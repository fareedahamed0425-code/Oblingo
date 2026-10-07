'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  X,
  LayoutDashboard,
  Layers,
  TrendingUp,
  GitFork,
  SlidersHorizontal,
  ShieldAlert,
  BotMessageSquare,
  Zap,
  Calendar,
  Wallet,
  ChevronDown,
  ArrowRight,
} from 'lucide-react';
import { Logo } from './Logo';
import { formatINR } from '@/utils/formatters';
import { BASE_STARTING_CASH } from '@/data/seedData';

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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const navItems: Array<{
    id: TabType;
    label: string;
    description: string;
    icon: React.ReactNode;
    badge?: string;
  }> = [
    {
      id: 'dashboard',
      label: 'Financial Dashboard',
      description: 'KPI summary, early warnings & 30-day cash timeline',
      icon: <LayoutDashboard className="w-4 h-4 text-teal-600" />,
    },
    {
      id: 'obligations',
      label: 'Obligations Ledger',
      description: 'Directory of 32 verified financial commitments',
      icon: <Layers className="w-4 h-4 text-blue-600" />,
      badge: '32 Items',
    },
    {
      id: 'cashflow',
      label: 'Cash Flow Timeline',
      description: 'Daily cash projection curve & safety buffer monitoring',
      icon: <TrendingUp className="w-4 h-4 text-teal-700" />,
    },
    {
      id: 'graph',
      label: 'Dependency Graph',
      description: 'Interactive causal links & downstream cascade tracing',
      icon: <GitFork className="w-4 h-4 text-blue-700" />,
    },
    {
      id: 'scenarios',
      label: 'Scenario Simulator',
      description: 'What-If simulation & delay stress testing',
      icon: <SlidersHorizontal className="w-4 h-4 text-teal-600" />,
      badge: 'What-If',
    },
    {
      id: 'risks',
      label: 'Risk Center & Diagnostics',
      description: '4-factor analytical scoring diagnostics',
      icon: <ShieldAlert className="w-4 h-4 text-rose-600" />,
      badge: 'Medium Risk',
    },
    {
      id: 'assistant',
      label: 'AI Intelligence Assistant',
      description: 'Deterministic obligation analysis via NVIDIA Nemotron',
      icon: <BotMessageSquare className="w-4 h-4 text-blue-600" />,
    },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeItem = navItems.find((item) => item.id === activeTab) || navItems[0];

  return (
    <div className="sticky top-4 z-40 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pointer-events-none">
      <div className="flex flex-wrap items-center justify-between gap-3 pointer-events-auto">
        {/* Floating Item 1: Brand & Logo Pill */}
        <div className="bg-white px-3.5 py-2 rounded-2xl border border-slate-200 shadow-sm hover:shadow transition-shadow">
          <button
            onClick={() => {
              onSelectTab('dashboard');
              setIsMenuOpen(false);
            }}
            className="focus:outline-none flex items-center"
          >
            <Logo size="md" showSubtitle={true} />
          </button>
        </div>

        {/* Floating Item 2: Menu Module Selector Button */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center space-x-2.5 px-4 py-2.5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 text-slate-800 text-xs font-bold transition-all shadow-sm hover:shadow"
          >
            <div className="p-1 rounded-lg bg-teal-50 text-teal-700">
              <Menu className="w-3.5 h-3.5" />
            </div>
            <span className="hidden sm:inline text-slate-400 font-medium">Module:</span>
            <span className="text-slate-900 font-bold">{activeItem.label}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Menu Dropdown Modal */}
          {isMenuOpen && (
            <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-slate-200 shadow-2xl p-2 z-50 animate-fadeIn space-y-1">
              <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Select Intelligence View
                </span>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1 max-h-[420px] overflow-y-auto py-1">
                {navItems.map((item) => {
                  const isSelected = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSelectTab(item.id);
                        setIsMenuOpen(false);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start space-x-3 group ${
                        isSelected
                          ? 'bg-teal-50 border border-teal-200 text-teal-950'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className={`p-2 rounded-lg mt-0.5 ${isSelected ? 'bg-white shadow-sm' : 'bg-slate-100 group-hover:bg-white'}`}>
                        {item.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className={`text-xs font-bold ${isSelected ? 'text-teal-900' : 'text-slate-900 group-hover:text-teal-700'}`}>
                            {item.label}
                          </span>
                          {item.badge && (
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                          {item.description}
                        </p>
                      </div>
                      {isSelected && (
                        <ArrowRight className="w-4 h-4 text-teal-700 shrink-0 self-center" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Floating Item 3: Reference Date & Available Cash Pill */}
        <div className="hidden lg:flex items-center space-x-2.5 px-4 py-2.5 rounded-2xl bg-white border border-slate-200 shadow-sm text-xs text-slate-700">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[11px] text-slate-400 font-medium">Ref:</span>
          <span className="font-mono text-[11px] text-slate-800 font-bold">15 Sep 2026</span>
          <span className="text-slate-300">|</span>
          <Wallet className="w-3.5 h-3.5 text-teal-600" />
          <span className="font-mono text-[11px] text-teal-700 font-extrabold">
            {formatINR(BASE_STARTING_CASH, true)}
          </span>
        </div>

        {/* Floating Item 4: Hero Delay Scenario Button (Solid Teal) */}
        <div className="bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
          <button
            onClick={onTriggerHeroDemo}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
              isHeroDemoActive
                ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
                : 'bg-teal-600 hover:bg-teal-700 text-white hover:bg-teal-700'
            }`}
          >
            <Zap className="w-3.5 h-3.5 fill-current text-white" />
            <span>
              {isHeroDemoActive ? 'Active Demo: Customer Delay' : 'Hero Scenario: 10-Day Delay'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
