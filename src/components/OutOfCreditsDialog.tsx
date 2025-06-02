import { X } from 'lucide-react'
import { useAppContext } from '@/contexts/AppContext'

interface OutOfCreditsDialogProps {
  onClose: () => void;
  onPurchaseCredits: () => void;
}

export default function OutOfCreditsDialog({ onClose, onPurchaseCredits }: OutOfCreditsDialogProps) {
  const { saveStateBeforePayment } = useAppContext()

  const handlePurchaseCredits = () => {
    // Save current state before going to payment
    saveStateBeforePayment();
    onPurchaseCredits();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-text">No Credits Available</h3>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <p className="text-text-secondary mb-6">
          You need credits to generate a context file. Purchase credits to continue.
        </p>
        
        <div className="flex space-x-3">
          <button
            onClick={handlePurchaseCredits}
            className="flex-1 bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Buy Credits ($2.99)
          </button>
          
          <button
            onClick={onClose}
            className="px-4 py-2 border border-border rounded-lg text-text-secondary hover:text-text transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
} 