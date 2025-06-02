import React from 'react'
import { CreditCard, Plus, User as UserIcon } from 'lucide-react'
import { User } from '@supabase/supabase-js'

interface CreditDisplayProps {
  credits: number
  onPurchaseCredits: () => void
  user?: User | null
  onRequestLogin?: () => void
}

const CreditDisplay: React.FC<CreditDisplayProps> = ({ 
  credits, 
  onPurchaseCredits,
  user,
  onRequestLogin
}) => {
  const handleLoginOrPurchase = () => {
    if (!user && onRequestLogin) {
      onRequestLogin()
    } else {
      onPurchaseCredits()
    }
  }

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-text">
              Credits: {credits}
            </span>
          </div>
          
          {user && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <UserIcon className="h-4 w-4" />
              <span>Signed In</span>
            </div>
          )}
        </div>
        
        <button
          onClick={handleLoginOrPurchase}
          className="flex items-center space-x-2 bg-primary hover:bg-primary/90 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>
            {!user ? 'Sign In & Get Credits' : 'Buy Credits'}
          </span>
        </button>
      </div>
    </div>
  )
}

export default CreditDisplay 
