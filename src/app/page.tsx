'use client'

import { useEffect, useState, Suspense, useRef } from 'react'
import { createSupabaseClient } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import { User } from '@supabase/supabase-js'
import toast from 'react-hot-toast'
import Dashboard from '@/components/Dashboard'
import { AppProvider } from '@/contexts/AppContext'

// Add global debug helpers type
declare global {
  interface Window {
    debugPayment?: {
      forcePaymentSuccess: () => void;
      addCredits: (amount?: number) => Promise<void>;
      signInAnonymously: () => Promise<void>;
      checkUserState: () => void;
      checkUrlParams: () => void;
    };
  }
}

const HomePageContent = () => {
  const [user, setUser] = useState<User | null>(null)
  const [credits, setCredits] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createSupabaseClient()
  
  // Function to refresh user credits from database
  const refreshCredits = async () => {
    if (!user) return
    
    try {
      const { data: userData, error } = await supabase
        .from('users')
        .select('credits')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Error fetching user credits:', error)
      } else {
        setCredits(userData?.credits || 0)
      }
    } catch (error) {
      console.error('Error refreshing credits:', error)
    }
  }

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          console.log('✅ User already exists:', user.id)
          setUser(user)
          
          // Get user credits
          const { data: userData, error } = await supabase
            .from('users')
            .select('credits')
            .eq('id', user.id)
            .single()

          if (error) {
            console.error('Error fetching user data:', error)
            // If user doesn't exist in database, create record
            if (error.code === 'PGRST116') {
              console.log('🔧 User not in database, creating record...')
              const { error: createError } = await supabase
                .from('users')
                .upsert({
                  id: user.id,
                  anonymous_id: user.id,
                  credits: 1, // Give 1 free credit to start
                })
              
              if (!createError) {
                console.log('✅ User record created with 1 free credit')
                setCredits(1)
              } else {
                console.error('❌ Error creating user record:', createError)
                setCredits(0)
              }
            } else {
              setCredits(0)
            }
          } else {
            setCredits(userData?.credits || 0)
          }
        } else {
          // No user found - automatically create anonymous user
          console.log('👤 No user found, creating anonymous user...')
          
          try {
            const { data: authData, error: authError } = await supabase.auth.signInAnonymously()
            
            if (authError) {
              console.error('❌ Anonymous signin error:', authError)
              if (authError.message.includes('Anonymous sign-ins are disabled')) {
                console.error('🚨 Anonymous sign-ins are disabled in Supabase settings')
                // Show login prompt instead
                setShowLoginPrompt(true)
                setCredits(0)
              } else {
                setCredits(0)
              }
            } else if (authData.user) {
              console.log('✅ Anonymous user created automatically:', authData.user.id)
              setUser(authData.user)
              
              // Create user record in database with 1 free credit
              const { error: dbError } = await supabase
                .from('users')
                .upsert({
                  id: authData.user.id,
                  anonymous_id: authData.user.id,
                  credits: 1, // Give 1 free credit
                })

              if (dbError) {
                console.error('❌ Database error:', dbError)
                setCredits(0)
              } else {
                console.log('✅ User record created with 1 free credit')
                setCredits(1)
              }
            }
          } catch (autoSignInError) {
            console.error('❌ Auto sign-in failed:', autoSignInError)
            setShowLoginPrompt(true)
            setCredits(0)
          }
        }
      } catch (error) {
        console.error('Auth error:', error)
        setShowLoginPrompt(true)
        setCredits(0)
      }
      
      setIsLoading(false)
    }

    getUser()
    
    // Add global debug helper for browser console
    if (typeof window !== 'undefined') {
      let lastDebugActionTime = 0; // Rate limiting for debug actions
      
      window.debugPayment = {
        forcePaymentSuccess: () => {
          const newUrl = new URL(window.location.href)
          newUrl.searchParams.set('success', 'true')
          newUrl.searchParams.set('session_id', 'debug_session')
          window.location.href = newUrl.toString()
        },
        addCredits: async (amount = 5) => {
          // Rate limiting - prevent rapid calls
          const now = Date.now()
          if (now - lastDebugActionTime < 3000) { // 3 seconds minimum between debug actions
            console.log('⏰ Please wait 3 seconds between debug credit additions')
            return
          }
          lastDebugActionTime = now

          if (!user) {
            console.log('❌ No user logged in')
            console.log('🔧 Attempting to restore user session...')
            
            try {
              const { data: { user: restoredUser }, error } = await supabase.auth.getUser()
              if (restoredUser && !error) {
                console.log('✅ User session restored:', restoredUser.id)
                setUser(restoredUser)
                
                // Now try to add credits with restored user
                const response = await fetch('/api/debug/credits', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ userId: restoredUser.id, credits: amount, source: 'debug_console' })
                })
                const result = await response.json()
                console.log('✅ Credits added after user restore:', result)
                
                // DON'T reload - just update state
                if (result.success) {
                  setCredits(result.newTotal || amount)
                  refreshCredits()
                }
                return
              } else {
                console.log('❌ Could not restore user session')
                console.log('🔧 Try: debugPayment.signInAnonymously()')
                return
              }
            } catch (err) {
              console.error('❌ Error restoring session:', err)
              console.log('🔧 Try: debugPayment.signInAnonymously()')
              return
            }
          }
          
          try {
            const response = await fetch('/api/debug/credits', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: user.id, credits: amount, source: 'debug_console' })
            })
            const result = await response.json()
            console.log('✅ Credits added:', result)
            
            if (result.success) {
              setCredits(result.newTotal || credits)
              refreshCredits() // Also refresh from database
            } else if (result.blocked) {
              console.log('🚫 Credit addition blocked:', result.reason)
            }
          } catch (error) {
            console.error('❌ Failed to add credits:', error)
          }
        },
        signInAnonymously: async () => {
          // Rate limiting for sign in too
          const now = Date.now()
          if (now - lastDebugActionTime < 3000) {
            console.log('⏰ Please wait 3 seconds between debug actions')
            return
          }
          lastDebugActionTime = now

          try {
            console.log('🔧 Signing in anonymously...')
            const { data, error } = await supabase.auth.signInAnonymously()
            
            if (error) {
              console.error('❌ Anonymous signin error:', error)
              return
            }

            if (data.user) {
              console.log('✅ Anonymous user created:', data.user.id)
              setUser(data.user)
              
              // Create user record in database
              const { error: dbError } = await supabase
                .from('users')
                .upsert({
                  id: data.user.id,
                  anonymous_id: data.user.id,
                  credits: 0,
                })

              if (dbError) {
                console.error('❌ Database error:', dbError)
              } else {
                console.log('✅ User record created in database')
                setCredits(0)
                console.log('🔧 Now you can use: debugPayment.addCredits(5)')
              }
            }
          } catch (error) {
            console.error('❌ Sign in failed:', error)
          }
        },
        checkUserState: () => {
          console.log('👤 Current user state:', { 
            user: user ? { id: user.id, email: user.email } : null, 
            credits, 
            isLoading 
          })
        },
        checkUrlParams: () => {
          const url = new URL(window.location.href)
          console.log('Current URL params:', Object.fromEntries(url.searchParams.entries()))
        }
      }
      console.log('🔧 Debug helpers loaded (with rate limiting):')
      console.log('- debugPayment.checkUserState() - Check current user and credits')
      console.log('- debugPayment.signInAnonymously() - Sign in as anonymous user')
      console.log('- debugPayment.addCredits(5) - Add credits (auto fixes user if needed)')
      console.log('- debugPayment.forcePaymentSuccess() - Simulate payment success')
      console.log('- debugPayment.checkUrlParams() - Check URL parameters')
      console.log('⏰ Note: Rate limited to prevent loops (3 second cooldown)')
    }
  }, [supabase])

  // Enhanced payment success handling
  useEffect(() => {
    const success = searchParams.get('success')
    const sessionId = searchParams.get('session_id')
    const canceled = searchParams.get('canceled')
    
    // Handle payment cancellation
    if (canceled === 'true') {
      console.log('💔 Payment was canceled')
      toast.error('Payment was canceled. You can try again anytime.')
      
      // Clear URL parameters
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.delete('success')
      newUrl.searchParams.delete('session_id')
      newUrl.searchParams.delete('canceled')
      window.history.replaceState({}, '', newUrl.toString())
      return
    }
    
    // Handle successful payment with hybrid approach (webhook primary + fallback)
    if (success === 'true' && sessionId && user) {
      console.log('✅ Payment success detected - implementing hybrid approach')
      console.log('🔖 Session ID:', sessionId)
      
      const handlePaymentSuccess = async () => {
        console.log('🔄 Starting payment success processing...')
        
        // Clear URL parameters immediately to prevent re-triggers
        const newUrl = new URL(window.location.href)
        newUrl.searchParams.delete('success')
        newUrl.searchParams.delete('session_id')
        newUrl.searchParams.delete('canceled')
        window.history.replaceState({}, '', newUrl.toString())
        
        try {
          // Step 1: Wait for webhook to process (webhook should be primary)
          console.log('⏳ Waiting for webhook to process (3 seconds)...')
          await new Promise(resolve => setTimeout(resolve, 3000))
          
          // Step 2: Check if webhook already processed this payment
          console.log('🔍 Checking if webhook processed the payment...')
          const checkResponse = await fetch('/api/debug/credits', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              userId: user.id, 
              action: 'check',
              paymentSessionId: sessionId,
              source: 'frontend_fallback'
            })
          })
          
          const checkResult = await checkResponse.json()
          console.log('📋 Webhook check result:', checkResult)
          
          if (checkResult.alreadyProcessed) {
            console.log('✅ Webhook already processed payment - refreshing credits from DB')
            
            // Refresh credits from database
            const { data: userData, error } = await supabase
              .from('users')
              .select('credits')
              .eq('id', user.id)
              .single()

            if (!error && userData) {
              setCredits(userData.credits)
              toast.success('Payment successful! Credits have been added to your account.')
              console.log('✅ Credits updated from database:', userData.credits)
            } else {
              console.error('Error refreshing credits:', error)
              toast.error('Payment processed but error refreshing display. Please refresh page.')
            }
          } else {
            console.log('⚠️ Webhook did not process payment - using fallback')
            
            // Fallback: Add credits via frontend (only if webhook failed)
            const fallbackResponse = await fetch('/api/debug/credits', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                userId: user.id, 
                credits: 5, // Standard credit amount for payments
                paymentSessionId: sessionId,
                source: 'frontend_fallback',
                action: 'add'
              })
            })
            
            const fallbackResult = await fallbackResponse.json()
            console.log('🔄 Fallback result:', fallbackResult)
            
            if (fallbackResult.success) {
              setCredits(fallbackResult.newTotal)
              toast.success('Payment successful! Credits have been added to your account.')
              console.log('✅ Credits added via fallback:', fallbackResult.newTotal)
            } else {
              console.error('Fallback failed:', fallbackResult.error)
              toast.error('Payment processed but error adding credits. Please contact support.')
            }
          }
          
          // Restore pre-payment state if available
          const prePaymentStateStr = sessionStorage.getItem('prePaymentState');
          if (prePaymentStateStr) {
            console.log('🔄 Pre-payment state found, will restore user position')
            sessionStorage.setItem('forceStartFlow', 'true')
            console.log('✅ forceStartFlow flag set for recovery')
          } else {
            console.log('✅ Payment completed - user can start fresh with new credits')
          }
          
        } catch (error) {
          console.error('❌ Error in payment success processing:', error)
          toast.error('Payment processed but error updating credits. Please refresh the page.')
        }
      }
      
      // Execute payment success handling
      handlePaymentSuccess()
    }
  }, [searchParams, user, supabase])

  const handleAnonymousLogin = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.signInAnonymously()
      
      if (error) {
        console.error('Anonymous signin error:', error)
        if (error.message.includes('Anonymous sign-ins are disabled')) {
          toast.error('Anonymous sign-ins are disabled in Supabase settings. Please enable it in Authentication > Settings > Allow anonymous sign-ins')
        } else {
          toast.error('Registration failed: ' + error.message)
        }
        return
      }

      if (data.user) {
        // Create user record in database with 1 free credit (consistent with auto sign-in)
        const { error: dbError } = await supabase
          .from('users')
          .upsert({
            id: data.user.id,
            anonymous_id: data.user.id,
            credits: 1, // Give 1 free credit like auto sign-in
          })

        if (dbError) {
          console.error('Database error:', dbError)
          toast.error('Database error: ' + dbError.message)
        } else {
          setUser(data.user)
          setCredits(1) // Set 1 free credit
          setShowLoginPrompt(false)
          toast.success('Successfully signed in! You have 1 free credit to get started.')
        }
      }
    } catch (error) {
      console.error('Registration error:', error)
      toast.error('Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleContextCreated = async () => {
    if (!user) {
      // Don't show login prompt here anymore since it's handled by flow
      return
    }

    if (credits <= 0) {
      // Don't show credits error here anymore since it's handled by flow
      return
    }

    // Decrease credit
    const { error } = await supabase
      .from('users')
      .update({ credits: credits - 1 })
      .eq('id', user?.id)

    if (error) {
      toast.error('Error updating credits')
      return
    }

    setCredits(credits - 1)
    // Don't show success toast here - let the component handle its own messaging
  }

  const handlePurchaseCredits = async () => {
    if (!user) {
      setShowLoginPrompt(true)
      toast.error('You need to sign in to purchase credits.')
      return
    }

    try {
      // Save current step and selections before going to payment
      console.log('💾 Saving current state before payment...')
      const stepState = {
        step: 'unknown', // Will be set by AppContext
        timestamp: Date.now()
      }
      sessionStorage.setItem('prePaymentState', JSON.stringify(stepState))
      console.log('✅ Pre-payment state saved')

      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
        }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        // Handle Stripe configuration errors
        if (data.useTestPayment) {
          console.log('🚨 Stripe error detected:', data.message)
          
          // For production, automatically use test payment instead of showing dialog
          const isProduction = process.env.NODE_ENV === 'production'
          
          const useTestPayment = isProduction ? true : confirm(
            `Payment System Issue: ${data.message}\n\n` +
            'Would you like to use TEST PAYMENT instead? (No real money will be charged)\n\n' +
            'Click OK for test payment or Cancel to try again later.'
          )
          
          if (useTestPayment) {
            console.log('🧪 Using test payment (auto-selected for production)...')
            
            // Call test payment API
            const testResponse = await fetch('/api/stripe/test-checkout', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: user.id, credits: 5 })
            })
            
            const testResult = await testResponse.json()
            
            if (testResult.success) {
              toast.success(`✅ Payment successful! Added ${testResult.newCredits - credits} credits.`)
              setCredits(testResult.newCredits)
              refreshCredits() // Also refresh from database
            } else {
              if (testResult.blocked) {
                toast.error('Please wait before making another payment.')
              } else {
                toast.error('Payment failed: ' + testResult.error)
              }
            }
          }
          return
        } else {
          throw new Error(data.error || 'Payment system error')
        }
      }
      
      if (data.url) {
        console.log('✅ Redirecting to Stripe checkout...')
        window.location.href = data.url
      } else {
        throw new Error('No checkout URL received')
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
      toast.error(`Payment error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleRefreshCredits = async () => {
    if (!user) {
      toast.error('You need to be logged in to refresh credits.')
      return
    }

    console.log('Manual credit refresh requested for user:', user.id)
    
    try {
      const { data: userData, error } = await supabase
        .from('users')
        .select('credits')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Error fetching user credits:', error)
        toast.error('Failed to refresh credits. Please try again.')
        return
      }

      const newCredits = userData?.credits || 0
      setCredits(newCredits)
      console.log('Credits refreshed:', newCredits)
      
      if (newCredits > 0) {
        toast.success(`✅ Credits updated! You have ${newCredits} credits.`)
      } else {
        toast.success('No credits found. If you just made a payment, please wait a few moments and try again.')
      }
    } catch (error) {
      console.error('Error refreshing credits:', error)
      toast.error('Failed to refresh credits. Please try again.')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <AppProvider credits={credits} onRefreshCredits={refreshCredits}>
      <Dashboard 
        user={user}
        credits={credits}
        onContextCreated={handleContextCreated}
        onPurchaseCredits={handlePurchaseCredits}
        onRequestLogin={handleAnonymousLogin}
        showLoginPrompt={showLoginPrompt}
        onCloseLoginPrompt={() => setShowLoginPrompt(false)}
        onRefreshCredits={handleRefreshCredits}
      />
    </AppProvider>
  )
}

const HomePage = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text">Loading...</p>
        </div>
      </div>
    }>
      <HomePageContent />
    </Suspense>
  )
}

export default HomePage
