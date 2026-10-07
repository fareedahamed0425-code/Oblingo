'use client';

import React from 'react';
import {
  LayoutDashboard,
  Layers,
  TrendingUp,
  GitFork,
  SlidersHorizontal,
  ShieldAlert,
  BotMessageSquare,
  Sparkles,
  Zap,
  Calendar,
  Wallet,
} from 'lucide-react';
import { formatINR } from '@/utils/formatters';
import { BASE_STARTING_CASH, REFERENCE_DATE } from '@/data/seedData';

export type TabType =
  | 'dashboard'
  | 'obligations'
  | 'cashflow'
  | 'graph'
  | 'scenarios'
  | 'risks'
  | 'assistant';

interface NavbarProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  onTriggerHeroDemo: () => void;
  isHeroDemoActive?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  onTriggerHeroDemo,
  isHeroDemoActive,
}) => {
  const navItems: Array<{ id: TabType; label: string; icon: React.ReactNode; badge?: string }> = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'obligations', label: 'Obligations', icon: <Layers className="w-4 h-4" />, badge: '32' },
    { id: 'cashflow', label: 'Cash Flow', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'graph', label: 'Dependency Graph', icon: <GitFork className="w-4 h-4" /> },
    { id: 'scenarios', label: 'Scenarios', icon: <SlidersHorizontal className="w-4 h-4" />, badge: 'What-If' },
    { id: 'risks', label: 'Risk Center', icon: <ShieldAlert className="w-4 h-4" />, badge: 'Medium' },
    { id: 'assistant', label: 'AI Assistant', icon: <BotMessageSquare className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#0b0f19]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => onSelectTab('dashboard')}
              className="flex items-center space-x-2.5 group text-left focus:outline-none"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
                <span className="font-extrabold text-white text-lg tracking-wider">O</span>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-lg tracking-tight text-white">OBLIGO</span>
                  <span className="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    Intelligence MVP
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium leading-none">
                  Financial Obligation Intelligence
                </p>
              </div>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono ${
                        item.badge === 'Medium'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : item.badge === 'What-If'
                          ? 'bg-indigo-500/20 text-indigo-300'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action: Demo Trigger & Status Stats */}
          <div className="flex items-center space-x-3">
            {/* System Status Pill */}
            <div className="hidden sm:flex items-center space-x-2 px-2.5 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[11px] text-slate-400">Ref:</span>
              <span className="font-mono text-[11px] text-slate-200 font-medium">15 Sep 2026</span>
              <span className="text-slate-700">|</span>
              <Wallet className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-mono text-[11px] text-emerald-400 font-semibold">
                {formatINR(BASE_STARTING_CASH, true)}
              </span>
            </div>

            {/* Hero Demo Trigger Button */}
            <button
              onClick={onTriggerHeroDemo}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-md ${
                isHeroDemoActive
                  ? 'bg-gradient-to-r from-amber-600 to-rose-600 text-white shadow-rose-500/20 ring-2 ring-rose-500/50 animate-pulse'
                  : 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white shadow-indigo-500/20 hover:scale-[1.02]'
              }`}
              title="Simulate 10-day Customer A (Nexus Retail) payment delay hero scenario"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span className="hidden sm:inline">
                {isHeroDemoActive ? 'Active Demo: Customer A 10-Day Delay' : '⚡ Hero Demo: 10-Day Delay'}
              </span>
              <span className="sm:hidden">⚡ Demo</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="lg:hidden flex items-center space-x-1 py-2 overflow-x-auto no-scrollbar border-t border-slate-800/50">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
