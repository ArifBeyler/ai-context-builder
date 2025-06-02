import React from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { DesignStyle, CornerStyle, IconStyle } from '../../types';
import RadioGroup from '../shared/RadioGroup';
import Checkbox from '../shared/Checkbox';
import StepNavigation from './StepNavigation';
import { 
  Ratio, Circle, Smile, ImageIcon, Palette, 
  Sparkles, Layers, SquareStack, Zap, Minus, 
  Paintbrush2
} from 'lucide-react';
import AnimatedContainer from '../shared/AnimatedContainer';

const DesignStep: React.FC = () => {
  const { selections, updateSelection } = useAppContext();

  return (
    <AnimatedContainer staggerChildren={true} staggerDelay={200} className="space-y-8">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-4">Design Style:</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { value: 'Glassmorphism', text: 'Glassmorphism', description: 'Frosted glass effect', icon: <Sparkles size={28} /> },
            { value: 'Neumorphism', text: 'Neumorphism', description: 'Soft UI with shadows', icon: <Layers size={28} /> },
            { value: 'Material', text: 'Material Design', description: 'Google\'s design system', icon: <SquareStack size={28} /> },
            { value: 'Minimalist', text: 'Minimalist', description: 'Clean and simple', icon: <Minus size={28} /> }
          ].map((style) => {
            const isSelected = selections.uiStyle === style.value;
            return (
              <button
                key={style.value}
                onClick={() => updateSelection('uiStyle', style.value as DesignStyle)}
                className={`relative p-4 rounded-lg border-2 transition-all duration-200 transform hover:scale-105 
                           text-center flex flex-col items-center justify-center aspect-square
                           ${isSelected 
                             ? 'bg-[#F26545] text-white border-[#F26545] ring-4 ring-[#F26545]/20 ring-offset-2 scale-105 shadow-xl' 
                             : 'bg-white hover:bg-slate-50 border-slate-300 hover:border-[#F26545]/70 text-slate-700 shadow-md hover:shadow-lg'
                           }`}
              >
                <div className={`mb-2 ${isSelected ? 'text-white' : 'text-slate-600'}`}>
                  {style.icon}
                </div>
                <span className={`text-xs font-medium mb-1 ${isSelected ? 'text-white' : 'text-slate-700'}`}>
                  {style.text}
                </span>
                <span className={`text-xs ${isSelected ? 'text-white/80' : 'text-slate-500'}`}>
                  {style.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-4">Corner Style:</label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: 'Sharp', text: 'Sharp', description: 'Modern angular edges', icon: <Ratio size={28} /> },
            { value: 'Rounded', text: 'Rounded', description: 'Friendly soft corners', icon: <Circle size={28} /> }
          ].map((style) => {
            const isSelected = selections.cornerStyle === style.value;
            return (
              <button
                key={style.value}
                onClick={() => updateSelection('cornerStyle', style.value as CornerStyle)}
                className={`relative p-4 rounded-lg border-2 transition-all duration-200 transform hover:scale-105 
                           text-center flex flex-col items-center justify-center aspect-square
                           ${isSelected 
                             ? 'bg-[#F26545] text-white border-[#F26545] ring-4 ring-[#F26545]/20 ring-offset-2 scale-105 shadow-xl' 
                             : 'bg-white hover:bg-slate-50 border-slate-300 hover:border-[#F26545]/70 text-slate-700 shadow-md hover:shadow-lg'
                           }`}
              >
                <div className={`mb-2 ${isSelected ? 'text-white' : 'text-slate-600'}`}>
                  {style.icon}
                </div>
                <span className={`text-xs font-medium mb-1 ${isSelected ? 'text-white' : 'text-slate-700'}`}>
                  {style.text}
                </span>
                <span className={`text-xs ${isSelected ? 'text-white/80' : 'text-slate-500'}`}>
                  {style.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-4">Icon Style:</label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'Emoji', text: 'Emoji', description: 'Fun, Simple', icon: <Smile size={24} /> },
            { value: 'SVG', text: 'SVG Icons', description: 'Clean, Scalable', icon: <ImageIcon size={24} /> },
            { value: 'Custom', text: 'Custom', description: 'Unique Style', icon: <Palette size={24} /> }
          ].map((iconStyle) => {
            const isSelected = selections.iconStyle === iconStyle.value;
            return (
              <button
                key={iconStyle.value}
                onClick={() => updateSelection('iconStyle', iconStyle.value as IconStyle)}
                className={`relative p-3 rounded-lg border-2 transition-all duration-200 transform hover:scale-105 
                           text-center flex flex-col items-center justify-center aspect-square
                           ${isSelected 
                             ? 'bg-[#F26545] text-white border-[#F26545] ring-4 ring-[#F26545]/20 ring-offset-2 scale-105 shadow-xl' 
                             : 'bg-white hover:bg-slate-50 border-slate-300 hover:border-[#F26545]/70 text-slate-700 shadow-md hover:shadow-lg'
                           }`}
              >
                <div className={`mb-2 ${isSelected ? 'text-white' : 'text-slate-600'}`}>
                  {iconStyle.icon}
                </div>
                <span className={`text-xs font-medium mb-1 ${isSelected ? 'text-white' : 'text-slate-700'}`}>
                  {iconStyle.text}
                </span>
                <span className={`text-xs ${isSelected ? 'text-white/80' : 'text-slate-500'}`}>
                  {iconStyle.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <StepNavigation nextDisabled={!selections.uiStyle || !selections.cornerStyle || !selections.iconStyle} />
    </AnimatedContainer>
  );
};

export default DesignStep;
