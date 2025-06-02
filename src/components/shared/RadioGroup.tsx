import React from 'react';
import { Check } from 'lucide-react'; // Import the Check icon

export interface RadioOption {
  value: string;
  text: string; // Main text label
  icon?: React.ReactNode; // Optional SVG icon component
}

interface RadioGroupProps {
  options: RadioOption[];
  selectedValue: string;
  onChange: (value: string) => void;
  name: string;
  label?: string;
  wrapperClassName?: string;
  gridCols?: string; // New prop for grid columns (e.g., "grid-cols-3")
}

const RadioGroup: React.FC<RadioGroupProps> = ({ options, selectedValue, onChange, name, label, wrapperClassName, gridCols = "grid-cols-2" }) => {
  return (
    <div className={`mb-4 ${wrapperClassName}`}>
      {label && <span className="block text-sm font-medium text-slate-700 mb-2">{label}</span>}
      <div className={`grid ${gridCols} gap-4 sm:gap-5`}>
        {options.map((option) => {
          const isSelected = selectedValue === option.value;
          
          return (
            <label
              key={option.value}
              className={`
                relative flex flex-col items-center justify-center text-center
                cursor-pointer p-4 rounded-lg transition-all duration-200 transform hover:scale-105
                shadow-md hover:shadow-lg aspect-square
                ${isSelected 
                  ? 'bg-[#F26545] text-white border-4 border-[#F26545] ring-4 ring-[#F26545]/20 ring-offset-2 ring-offset-white shadow-2xl scale-105' 
                  : 'bg-white hover:bg-slate-50 border-2 border-slate-300 hover:border-[#F26545]/70 text-slate-700'
                }
              `}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={isSelected}
                onChange={(e) => onChange(e.target.value)}
                className="sr-only" // Visually hide the radio button but keep it accessible
              />
              
              {/* Check mark for selected state - larger and more prominent */}
              {isSelected && (
                <div className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-lg">
                  <Check size={20} className="text-[#F26545]" strokeWidth={4} />
                </div>
              )}
              
              {option.icon && (
                <span className={`mb-3 transition-colors duration-200 [&>svg]:w-10 [&>svg]:h-10 sm:[&>svg]:w-12 sm:[&>svg]:h-12
                                ${isSelected ? 'text-white' : 'text-slate-600'}`}>
                  {option.icon}
                </span>
              )}
              
              <span className={`text-xs sm:text-sm font-medium transition-colors duration-200 
                              ${option.icon ? '' : 'text-center w-full'}
                              ${isSelected ? 'text-white' : 'text-slate-700'}`}>
                {option.text}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
};

export default RadioGroup;
