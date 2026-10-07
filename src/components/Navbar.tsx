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
  ShieldCheck,
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
      description: 'KPI summary, early warnings & 30-day timeline',
      icon: <LayoutDashboard className="w-4 h-4 text-indigo-600" />,
    },
    {
      id: 'obligations',
      label: 'Obligations Ledger',
      description: 'Search & filter 32+ verified commitments',
      icon: <Layers className="w-4 h-4 text-blue-600" />,
      badge: '32 Items',
    },
    {
      id: 'cashflow',
      label: 'Cash Flow Timeline',
      description: 'Forward-looking daily balance & buffer health',
      icon: <TrendingUp className="w-4 h-4 text-emerald-600" />,
    },
    {
      id: 'graph',
      label: 'Dependency Graph',
      description: 'Interactive causal links & cascade tracing',
      icon: <GitFork className="w-4 h-4 text-violet-600" />,
    },
    {
      id: 'scenarios',
      label: 'Scenario Simulator',
      description: 'What-If simulation & delay stress testing',
      icon: <SlidersHorizontal className="w-4 h-4 text-amber-600" />,
      badge: 'What-If',
    },
    {
      id: 'risks',
      label: 'Risk Center & Explainability',
      description: '4-factor analytical scoring diagnostics',
      icon: <ShieldAlert className="w-4 h-4 text-rose-600" />,
      badge: 'Medium Risk',
    },
    {
      id: 'assistant',
      label: 'AI Intelligence Assistant',
      description: 'Deterministic obligation Q&A via NVIDIA Nemotron',
      icon: <BotMessageSquare className="w-4 h-4 text-indigo-600" />,
    },
  ];

  // Close menu on click outside
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
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Brand & Menu Button */}
          <div className="flex items-center space-x-4">
            {/* Logo */}
            <button
              onClick={() => {
                onSelectTab('dashboard');
                setIsMenuOpen(false);
              }}
              className="flex items-center space-x-2.5 group text-left focus:outline-none"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-700 flex items-center justify-center shadow-md shadow-indigo-600/20 group-hover:scale-105 transition-transform">
                <span className="font-extrabold text-white text-lg tracking-wider">O</span>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-lg tracking-tight text-slate-900">OBLIGO</span>
                  <span className="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Intelligence
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium leading-none">
                  Financial Obligation Intelligence
                </p>
              </div>
            </button>

            {/* Menu Button with Active Section Indicator */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-800 text-xs font-semibold transition-all shadow-sm"
              >
                <Menu className="w-4 h-4 text-indigo-600" />
                <span className="hidden sm:inline text-slate-500">Module:</span>
                <span className="text-slate-900 font-bold">{activeItem.label}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Menu Dropdown Modal */}
              {isMenuOpen && (
                <div className="absolute left-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-slate-200 shadow-2xl p-2 z-50 animate-fadeIn space-y-1">
                  <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Select Financial Intelligence View
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
                              ? 'bg-indigo-50/90 border border-indigo-200 text-indigo-950'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className={`p-2 rounded-lg mt-0.5 ${isSelected ? 'bg-white shadow-sm' : 'bg-slate-100 group-hover:bg-white'}`}>
                            {item.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <span className={`text-xs font-bold ${isSelected ? 'text-indigo-900' : 'text-slate-900 group-hover:text-indigo-600'}`}>
                                {item.label}
                              </span>
                              {item.badge && (
                                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded font-semibold bg-slate-200 text-slate-700">
                                  {item.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                              {item.description}
                            </p>
                          </div>
                          {isSelected && (
                            <ArrowRight className="w-4 h-4 text-indigo-600 shrink-0 self-center" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Action: Status Pill & Demo Trigger */}
          <div className="flex items-center space-x-3">
            {/* System Status Pill */}
            <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-700">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-[11px] text-slate-500">Ref:</span>
              <span className="font-mono text-[11px] text-slate-800 font-semibold">15 Sep 2026</span>
              <span className="text-slate-300">|</span>
              <Wallet className="w-3.5 h-3.5 text-emerald-600" />
              <span className="font-mono text-[11px] text-emerald-700 font-bold">
                {formatINR(BASE_STARTING_CASH, true)}
              </span>
            </div>

            {/* Hero Demo Button */}
            <button
              onClick={onTriggerHeroDemo}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                isHeroDemoActive
                  ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200 animate-pulse'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200 hover:scale-[1.02]'
              }`}
            >
              <Zap className="w-3.5 h-3.5 fill-current text-amber-300" />
              <span className="hidden sm:inline">
                {isHeroDemoActive ? 'Active Demo: Customer A Delay' : '⚡ Hero Scenario: 10-Day Delay'}
              </span>
              <span className="sm:hidden">⚡ Demo</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
