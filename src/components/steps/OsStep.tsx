import React, { useEffect } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { OperatingSystem } from '../../types';
import RadioGroup from '../shared/RadioGroup';
import StepNavigation from './StepNavigation';
import AnimatedContainer from '../shared/AnimatedContainer';
import { Apple, AppWindow, Monitor, HardDrive } from 'lucide-react';

const OsStep: React.FC = () => {
  const { selections, updateSelection, setCurrentStep } = useAppContext();

  // Check if OS selection is required
  // "Not Sure" is treated like Windsurf for OS requirement logic
  const isOsRequired = selections.devTool === 'Cursor' || selections.devTool === 'Windsurf' || selections.devTool === 'Not Sure';

  useEffect(() => {
    if (!isOsRequired) {
      // Skip this step if not required by advancing currentStep
      setCurrentStep(prev => prev + 1); 
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOsRequired, setCurrentStep]);

  if (!isOsRequired) {
    return <p className="text-center text-slate-500">Operating system selection is not required for the chosen development tool. Skipping...</p>;
  }

  const handleOSChange = (value: string) => {
    updateSelection('operatingSystem', value as OperatingSystem);
  };

  return (
    <AnimatedContainer staggerChildren={true} staggerDelay={200} className="space-y-6">
      {selections.devTool === 'Not Sure' && (
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 shadow-sm mb-4">
          <p className="text-sm text-blue-700">
            <span className="font-semibold">ℹ️ Operating System:</span> Since you're not sure about your development tool, knowing your OS helps us provide better recommendations.
          </p>
        </div>
      )}
      
      <p className="text-sm text-slate-500"> 
        This helps personalize recommendations (e.g., simulator suggestions).
      </p>
      <RadioGroup
        label="Development Environment:"
        name="operatingSystem"
        options={[
          { value: 'Windows', text: 'Windows', icon: <Monitor size={48} /> },
          { value: 'macOS', text: 'macOS', icon: <Apple size={48} /> },
        ]}
        selectedValue={selections.operatingSystem || ''}
        onChange={handleOSChange}
      />
      <StepNavigation nextDisabled={!selections.operatingSystem} />
    </AnimatedContainer>
  );
};

export default OsStep;
