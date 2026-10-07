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
  Clock,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Line,
  ComposedChart,
  Area,
} from 'recharts';
import { DashboardSummary, EarlyWarning, Obligation } from '@/types';
import { formatINR, formatDate, getRiskBadgeClasses, getStatusBadgeClasses } from '@/utils/formatters';

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
  // Process timeline data for Recharts
  const chartData = dashboardData.cashFlowTimeline.map((item) => ({
    date: formatDate(item.date, { short: true }),
    fullDate: item.date,
    inflows: item.inflows,
    outflows: -item.outflows, // negative for visual bar polarity
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/60 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Financial Obligation Intelligence
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wide bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 rounded">
              Forward-Looking Mode
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time obligation dependency graph, cash-flow cascade projections, and deterministic risk modeling.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => onNavigateTab('assistant')}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 text-xs font-medium transition-colors"
          >
            <BotMessageSquare className="w-3.5 h-3.5 text-indigo-400" />
            <span>Ask Intelligence AI</span>
          </button>
          <button
            onClick={onRunHeroScenario}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all hover:scale-[1.02]"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Run Hero Delay Scenario</span>
          </button>
        </div>
      </div>

      {/* Top 5 KPI Cards (Section 10 Requirements) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Current Cash */}
        <div className="fintech-card fintech-card-hover p-4 rounded-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Current Cash</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold font-mono text-white">
              {formatINR(dashboardData.currentCash, true)}
            </span>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Available liquid working capital
            </p>
          </div>
          <div className="mt-3 flex items-center space-x-1 text-[11px] text-emerald-400 font-medium">
            <CheckCircle2 className="w-3 h-3" />
            <span>Buffer Healthy (₹5.0L Min)</span>
          </div>
        </div>

        {/* 30-Day Expected Inflows */}
        <div className="fintech-card fintech-card-hover p-4 rounded-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">30-Day Expected Inflows</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold font-mono text-white">
              {formatINR(dashboardData.inflows30Days, true)}
            </span>
            <p className="text-[11px] text-slate-400 mt-0.5">
              From 12 scheduled invoices
            </p>
          </div>
          <div className="mt-3 flex items-center space-x-1 text-[11px] text-blue-400 font-medium">
            <Clock className="w-3 h-3" />
            <span>Next: ₹12.0L (Sept 20)</span>
          </div>
        </div>

        {/* 30-Day Obligations */}
        <div className="fintech-card fintech-card-hover p-4 rounded-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">30-Day Obligations</span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold font-mono text-white">
              {formatINR(dashboardData.outflows30Days, true)}
            </span>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Suppliers, payroll, EMI & taxes
            </p>
          </div>
          <div className="mt-3 flex items-center space-x-1 text-[11px] text-slate-400 font-medium">
            <span>Net Delta:</span>
            <span className={`font-mono ${dashboardData.netCash30Days >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {dashboardData.netCash30Days >= 0 ? '+' : ''}{formatINR(dashboardData.netCash30Days, true)}
            </span>
          </div>
        </div>

        {/* Amount At Risk */}
        <div className="fintech-card fintech-card-hover p-4 rounded-xl relative overflow-hidden border-amber-500/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-300">Amount At Risk</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold font-mono text-amber-400">
              {formatINR(dashboardData.amountAtRisk, true)}
            </span>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Supplier B (Paramount) exposed
            </p>
          </div>
          <div className="mt-3 flex items-center space-x-1 text-[11px] text-amber-400 font-medium">
            <GitFork className="w-3 h-3" />
            <span>4 Downstream Dependents</span>
          </div>
        </div>

        {/* Liquidity Risk Score */}
        <div className="fintech-card fintech-card-hover p-4 rounded-xl relative overflow-hidden border-indigo-500/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Liquidity Risk</span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-amber-400">
              {dashboardData.liquidityRiskLevel}
            </span>
            <span className="text-xs font-mono text-slate-400">
              ({dashboardData.liquidityRiskScore}/100)
            </span>
          </div>
          <div className="mt-3 flex items-center space-x-1 text-[11px] text-indigo-400 font-medium">
            <TrendingUp className="w-3 h-3" />
            <span>Analytical Risk Engine</span>
          </div>
        </div>
      </div>

      {/* EARLY WARNINGS SECTION (Hero Callout from Spec) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertOctagon className="w-4 h-4 text-rose-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              Early Warning Intelligence
            </h2>
          </div>
          <button
            onClick={() => onNavigateTab('risks')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center space-x-1"
          >
            <span>View All Diagnostics</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {dashboardData.earlyWarnings.map((warning) => {
          const isHero = warning.id === 'warn-hero-nexus';
          return (
            <div
              key={warning.id}
              className={`p-5 rounded-xl border backdrop-blur-md transition-all ${
                isHero
                  ? 'bg-gradient-to-r from-rose-950/40 via-slate-900/80 to-slate-900/90 border-rose-500/40 shadow-lg shadow-rose-950/20'
                  : 'bg-slate-900/70 border-slate-800'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center space-x-2.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-rose-500/20 border border-rose-500/40 text-rose-400">
                      {warning.severity} RISK
                    </span>
                    <h3 className="text-base font-bold text-white tracking-tight">
                      {warning.title}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
                    <span className="font-semibold text-rose-300">Cause: </span>
                    {warning.cause}
                  </p>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1 text-xs text-slate-400">
                    <div>
                      <span className="text-slate-400">Potentially affects: </span>
                      <span className="text-slate-200 font-medium">
                        {warning.affectedObligations.slice(0, 3).join(', ')}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Estimated Liquidity Pressure: </span>
                      <span className="text-amber-400 font-semibold">{warning.timeHorizon}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Financial Exposure: </span>
                      <span className="text-emerald-400 font-mono font-semibold">
                        {formatINR(warning.financialImpact, true)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Warning Actions */}
                <div className="flex sm:flex-col gap-2 shrink-0">
                  <button
                    onClick={() => onNavigateTab('graph')}
                    className="flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 text-xs font-semibold transition-all"
                  >
                    <GitFork className="w-3.5 h-3.5" />
                    <span>View Cascade</span>
                  </button>
                  <button
                    onClick={onRunHeroScenario}
                    className="flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md transition-all hover:scale-[1.02]"
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

      {/* CASH FLOW TIMELINE (Section 10 Requirements) */}
      <div className="fintech-card p-6 rounded-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              <span>Forward-Looking Cash Flow Timeline (30 Days)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Positive/negative cash movements with cumulative projected balance & safety buffer line.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('cashflow')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center space-x-1 self-start sm:self-auto"
          >
            <span>Expand Full Cash Ledger</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Interactive Chart */}
        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#64748b"
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                tickLine={false}
              />
              <YAxis
                stroke="#64748b"
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                tickLine={false}
                tickFormatter={(val) => `₹${(val / 100000).toFixed(0)}L`}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900/95 border border-slate-700 p-3 rounded-xl shadow-2xl text-xs space-y-1.5 backdrop-blur-md">
                        <p className="font-bold text-white border-b border-slate-800 pb-1 font-mono">
                          {data.fullDate} ({data.date})
                        </p>
                        <div className="flex justify-between space-x-4">
                          <span className="text-slate-400">Day Inflows:</span>
                          <span className="font-mono text-emerald-400 font-bold">
                            {formatINR(data.inflows)}
                          </span>
                        </div>
                        <div className="flex justify-between space-x-4">
                          <span className="text-slate-400">Day Outflows:</span>
                          <span className="font-mono text-rose-400 font-bold">
                            {formatINR(Math.abs(data.outflows))}
                          </span>
                        </div>
                        <div className="flex justify-between space-x-4 border-t border-slate-800 pt-1">
                          <span className="text-slate-300 font-semibold">Projected Cash:</span>
                          <span className="font-mono text-indigo-300 font-bold">
                            {formatINR(data.projectedCash)}
                          </span>
                        </div>
                        {data.isBreached && (
                          <p className="text-[10px] text-rose-400 font-semibold pt-1">
                            ⚠️ Liquidity buffer breached on this day
                          </p>
                        )}
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
                  fill: '#ef4444',
                  fontSize: 10,
                  position: 'insideTopRight',
                }}
              />
              {/* Positive Inflows Bar */}
              <Bar dataKey="inflows" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={16} />
              {/* Negative Outflows Bar */}
              <Bar dataKey="outflows" fill="#f43f5e" radius={[0, 0, 4, 4]} maxBarSize={16} />
              {/* Projected Cash Cumulative Line */}
              <Line
                type="monotone"
                dataKey="projectedCash"
                stroke="#818cf8"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#818cf8' }}
                activeDot={{ r: 6, fill: '#6366f1' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* UPCOMING OBLIGATIONS & QUICK ACTION PREVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Commitments Table */}
        <div className="lg:col-span-2 fintech-card p-5 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white tracking-tight">
              Upcoming Financial Commitments
            </h3>
            <button
              onClick={() => onNavigateTab('obligations')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
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
                  className="p-3 rounded-lg bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-slate-700 transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-8 rounded-full bg-slate-700 group-hover:bg-indigo-500 transition-colors" />
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-200 group-hover:text-indigo-400 transition-colors">
                          {ob.counterparty}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold uppercase ${riskBadge.bg} ${riskBadge.text} border ${riskBadge.border}`}>
                          {ob.riskLevel}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">{ob.description}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold font-mono text-white block">
                      {formatINR(ob.amount)}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      Due {formatDate(ob.dueDate)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Signature Intelligence Teaser */}
        <div className="fintech-card p-5 rounded-xl space-y-4 bg-gradient-to-br from-indigo-950/30 via-slate-900/70 to-slate-900/90 border-indigo-500/30 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-indigo-400">
              <Sparkles className="w-4 h-4" />
              <h3 className="text-xs font-bold uppercase tracking-wider">
                Intelligence Engine
              </h3>
            </div>
            <h4 className="text-base font-bold text-white leading-tight">
              “What happens next if one financial obligation changes?”
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              OBLIGO models non-linear financial dependency paths. Delayed customer payments cascade into supplier exposures, payroll pressure, and liquidity deficits.
            </p>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-800">
            <button
              onClick={() => onNavigateTab('graph')}
              className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs font-medium text-slate-200 transition-colors"
            >
              <div className="flex items-center space-x-2">
                <GitFork className="w-3.5 h-3.5 text-indigo-400" />
                <span>Explore Interactive Dependency Graph</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
            <button
              onClick={() => onNavigateTab('assistant')}
              className="w-full flex items-center justify-between p-2.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-xs font-semibold text-indigo-300 transition-colors"
            >
              <div className="flex items-center space-x-2">
                <BotMessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                <span>Ask Natural Language Assistant</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
