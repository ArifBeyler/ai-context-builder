import React from 'react';
import { Check } from 'lucide-react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  wrapperClassName?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({ label, id, wrapperClassName, className, checked, ...props }) => {
  return (
    <div className={`flex items-center mb-4 ${wrapperClassName}`}>
      <div className="relative">
        <input
          id={id || props.name}
          type="checkbox"
          checked={checked}
          className={`sr-only ${className}`}
          {...props}
        />
        <label 
          htmlFor={id || props.name} 
          className={`flex items-center justify-center w-6 h-6 border-2 rounded-md cursor-pointer transition-all duration-200 
                     ${checked 
                       ? 'bg-[#F26545] border-[#F26545] text-white shadow-lg' 
                       : 'bg-white border-slate-300 hover:border-[#F26545]/70 hover:bg-slate-50'
                     }`}
        >
          {checked && <Check size={16} className="text-white" strokeWidth={3} />}
        </label>
      </div>
      <label htmlFor={id || props.name} className="ml-3 block text-sm text-slate-700 cursor-pointer select-none">
        {label}
      </label>
    </div>
  );
};

export default Checkbox;
