// // Reusable Enterprise Button component with asynchronous loading states
'use client';
import React from 'react';

export default function Button({ 
  children, 
  onClick, 
  variant = 'primary', 
  loading = false, 
  disabled = false, 
  type = 'button' 
}) {
  const baseStyles = "px-4 py-2.5 rounded-lg text-xs font-semibold transition-all shadow-lg flex items-center justify-center space-x-2 focus:outline-none";
  
  const variants = {
    primary: "bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50",
    danger: "bg-rose-600 hover:bg-rose-500 text-white disabled:opacity-50",
    secondary: "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 disabled:opacity-50"
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary}`}
    >
      {loading && (
        <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
      )}
      <span>{children}</span>
    </button>
  );
}