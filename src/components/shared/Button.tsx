
import React, { ReactNode } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  isLoading = false,
  ...props 
}) => {
  const baseStyles = "font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-opacity-75 transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center shadow-md hover:shadow-lg";

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  // Updated variant styles for light theme
  const variantStyles = {
    primary: 'text-white bg-[#F26545] hover:bg-[#E05434] focus:ring-[#F26545] disabled:bg-slate-300 disabled:text-slate-500', // Orange primary
    secondary: 'text-[#292F3B] bg-slate-200 hover:bg-slate-300 focus:ring-slate-400 disabled:bg-slate-100 disabled:text-slate-400', // Light gray secondary
    outline: 'text-[#F26545] border border-[#F26545] hover:bg-[#F26545]/10 focus:ring-[#F26545] disabled:border-slate-300 disabled:text-slate-400 disabled:hover:bg-transparent', // Orange outline
    ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-800 focus:ring-slate-300 disabled:text-slate-400', // For less prominent actions
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <svg className={`animate-spin -ml-1 mr-3 h-5 w-5 ${variant === 'primary' ? 'text-white' : 'text-[#F26545]'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : children}
    </button>
  );
};

export default Button;
