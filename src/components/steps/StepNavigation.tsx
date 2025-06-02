import React from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { User } from '@supabase/supabase-js';
import Button from '../shared/Button';
import toast from 'react-hot-toast';

interface StepNavigationProps {
  onNext?: () => void; // Custom logic before navigating next
  nextDisabled?: boolean;
  hidePrev?: boolean;
  nextLabel?: string;
  // New props for credit handling
  user?: User | null;
  credits?: number;
  onPurchaseCredits?: () => void;
  onContextCreated?: () => Promise<void>;
}

const StepNavigation: React.FC<StepNavigationProps> = ({ 
  onNext, 
  nextDisabled = false, 
  hidePrev = false, 
  nextLabel = "Next",
  user,
  credits = 0,
  onPurchaseCredits,
  onContextCreated
}) => {
  const { 
    currentStep, 
    setCurrentStep, 
    generateContextFile, 
    generateContextWithAllSelections,
    saveStateBeforePayment,
    selections 
  } = useAppContext();

  // Define totalConfigSteps here to be accessible throughout the component
  // STEPS array in App.tsx has 11 items (indices 0 to 10).
  // Step 0 is PromptInputStep.
  // Steps 1 through 9 are configuration steps (PlatformStep to LanguageStep).
  // Step 10 is FinalScreen.
  // The last configuration step before FinalScreen is LanguageStep at index 9.
  const totalConfigSteps = 9; 

  const handleGenerateContext = async () => {
    console.log('🎯 Generate Context clicked', { user: !!user, credits });
    
    // Since we now do automatic anonymous sign-in, user should always exist
    if (!user) {
      console.error('❌ No user found during context generation');
      toast.error('Authentication error. Please refresh the page.');
      return;
    }

    // Check if user has credits
    if (credits <= 0) {
      console.log('❌ No credits available');
      toast.error('You need credits to generate context. Redirecting to payment...');
      
      if (onPurchaseCredits) {
        // Save current state before payment
        saveStateBeforePayment();
        onPurchaseCredits();
      } else {
        toast.error('Payment system not available');
      }
      return;
    }

    // User has credits, proceed with generation
    console.log('✅ User has credits, generating context...');
    
    try {
      // Use the full context generation with credit deduction
      await generateContextWithAllSelections(onContextCreated);
      
      // Move to final screen
      setCurrentStep(10);
      
      toast.success('Context generated successfully!');
    } catch (error) {
      console.error('❌ Context generation failed:', error);
      toast.error('Failed to generate context. Please try again.');
    }
  };

  const handleNext = () => {
    if (onNext) {
      // If there's a custom onNext handler, use it and don't do default navigation
      onNext();
      return;
    }
    
    if (currentStep === totalConfigSteps) { 
      // This is the "Generate Context" button
      handleGenerateContext();
    } else if (currentStep < totalConfigSteps + 1) { // +1 because FinalScreen is a step (index 10)
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <div className={`mt-8 flex ${hidePrev ? 'justify-end' : 'justify-between'} items-center`}>
      {!hidePrev && (
        <Button 
          variant="outline" 
          onClick={handlePrev}
          disabled={currentStep === 0}
        >
          Previous
        </Button>
      )}
      <Button 
        onClick={handleNext}
        disabled={nextDisabled}
      >
        {currentStep === totalConfigSteps ? "Generate Context" : nextLabel}
      </Button>
    </div>
  );
};

export default StepNavigation;
