'use client'

import { useState } from 'react'
import { useAppContext } from '@/contexts/AppContext'
import { createSupabaseClient } from '@/lib/supabase'
import { Download, RefreshCw, AlertTriangle, CreditCard, Zap, Copy, Check } from 'lucide-react'
import toast from 'react-hot-toast'

interface FinalScreenProps {
  onBack: () => void
  user?: { id: string } | null
  credits: number
  onRefreshCredits?: () => Promise<void>
  onPurchaseCredits?: () => void
}

const FinalScreen: React.FC<FinalScreenProps> = ({ onBack, user, credits, onRefreshCredits, onPurchaseCredits }) => {
  const { selections, generatedContext, isLoading, generateContextWithAllSelections, saveStateBeforePayment } = useAppContext()
  const [isFixing, setIsFixing] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [copiedContext, setCopiedContext] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const supabase = createSupabaseClient()

  const handleEmergencyCreateUser = async () => {
    setIsFixing(true)
    try {
      console.log('🔧 Creating emergency anonymous user...')
      const { data, error } = await supabase.auth.signInAnonymously()
      
      if (error) {
        console.error('❌ Anonymous signin error:', error)
        toast.error('Failed to create emergency user: ' + error.message)
        return
      }

      if (data?.user) {
        console.log('✅ Emergency user created:', data.user.id)
        toast.success('Emergency user created successfully!')
        
        // Add credits to the new user
        const response = await fetch('/api/debug/credits', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: data.user.id, credits: 5 })
        })
        
        const result = await response.json()
        
        if (result.success) {
          toast.success('✅ Emergency user setup complete with 5 credits!')
          // Reload page to update user state
          window.location.reload()
        }
      }
    } catch (error) {
      console.error('❌ Emergency user creation failed:', error)
      toast.error('Emergency user creation failed.')
    }
    setIsFixing(false)
  }

  const handleDownload = () => {
    if (!generatedContext) {
      toast.error('No context available to download')
      return
    }

    setIsDownloading(true)
    
    try {
      // Create context file
      const contextBlob = new Blob([generatedContext], { type: 'text/markdown' })
      const contextUrl = URL.createObjectURL(contextBlob)
      const contextLink = document.createElement('a')
      contextLink.href = contextUrl
      contextLink.download = 'context.md'
      contextLink.click()
      URL.revokeObjectURL(contextUrl)

      toast.success('Files downloaded successfully!')
    } catch (error) {
      console.error('Download error:', error)
      toast.error('Failed to download files')
    }
    
    setIsDownloading(false)
  }

  const handleCopyContext = async () => {
    if (!generatedContext) {
      toast.error('No context available to copy')
      return
    }

    try {
      await navigator.clipboard.writeText(generatedContext)
      setCopiedContext(true)
      toast.success('Context copied to clipboard!')
      setTimeout(() => setCopiedContext(false), 2000)
    } catch (error) {
      console.error('Copy error:', error)
      toast.error('Failed to copy context')
    }
  }

  const handleRegenerate = async () => {
    if (!user) {
      toast.error('You need to be logged in to regenerate context')
      return
    }

    if (credits <= 0) {
      if (onPurchaseCredits) {
        toast.error('You need credits to regenerate context')
        saveStateBeforePayment() // Save current state before payment
        onPurchaseCredits()
      }
      return
    }

    setIsRegenerating(true)
    try {
      console.log('🔄 Regenerating context...')
      
      // Create a function that will handle credit deduction
      const handleContextCreated = async () => {
        if (!user) throw new Error('No user found')
        
        const { error } = await supabase
          .from('users')
          .update({ credits: credits - 1 })
          .eq('id', user.id)

        if (error) {
          throw new Error('Error updating credits: ' + error.message)
        }
        
        console.log('✅ Credit deducted for regeneration')
      }

      // Call context generation with credit deduction
      await generateContextWithAllSelections(handleContextCreated)
      
      toast.success('Context regenerated successfully!')
      
      // Refresh credits to show updated amount
      if (onRefreshCredits) {
        await onRefreshCredits()
      }
      
    } catch (error) {
      console.error('❌ Error regenerating context:', error)
      toast.error('Failed to regenerate context. Please try again.')
    } finally {
      setIsRegenerating(false)
    }
  }

  const handleStartNewProject = () => {
    console.log('🆕 Starting new project...')
    
    // Clear all session storage flags
    sessionStorage.removeItem('forceStartFlow')
    sessionStorage.removeItem('prePaymentState')
    sessionStorage.removeItem('immediateGeneration')
    
    // Clear any payment processing flags
    const sessionId = new URLSearchParams(window.location.search).get('session_id')
    if (sessionId) {
      sessionStorage.removeItem(`payment_processed_${sessionId}`)
    }
    
    console.log('✅ All session flags cleared for new project')
    
    // Call the original onBack function to reset everything
    onBack()
  }

  const appName = selections.appName || selections.aiSuggestions.appName || 'My Application'

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎉 Your AI Context is Ready!
          </h1>
          <p className="text-xl text-gray-600">
            Context generated for <span className="font-semibold text-indigo-600">{appName}</span>
          </p>
        </div>

        {/* Emergency Fix / Purchase Credits Section */}
        {!user ? (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-amber-600" />
              <h3 className="text-lg font-semibold text-amber-800">Session Recovery Required</h3>
            </div>
            
            <p className="text-amber-700 mb-4">
              No user session detected. This can happen after payment redirects.
            </p>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleEmergencyCreateUser}
                disabled={isFixing}
                className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isFixing ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Zap className="h-4 w-4" />
                )}
                Create Emergency User
              </button>

              {onRefreshCredits && (
                <button
                  onClick={onRefreshCredits}
                  disabled={isFixing}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh Credits
                </button>
              )}
            </div>
          </div>
        ) : credits === 0 ? (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <CreditCard className="h-6 w-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-blue-800">Need More Credits?</h3>
            </div>
            
            <p className="text-blue-700 mb-4">
              You've used all your credits! Purchase more to continue creating amazing contexts.
            </p>

            <div className="flex flex-wrap gap-3">
              {onPurchaseCredits && (
                <button
                  onClick={onPurchaseCredits}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  <CreditCard className="h-5 w-5" />
                  Buy More Credits
                </button>
              )}

              {onRefreshCredits && (
                <button
                  onClick={onRefreshCredits}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh Credits
                </button>
              )}
            </div>
          </div>
        ) : null}

        {/* Main Content */}
        <div className="flex justify-center">
          {/* Context File */}
          <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">context.md</h3>
              <p className="text-gray-600">Complete project context for AI assistants</p>
            </div>
            
            <div className="p-6">
              <div className="bg-gray-50 rounded-lg p-6 mb-4 max-h-96 overflow-y-auto">
                {generatedContext ? (
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono leading-relaxed">
                    {generatedContext}
                  </pre>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-gray-500 mb-4">⚠️ No context generated yet</div>
                    <p className="text-sm text-gray-600">
                      The context generation might have failed. Try regenerating it.
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex justify-center">
                <button
                  onClick={handleCopyContext}
                  disabled={!generatedContext}
                  className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
                >
                  {copiedContext ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <Copy className="h-5 w-5" />
                  )}
                  {copiedContext ? 'Copied!' : 'Copy Context'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center mt-8">
          <button
            onClick={handleDownload}
            disabled={!generatedContext || isDownloading || isLoading}
            className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg font-semibold"
          >
            {isDownloading ? (
              <RefreshCw className="h-5 w-5 animate-spin" />
            ) : (
              <Download className="h-5 w-5" />
            )}
            {isDownloading ? 'Downloading...' : 'Download Files'}
          </button>

          <button
            onClick={handleRegenerate}
            disabled={isRegenerating || isLoading || (!user || credits <= 0)}
            className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg font-semibold"
          >
            {isRegenerating ? (
              <RefreshCw className="h-5 w-5 animate-spin" />
            ) : (
              <RefreshCw className="h-5 w-5" />
            )}
            {isRegenerating ? 'Regenerating...' : 'Regenerate Context'}
          </button>

          <button
            onClick={handleStartNewProject}
            className="px-8 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors text-lg font-semibold"
          >
            Start New Project
          </button>
        </div>

        {/* Debug Info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-gray-100 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">Debug Info:</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <div>User ID: {user?.id || 'None'}</div>
              <div>Credits: {credits}</div>
              <div>Context Length: {generatedContext?.length || 0} chars</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default FinalScreen 