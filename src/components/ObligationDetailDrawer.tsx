'use client';

import React from 'react';
import {
  X,
  Layers,
  ArrowRight,
  AlertTriangle,
  Calendar,
  Building2,
  FileText,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Sparkles,
  GitFork,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';
import { Obligation, RiskAnalysis } from '@/types';
import { formatINR, formatDate, getRiskBadgeClasses, getStatusBadgeClasses } from '@/utils/formatters';

interface ObligationDetailDrawerProps {
  obligation: Obligation | null;
  riskAnalysis?: RiskAnalysis | null;
  allObligations: Obligation[];
  onClose: () => void;
  onSelectObligation: (id: string) => void;
  onOpenInGraph?: (id: string) => void;
  onSimulateObligationDelay?: (id: string) => void;
}

export const ObligationDetailDrawer: React.FC<ObligationDetailDrawerProps> = ({
  obligation,
  riskAnalysis,
  allObligations,
  onClose,
  onSelectObligation,
  onOpenInGraph,
  onSimulateObligationDelay,
}) => {
  if (!obligation) return null;

  const riskStyles = getRiskBadgeClasses(obligation.riskLevel);
  const statusStyles = getStatusBadgeClasses(obligation.status);

  const upstreamDependencies = allObligations.filter((o) => obligation.dependencies.includes(o.id));
  const downstreamDependents = allObligations.filter((o) => obligation.dependentObligations.includes(o.id));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end animate-fadeIn">
      <div className="w-full max-w-xl bg-[#0f172a] border-l border-slate-800 shadow-2xl h-full flex flex-col z-50 overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-slate-800/80 bg-slate-900/50 sticky top-0 z-10 backdrop-blur-md flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-1.5">
              <span className={`px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider border ${statusStyles.bg} ${statusStyles.text}`}>
                {obligation.status.replace('_', ' ')}
              </span>
              <span className={`px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider border ${riskStyles.bg} ${riskStyles.text} ${riskStyles.border}`}>
                {obligation.riskLevel} RISK
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {obligation.type.replace('_', ' ')}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {obligation.counterparty}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">{obligation.description}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 flex-1">
          {/* Main Financial Card */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div>
              <p className="text-xs text-slate-400 font-medium">Obligation Amount</p>
              <div className="flex items-baseline space-x-1.5 mt-1">
                <span className={`text-2xl font-extrabold font-mono ${obligation.category === 'INFLOW' ? 'text-emerald-400' : 'text-slate-100'}`}>
                  {formatINR(obligation.amount)}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 flex items-center space-x-1">
                {obligation.category === 'INFLOW' ? (
                  <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <ArrowUpRight className="w-3.5 h-3.5 text-rose-400" />
                )}
                <span>{obligation.category === 'INFLOW' ? 'Expected Inflow' : 'Committed Outflow'}</span>
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400 font-medium">Due & Expected Date</p>
              <div className="flex items-center space-x-2 mt-1.5">
                <Calendar className="w-4 h-4 text-indigo-400" />
                <span className="text-sm font-semibold font-mono text-white">
                  {formatDate(obligation.expectedDate || obligation.dueDate, { includeYear: true })}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Source: <span className="font-mono text-slate-300">{obligation.source}</span>
              </p>
            </div>
          </div>

          {/* Quick Action Bar */}
          <div className="flex items-center space-x-2">
            {onOpenInGraph && (
              <button
                onClick={() => onOpenInGraph(obligation.id)}
                className="flex-1 flex items-center justify-center space-x-2 py-2.5 px-3 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-xs font-semibold transition-all"
              >
                <GitFork className="w-4 h-4" />
                <span>View in Dependency Graph</span>
              </button>
            )}
            {onSimulateObligationDelay && obligation.category === 'INFLOW' && (
              <button
                onClick={() => onSimulateObligationDelay(obligation.id)}
                className="flex-1 flex items-center justify-center space-x-2 py-2.5 px-3 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/30 text-amber-300 text-xs font-semibold transition-all"
              >
                <Clock className="w-4 h-4" />
                <span>Simulate Inflow Delay</span>
              </button>
            )}
          </div>

          {/* Explainability Breakdown */}
          {riskAnalysis && (
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center space-x-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    Analytical Explainability (Why & What)
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold text-amber-400">
                  Score: {riskAnalysis.overallScore}/100
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div>
                  <span className="text-[11px] font-bold uppercase text-slate-400 block mb-0.5">
                    Why is this rated {riskAnalysis.riskLevel}?
                  </span>
                  <p className="text-slate-300 leading-relaxed bg-slate-800/40 p-2.5 rounded-lg border border-slate-700/40">
                    {riskAnalysis.why}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-800/30 p-2 rounded-lg border border-slate-700/30">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">When Impact Occurs</span>
                    <span className="text-slate-200 font-medium">{riskAnalysis.when}</span>
                  </div>
                  <div className="bg-slate-800/30 p-2 rounded-lg border border-slate-700/30">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Financial Magnitude</span>
                    <span className="text-emerald-400 font-mono font-semibold">{formatINR(riskAnalysis.howMuch)}</span>
                  </div>
                </div>
              </div>

              {/* 4 Factor Breakdown */}
              <div className="pt-2 border-t border-slate-800">
                <span className="text-[11px] font-bold uppercase text-slate-400 block mb-2">
                  Risk Factor Breakdown (Analytical Engine)
                </span>
                <div className="space-y-1.5">
                  {riskAnalysis.factors.map((factor, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs bg-slate-800/30 p-2 rounded">
                      <div className="flex items-center space-x-2">
                        <span className={`w-2 h-2 rounded-full ${factor.status === 'DANGER' ? 'bg-red-400' : factor.status === 'WARNING' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                        <span className="text-slate-300 font-medium">{factor.name}</span>
                      </div>
                      <span className="font-mono text-slate-400">
                        {factor.score}/{factor.weight} pts
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Upstream & Downstream Dependencies */}
          <div className="space-y-4">
            {/* Upstream */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                  <span>Upstream Sources / Required Inflows</span>
                  <span className="text-[10px] bg-slate-800 px-1.5 py-0.2 rounded font-mono text-slate-300">
                    {upstreamDependencies.length}
                  </span>
                </h4>
              </div>
              {upstreamDependencies.length === 0 ? (
                <p className="text-xs text-slate-400 italic bg-slate-900/40 p-3 rounded-lg border border-slate-800/60">
                  Funded directly by existing working capital and opening cash reserves.
                </p>
              ) : (
                <div className="space-y-2">
                  {upstreamDependencies.map((dep) => (
                    <button
                      key={dep.id}
                      onClick={() => onSelectObligation(dep.id)}
                      className="w-full text-left p-3 rounded-lg bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 transition-colors flex items-center justify-between group"
                    >
                      <div>
                        <p className="text-xs font-semibold text-slate-200 group-hover:text-indigo-400 transition-colors">
                          {dep.counterparty}
                        </p>
                        <p className="text-[11px] text-slate-400 font-mono">
                          Expected: {formatDate(dep.expectedDate || dep.dueDate)} • {dep.type}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold font-mono text-emerald-400">
                          {formatINR(dep.amount)}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 ml-auto mt-1 group-hover:text-indigo-400 transition-colors" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Downstream */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                  <span>Downstream Dependent Obligations</span>
                  <span className="text-[10px] bg-slate-800 px-1.5 py-0.2 rounded font-mono text-slate-300">
                    {downstreamDependents.length}
                  </span>
                </h4>
              </div>
              {downstreamDependents.length === 0 ? (
                <p className="text-xs text-slate-400 italic bg-slate-900/40 p-3 rounded-lg border border-slate-800/60">
                  No downstream obligations directly dependent on this specific item.
                </p>
              ) : (
                <div className="space-y-2">
                  {downstreamDependents.map((dep) => (
                    <button
                      key={dep.id}
                      onClick={() => onSelectObligation(dep.id)}
                      className="w-full text-left p-3 rounded-lg bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 transition-colors flex items-center justify-between group"
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="text-xs font-semibold text-slate-200 group-hover:text-indigo-400 transition-colors">
                            {dep.counterparty}
                          </p>
                          <span className={`text-[10px] px-1 rounded uppercase font-semibold ${getRiskBadgeClasses(dep.riskLevel).text}`}>
                            {dep.riskLevel}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono">
                          Due: {formatDate(dep.dueDate)} • {dep.type.replace('_', ' ')}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold font-mono text-rose-400">
                          {formatINR(dep.amount)}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 ml-auto mt-1 group-hover:text-indigo-400 transition-colors" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recommended Action Checklist */}
          {riskAnalysis?.recommendedActions && (
            <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/20 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Recommended Finance Actions</span>
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {riskAnalysis.recommendedActions.map((action, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <span className="text-indigo-400 font-bold">•</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
