'use client';

import React, { useState } from 'react';
import {
  TrendingUp,
  ArrowDownLeft,
  ArrowUpRight,
} from 'lucide-react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { CashFlowSummary, Obligation } from '@/types';
import { FinancialEngine } from '@/engine/financialEngine';
import { formatINR, formatDate } from '@/utils/formatters';
import { BASE_STARTING_CASH, MINIMUM_LIQUIDITY_BUFFER, REFERENCE_DATE } from '@/data/seedData';

interface CashFlowViewProps {
  obligations: Obligation[];
  onSelectObligation: (id: string) => void;
}

export const CashFlowView: React.FC<CashFlowViewProps> = ({
  obligations,
  onSelectObligation,
}) => {
  const [horizonDays, setHorizonDays] = useState<number>(30);

  const summary: CashFlowSummary = FinancialEngine.calculateCashFlowTimeline(
    obligations,
    BASE_STARTING_CASH,
    MINIMUM_LIQUIDITY_BUFFER,
    horizonDays,
    REFERENCE_DATE
  );

  const chartData = summary.timeline.map((point) => ({
    date: formatDate(point.date, { short: true }),
    fullDate: point.date,
    inflows: point.inflows,
    outflows: -point.outflows,
    projectedCash: point.projectedCash,
    buffer: summary.minimumBuffer,
    isBreached: point.isBreached,
    events: point.events,
  }));

  const horizonOptions = [7, 14, 30, 60, 90];

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            <span>Forward Cash Flow Timeline & Buffer Health</span>
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Deterministic daily cash projection curve based on verified obligation schedule windows.
          </p>
        </div>

        {/* Horizon Switcher */}
        <div className="flex items-center space-x-1.5 p-1 rounded-2xl bg-white border border-slate-200 shadow-sm self-start md:self-auto">
          <span className="text-[11px] font-bold text-slate-500 px-2">Horizon:</span>
          {horizonOptions.map((days) => (
            <button
              key={days}
              onClick={() => setHorizonDays(days)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                horizonDays === days
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {days} Days
            </button>
          ))}
        </div>
      </div>

      {/* Metric Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Opening Cash */}
        <div className="fintech-card p-4 rounded-2xl">
          <span className="text-xs font-semibold text-slate-500">Opening Cash (15 Sep)</span>
          <div className="mt-1 flex items-baseline space-x-1">
            <span className="text-xl font-bold font-mono text-slate-900">
              {formatINR(summary.startingCash, true)}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Starting point</p>
        </div>

        {/* Expected Inflows */}
        <div className="fintech-card p-4 rounded-2xl">
          <span className="text-xs font-semibold text-slate-500">Expected Inflows</span>
          <div className="mt-1 flex items-baseline space-x-1 text-emerald-600">
            <ArrowDownLeft className="w-4 h-4" />
            <span className="text-xl font-bold font-mono">
              +{formatINR(summary.totalExpectedInflows, true)}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Over {horizonDays} days</p>
        </div>

        {/* Expected Outflows */}
        <div className="fintech-card p-4 rounded-2xl">
          <span className="text-xs font-semibold text-slate-500">Committed Outflows</span>
          <div className="mt-1 flex items-baseline space-x-1 text-rose-600">
            <ArrowUpRight className="w-4 h-4" />
            <span className="text-xl font-bold font-mono">
              -{formatINR(summary.totalExpectedOutflows, true)}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Over {horizonDays} days</p>
        </div>

        {/* Ending Projected Cash */}
        <div className="fintech-card p-4 rounded-2xl">
          <span className="text-xs font-semibold text-slate-500">Projected Ending Cash</span>
          <div className="mt-1 flex items-baseline space-x-1">
            <span className="text-xl font-bold font-mono text-indigo-700">
              {formatINR(summary.endingProjectedCash, true)}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">
            Net delta: {summary.netCashChange >= 0 ? '+' : ''}{formatINR(summary.netCashChange, true)}
          </p>
        </div>

        {/* Lowest Projected Point */}
        <div
          className={`fintech-card p-4 rounded-2xl ${
            summary.minimumProjectedCash < summary.minimumBuffer ? 'border-amber-300 bg-amber-50/50' : ''
          }`}
        >
          <span className="text-xs font-semibold text-amber-900">Lowest Buffer Point</span>
          <div className="mt-1 flex items-baseline space-x-1">
            <span
              className={`text-xl font-bold font-mono ${
                summary.minimumProjectedCash < summary.minimumBuffer ? 'text-amber-800' : 'text-slate-900'
              }`}
            >
              {formatINR(summary.minimumProjectedCash, true)}
            </span>
          </div>
          <p className="text-[11px] text-slate-600 mt-1">
            {summary.minimumCashDate ? `On ${formatDate(summary.minimumCashDate)}` : 'Safe margin'}
          </p>
        </div>
      </div>

      {/* Main Chart */}
      <div className="fintech-card p-6 rounded-2xl space-y-4">
        <div className="space-y-0.5">
          <h3 className="text-sm font-bold text-slate-900">
            Projected Cash Trajectory vs Minimum Safety Buffer (₹5.0L)
          </h3>
          <p className="text-xs text-slate-500">
            Green = Realized / Expected Inflows, Red = Committed Outflows, Purple Line = Cumulative Cash
          </p>
        </div>

        <div className="h-80 w-full pt-4">
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
                          <span className="font-mono text-emerald-700 font-bold">
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
                          <span className="font-mono text-indigo-700 font-bold">
                            {formatINR(data.projectedCash)}
                          </span>
                        </div>
                        {data.events && data.events.length > 0 && (
                          <div className="pt-1.5 border-t border-slate-100">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                              Scheduled Events ({data.events.length})
                            </span>
                            {data.events.map((ev: any, idx: number) => (
                              <div key={idx} className="text-[11px] text-slate-700 flex justify-between space-x-2">
                                <span className="truncate max-w-[140px] font-medium">{ev.counterparty}</span>
                                <span className={ev.category === 'INFLOW' ? 'text-emerald-700 font-mono font-bold' : 'text-rose-700 font-mono font-bold'}>
                                  {ev.category === 'INFLOW' ? '+' : '-'}{formatINR(ev.amount, true)}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine
                y={summary.minimumBuffer}
                stroke="#ef4444"
                strokeDasharray="4 4"
                label={{
                  value: `Safety Buffer (${formatINR(summary.minimumBuffer, true)})`,
                  fill: '#dc2626',
                  fontSize: 10,
                  position: 'insideTopRight',
                }}
              />
              <Bar dataKey="inflows" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={20} />
              <Bar dataKey="outflows" fill="#f43f5e" radius={[0, 0, 4, 4]} maxBarSize={20} />
              <Line
                type="monotone"
                dataKey="projectedCash"
                stroke="#6366f1"
                strokeWidth={3}
                dot={{ r: 3, fill: '#6366f1' }}
                activeDot={{ r: 6, fill: '#4f46e5' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Daily Event Ledger Table */}
      <div className="fintech-card p-5 rounded-2xl space-y-3">
        <h3 className="text-sm font-bold text-slate-900 tracking-tight">
          Day-by-Day Financial Event Ledger
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px]">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Day Inflow</th>
                <th className="py-2.5 px-3">Day Outflow</th>
                <th className="py-2.5 px-3">Net Day Delta</th>
                <th className="py-2.5 px-3 text-right">Projected Cash Balance</th>
                <th className="py-2.5 px-3">Key Commitments / Invoices</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {summary.timeline.map((point) => (
                <tr
                  key={point.date}
                  className={`hover:bg-slate-50 transition-colors ${
                    point.isBreached ? 'bg-rose-50/50' : point.events.length > 0 ? 'bg-slate-50/30' : ''
                  }`}
                >
                  <td className="py-3 px-3 whitespace-nowrap font-mono font-medium text-slate-900">
                    {formatDate(point.date, { includeYear: true })}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap font-mono font-bold text-emerald-700">
                    {point.inflows > 0 ? `+${formatINR(point.inflows)}` : '—'}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap font-mono font-bold text-rose-700">
                    {point.outflows > 0 ? `-${formatINR(point.outflows)}` : '—'}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap font-mono font-semibold text-slate-800">
                    {point.netDayChange !== 0 ? (
                      <span className={point.netDayChange > 0 ? 'text-emerald-700' : 'text-rose-700'}>
                        {point.netDayChange > 0 ? '+' : ''}{formatINR(point.netDayChange)}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap font-mono font-bold text-right text-indigo-700">
                    {formatINR(point.projectedCash)}
                  </td>
                  <td className="py-3 px-3">
                    {point.events.length === 0 ? (
                      <span className="text-slate-400 italic text-[11px]">No scheduled movements</span>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {point.events.map((ev) => (
                          <button
                            key={ev.id}
                            onClick={() => onSelectObligation(ev.id)}
                            className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold border transition-all hover:scale-105 ${
                              ev.category === 'INFLOW'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200'
                            }`}
                          >
                            {ev.counterparty} ({formatINR(ev.amount, true)})
                          </button>
                        ))}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
