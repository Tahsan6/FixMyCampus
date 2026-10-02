import React from 'react';

export default function Logo({ size = 'md', className = '' }) {
  const isSm = size === 'sm';
  const isLg = size === 'lg';

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Brand Icon */}
      <div className={`relative shrink-0 flex items-center justify-center rounded-xl bg-[#4338CA] shadow-sm shadow-indigo-600/25 ${
        isSm ? 'h-7 w-7 rounded-lg' : isLg ? 'h-11 w-11 rounded-2xl' : 'h-9 w-9'
      }`}>
        <svg 
          viewBox="0 0 32 32" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg" 
          className={isSm ? 'h-4 w-4' : isLg ? 'h-6 w-6' : 'h-5 w-5'}
        >
          <path 
            d="M7.5 16.5L13 22L22.5 10.5" 
            stroke="white" 
            strokeWidth="3.2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          <path 
            d="M20.5 8.5L24.5 12" 
            stroke="white" 
            strokeWidth="2.8" 
            strokeLinecap="round" 
          />
        </svg>
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col leading-none">
        <span className={`font-black tracking-tight text-slate-900 ${
          isSm ? 'text-base' : isLg ? 'text-2xl' : 'text-lg'
        }`}>
          FixMy<span className="text-indigo-600">Campus</span>
        </span>
        <span className={`font-extrabold uppercase tracking-[0.22em] text-slate-400 mt-1 ${
          isSm ? 'text-[7px]' : isLg ? 'text-[9.5px]' : 'text-[8px]'
        }`}>
          Facilities &amp; Reporting
        </span>
      </div>
    </div>
  );
}
