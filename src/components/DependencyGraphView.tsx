'use client';

import React, { useState, useMemo } from 'react';
import {
  GitFork,
  SlidersHorizontal,
  ShieldAlert,
  Layers,
  Search,
  Zap,
  Info,
} from 'lucide-react';
import { Obligation, DependencyGraphData } from '@/types';
import { GraphEngine } from '@/engine/graphEngine';
import { formatINR, formatDate } from '@/utils/formatters';

interface DependencyGraphViewProps {
  obligations: Obligation[];
  selectedNodeId?: string | null;
  onSelectObligation: (id: string) => void;
  onSimulateDelay: (obligationId: string) => void;
}

export const DependencyGraphView: React.FC<DependencyGraphViewProps> = ({
  obligations,
  selectedNodeId: initialSelectedId,
  onSelectObligation,
  onSimulateDelay,
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>(initialSelectedId || 'nexus-rec-01');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const graph: DependencyGraphData = useMemo(() => {
    return GraphEngine.buildDependencyGraph(obligations);
  }, [obligations]);

  const cascadeInfo = useMemo(() => {
    if (!selectedNodeId) return null;
    return GraphEngine.traceDownstreamCascade(selectedNodeId, graph);
  }, [selectedNodeId, graph]);

  const selectedNode = useMemo(() => {
    return graph.nodes.find((n) => n.id === selectedNodeId) || null;
  }, [graph, selectedNodeId]);

  const displayNodes = useMemo(() => {
    return graph.nodes.filter((node) => {
      if (filterType !== 'ALL') {
        if (filterType === 'INFLOW' && node.category !== 'INFLOW') return false;
        if (filterType === 'OUTFLOW' && node.category !== 'OUTFLOW') return false;
        if (filterType === 'CRITICAL' && node.riskLevel !== 'HIGH' && node.riskLevel !== 'CRITICAL' && !node.isHero) return false;
      }
      if (searchQuery) {
        return (
          node.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          node.type.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      return true;
    });
  }, [graph, filterType, searchQuery]);

  return (
    <div className="space-y-5 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center space-x-2">
            <GitFork className="w-5 h-5 text-indigo-600" />
            <span>Interactive Financial Dependency Graph</span>
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Explore causal linkages between receivables, suppliers, payroll, taxes, and liquidity buffers. Select any node to trace its complete downstream impact cascade.
          </p>
        </div>

        {/* Quick Hero Select Button */}
        <button
          onClick={() => setSelectedNodeId('nexus-rec-01')}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-bold self-start md:self-auto"
        >
          <Zap className="w-3.5 h-3.5 text-amber-600" />
          <span>Select Hero Node: Customer A (₹12.0L)</span>
        </button>
      </div>

      {/* Main Graph & Inspector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Interactive Graph Canvas */}
        <div className="lg:col-span-2 space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center space-x-1.5">
              <span className="text-[11px] font-bold text-slate-500 px-1.5">View:</span>
              {(['ALL', 'INFLOW', 'OUTFLOW', 'CRITICAL'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    filterType === t
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="relative w-44">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
              <input
                type="text"
                placeholder="Search graph..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Graph Visualization Canvas */}
          <div className="fintech-card rounded-2xl p-6 min-h-[520px] relative overflow-hidden flex flex-col justify-between border-slate-200 shadow-sm bg-white">
            {/* Background Grid Accent */}
            <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] opacity-60 pointer-events-none" />

            {/* Stage Layout: Visual 4-Tier Dependency Architecture */}
            <div className="relative z-10 space-y-8">
              {/* TIER 1: Customer Inflows */}
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Tier 1: Customer Inflows & Receivables
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {displayNodes
                    .filter((n) => n.category === 'INFLOW')
                    .map((node) => {
                      const isSelected = selectedNodeId === node.id;
                      const isInCascade = cascadeInfo?.impactedNodeIds.has(node.id);
                      return (
                        <div
                          key={node.id}
                          onClick={() => setSelectedNodeId(node.id)}
                          className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative ${
                            isSelected
                              ? 'bg-indigo-50 border-indigo-500 shadow-md ring-2 ring-indigo-200'
                              : isInCascade
                              ? 'bg-amber-50/80 border-amber-300'
                              : 'bg-white hover:bg-slate-50 border-slate-200 shadow-sm'
                          }`}
                        >
                          {node.isHero && (
                            <span className="absolute -top-2 -right-2 px-2 py-0.2 rounded-full text-[9px] font-bold bg-indigo-600 text-white shadow">
                              HERO
                            </span>
                          )}
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900 truncate max-w-[130px]">
                              {node.label}
                            </span>
                            <span className="text-xs font-mono font-bold text-emerald-700">
                              {node.amount ? formatINR(node.amount, true) : ''}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2 font-mono">
                            <span>Due {node.dueDate ? formatDate(node.dueDate) : ''}</span>
                            <span className="text-indigo-600 font-bold">↓ {node.dependentCount} downstream</span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* TIER 2: Central Working Capital & Cash Buffer */}
              <div className="flex justify-center my-4">
                <div
                  onClick={() => setSelectedNodeId('node-central-liquidity')}
                  className={`max-w-md w-full p-4 rounded-2xl border text-center transition-all cursor-pointer ${
                    selectedNodeId === 'node-central-liquidity'
                      ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-200 shadow-md'
                      : cascadeInfo?.impactedNodeIds.has('node-central-liquidity')
                      ? 'bg-amber-50 border-amber-300'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-1">
                    <Layers className="w-4 h-4" />
                    <span>Tier 2: Central Working Capital & Liquidity Node</span>
                  </div>
                  <p className="text-xl font-bold font-mono text-slate-900">
                    ₹24.8L Opening Cash <span className="text-xs text-slate-500 font-sans font-normal">(Buffer: ₹5.0L)</span>
                  </p>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Directly exposed when upstream inflow schedules shift
                  </p>
                </div>
              </div>

              {/* TIER 3: Downstream Committed Outflows */}
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200">
                    Tier 3: Downstream Committed Commitments (Suppliers, Payroll, Loans, Taxes)
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {displayNodes
                    .filter((n) => n.category === 'OUTFLOW')
                    .map((node) => {
                      const isSelected = selectedNodeId === node.id;
                      const isInCascade = cascadeInfo?.impactedNodeIds.has(node.id);
                      return (
                        <div
                          key={node.id}
                          onClick={() => setSelectedNodeId(node.id)}
                          className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative ${
                            isSelected
                              ? 'bg-indigo-50 border-indigo-500 shadow-md ring-2 ring-indigo-200'
                              : isInCascade
                              ? 'bg-rose-50 border-rose-300 shadow-sm'
                              : 'bg-white hover:bg-slate-50 border-slate-200 shadow-sm'
                          }`}
                        >
                          {isInCascade && (
                            <span className="absolute -top-2 -right-1 px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-600 text-white shadow animate-pulse">
                              EXPOSED
                            </span>
                          )}
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900 truncate max-w-[130px]">
                              {node.label}
                            </span>
                            <span className="text-xs font-mono font-bold text-rose-700">
                              {node.amount ? formatINR(node.amount, true) : ''}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2 font-mono">
                            <span>Due {node.dueDate ? formatDate(node.dueDate) : ''}</span>
                            <span className="text-slate-600 uppercase font-bold">{node.type}</span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>

            {/* Footer Canvas Legend */}
            <div className="mt-6 pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between text-[11px] text-slate-600">
              <div className="flex items-center space-x-4">
                <span className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                  <span>Selected Node</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
                  <span>Cascade Impact Path</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                  <span>Inflow Source</span>
                </span>
              </div>
              <span className="text-slate-500">Click any node to re-center cascade calculation</span>
            </div>
          </div>
        </div>

        {/* Right Col: Node Inspector & Cascade Panel */}
        <div className="space-y-4">
          {selectedNode ? (
            <div className="fintech-card p-5 rounded-2xl space-y-5 border-slate-200 shadow-sm bg-white">
              {/* Header */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Selected Graph Node Inspector
                </span>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                  {selectedNode.label}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Type: <span className="font-mono text-slate-700 font-semibold">{selectedNode.type.toUpperCase()}</span>
                </p>
              </div>

              {/* Financial Attributes */}
              <div className="grid grid-cols-2 gap-2 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-semibold">Amount</span>
                  <span className={`font-mono font-bold text-sm ${selectedNode.category === 'INFLOW' ? 'text-emerald-700' : 'text-slate-900'}`}>
                    {selectedNode.amount ? formatINR(selectedNode.amount) : '₹24.8L Balance'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-semibold">Scheduled Date</span>
                  <span className="font-mono text-slate-800 font-bold">
                    {selectedNode.dueDate ? formatDate(selectedNode.dueDate) : 'Ongoing'}
                  </span>
                </div>
              </div>

              {/* Cascade Impact Tracing */}
              {cascadeInfo && (
                <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-rose-900 flex items-center space-x-1.5">
                      <ShieldAlert className="w-4 h-4 text-rose-600" />
                      <span>Cascade Exposure Trace</span>
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold border border-rose-200">
                      {cascadeInfo.highestRisk}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-700">
                      <span>Total Downstream Exposure:</span>
                      <span className="font-mono font-bold text-rose-700">
                        {formatINR(cascadeInfo.totalExposedAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-700">
                      <span>Downstream Nodes Impacted:</span>
                      <span className="font-mono font-bold text-slate-900">
                        {Math.max(0, cascadeInfo.impactedNodeIds.size - 1)} obligations
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-rose-200">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1.5">
                      Directly Exposed Chain:
                    </span>
                    <ul className="space-y-1 text-xs text-slate-800">
                      {Array.from(cascadeInfo.impactedNodeIds)
                        .filter((id) => id !== selectedNode.id && id !== 'node-central-liquidity')
                        .slice(0, 4)
                        .map((id) => {
                          const impacted = graph.nodes.find((n) => n.id === id);
                          if (!impacted) return null;
                          return (
                            <li key={id} className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-rose-100 shadow-sm">
                              <span className="truncate max-w-[140px] font-semibold">{impacted.label}</span>
                              <span className="font-mono text-rose-700 text-[11px] font-bold">
                                {impacted.amount ? formatINR(impacted.amount, true) : ''}
                              </span>
                            </li>
                          );
                        })}
                    </ul>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                {selectedNode.category === 'INFLOW' && (
                  <button
                    onClick={() => onSimulateDelay(selectedNode.id)}
                    className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm transition-all hover:scale-[1.02]"
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                    <span>Simulate Delay on this Node</span>
                  </button>
                )}

                {selectedNode.id !== 'node-central-liquidity' && (
                  <button
                    onClick={() => onSelectObligation(selectedNode.id)}
                    className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-200 transition-colors"
                  >
                    <Layers className="w-4 h-4" />
                    <span>Open Full Obligation Details</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="fintech-card p-6 rounded-2xl text-center text-slate-500 space-y-2 bg-white">
              <Info className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-sm font-bold text-slate-800">No Node Selected</p>
              <p className="text-xs">Click any node on the graph canvas to inspect relationships.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
