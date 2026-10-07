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
      {/* Precision Financial Obligation & Liquidity Emblem (Solid Teal, Blue & White) */}
      <div
        className={`${iconDimension} rounded-xl bg-teal-600 p-2 flex items-center justify-center border border-teal-700 shadow-sm shrink-0 relative overflow-hidden group`}
      >
        {/* Custom Financial Flow & Interlocking Obligation Vector (No Gradients) */}
        <svg
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full transform transition-transform group-hover:scale-105"
        >
          {/* Base Connected Obligation Grid Line */}
          <line
            x1="6"
            y1="28"
            x2="30"
            y2="28"
            stroke="#ffffff"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Upstream Inflow Financial Pillar (Teal/White) */}
          <rect
            x="7"
            y="18"
            width="5"
            height="10"
            rx="1.5"
            fill="#ffffff"
          />

          {/* Central Buffer & Obligation Node (Solid Blue) */}
          <rect
            x="15.5"
            y="12"
            width="5"
            height="16"
            rx="1.5"
            fill="#1d4ed8"
            stroke="#ffffff"
            strokeWidth="1.5"
          />

          {/* Downstream Growth / Forward-Looking Obligation Pillar (Solid White) */}
          <rect
            x="24"
            y="6"
            width="5"
            height="22"
            rx="1.5"
            fill="#ffffff"
          />

          {/* Interlocking Dependency Trajectory Vector (Solid Blue Arrow & Nodes) */}
          <path
            d="M 9.5 15 L 18 9 L 26.5 4"
            stroke="#1d4ed8"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Upstream Node Point */}
          <circle cx="9.5" cy="15" r="2" fill="#ffffff" stroke="#1d4ed8" strokeWidth="1.5" />

          {/* Downstream Pinnacle Node Point */}
          <circle cx="26.5" cy="4" r="2.2" fill="#ffffff" stroke="#1d4ed8" strokeWidth="1.5" />
        </svg>
      </div>

      {/* Brand Typography */}
      <div>
        <div className="flex items-center space-x-2">
          <span className={`font-extrabold ${titleSize} tracking-tight text-slate-900 leading-none`}>
            OBLIGO
          </span>
          <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
            FINTECH
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
