import React from 'react';
import logo from '../assets/logo.png';

export default function Logo({ size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'h-6 max-h-6 max-w-[140px]',
    md: 'h-8 max-h-8 sm:h-9 sm:max-h-9 max-w-[190px]',
    lg: 'h-11 max-h-11 sm:h-12 sm:max-h-12 max-w-[240px]'
  }[size] || 'h-8 max-h-8 sm:h-9 sm:max-h-9 max-w-[190px]';

  return (
    <img
      src={logo}
      alt="FixMyCampus"
      className={`w-auto shrink-0 object-contain select-none block ${sizeClasses} ${className}`}
    />
  );
}
