import React from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { DevTool } from '../../types';
import RadioGroup from '../shared/RadioGroup';
import StepNavigation from './StepNavigation';
import AnimatedContainer from '../shared/AnimatedContainer';
import { Code, Zap, HelpCircle } from 'lucide-react';

const DevToolStep: React.FC = () => {
  const { selections, updateSelection } = useAppContext();

  const handleDevToolChange = (value: string) => {
    if (value === 'Not Sure') {
      // Display "Not Sure" but internally save as "Cursor" for logic purposes
      updateSelection('devTool', 'Not Sure' as DevTool);
    } else {
      updateSelection('devTool', value as DevTool);
    }
  };

  return (
    <AnimatedContainer staggerChildren={true} staggerDelay={200} className="space-y-6">
      <RadioGroup
        label="Preferred Development Tool:"
        name="devTool"
        options={[
          { value: 'Windsurf', text: 'Windsurf.ai', icon: <Code size={48} /> },
          { value: 'Cursor', text: 'Cursor.ai', icon: <Zap size={48} /> },
          { value: 'Not Sure', text: 'Not Sure / Recommend', icon: <HelpCircle size={48} /> },
        ]}
        selectedValue={selections.devTool}
        onChange={handleDevToolChange}
      />
      
      {selections.devTool === 'Not Sure' && (
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 shadow-sm">
          <p className="text-sm text-blue-700">
            <span className="font-semibold">💡 No worries!</span> We'll set up recommendations assuming you're using a modern AI-powered code editor like Windsurf.
          </p>
        </div>
      )}
      
      <StepNavigation nextDisabled={!selections.devTool} />
    </AnimatedContainer>
  );
};

export default DevToolStep;
