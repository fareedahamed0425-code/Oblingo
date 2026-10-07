'use client';

import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', showSubtitle = true }) => {
  const isSm = size === 'sm';
  const isLg = size === 'lg';

  const iconDimension = isSm ? 'w-8 h-8' : isLg ? 'w-12 h-12' : 'w-10 h-10';
  const titleSize = isSm ? 'text-base' : isLg ? 'text-2xl' : 'text-lg';

  return (
    <div className="flex items-center space-x-3">
      {/* Precision Geometric Nano Banana Fintech Icon */}
      <div
        className={`${iconDimension} rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-2 flex items-center justify-center border border-slate-700/80 shadow-md shadow-slate-900/10 shrink-0 relative overflow-hidden group`}
      >
        {/* Subtle Ambient Light */}
        <div className="absolute -top-3 -right-3 w-8 h-8 bg-amber-400/20 rounded-full blur-sm" />
        
        {/* Custom SVG Nano Banana & Liquidity Arch */}
        <svg
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full transform transition-transform group-hover:scale-105"
        >
          {/* Background Structural Arc */}
          <path
            d="M 6 26 C 10 32, 26 32, 30 18"
            stroke="#6366f1"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="2 3"
            opacity="0.6"
          />

          {/* Primary Nano Banana Vector Curve (Golden Amber to Bright Yellow) */}
          <path
            d="M 8 11 C 11 18, 17 28, 28 26 C 29.5 25.7, 30 24, 28.5 23.5 C 20 20.5, 15 15, 12 7 C 11.2 5.5, 9 6, 8 7.5 Z"
            fill="url(#bananaGradient)"
            stroke="#f59e0b"
            strokeWidth="0.8"
          />

          {/* Banana Crown / Node Connection Tip */}
          <circle cx="8.5" cy="7.5" r="1.5" fill="#10b981" />
          
          {/* Banana Base Node */}
          <circle cx="28.5" cy="25" r="1.5" fill="#6366f1" />

          {/* Precision Core Highlights */}
          <path
            d="M 11 13 C 14 18, 19 23, 26 23.5"
            stroke="#fef08a"
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity="0.85"
          />

          {/* Gradients */}
          <defs>
            <linearGradient id="bananaGradient" x1="8" y1="6" x2="30" y2="28" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="25%" stopColor="#eab308" />
              <stop offset="70%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Brand Typography */}
      <div>
        <div className="flex items-center space-x-2">
          <span className={`font-extrabold ${titleSize} tracking-tight text-slate-900 leading-none`}>
            OBLIGO
          </span>
          <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
            Nano
          </span>
        </div>
        {showSubtitle && (
          <p className="text-[10px] text-slate-500 font-semibold tracking-tight mt-0.5 leading-none">
            Financial Obligation Intelligence
          </p>
        )}
      </div>
    </div>
  );
};
