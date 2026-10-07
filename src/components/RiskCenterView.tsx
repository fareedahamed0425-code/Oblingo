'use client';

import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  AlertOctagon,
  TrendingDown,
  Clock,
  Layers,
  CheckCircle2,
  GitFork,
  ArrowRight,
  Info,
  SlidersHorizontal,
} from 'lucide-react';
import { Obligation, EarlyWarning, RiskAnalysis } from '@/types';
import { RiskEngine } from '@/engine/riskEngine';
import { FinancialEngine } from '@/engine/financialEngine';
import { formatINR, formatDate, getRiskBadgeClasses } from '@/utils/formatters';
import { BASE_STARTING_CASH, MINIMUM_LIQUIDITY_BUFFER, REFERENCE_DATE } from '@/data/seedData';

interface RiskCenterViewProps {
  obligations: Obligation[];
  onSelectObligation: (id: string) => void;
  onRunScenario: () => void;
  onOpenInGraph: (id: string) => void;
}

export const RiskCenterView: React.FC<RiskCenterViewProps> = ({
  obligations,
  onSelectObligation,
  onRunScenario,
  onOpenInGraph,
}) => {
  const cashSummary = FinancialEngine.calculateCashFlowTimeline(
    obligations,
    BASE_STARTING_CASH,
    MINIMUM_LIQUIDITY_BUFFER,
    30,
    REFERENCE_DATE
  );

  const earlyWarnings = RiskEngine.generateEarlyWarnings(
    obligations,
    cashSummary,
    REFERENCE_DATE
  );

  const analyzedObligations: RiskAnalysis[] = obligations.map((ob) =>
    RiskEngine.evaluateObligationRisk(ob, obligations, cashSummary, REFERENCE_DATE)
  );

  const criticalCount = analyzedObligations.filter((a) => a.riskLevel === 'CRITICAL').length;
  const highCount = analyzedObligations.filter((a) => a.riskLevel === 'HIGH').length;
  const mediumCount = analyzedObligations.filter((a) => a.riskLevel === 'MEDIUM').length;
  const lowCount = analyzedObligations.filter((a) => a.riskLevel === 'LOW').length;

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800/60 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <span>Risk Center & Explainability Engine</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Transparent analytical risk diagnostics. Every risk is backed by deterministic Why, What, When, and How Much metrics.
          </p>
        </div>

        <button
          onClick={onRunScenario}
          className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md self-start md:self-auto"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Simulate Stress Test</span>
        </button>
      </div>

      {/* Risk Metrics Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Portfolio Risk Index */}
        <div className="fintech-card p-4 rounded-xl border-amber-500/30">
          <span className="text-xs font-semibold text-slate-400">Portfolio Risk Score</span>
          <div className="mt-1 flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-amber-400">48/100</span>
            <span className="text-xs font-bold uppercase text-amber-400">MEDIUM</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Analytical baseline index</p>
        </div>

        {/* High / Critical Items */}
        <div className="fintech-card p-4 rounded-xl border-rose-500/30">
          <span className="text-xs font-semibold text-slate-400">High & Critical Exposure</span>
          <div className="mt-1">
            <span className="text-2xl font-bold font-mono text-rose-400">
              {highCount + criticalCount} Obligations
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Anchored by Customer A & Supplier B
          </p>
        </div>

        {/* Amount At Exposure */}
        <div className="fintech-card p-4 rounded-xl">
          <span className="text-xs font-semibold text-slate-400">Clustered Month-End Outflows</span>
          <div className="mt-1">
            <span className="text-2xl font-bold font-mono text-white">
              {formatINR(2500000, true)}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Salaries, GST & HDFC Loan EMI
          </p>
        </div>

        {/* Active Early Warnings */}
        <div className="fintech-card p-4 rounded-xl">
          <span className="text-xs font-semibold text-slate-400">Early Warning Alerts</span>
          <div className="mt-1">
            <span className="text-2xl font-bold font-mono text-indigo-300">
              {earlyWarnings.length} Active
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Explainable causal triggers</p>
        </div>
      </div>

      {/* Early Warning Feed */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center space-x-2">
          <AlertOctagon className="w-4 h-4 text-rose-400" />
          <span>Active Early Warning Triggers</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {earlyWarnings.map((warning) => (
            <div
              key={warning.id}
              className="fintech-card p-5 rounded-2xl border-slate-800 space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-500/20 text-rose-400 border border-rose-500/40">
                    {warning.severity} RISK
                  </span>
                  <span className="text-[11px] font-mono text-amber-400 font-semibold">
                    {warning.timeHorizon}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white tracking-tight">
                  {warning.title}
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  <span className="font-bold text-rose-300">Cause: </span>
                  {warning.cause}
                </p>

                <div className="space-y-1.5 text-xs text-slate-400">
                  <div>
                    <span className="font-semibold text-slate-300">Affected Obligations: </span>
                    <span className="text-slate-200 font-medium">
                      {warning.affectedObligations.join(', ')}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-300">Financial Impact: </span>
                    <span className="text-emerald-400 font-mono font-bold">
                      {formatINR(warning.financialImpact)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Recommended Mitigation Steps */}
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 block">
                  Recommended Finance Actions
                </span>
                <ul className="space-y-1 text-xs text-slate-300">
                  {warning.recommendedActions.map((act, i) => (
                    <li key={i} className="flex items-start space-x-1.5">
                      <span className="text-indigo-400 font-bold">•</span>
                      <span>{act}</span>
                    </li>
                  ))}
                </ul>

                <div className="flex items-center space-x-2 pt-2">
                  <button
                    onClick={() => onOpenInGraph(warning.triggerObligationId)}
                    className="flex-1 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors flex items-center justify-center space-x-1"
                  >
                    <GitFork className="w-3.5 h-3.5 text-indigo-400" />
                    <span>View in Graph</span>
                  </button>
                  <button
                    onClick={onRunScenario}
                    className="flex-1 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors flex items-center justify-center space-x-1"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Run Scenario</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4-Factor Analytical Model Explanation (Section 6 & 17 Requirements) */}
      <div className="fintech-card p-6 rounded-2xl space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center space-x-2">
          <Info className="w-4 h-4 text-indigo-400" />
          <span>Analytical Risk Scoring Engine Architecture</span>
        </h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          OBLIGO computes risk dynamically through 4 weighted factors evaluated against the forward-looking cash timeline:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
            <span className="text-xs font-bold text-indigo-400">1. Liquidity Buffer Proximity (30 pts)</span>
            <p className="text-[11px] text-slate-400">
              Evaluates projected cash balance on obligation date against the ₹5.0L minimum safety buffer.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
            <span className="text-xs font-bold text-indigo-400">2. Timing Pressure (25 pts)</span>
            <p className="text-[11px] text-slate-400">
              Measures remaining days until maturity and sensitivity to short-term collection delays.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
            <span className="text-xs font-bold text-indigo-400">3. Capital Exposure Ratio (25 pts)</span>
            <p className="text-[11px] text-slate-400">
              Ratio of obligation magnitude relative to total available working capital buffer.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
            <span className="text-xs font-bold text-indigo-400">4. Downstream Cascade Depth (20 pts)</span>
            <p className="text-[11px] text-slate-400">
              Number and value of downstream commitments that directly rely on this obligation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
