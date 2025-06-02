import React from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { COLOR_PALETTES } from '../../constants';
import StepNavigation from './StepNavigation';
import AnimatedContainer from '../shared/AnimatedContainer';
import { Check, Palette } from 'lucide-react';
import { ColorPalette } from '../../types';

const ColorPaletteStep: React.FC = () => {
  const { selections, updateSelection } = useAppContext();

  return (
    <AnimatedContainer staggerChildren={true} staggerDelay={200} className="space-y-6">
      <div className="text-center">
        <Palette size={24} className="mx-auto mb-2 text-slate-600" />
        <p className="text-slate-700 font-medium">Choose a color theme for your application</p>
        <p className="text-sm text-slate-500 mt-1">Select the palette that best matches your app's personality</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {COLOR_PALETTES.map(palette => {
          const isSelected = selections.colorPaletteId === palette.id;
          
          return (
            <button
              key={palette.id}
              onClick={() => updateSelection('colorPaletteId', palette.id)}
              className={`relative p-4 rounded-xl border-2 transition-all duration-200 transform hover:scale-105 bg-white
                         ${isSelected 
                           ? 'border-[#F26545] ring-4 ring-[#F26545]/20 ring-offset-2 scale-105 shadow-xl' 
                           : 'border-slate-200 hover:border-[#F26545]/70 shadow-lg hover:shadow-xl'
                         }`}
            >
              {/* Check mark for selected state */}
              {isSelected && (
                <div className="absolute top-3 right-3 bg-[#F26545] rounded-full p-1.5 shadow-lg">
                  <Check size={16} className="text-white" strokeWidth={3} />
                </div>
              )}
              
              {/* Color palette preview */}
              <div className="flex justify-center mb-3">
                <div className="flex space-x-1 p-2 bg-gray-50 rounded-lg">
                  {palette.id === 'primary-light-theme' && (
                    <>
                      <div className="w-12 h-12 rounded-lg bg-orange-50 border border-gray-200 shadow-sm"></div>
                      <div className="w-12 h-12 rounded-lg bg-orange-900 border border-gray-200 shadow-sm"></div>
                      <div className="w-12 h-12 rounded-lg bg-orange-500 border border-gray-200 shadow-sm"></div>
                    </>
                  )}
                  {palette.id === 'dark-default-theme' && (
                    <>
                      <div className="w-12 h-12 rounded-lg bg-slate-900 border border-gray-200 shadow-sm"></div>
                      <div className="w-12 h-12 rounded-lg bg-slate-100 border border-gray-200 shadow-sm"></div>
                      <div className="w-12 h-12 rounded-lg bg-orange-500 border border-gray-200 shadow-sm"></div>
                    </>
                  )}
                  {palette.id === 'ocean-blue' && (
                    <>
                      <div className="w-12 h-12 rounded-lg bg-blue-50 border border-gray-200 shadow-sm"></div>
                      <div className="w-12 h-12 rounded-lg bg-blue-900 border border-gray-200 shadow-sm"></div>
                      <div className="w-12 h-12 rounded-lg bg-blue-600 border border-gray-200 shadow-sm"></div>
                    </>
                  )}
                  {palette.id === 'forest-green' && (
                    <>
                      <div className="w-12 h-12 rounded-lg bg-green-50 border border-gray-200 shadow-sm"></div>
                      <div className="w-12 h-12 rounded-lg bg-green-900 border border-gray-200 shadow-sm"></div>
                      <div className="w-12 h-12 rounded-lg bg-green-600 border border-gray-200 shadow-sm"></div>
                    </>
                  )}
                  {palette.id === 'royal-purple' && (
                    <>
                      <div className="w-12 h-12 rounded-lg bg-purple-50 border border-gray-200 shadow-sm"></div>
                      <div className="w-12 h-12 rounded-lg bg-purple-900 border border-gray-200 shadow-sm"></div>
                      <div className="w-12 h-12 rounded-lg bg-purple-600 border border-gray-200 shadow-sm"></div>
                    </>
                  )}
                  {palette.id === 'rose-gold' && (
                    <>
                      <div className="w-12 h-12 rounded-lg bg-rose-50 border border-gray-200 shadow-sm"></div>
                      <div className="w-12 h-12 rounded-lg bg-rose-900 border border-gray-200 shadow-sm"></div>
                      <div className="w-12 h-12 rounded-lg bg-rose-500 border border-gray-200 shadow-sm"></div>
                    </>
                  )}
                  {palette.id === 'cyber-neon' && (
                    <>
                      <div className="w-12 h-12 rounded-lg bg-gray-900 border border-gray-200 shadow-sm"></div>
                      <div className="w-12 h-12 rounded-lg bg-cyan-300 border border-gray-200 shadow-sm"></div>
                      <div className="w-12 h-12 rounded-lg bg-cyan-500 border border-gray-200 shadow-sm"></div>
                    </>
                  )}
                  {palette.id === 'monochrome' && (
                    <>
                      <div className="w-12 h-12 rounded-lg bg-gray-50 border border-gray-200 shadow-sm"></div>
                      <div className="w-12 h-12 rounded-lg bg-gray-900 border border-gray-200 shadow-sm"></div>
                      <div className="w-12 h-12 rounded-lg bg-gray-600 border border-gray-200 shadow-sm"></div>
                    </>
                  )}
                </div>
              </div>
              
              {/* Palette name and description */}
              <div className="text-center">
                <h3 className="font-semibold text-slate-900 mb-1">{palette.name}</h3>
                <div className="flex justify-center space-x-1 text-xs text-slate-500">
                  <span>Background</span>
                  <span>•</span>
                  <span>Text</span>
                  <span>•</span>
                  <span>Accent</span>
                </div>
              </div>
              
              {/* Special badges */}
              {palette.id === 'primary-light-theme' && (
                <div className="absolute top-3 left-3 bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">
                  Default
                </div>
              )}
              {palette.id === 'dark-default-theme' && (
                <div className="absolute top-3 left-3 bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">
                  Dark
                </div>
              )}
            </button>
          );
        })}
      </div>
      
      <StepNavigation nextDisabled={!selections.colorPaletteId} />
    </AnimatedContainer>
  );
};

export default ColorPaletteStep;
