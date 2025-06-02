
import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  wrapperClassName?: string;
}

const Textarea: React.FC<TextareaProps> = ({ label, id, error, className, wrapperClassName, ...props }) => {
  return (
    <div className={`mb-4 ${wrapperClassName}`}>
      {label && <label htmlFor={id || props.name} className="block text-sm font-medium text-slate-700 mb-1">{label}</label>}
      <textarea
        id={id || props.name}
        rows={4}
        className={`w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-[#292F3B] placeholder-slate-400 focus:ring-2 focus:ring-[#F26545] focus:border-[#F26545] outline-none transition-colors duration-200 ease-in-out shadow-sm hover:shadow-md ${error ? 'border-red-500 focus:ring-red-400' : 'border-slate-300'} ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default Textarea;
