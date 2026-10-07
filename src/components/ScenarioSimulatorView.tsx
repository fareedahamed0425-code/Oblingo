'use client';

import React, { useState, useEffect } from 'react';
import {
  SlidersHorizontal,
  RotateCcw,
  ArrowRight,
  Sparkles,
  GitFork,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Obligation, ScenarioInput, ScenarioResult } from '@/types';
import { FinancialEngine } from '@/engine/financialEngine';
import { formatINR, formatDate, getRiskBadgeClasses } from '@/utils/formatters';
import { BASE_STARTING_CASH, MINIMUM_LIQUIDITY_BUFFER, REFERENCE_DATE } from '@/data/seedData';

interface ScenarioSimulatorViewProps {
  obligations: Obligation[];
  initialHeroDelay?: boolean;
  onSelectObligation: (id: string) => void;
  onNavigateTab: (tab: 'dashboard' | 'obligations' | 'cashflow' | 'graph' | 'scenarios' | 'risks' | 'assistant') => void;
}

export const ScenarioSimulatorView: React.FC<ScenarioSimulatorViewProps> = ({
  obligations,
  initialHeroDelay = false,
  onSelectObligation,
  onNavigateTab,
}) => {
  const [customerADelay, setCustomerADelay] = useState<number>(initialHeroDelay ? 10 : 0);
  const [globalInflowDelay, setGlobalInflowDelay] = useState<number>(0);
  const [supplierDelay, setSupplierDelay] = useState<number>(0);
  const [unexpectedExpenseAmount, setUnexpectedExpenseAmount] = useState<number>(0);
  const [cashInfusionAmount, setCashInfusionAmount] = useState<number>(0);

  const [scenarioResult, setScenarioResult] = useState<ScenarioResult | null>(null);

  useEffect(() => {
    const scenarioInput: ScenarioInput = {
      name:
        customerADelay > 0
          ? `Customer A ${customerADelay}-Day Delay Simulation`
          : 'Custom What-If Scenario',
      customerDelayDays: {
        'nexus-rec-01': customerADelay,
      },
      globalCustomerDelayDays: globalInflowDelay,
      unexpectedExpense:
        unexpectedExpenseAmount > 0
          ? {
              amount: unexpectedExpenseAmount,
              date: '2026-09-22',
              description: 'Unexpected Operational Contingency Expense',
            }
          : undefined,
      additionalCashInfusion:
        cashInfusionAmount > 0
          ? {
              amount: cashInfusionAmount,
              date: '2026-09-16',
              source: 'Emergency Working Capital Drawdown',
            }
          : undefined,
    };

    const result = FinancialEngine.simulateScenario(
      obligations,
      scenarioInput,
      BASE_STARTING_CASH,
      MINIMUM_LIQUIDITY_BUFFER,
      40,
      REFERENCE_DATE
    );

    setScenarioResult(result);
  }, [customerADelay, globalInflowDelay, supplierDelay, unexpectedExpenseAmount, cashInfusionAmount, obligations]);

  const handleApplyHeroPreset = () => {
    setCustomerADelay(10);
    setGlobalInflowDelay(0);
    setSupplierDelay(0);
    setUnexpectedExpenseAmount(0);
    setCashInfusionAmount(0);
  };

  const handleReset = () => {
    setCustomerADelay(0);
    setGlobalInflowDelay(0);
    setSupplierDelay(0);
    setUnexpectedExpenseAmount(0);
    setCashInfusionAmount(0);
  };

  if (!scenarioResult) return null;

  const comparisonData = scenarioResult.timelineComparison.baselineTimeline.map((basePt, idx) => {
    const scenPt = scenarioResult.timelineComparison.scenarioTimeline[idx] || basePt;
    return {
      date: formatDate(basePt.date, { short: true }),
      fullDate: basePt.date,
      baselineCash: basePt.projectedCash,
      scenarioCash: scenPt.projectedCash,
      buffer: MINIMUM_LIQUIDITY_BUFFER,
    };
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center space-x-2">
            <SlidersHorizontal className="w-5 h-5 text-indigo-600" />
            <span>Scenario Simulator & What-If Engine</span>
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Evaluate how changes in one or more obligations ripple through the dependency chain and shift cash positions.
          </p>
        </div>

        {/* Action Preset Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleApplyHeroPreset}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all hover:scale-[1.02]"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Load Hero Preset (10-Day Customer A Delay)</span>
          </button>
          <button
            onClick={handleReset}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-sm transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Grid: Controls on Left, Outputs on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Simulation Controls */}
        <div className="fintech-card p-5 rounded-2xl space-y-5 border-slate-200 shadow-sm bg-white">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
              <span>Simulation Controls</span>
            </h3>
            <span className="text-[10px] uppercase font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
              Live Recomputation
            </span>
          </div>

          {/* Control 1: Customer A Delay */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800">
                Customer A Delay (Nexus Retail ₹12L):
              </label>
              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-lg ${customerADelay > 0 ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-slate-100 text-slate-700'}`}>
                {customerADelay} Days
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              step="1"
              value={customerADelay}
              onChange={(e) => setCustomerADelay(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0 Days (Sept 20)</span>
              <span>15 Days</span>
              <span>30 Days (Oct 20)</span>
            </div>
          </div>

          {/* Control 2: Global Receivables Delay */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">
                Global Customer Receivables Delay:
              </label>
              <span className="text-xs font-mono font-bold text-slate-800">
                {globalInflowDelay} Days
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              step="1"
              value={globalInflowDelay}
              onChange={(e) => setGlobalInflowDelay(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
            />
          </div>

          {/* Control 3: Unexpected Expense Outflow */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">
                Unexpected Contingency Expense:
              </label>
              <span className="text-xs font-mono font-bold text-rose-700">
                {formatINR(unexpectedExpenseAmount, true)}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1000000"
              step="50000"
              value={unexpectedExpenseAmount}
              onChange={(e) => setUnexpectedExpenseAmount(Number(e.target.value))}
              className="w-full accent-rose-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
            />
          </div>

          {/* Control 4: Additional Cash Infusion */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">
                Capital Infusion / Credit Line:
              </label>
              <span className="text-xs font-mono font-bold text-emerald-700">
                +{formatINR(cashInfusionAmount, true)}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="2000000"
              step="100000"
              value={cashInfusionAmount}
              onChange={(e) => setCashInfusionAmount(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
            />
          </div>

          {/* Hero Story Info Box */}
          <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200 text-xs space-y-1.5">
            <span className="font-bold text-indigo-900 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Core User Story Trace</span>
            </span>
            <p className="text-slate-700 leading-relaxed text-[11px]">
              Customer A owes ₹12.0L on Sept 20. The business owes Supplier B ₹8.0L on Sept 22 and Payroll ₹6.0L on Sept 30. Notice how sliding Customer A delay past 2 days exposes Supplier B and breaches buffer.
            </p>
          </div>
        </div>

        {/* Right 2 Cols: Scenario Impact & Timeline Comparison */}
        <div className="lg:col-span-2 space-y-5">
          {/* Top Result KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Baseline vs Scenario Cash */}
            <div className="fintech-card p-4 rounded-2xl">
              <span className="text-[11px] font-semibold text-slate-500">Min Projected Cash</span>
              <div className="mt-1 flex items-baseline space-x-2">
                <span className={`text-xl font-bold font-mono ${scenarioResult.scenarioMinCash < MINIMUM_LIQUIDITY_BUFFER ? 'text-amber-800' : 'text-emerald-700'}`}>
                  {formatINR(scenarioResult.scenarioMinCash, true)}
                </span>
                <span className="text-xs font-mono text-slate-400 line-through">
                  {formatINR(scenarioResult.baselineMinCash, true)}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Net Delta: <span className="font-mono text-rose-700 font-bold">{formatINR(scenarioResult.difference, true)}</span>
              </p>
            </div>

            {/* Risk Level Shift */}
            <div className="fintech-card p-4 rounded-2xl">
              <span className="text-[11px] font-semibold text-slate-500">Risk Rating Shift</span>
              <div className="mt-1 flex items-center space-x-2">
                <span className="text-xs font-mono font-semibold text-slate-500">
                  {scenarioResult.baselineRiskLevel}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                <span className={`text-base font-bold font-mono px-2 py-0.5 rounded border ${getRiskBadgeClasses(scenarioResult.scenarioRiskLevel).bg} ${getRiskBadgeClasses(scenarioResult.scenarioRiskLevel).text} ${getRiskBadgeClasses(scenarioResult.scenarioRiskLevel).border}`}>
                  {scenarioResult.scenarioRiskLevel}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                {scenarioResult.scenarioRiskLevel === 'HIGH' || scenarioResult.scenarioRiskLevel === 'CRITICAL' ? '⚠️ Buffer Breached' : 'Within tolerance'}
              </p>
            </div>

            {/* Liquidity Gap */}
            <div className="fintech-card p-4 rounded-2xl">
              <span className="text-[11px] font-semibold text-slate-500">Liquidity Buffer Gap</span>
              <div className="mt-1">
                <span className={`text-xl font-bold font-mono ${scenarioResult.scenarioLiquidityGap > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                  {scenarioResult.scenarioLiquidityGap > 0 ? formatINR(scenarioResult.scenarioLiquidityGap, true) : '₹0 (Safe)'}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Target: ₹5.0L Min Buffer
              </p>
            </div>

            {/* Days to Pressure */}
            <div className="fintech-card p-4 rounded-2xl">
              <span className="text-[11px] font-semibold text-slate-500">Days Until Pressure</span>
              <div className="mt-1">
                <span className="text-xl font-bold font-mono text-indigo-700">
                  {scenarioResult.daysToPressure !== null ? `${scenarioResult.daysToPressure} Days` : 'None'}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                {scenarioResult.earliestBreachDate ? `On ${formatDate(scenarioResult.earliestBreachDate)}` : 'Stable curve'}
              </p>
            </div>
          </div>

          {/* Dual Line Chart */}
          <div className="fintech-card p-5 rounded-2xl space-y-3 bg-white">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Cash Trajectory Comparison (Baseline vs Scenario)
              </h4>
              <div className="flex items-center space-x-3 text-[11px]">
                <span className="flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                  <span className="text-slate-600 font-medium">Baseline Cash</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
                  <span className="text-rose-700 font-bold">Scenario Cash</span>
                </span>
              </div>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={comparisonData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 10, fill: '#64748b' }} />
                  <YAxis
                    stroke="#94a3b8"
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    tickFormatter={(val) => `₹${(val / 100000).toFixed(0)}L`}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-xl text-xs space-y-1">
                            <p className="font-bold text-slate-900 font-mono">{d.fullDate}</p>
                            <p className="text-slate-600">
                              Baseline: <span className="font-mono text-slate-900 font-bold">{formatINR(d.baselineCash)}</span>
                            </p>
                            <p className="text-rose-700 font-bold">
                              Scenario: <span className="font-mono">{formatINR(d.scenarioCash)}</span>
                            </p>
                            <p className="text-slate-500 text-[10px]">
                              Delta: {formatINR(d.scenarioCash - d.baselineCash)}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <ReferenceLine
                    y={MINIMUM_LIQUIDITY_BUFFER}
                    stroke="#ef4444"
                    strokeDasharray="4 4"
                    label={{
                      value: 'Buffer (₹5L)',
                      fill: '#dc2626',
                      fontSize: 10,
                      position: 'insideTopRight',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="baselineCash"
                    stroke="#94a3b8"
                    strokeDasharray="4 4"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="scenarioCash"
                    stroke="#e11d48"
                    strokeWidth={3}
                    dot={{ r: 3, fill: '#e11d48' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Causal Cascade */}
          <div className="fintech-card p-5 rounded-2xl space-y-4 bg-white">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center space-x-2">
              <GitFork className="w-4 h-4 text-indigo-600" />
              <span>Step-by-Step Causal Consequence Chain</span>
            </h4>

            <div className="space-y-2.5">
              {scenarioResult.cascade.map((step) => (
                <div
                  key={step.step}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start space-x-3"
                >
                  <div className="w-6 h-6 rounded-full bg-indigo-100 border border-indigo-200 text-indigo-800 flex items-center justify-center text-xs font-bold font-mono shrink-0 mt-0.5">
                    {step.step}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">
                        {step.sourceNode} → {step.impactedNode}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-rose-700">
                        {formatINR(step.financialMagnitude, true)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Affected Obligations Table */}
            {scenarioResult.affectedObligations.length > 0 && (
              <div className="pt-3 border-t border-slate-200 space-y-2">
                <h5 className="text-xs font-bold text-slate-900 uppercase">
                  Downstream Obligations Exposed in this Scenario ({scenarioResult.affectedObligations.length})
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {scenarioResult.affectedObligations.map((aff) => (
                    <div
                      key={aff.id}
                      onClick={() => onSelectObligation(aff.id)}
                      className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 truncate">{aff.counterparty}</span>
                        <span className="text-xs font-mono font-bold text-rose-700">{formatINR(aff.amount, true)}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        Due {formatDate(aff.effectiveDate)} • <span className="text-amber-800 font-bold">{aff.causeOfExposure}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
