'use client';

import React, { useState, useMemo } from 'react';
import {
  GitFork,
  ArrowRight,
  ShieldAlert,
  Search,
  SlidersHorizontal,
  Info,
  Layers,
  ArrowDownLeft,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { Obligation, DependencyGraphData, DependencyGraphNode } from '@/types';
import { GraphEngine } from '@/engine/graphEngine';
import { formatINR, formatDate, getRiskBadgeClasses } from '@/utils/formatters';
import { BASE_STARTING_CASH } from '@/data/seedData';

interface DependencyGraphViewProps {
  obligations: Obligation[];
  selectedNodeId: string | null;
  onSelectObligation: (id: string) => void;
  onSimulateDelay: (id: string) => void;
}

export const DependencyGraphView: React.FC<DependencyGraphViewProps> = ({
  obligations,
  selectedNodeId: initialSelectedId,
  onSelectObligation,
  onSimulateDelay,
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(
    initialSelectedId || 'nexus-rec-01'
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTierFilter, setActiveTierFilter] = useState<'ALL' | 'INFLOW' | 'OUTFLOW'>('ALL');

  const graph: DependencyGraphData = useMemo(() => {
    return GraphEngine.buildDependencyGraph(obligations);
  }, [obligations]);

  const selectedNode: DependencyGraphNode | undefined = useMemo(() => {
    return graph.nodes.find((n) => n.id === selectedNodeId);
  }, [graph, selectedNodeId]);

  const cascadeInfo = useMemo(() => {
    if (!selectedNodeId) return null;
    return GraphEngine.traceDownstreamCascade(selectedNodeId, graph);
  }, [selectedNodeId, graph]);

  const displayNodes = useMemo(() => {
    return graph.nodes.filter((node) => {
      const matchesSearch = node.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.type.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTier = activeTierFilter === 'ALL' || node.category === activeTierFilter;
      return matchesSearch && matchesTier;
    });
  }, [graph, searchQuery, activeTierFilter]);

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center space-x-2">
            <GitFork className="w-5 h-5 text-teal-600" />
            <span>Multi-Tier Financial Dependency Graph</span>
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Visualize how delayed inflows directly impact downstream supplier disbursements, payroll, and debt servicing.
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={() => setSelectedNodeId('nexus-rec-01')}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-800 text-xs font-bold self-start md:self-auto"
        >
          <Sparkles className="w-3.5 h-3.5 text-teal-700" />
          <span>Reset to Nexus Retail (Customer A)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Visual Hierarchical Dependency Board */}
        <div className="lg:col-span-2 space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center space-x-1">
              {(['ALL', 'INFLOW', 'OUTFLOW'] as const).map((tier) => (
                <button
                  key={tier}
                  onClick={() => setActiveTierFilter(tier)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    activeTierFilter === tier
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {tier === 'ALL' ? 'All Tiers' : tier === 'INFLOW' ? 'Tier 1: Inflows' : 'Tier 3 & 4: Outflows'}
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
                className="w-full pl-8 pr-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          {/* Graph Visualization Canvas (Clean solid background, zero gradients) */}
          <div className="fintech-card rounded-2xl p-6 min-h-[520px] relative overflow-hidden flex flex-col justify-between border-slate-200 shadow-sm bg-white">
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
                              ? 'bg-teal-50 border-teal-500 shadow-md ring-2 ring-teal-200'
                              : isInCascade
                              ? 'bg-amber-50/80 border-amber-300'
                              : 'bg-white hover:bg-slate-50 border-slate-200 shadow-sm'
                          }`}
                        >
                          {node.isHero && (
                            <span className="absolute -top-2 -right-2 px-2 py-0.2 rounded-full text-[9px] font-bold bg-teal-700 text-white shadow">
                              HERO
                            </span>
                          )}
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900 truncate">
                              {node.label}
                            </span>
                            <ArrowDownLeft className="w-3.5 h-3.5 text-teal-600" />
                          </div>
                          <div className="mt-2 flex items-baseline justify-between">
                            <span className="font-mono text-sm font-extrabold text-teal-700">
                              {node.amount ? formatINR(node.amount) : '—'}
                            </span>
                            <span className="text-teal-700 font-bold text-[11px]">↓ {node.dependentCount} downstream</span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* TIER 2: Central Working Capital Hub */}
              <div className="flex justify-center">
                <div
                  onClick={() => setSelectedNodeId('node-central-liquidity')}
                  className={`w-full max-w-md p-4 rounded-2xl border transition-all cursor-pointer text-center ${
                    selectedNodeId === 'node-central-liquidity'
                      ? 'bg-teal-50 border-teal-500 ring-2 ring-teal-200 shadow-md'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-300 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2 text-teal-800 text-xs font-bold uppercase tracking-wider mb-1">
                    <GitFork className="w-3.5 h-3.5" />
                    <span>Tier 2: Central Liquidity Buffer Hub (₹24.8L)</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    All customer receivables pool here to service downstream supplier and payroll commitments.
                  </p>
                </div>
              </div>

              {/* TIER 3 & 4: Committed Outflows */}
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200">
                    Tier 3 & 4: Downstream Suppliers, Payroll & Debt Commitments
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {displayNodes
                    .filter((n) => n.category === 'OUTFLOW')
                    .slice(0, 9)
                    .map((node) => {
                      const isSelected = selectedNodeId === node.id;
                      const isInCascade = cascadeInfo?.impactedNodeIds.has(node.id);
                      const riskBadge = getRiskBadgeClasses(node.riskLevel || 'LOW');
                      return (
                        <div
                          key={node.id}
                          onClick={() => setSelectedNodeId(node.id)}
                          className={`p-3 rounded-2xl border transition-all cursor-pointer relative ${
                            isSelected
                              ? 'bg-teal-50 border-teal-500 shadow-md ring-2 ring-teal-200'
                              : isInCascade
                              ? 'bg-rose-50 border-rose-300 ring-1 ring-rose-200 shadow-sm'
                              : 'bg-white hover:bg-slate-50 border-slate-200 shadow-sm'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900 truncate">
                              {node.label}
                            </span>
                            <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${riskBadge.bg} ${riskBadge.text}`}>
                              {node.riskLevel}
                            </span>
                          </div>
                          <div className="mt-2 flex items-baseline justify-between">
                            <span className="font-mono text-xs font-bold text-rose-700">
                              {node.amount ? formatINR(node.amount) : '—'}
                            </span>
                            <span className="text-[10px] font-mono text-slate-500">
                              Due: {node.dueDate ? formatDate(node.dueDate) : 'Scheduled'}
                            </span>
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
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-600" />
                  <span>Selected Node</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
                  <span>Cascade Impact Path</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-700" />
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
                  <span className={`font-mono font-bold text-sm ${selectedNode.category === 'INFLOW' ? 'text-teal-700' : 'text-slate-900'}`}>
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
