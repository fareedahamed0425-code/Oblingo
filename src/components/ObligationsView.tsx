'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  ArrowUpDown,
  GitFork,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Layers,
  SlidersHorizontal,
} from 'lucide-react';
import { Obligation } from '@/types';
import { formatINR, formatDate, getRiskBadgeClasses, getStatusBadgeClasses } from '@/utils/formatters';

interface ObligationsViewProps {
  obligations: Obligation[];
  onSelectObligation: (id: string) => void;
  onOpenInGraph: (id: string) => void;
  onSimulateObligationDelay: (id: string) => void;
}

type FilterCategory = 'ALL' | 'RECEIVABLE' | 'PAYABLE' | 'PAYROLL' | 'LOAN' | 'TAX' | 'AT_RISK' | 'OVERDUE';

export const ObligationsView: React.FC<ObligationsViewProps> = ({
  obligations,
  onSelectObligation,
  onOpenInGraph,
  onSimulateObligationDelay,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('ALL');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'risk' | 'counterparty'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const filterTabs: Array<{ id: FilterCategory; label: string; count: number }> = [
    { id: 'ALL', label: 'All Obligations', count: obligations.length },
    { id: 'RECEIVABLE', label: 'Receivables', count: obligations.filter((o) => o.type === 'RECEIVABLE').length },
    { id: 'PAYABLE', label: 'Payables & Suppliers', count: obligations.filter((o) => o.type === 'PAYABLE' || o.type === 'SUPPLIER_PAYMENT').length },
    { id: 'PAYROLL', label: 'Payroll', count: obligations.filter((o) => o.type === 'PAYROLL').length },
    { id: 'LOAN', label: 'Loans & EMI', count: obligations.filter((o) => o.type === 'LOAN' || o.type === 'EMI').length },
    { id: 'TAX', label: 'Taxes', count: obligations.filter((o) => o.type === 'TAX').length },
    { id: 'AT_RISK', label: 'At Risk', count: obligations.filter((o) => o.riskLevel === 'HIGH' || o.riskLevel === 'CRITICAL' || o.riskLevel === 'MEDIUM').length },
    { id: 'OVERDUE', label: 'Overdue', count: obligations.filter((o) => o.status === 'OVERDUE').length },
  ];

  const filteredObligations = useMemo(() => {
    return obligations.filter((ob) => {
      if (activeFilter === 'RECEIVABLE' && ob.type !== 'RECEIVABLE') return false;
      if (activeFilter === 'PAYABLE' && ob.type !== 'PAYABLE' && ob.type !== 'SUPPLIER_PAYMENT') return false;
      if (activeFilter === 'PAYROLL' && ob.type !== 'PAYROLL') return false;
      if (activeFilter === 'LOAN' && ob.type !== 'LOAN' && ob.type !== 'EMI') return false;
      if (activeFilter === 'TAX' && ob.type !== 'TAX') return false;
      if (activeFilter === 'AT_RISK' && ob.riskLevel !== 'HIGH' && ob.riskLevel !== 'CRITICAL' && ob.riskLevel !== 'MEDIUM') return false;
      if (activeFilter === 'OVERDUE' && ob.status !== 'OVERDUE') return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          ob.counterparty.toLowerCase().includes(q) ||
          ob.description.toLowerCase().includes(q) ||
          ob.source.toLowerCase().includes(q) ||
          ob.type.toLowerCase().includes(q);
        if (!match) return false;
      }

      return true;
    }).sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'date') {
        const dateA = a.expectedDate || a.dueDate;
        const dateB = b.expectedDate || b.dueDate;
        comparison = dateA.localeCompare(dateB);
      } else if (sortBy === 'amount') {
        comparison = a.amount - b.amount;
      } else if (sortBy === 'risk') {
        const riskWeight: Record<string, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
        comparison = (riskWeight[b.riskLevel] || 0) - (riskWeight[a.riskLevel] || 0);
      } else if (sortBy === 'counterparty') {
        comparison = a.counterparty.localeCompare(b.counterparty);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [obligations, activeFilter, searchQuery, sortBy, sortOrder]);

  const toggleSort = (field: 'date' | 'amount' | 'risk' | 'counterparty') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="space-y-5 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center space-x-2">
            <Layers className="w-5 h-5 text-teal-600" />
            <span>Obligations Ledger</span>
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Full directory of scheduled receivables, supplier disbursements, payroll, taxes, and loan EMIs with causal dependencies.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search counterparty, PO, invoice..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500 shadow-sm transition-colors"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar pb-1">
        {filterTabs.map((tab) => {
          const isActive = activeFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  isActive ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Obligations Table */}
      <div className="fintech-card rounded-2xl overflow-hidden border-slate-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Type / Flow</th>
                <th
                  onClick={() => toggleSort('counterparty')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900 transition-colors"
                >
                  <div className="flex items-center space-x-1">
                    <span>Counterparty</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('amount')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900 transition-colors text-right"
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>Amount</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('date')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900 transition-colors"
                >
                  <div className="flex items-center space-x-1">
                    <span>Due Date</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4">Status</th>
                <th
                  onClick={() => toggleSort('risk')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900 transition-colors"
                >
                  <div className="flex items-center space-x-1">
                    <span>Risk Level</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4 text-center">Dependencies</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredObligations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <p className="text-sm font-semibold">No obligations found matching the filter.</p>
                    <p className="text-xs text-slate-400 mt-1">Try adjusting search parameters or active category.</p>
                  </td>
                </tr>
              ) : (
                filteredObligations.map((ob) => {
                  const riskBadge = getRiskBadgeClasses(ob.riskLevel);
                  const statusBadge = getStatusBadgeClasses(ob.status);
                  const isHero = ob.id === 'nexus-rec-01' || ob.id === 'paramount-pay-01';

                  return (
                    <tr
                      key={ob.id}
                      className={`hover:bg-slate-50/80 transition-colors group cursor-pointer ${
                        isHero ? 'bg-teal-50/40' : ''
                      }`}
                      onClick={() => onSelectObligation(ob.id)}
                    >
                      {/* Type / Flow */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <div
                            className={`p-1.5 rounded-lg ${
                              ob.category === 'INFLOW'
                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                : 'bg-rose-50 text-rose-600 border border-rose-100'
                            }`}
                          >
                            {ob.category === 'INFLOW' ? (
                              <ArrowDownLeft className="w-3.5 h-3.5" />
                            ) : (
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block text-xs">
                              {ob.type.replace('_', ' ')}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {ob.recurrence !== 'NONE' ? ob.recurrence : 'One-time'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Counterparty & Description */}
                      <td className="py-3.5 px-4">
                        <div className="max-w-xs">
                          <span className="font-bold text-slate-900 group-hover:text-teal-700 transition-colors block">
                            {ob.counterparty}
                          </span>
                          <span className="text-[11px] text-slate-500 truncate block">
                            {ob.description}
                          </span>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <span
                          className={`font-mono font-bold text-sm ${
                            ob.category === 'INFLOW' ? 'text-teal-700' : 'text-slate-900'
                          }`}
                        >
                          {formatINR(ob.amount)}
                        </span>
                        <span className="block text-[10px] text-slate-500 font-mono">
                          Confidence: {ob.confidence}%
                        </span>
                      </td>

                      {/* Due Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center space-x-1.5 font-mono text-slate-800 font-medium">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{formatDate(ob.dueDate)}</span>
                        </div>
                        {ob.expectedDate && ob.expectedDate !== ob.dueDate && (
                          <span className="text-[10px] text-amber-800 font-mono font-bold block">
                            Exp: {formatDate(ob.expectedDate)}
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${statusBadge.bg} ${statusBadge.text}`}
                        >
                          {ob.status.replace('_', ' ')}
                        </span>
                      </td>

                      {/* Risk */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${riskBadge.bg} ${riskBadge.text} ${riskBadge.border}`}
                        >
                          {ob.riskLevel}
                        </span>
                      </td>

                      {/* Dependencies */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center space-x-2">
                          <span
                            className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-mono text-[10px] font-semibold"
                            title={`${ob.dependencies.length} Upstream Sources`}
                          >
                            ↑{ob.dependencies.length}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded font-mono text-[10px] font-bold ${
                              ob.dependentObligations.length > 0
                                ? 'bg-teal-50 border border-teal-200 text-teal-800'
                                : 'bg-slate-100 border border-slate-200 text-slate-500'
                            }`}
                            title={`${ob.dependentObligations.length} Downstream Dependents`}
                          >
                            ↓{ob.dependentObligations.length}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => onOpenInGraph(ob.id)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-teal-50 text-slate-600 hover:text-teal-700 border border-slate-200 transition-colors"
                            title="Inspect in Dependency Graph"
                          >
                            <GitFork className="w-3.5 h-3.5" />
                          </button>
                          {ob.category === 'INFLOW' && (
                            <button
                              onClick={() => onSimulateObligationDelay(ob.id)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-amber-50 text-slate-600 hover:text-amber-700 border border-slate-200 transition-colors"
                              title="Simulate Delay on this Inflow"
                            >
                              <SlidersHorizontal className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
