'use client';

import React from 'react';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  AlertOctagon,
  ShieldAlert,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  GitFork,
  SlidersHorizontal,
  BotMessageSquare,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import {
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Line,
  ComposedChart,
} from 'recharts';
import { DashboardSummary, Obligation } from '@/types';
import { formatINR, formatDate, getRiskBadgeClasses } from '@/utils/formatters';

interface DashboardViewProps {
  dashboardData: DashboardSummary;
  obligations: Obligation[];
  onSelectObligation: (id: string) => void;
  onNavigateTab: (tab: 'dashboard' | 'obligations' | 'cashflow' | 'graph' | 'scenarios' | 'risks' | 'assistant') => void;
  onRunHeroScenario: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  dashboardData,
  obligations,
  onSelectObligation,
  onNavigateTab,
  onRunHeroScenario,
}) => {
  const chartData = dashboardData.cashFlowTimeline.map((item) => ({
    date: formatDate(item.date, { short: true }),
    fullDate: item.date,
    inflows: item.inflows,
    outflows: -item.outflows,
    netChange: item.netDayChange,
    projectedCash: item.projectedCash,
    buffer: dashboardData.minimumBuffer,
    isBreached: item.isBreached,
  }));

  const upcomingCommitments = obligations
    .filter((o) => o.category === 'OUTFLOW')
    .slice(0, 5);

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Financial Intelligence Overview
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-bold tracking-wide bg-teal-50 border border-teal-200 text-teal-800 rounded-md">
              Forward-Looking Mode
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Real-time obligation dependency graph, cash-flow cascade projections, and deterministic risk modeling.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => onNavigateTab('assistant')}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold shadow-sm transition-colors"
          >
            <BotMessageSquare className="w-3.5 h-3.5 text-blue-600" />
            <span>Ask Intelligence AI</span>
          </button>
          <button
            onClick={onRunHeroScenario}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm transition-all hover:scale-[1.02]"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Simulate Customer Delay</span>
          </button>
        </div>
      </div>

      {/* Top 5 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Current Cash */}
        <div className="fintech-card fintech-card-hover p-5 rounded-2xl relative">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Current Cash</span>
            <div className="p-2 rounded-xl bg-teal-50 text-teal-700 border border-teal-100">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold font-mono text-slate-900">
              {formatINR(dashboardData.currentCash, true)}
            </span>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Available liquid working capital
            </p>
          </div>
          <div className="mt-3 flex items-center space-x-1 text-[11px] text-teal-700 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Buffer Healthy (₹5.0L Min)</span>
          </div>
        </div>

        {/* 30-Day Expected Inflows */}
        <div className="fintech-card fintech-card-hover p-5 rounded-2xl relative">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">30-Day Expected Inflows</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold font-mono text-emerald-700">
              {formatINR(dashboardData.inflows30Days, true)}
            </span>
            <p className="text-[11px] text-slate-500 mt-0.5">
              4 Customer receivables
            </p>
          </div>
          <div className="mt-3 flex items-center space-x-1 text-[11px] text-emerald-700 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Expected On-Time</span>
          </div>
        </div>

        {/* 30-Day Committed Outflows */}
        <div className="fintech-card fintech-card-hover p-5 rounded-2xl relative">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">30-Day Committed Outflows</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-700 border border-rose-100">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold font-mono text-rose-700">
              {formatINR(dashboardData.outflows30Days, true)}
            </span>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Payroll, suppliers, debt, taxes
            </p>
          </div>
          <div className="mt-3 flex items-center space-x-1 text-[11px] text-rose-700 font-semibold">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>Strict Due Dates</span>
          </div>
        </div>

        {/* Liquidity Risk Level */}
        <div className="fintech-card fintech-card-hover p-5 rounded-2xl relative">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Liquidity Risk Level</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-100">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold font-mono text-amber-800">
                {dashboardData.liquidityRiskLevel}
              </span>
              <span className="text-xs text-slate-500 font-mono">
                ({dashboardData.liquidityRiskScore}/100)
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {dashboardData.atRiskObligationsCount} obligations at risk
            </p>
          </div>
          <div className="mt-3 flex items-center space-x-1 text-[11px] text-amber-700 font-semibold">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Buffer Breaches on Delay</span>
          </div>
        </div>

        {/* Critical Dependencies */}
        <div className="fintech-card fintech-card-hover p-5 rounded-2xl relative">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Critical Dependencies</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-100">
              <GitFork className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold font-mono text-blue-700">
              {dashboardData.criticalDependenciesCount}
            </span>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Across {obligations.length} total commitments
            </p>
          </div>
          <div className="mt-3 flex items-center space-x-1 text-[11px] text-blue-700 font-semibold">
            <GitFork className="w-3.5 h-3.5" />
            <span>High cascade sensitivity</span>
          </div>
        </div>
      </div>

      {/* EARLY WARNING BANNER */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <AlertOctagon className="w-5 h-5 text-rose-600" />
            <span>Early Warning Intelligence</span>
          </h2>
          <span className="text-xs text-slate-500">
            {dashboardData.earlyWarnings.length} active warnings detected
          </span>
        </div>

        {dashboardData.earlyWarnings.map((warning) => {
          const isHigh = warning.severity === 'HIGH' || warning.severity === 'CRITICAL';
          return (
            <div
              key={warning.id}
              className={`p-5 rounded-2xl border transition-all ${
                isHigh
                  ? 'bg-white border-rose-300 shadow-sm'
                  : 'bg-white border-amber-300 shadow-sm'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-rose-100 text-rose-700 border border-rose-200">
                      {warning.severity} RISK
                    </span>
                    <h3 className="text-base font-bold text-slate-900 tracking-tight">
                      {warning.title}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed max-w-4xl">
                    <span className="font-bold text-rose-900">Cause: </span>
                    {warning.cause}
                  </p>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1 text-xs text-slate-600">
                    <div>
                      <span className="text-slate-500">Potentially affects: </span>
                      <span className="text-slate-800 font-semibold">
                        {warning.affectedObligations.slice(0, 3).join(', ')}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Estimated Liquidity Pressure: </span>
                      <span className="text-amber-800 font-bold">{warning.timeHorizon}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Financial Exposure: </span>
                      <span className="text-teal-700 font-mono font-bold">
                        {formatINR(warning.financialImpact, true)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Warning Actions */}
                <div className="flex sm:flex-col gap-2 shrink-0">
                  <button
                    onClick={() => onNavigateTab('graph')}
                    className="flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-800 text-xs font-bold transition-all"
                  >
                    <GitFork className="w-3.5 h-3.5" />
                    <span>View Cascade</span>
                  </button>
                  <button
                    onClick={onRunHeroScenario}
                    className="flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-all hover:scale-[1.02]"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Run Scenario</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CASH FLOW TIMELINE */}
      <div className="fintech-card p-6 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-teal-600" />
              <span>Forward-Looking Cash Flow Timeline (30 Days)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Teal = Expected Inflows, Rose = Committed Outflows, Blue Line = Projected Cash Balance
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('cashflow')}
            className="text-xs text-teal-700 hover:text-teal-900 font-semibold flex items-center space-x-1 self-start sm:self-auto"
          >
            <span>Full Cash Ledger</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Chart */}
        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#94a3b8"
                tick={{ fontSize: 10, fill: '#64748b' }}
                tickLine={false}
              />
              <YAxis
                stroke="#94a3b8"
                tick={{ fontSize: 10, fill: '#64748b' }}
                tickLine={false}
                tickFormatter={(val) => `₹${(val / 100000).toFixed(0)}L`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-xl text-xs space-y-1.5">
                        <p className="font-bold text-slate-900 border-b border-slate-100 pb-1 font-mono">
                          {data.fullDate} ({data.date})
                        </p>
                        <div className="flex justify-between space-x-4">
                          <span className="text-slate-500">Inflows:</span>
                          <span className="font-mono text-teal-700 font-bold">
                            {formatINR(data.inflows)}
                          </span>
                        </div>
                        <div className="flex justify-between space-x-4">
                          <span className="text-slate-500">Outflows:</span>
                          <span className="font-mono text-rose-700 font-bold">
                            {formatINR(Math.abs(data.outflows))}
                          </span>
                        </div>
                        <div className="flex justify-between space-x-4 border-t border-slate-100 pt-1">
                          <span className="text-slate-700 font-semibold">Projected Cash:</span>
                          <span className="font-mono text-blue-700 font-bold">
                            {formatINR(data.projectedCash)}
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine
                y={dashboardData.minimumBuffer}
                stroke="#ef4444"
                strokeDasharray="4 4"
                label={{
                  value: `Min Buffer (${formatINR(dashboardData.minimumBuffer, true)})`,
                  fill: '#dc2626',
                  fontSize: 10,
                  position: 'insideTopRight',
                }}
              />
              <Bar dataKey="inflows" fill="#0d9488" radius={[4, 4, 0, 0]} maxBarSize={16} />
              <Bar dataKey="outflows" fill="#f43f5e" radius={[0, 0, 4, 4]} maxBarSize={16} />
              <Line
                type="monotone"
                dataKey="projectedCash"
                stroke="#2563eb"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#2563eb' }}
                activeDot={{ r: 6, fill: '#1d4ed8' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* UPCOMING OBLIGATIONS & QUICK ACTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 fintech-card p-5 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Upcoming Financial Commitments
            </h3>
            <button
              onClick={() => onNavigateTab('obligations')}
              className="text-xs text-teal-700 hover:text-teal-900 font-semibold"
            >
              View all ({obligations.length}) →
            </button>
          </div>

          <div className="space-y-2">
            {upcomingCommitments.map((ob) => {
              const riskBadge = getRiskBadgeClasses(ob.riskLevel);
              return (
                <div
                  key={ob.id}
                  onClick={() => onSelectObligation(ob.id)}
                  className="p-3.5 rounded-xl bg-slate-50 hover:bg-teal-50/50 border border-slate-200/80 hover:border-teal-200 transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-1.5 h-8 rounded-full bg-slate-300 group-hover:bg-teal-600 transition-colors" />
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-900 group-hover:text-teal-800 transition-colors">
                          {ob.counterparty}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold uppercase ${riskBadge.bg} ${riskBadge.text} border ${riskBadge.border}`}>
                          {ob.riskLevel}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">{ob.description}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold font-mono text-slate-900 block">
                      {formatINR(ob.amount)}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      Due {formatDate(ob.dueDate)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Intelligence Side Card (Solid White with Teal Border) */}
        <div className="fintech-card p-5 rounded-2xl space-y-4 bg-white border-teal-200 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-teal-700">
              <Sparkles className="w-4 h-4" />
              <h3 className="text-xs font-bold uppercase tracking-wider">
                Intelligence Engine
              </h3>
            </div>
            <h4 className="text-base font-bold text-slate-900 leading-tight">
              “What happens next if one financial obligation changes?”
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              OBLIGO models non-linear financial dependency paths. Delayed customer payments cascade into supplier exposures, payroll pressure, and liquidity deficits.
            </p>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <button
              onClick={() => onNavigateTab('graph')}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 transition-colors shadow-sm"
            >
              <div className="flex items-center space-x-2">
                <GitFork className="w-3.5 h-3.5 text-blue-600" />
                <span>Interactive Dependency Graph</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
            <button
              onClick={() => onNavigateTab('assistant')}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-200 text-xs font-bold text-teal-900 transition-colors"
            >
              <div className="flex items-center space-x-2">
                <BotMessageSquare className="w-3.5 h-3.5 text-teal-700" />
                <span>Ask Intelligence AI</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-teal-700" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
