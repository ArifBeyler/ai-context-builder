import React from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { AppFont } from '../../types';
import { APP_FONTS } from '../../constants';
import StepNavigation from './StepNavigation';
import AnimatedContainer from '../shared/AnimatedContainer';
import { Check, Type } from 'lucide-react';

const FontStep: React.FC = () => {
  const { selections, updateSelection } = useAppContext();
  const aiSuggestedFont = selections.aiSuggestions.font;
  const aiFontReason = selections.aiSuggestions.fontReason;

  const getFontClass = (font: AppFont) => {
    if (!font) return 'font-sans';
    
    const fontMap: Record<string, string> = {
      'Poppins': 'font-sans',
      'Inter': 'font-sans',
      'SF Pro': 'font-sans',
      'Roboto': 'font-sans',
      'Montserrat': 'font-sans',
      'Lato': 'font-sans'
    };
    return fontMap[font] || 'font-sans';
  };

  return (
    <AnimatedContainer staggerChildren={true} staggerDelay={200} className="space-y-6">
      {aiSuggestedFont && aiFontReason && (
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 shadow-md">
          <p className="text-sm text-slate-700"> 
            <span className="font-semibold text-[#F26545]">AI Suggestion:</span> Based on your app idea, <span className="font-semibold">{aiSuggestedFont}</span> might be a good choice because: "{aiFontReason}"
          </p>
        </div>
      )}
      
      <div className="space-y-4">
        <span className="block text-sm font-medium text-slate-700 mb-2">Select Primary Font:</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {APP_FONTS.map((font) => {
            const isSelected = selections.font === font;
            const isAISuggested = font === aiSuggestedFont;
            
            return (
              <button
                key={font}
                onClick={() => updateSelection('font', font as AppFont)}
                className={`relative p-4 rounded-lg border-2 transition-all duration-200 transform hover:scale-105 text-left
                            ${isSelected 
                              ? 'border-[#F26545] ring-2 ring-[#F26545] ring-offset-2 ring-offset-white scale-105 bg-[#F26545] text-white shadow-xl' 
                              : 'border-slate-300 hover:border-[#F26545]/70 bg-white hover:bg-slate-50 shadow-lg hover:shadow-xl'
                            }`}
              >
                {/* Check mark for selected state */}
                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <Check size={20} className="text-white" strokeWidth={3} />
                  </div>
                )}
                
                {/* AI suggestion badge */}
                {isAISuggested && !isSelected && (
                  <div className="absolute top-2 right-2 bg-[#F26545] text-white text-xs px-2 py-1 rounded-full">
                    AI
                  </div>
                )}
                
                <div className="flex items-center space-x-3">
                  <Type size={24} className={isSelected ? 'text-white' : 'text-slate-600'} />
                  <div>
                    <h3 className={`font-semibold text-lg ${getFontClass(font)} ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                      {font}
                    </h3>
                    <p className={`text-sm ${getFontClass(font)} ${isSelected ? 'text-white/90' : 'text-slate-600'}`}>
                      The quick brown fox jumps
                    </p>
                    {isAISuggested && (
                      <span className={`text-xs ${isSelected ? 'text-white/80' : 'text-[#F26545]'} font-medium`}>
                        AI Suggested
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
      
      <StepNavigation nextDisabled={!selections.font} />
    </AnimatedContainer>
  );
};

export default FontStep;
