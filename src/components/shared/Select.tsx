
import React, { ReactNode } from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  children: ReactNode;
  wrapperClassName?: string;
}

const Select: React.FC<SelectProps> = ({ label, id, error, children, className, wrapperClassName, ...props }) => {
  return (
    <div className={`mb-4 ${wrapperClassName}`}>
      {label && <label htmlFor={id || props.name} className="block text-sm font-medium text-slate-700 mb-1">{label}</label>}
      <select
        id={id || props.name}
        className={`w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-[#292F3B] focus:ring-2 focus:ring-[#F26545] focus:border-[#F26545] outline-none transition-colors duration-200 ease-in-out appearance-none pr-8 bg-no-repeat bg-right shadow-sm hover:shadow-md ${error ? 'border-red-500 focus:ring-red-400' : 'border-slate-300'} ${className}`}
        style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%234B5563' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundSize: '1.5em 1.5em' }}
        {...props}
      >
        {children}
      </select>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default Select;
