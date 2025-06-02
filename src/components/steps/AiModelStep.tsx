import React from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { AiAppModel } from '../../types';
import RadioGroup from '../shared/RadioGroup';
import StepNavigation from './StepNavigation';
import AnimatedContainer from '../shared/AnimatedContainer';
import { Brain, Zap, HelpCircle, Sparkles, Search, Bot, Globe, MessageSquare } from 'lucide-react';

const AiModelStep: React.FC = () => {
  const { selections, updateSelection } = useAppContext();

  const handleAiModelChange = (value: string) => {
    updateSelection('aiAppModel', value as AiAppModel);
  };

  return (
    <AnimatedContainer staggerChildren={true} staggerDelay={200} className="space-y-6">
      <RadioGroup
        label="AI Model Preference:"
        name="aiModel"
        gridCols="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        options={[
          { value: 'ChatGPT', text: 'ChatGPT (OpenAI)', icon: <Brain size={48} /> },
          { value: 'Claude', text: 'Claude (Anthropic)', icon: <Zap size={48} /> },
          { value: 'Mistral', text: 'Mistral', icon: <Sparkles size={48} /> },
          { value: 'DeepSeek', text: 'DeepSeek', icon: <Search size={48} /> },
          { value: 'Google', text: 'Google (Gemini)', icon: <Bot size={48} /> },
          { value: 'Groq', text: 'Groq', icon: <Zap size={48} /> },
          { value: 'Perplexity', text: 'Perplexity AI', icon: <Globe size={48} /> },
          { value: 'Llama', text: 'Llama (Meta)', icon: <MessageSquare size={48} /> },
          { value: 'Not Sure', text: 'Not Sure / Recommend', icon: <HelpCircle size={48} /> },
        ]}
        selectedValue={selections.aiAppModel}
        onChange={handleAiModelChange}
      />

      <StepNavigation nextDisabled={!selections.aiAppModel} />
    </AnimatedContainer>
  );
};

export default AiModelStep;
