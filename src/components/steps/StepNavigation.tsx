import React from 'react';
import { useAppContext } from '@/contexts/AppContext';
import Button from '../shared/Button';

interface StepNavigationProps {
  onNext?: () => void; // Custom logic before navigating next
  nextDisabled?: boolean;
  hidePrev?: boolean;
  nextLabel?: string;
}

const StepNavigation: React.FC<StepNavigationProps> = ({ onNext, nextDisabled = false, hidePrev = false, nextLabel = "Next" }) => {
  const { currentStep, setCurrentStep, generateContextFile, selections } = useAppContext();

  // Define totalConfigSteps here to be accessible throughout the component
  // STEPS array in App.tsx has 11 items (indices 0 to 10).
  // Step 0 is PromptInputStep.
  // Steps 1 through 9 are configuration steps (PlatformStep to LanguageStep).
  // Step 10 is FinalScreen.
  // The last configuration step before FinalScreen is LanguageStep at index 9.
  const totalConfigSteps = 9; 

  const handleNext = () => {
    if (onNext) {
      // If there's a custom onNext handler, use it and don't do default navigation
      onNext();
      return;
    }
    
    if (currentStep === totalConfigSteps) { // If current step is the last config step (LanguageStep)
      generateContextFile();
      setCurrentStep(prev => prev + 1); // Move to FinalScreen
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
        {/* FIX: totalConfigSteps is now defined in the component scope */}
        {currentStep === totalConfigSteps ? "Generate Context" : nextLabel}
      </Button>
    </div>
  );
};

export default StepNavigation;
