import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  className = '', 
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' | 'danger', isLoading?: boolean }) => {
  
  const baseStyle = "px-4 py-3 rounded-lg font-medium transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2";
  const variants = {
    primary: "bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/20 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200",
    secondary: "bg-amber-500 text-white hover:bg-amber-600 shadow-lg shadow-amber-500/20",
    outline: "border-2 border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800",
    danger: "bg-red-500 text-white hover:bg-red-600"
  };

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${className}`} 
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
};

export const Input = ({ label, error, className = '', ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label?: string, error?: string }) => (
  <div className="flex flex-col gap-1 w-full">
    {label && <label className="text-sm font-medium text-slate-600 dark:text-slate-300">{label}</label>}
    <input 
      className={`px-4 py-3 rounded-lg border bg-white dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none transition-all ${error ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} ${className}`}
      {...props}
    />
    {error && <span className="text-xs text-red-500">{error}</span>}
  </div>
);

export const Select = ({ label, options, className = '', ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string, options: { label: string, value: string }[] }) => (
  <div className="flex flex-col gap-1 w-full">
    {label && <label className="text-sm font-medium text-slate-600 dark:text-slate-300">{label}</label>}
    <div className="relative">
      <select 
        className={`w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-white appearance-none focus:ring-2 focus:ring-amber-500/50 outline-none ${className}`}
        {...props}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
      </div>
    </div>
  </div>
);

export const Card: React.FC<{ children?: React.ReactNode, className?: string, onClick?: () => void }> = ({ children, className = '', onClick }) => (
  <div onClick={onClick} className={`bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm p-5 ${className}`}>
    {children}
  </div>
);

export const Modal: React.FC<{ isOpen: boolean, onClose: () => void, title: string, children?: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 dark:border dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 18 18"/></svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};