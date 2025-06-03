'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Button from '@/components/shared/Button'
import { CreditCard, Plus, User as UserIcon } from 'lucide-react'
import { User } from '@supabase/supabase-js'

interface CreditDisplayProps {
  credits: number
  onPurchaseCredits: () => void
  user?: User | null
  onRequestLogin?: () => void
  userId: string | null
}

export const CreditDisplay = ({ 
  credits, 
  onPurchaseCredits,
  user,
  onRequestLogin,
  userId
}: CreditDisplayProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const [localCredits, setLocalCredits] = useState(credits)
  const [lastTestTime, setLastTestTime] = useState<number>(0)

  const fetchCredits = async () => {
    if (!userId) {
      setIsLoading(false)
      setLocalCredits(credits)
      return
    }

    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('users')
        .select('credits')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching credits:', error)
        setLocalCredits(credits)
      } else {
        setLocalCredits(data?.credits || 0)
      }
    } catch (error) {
      console.error('Error:', error)
      setLocalCredits(credits)
    } finally {
      setIsLoading(false)
    }
  }

  // Function to add test credits (for development) with rate limiting
  const addTestCredits = async (amount: number = 5) => {
    if (!userId) return
    
    // Rate limiting - prevent rapid clicks
    const now = Date.now()
    if (now - lastTestTime < 2000) { // 2 seconds minimum between test credit additions
      alert('⏰ Please wait 2 seconds between test credit additions')
      return
    }
    setLastTestTime(now)
    
    try {
      const response = await fetch('/api/debug/credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, credits: amount, source: 'test_button' })
      })
      
      const result = await response.json()
      
      if (result.success) {
        // Update local credits immediately
        setLocalCredits(result.newTotal)
        // Trigger credit refresh in parent component
        onPurchaseCredits()
        alert(`✅ ${result.message}! New total: ${result.newTotal}`)
      } else {
        alert(`❌ Error: ${result.error}`)
      }
    } catch (error) {
      console.error('Error adding test credits:', error)
      alert('❌ Failed to add credits')
    }
  }

  // Function to simulate fake payment (for testing) with rate limiting
  const simulateFakePayment = async () => {
    if (!userId) return
    
    // Rate limiting - prevent rapid clicks
    const now = Date.now()
    if (now - lastTestTime < 5000) { // 5 seconds minimum between fake payments
      alert('⏰ Please wait 5 seconds between fake payments')
      return
    }
    setLastTestTime(now)
    
    try {
      alert('🧪 Simulating payment process... (This would normally redirect to Stripe)')
      
      const response = await fetch('/api/stripe/test-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, credits: 5 })
      })
      
      const result = await response.json()
      
      if (result.success) {
        // Update local credits immediately
        setLocalCredits(result.newCredits)
        // Trigger credit refresh in parent component
        onPurchaseCredits()
        alert(`✅ FAKE PAYMENT SUCCESS! ${result.message}\nNew total: ${result.newCredits} credits`)
      } else {
        if (result.blocked) {
          alert(`⏰ ${result.error}`)
        } else {
          alert(`❌ Payment failed: ${result.error}`)
        }
      }
    } catch (error) {
      console.error('Error simulating payment:', error)
      alert('❌ Failed to process fake payment')
    }
  }

  useEffect(() => {
    setLocalCredits(credits)
  }, [credits])

  useEffect(() => {
    if (userId) {
      fetchCredits()
    } else {
      setIsLoading(false)
      setLocalCredits(credits)
    }
  }, [userId])

  const handleLoginOrPurchase = () => {
    if (!user && onRequestLogin) {
      onRequestLogin()
    } else {
      onPurchaseCredits()
    }
  }

  const isDevelopment = process.env.NODE_ENV === 'development'

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-text">
              Credits: {isLoading ? (
                <div className="inline-flex items-center">
                  <div className="w-3 h-3 border border-blue-300 border-t-blue-600 rounded-full animate-spin mr-1"></div>
                  Loading...
                </div>
              ) : localCredits}
            </span>
          </div>
          
          {user && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <UserIcon className="h-4 w-4" />
              <span>Signed In</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleLoginOrPurchase}
            className="flex items-center space-x-2 bg-primary hover:bg-primary/90 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>
              {!user ? 'Sign In & Get Credits' : 'Buy Credits'}
            </span>
          </button>

          {/* Debug buttons only in development - TEMPORARILY HIDDEN FOR TESTING */}
          {false && isDevelopment && userId && (
            <div className="flex items-center gap-2">
              <Button 
                onClick={simulateFakePayment}
                variant="outline"
                size="sm"
                className="text-xs bg-purple-50 border-purple-300 text-purple-700 hover:bg-purple-100"
              >
                🧪 Fake Payment
              </Button>
              <Button 
                onClick={() => addTestCredits(1)}
                variant="outline"
                size="sm"
                className="text-xs bg-green-50 border-green-300 text-green-700 hover:bg-green-100"
              >
                +1
              </Button>
              <Button 
                onClick={() => addTestCredits(5)}
                variant="outline"
                size="sm"
                className="text-xs bg-yellow-50 border-yellow-300 text-yellow-700 hover:bg-yellow-100"
              >
                +5
              </Button>
              <Button 
                onClick={() => addTestCredits(10)}
                variant="outline"
                size="sm"
                className="text-xs bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100"
              >
                +10
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CreditDisplay 
