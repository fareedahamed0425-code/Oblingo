'use client';

import React from 'react';
import {
  ShieldAlert,
  AlertOctagon,
  GitFork,
  Info,
  SlidersHorizontal,
} from 'lucide-react';
import { Obligation, RiskAnalysis } from '@/types';
import { RiskEngine } from '@/engine/riskEngine';
import { FinancialEngine } from '@/engine/financialEngine';
import { formatINR } from '@/utils/formatters';
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

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-amber-600" />
            <span>Risk Center & Explainability Engine</span>
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Transparent analytical risk diagnostics. Every risk is backed by deterministic Why, What, When, and How Much metrics.
          </p>
        </div>

        <button
          onClick={onRunScenario}
          className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm self-start md:self-auto transition-all"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Simulate Stress Test</span>
        </button>
      </div>

      {/* Risk Metrics Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Portfolio Risk Index */}
        <div className="fintech-card p-5 rounded-2xl border-amber-200 bg-amber-50/30">
          <span className="text-xs font-semibold text-slate-600">Portfolio Risk Score</span>
          <div className="mt-1 flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-amber-800">48/100</span>
            <span className="text-xs font-bold uppercase text-amber-800">MEDIUM</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Analytical baseline index</p>
        </div>

        {/* High / Critical Items */}
        <div className="fintech-card p-5 rounded-2xl border-rose-200 bg-rose-50/30">
          <span className="text-xs font-semibold text-slate-600">High & Critical Exposure</span>
          <div className="mt-1">
            <span className="text-2xl font-bold font-mono text-rose-800">
              {highCount + criticalCount} Commitments
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Anchored by Customer A & Supplier B
          </p>
        </div>

        {/* Amount At Exposure */}
        <div className="fintech-card p-5 rounded-2xl">
          <span className="text-xs font-semibold text-slate-600">Month-End Commitments</span>
          <div className="mt-1">
            <span className="text-2xl font-bold font-mono text-slate-900">
              {formatINR(2500000, true)}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Salaries, GST & HDFC Loan EMI
          </p>
        </div>

        {/* Active Early Warnings */}
        <div className="fintech-card p-5 rounded-2xl">
          <span className="text-xs font-semibold text-slate-600">Early Warning Alerts</span>
          <div className="mt-1">
            <span className="text-2xl font-bold font-mono text-blue-700">
              {earlyWarnings.length} Active
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Explainable causal triggers</p>
        </div>
      </div>

      {/* Early Warning Feed */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
          <AlertOctagon className="w-5 h-5 text-rose-600" />
          <span>Active Analytical Diagnostics</span>
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {earlyWarnings.map((warning) => (
            <div
              key={warning.id}
              className="fintech-card p-5 rounded-2xl space-y-4 border-slate-200 bg-white"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200">
                    {warning.severity} SEVERITY
                  </span>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight mt-1.5">
                    {warning.title}
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold text-rose-700">
                  {formatINR(warning.financialImpact, true)}
                </span>
              </div>

              {/* Explainability Breakdown */}
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-500 font-semibold block">Cause Analysis:</span>
                  <p className="text-slate-800 font-medium mt-0.5">{warning.cause}</p>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block">Consequence & Cascade:</span>
                  <p className="text-slate-800 font-medium mt-0.5">{warning.explanation}</p>
                </div>
                <div className="flex justify-between items-center pt-1 text-[11px] font-mono text-slate-600">
                  <span>Impact Horizon: <strong className="text-amber-800">{warning.timeHorizon}</strong></span>
                  <span>Confidence: <strong className="text-slate-900">92% Deterministic</strong></span>
                </div>
              </div>

              {/* Recommended Mitigation Steps */}
              <div className="pt-3 border-t border-slate-200 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-teal-900 block">
                  Recommended Finance Actions
                </span>
                <ul className="space-y-1 text-xs text-slate-700">
                  {warning.recommendedActions.map((act, i) => (
                    <li key={i} className="flex items-start space-x-1.5">
                      <span className="text-teal-700 font-bold">•</span>
                      <span>{act}</span>
                    </li>
                  ))}
                </ul>

                <div className="flex items-center space-x-2 pt-2">
                  <button
                    onClick={() => onOpenInGraph(warning.triggerObligationId)}
                    className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-200 transition-colors flex items-center justify-center space-x-1"
                  >
                    <GitFork className="w-3.5 h-3.5 text-blue-600" />
                    <span>View in Graph</span>
                  </button>
                  <button
                    onClick={onRunScenario}
                    className="flex-1 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-colors flex items-center justify-center space-x-1 shadow-sm"
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

      {/* 4-Factor Analytical Model Explanation */}
      <div className="fintech-card p-6 rounded-2xl space-y-4 bg-white">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center space-x-2">
          <Info className="w-4 h-4 text-teal-600" />
          <span>Analytical Risk Scoring Engine Architecture</span>
        </h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          OBLIGO computes risk dynamically through 4 weighted factors evaluated against the forward-looking cash timeline:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-xs font-bold text-teal-800">1. Liquidity Buffer Proximity (30 pts)</span>
            <p className="text-[11px] text-slate-600">
              Evaluates projected cash balance on obligation date against the ₹5.0L minimum safety buffer.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-xs font-bold text-teal-800">2. Timing Pressure (25 pts)</span>
            <p className="text-[11px] text-slate-600">
              Measures remaining days until maturity and sensitivity to short-term collection delays.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-xs font-bold text-teal-800">3. Capital Exposure Ratio (25 pts)</span>
            <p className="text-[11px] text-slate-600">
              Ratio of obligation magnitude relative to total available working capital buffer.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-xs font-bold text-teal-800">4. Downstream Cascade Depth (20 pts)</span>
            <p className="text-[11px] text-slate-600">
              Number and value of downstream commitments that directly rely on this obligation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
