'use client';

import React from 'react';
import {
  X,
  ArrowRight,
  Calendar,
  ShieldAlert,
  CheckCircle2,
  Clock,
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
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-sm flex justify-end animate-fadeIn">
      <div className="w-full max-w-xl bg-white border-l border-slate-200 shadow-2xl h-full flex flex-col z-50 overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 bg-slate-50/80 sticky top-0 z-10 backdrop-blur-md flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-1.5">
              <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider border ${statusStyles.bg} ${statusStyles.text}`}>
                {obligation.status.replace('_', ' ')}
              </span>
              <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider border ${riskStyles.bg} ${riskStyles.text} ${riskStyles.border}`}>
                {obligation.riskLevel} RISK
              </span>
              <span className="text-xs text-slate-500 font-mono">
                {obligation.type.replace('_', ' ')}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {obligation.counterparty}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">{obligation.description}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 flex-1 bg-white">
          {/* Main Financial Card */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div>
              <p className="text-xs text-slate-500 font-semibold">Obligation Amount</p>
              <div className="flex items-baseline space-x-1.5 mt-1">
                <span className={`text-2xl font-extrabold font-mono ${obligation.category === 'INFLOW' ? 'text-emerald-700' : 'text-slate-900'}`}>
                  {formatINR(obligation.amount)}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mt-1 flex items-center space-x-1 font-medium">
                {obligation.category === 'INFLOW' ? (
                  <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <ArrowUpRight className="w-3.5 h-3.5 text-rose-600" />
                )}
                <span>{obligation.category === 'INFLOW' ? 'Expected Inflow' : 'Committed Outflow'}</span>
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500 font-semibold">Due & Expected Date</p>
              <div className="flex items-center space-x-2 mt-1.5">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <span className="text-sm font-bold font-mono text-slate-900">
                  {formatDate(obligation.expectedDate || obligation.dueDate, { includeYear: true })}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Source: <span className="font-mono text-slate-700 font-medium">{obligation.source}</span>
              </p>
            </div>
          </div>

          {/* Quick Action Bar */}
          <div className="flex items-center space-x-2">
            {onOpenInGraph && (
              <button
                onClick={() => onOpenInGraph(obligation.id)}
                className="flex-1 flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-bold transition-all"
              >
                <GitFork className="w-4 h-4" />
                <span>View in Dependency Graph</span>
              </button>
            )}
            {onSimulateObligationDelay && obligation.category === 'INFLOW' && (
              <button
                onClick={() => onSimulateObligationDelay(obligation.id)}
                className="flex-1 flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-bold transition-all"
              >
                <Clock className="w-4 h-4" />
                <span>Simulate Inflow Delay</span>
              </button>
            )}
          </div>

          {/* Explainability Breakdown */}
          {riskAnalysis && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex items-center space-x-2">
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    Analytical Explainability (Why & What)
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Score: {riskAnalysis.overallScore}/100
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div>
                  <span className="text-[11px] font-bold uppercase text-slate-500 block mb-0.5">
                    Why is this rated {riskAnalysis.riskLevel}?
                  </span>
                  <p className="text-slate-800 leading-relaxed bg-white p-2.5 rounded-xl border border-slate-200">
                    {riskAnalysis.why}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold uppercase text-slate-500 block">When Impact Occurs</span>
                    <span className="text-slate-900 font-semibold">{riskAnalysis.when}</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold uppercase text-slate-500 block">Financial Magnitude</span>
                    <span className="text-emerald-700 font-mono font-bold">{formatINR(riskAnalysis.howMuch)}</span>
                  </div>
                </div>
              </div>

              {/* 4 Factor Breakdown */}
              <div className="pt-2 border-t border-slate-200">
                <span className="text-[11px] font-bold uppercase text-slate-500 block mb-2">
                  Risk Factor Breakdown (Analytical Engine)
                </span>
                <div className="space-y-1.5">
                  {riskAnalysis.factors.map((factor, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs bg-white p-2.5 rounded-xl border border-slate-200">
                      <div className="flex items-center space-x-2">
                        <span className={`w-2 h-2 rounded-full ${factor.status === 'DANGER' ? 'bg-red-500' : factor.status === 'WARNING' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                        <span className="text-slate-800 font-medium">{factor.name}</span>
                      </div>
                      <span className="font-mono text-slate-600 font-bold">
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
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center space-x-1.5">
                  <span>Upstream Sources / Required Inflows</span>
                  <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full font-mono text-slate-700 font-bold">
                    {upstreamDependencies.length}
                  </span>
                </h4>
              </div>
              {upstreamDependencies.length === 0 ? (
                <p className="text-xs text-slate-500 italic bg-slate-50 p-3 rounded-xl border border-slate-200">
                  Funded directly by existing working capital and opening cash reserves.
                </p>
              ) : (
                <div className="space-y-2">
                  {upstreamDependencies.map((dep) => (
                    <button
                      key={dep.id}
                      onClick={() => onSelectObligation(dep.id)}
                      className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-indigo-50/50 border border-slate-200 transition-colors flex items-center justify-between group"
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {dep.counterparty}
                        </p>
                        <p className="text-[11px] text-slate-500 font-mono">
                          Expected: {formatDate(dep.expectedDate || dep.dueDate)} • {dep.type}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold font-mono text-emerald-700">
                          {formatINR(dep.amount)}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 ml-auto mt-1 group-hover:text-indigo-600 transition-colors" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Downstream */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center space-x-1.5">
                  <span>Downstream Dependent Obligations</span>
                  <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full font-mono text-slate-700 font-bold">
                    {downstreamDependents.length}
                  </span>
                </h4>
              </div>
              {downstreamDependents.length === 0 ? (
                <p className="text-xs text-slate-500 italic bg-slate-50 p-3 rounded-xl border border-slate-200">
                  No downstream obligations directly dependent on this specific item.
                </p>
              ) : (
                <div className="space-y-2">
                  {downstreamDependents.map((dep) => (
                    <button
                      key={dep.id}
                      onClick={() => onSelectObligation(dep.id)}
                      className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-indigo-50/50 border border-slate-200 transition-colors flex items-center justify-between group"
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {dep.counterparty}
                          </p>
                          <span className={`text-[10px] px-1 rounded uppercase font-bold ${getRiskBadgeClasses(dep.riskLevel).text}`}>
                            {dep.riskLevel}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-mono">
                          Due: {formatDate(dep.dueDate)} • {dep.type.replace('_', ' ')}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold font-mono text-rose-700">
                          {formatINR(dep.amount)}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 ml-auto mt-1 group-hover:text-indigo-600 transition-colors" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recommended Action Checklist */}
          {riskAnalysis?.recommendedActions && (
            <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                <span>Recommended Finance Actions</span>
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {riskAnalysis.recommendedActions.map((action, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <span className="text-indigo-600 font-bold">•</span>
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
