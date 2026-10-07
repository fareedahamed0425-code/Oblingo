'use client';

import React, { useState, useEffect } from 'react';
import { Navbar, TabType } from '@/components/Navbar';
import { DashboardView } from '@/components/DashboardView';
import { ObligationsView } from '@/components/ObligationsView';
import { CashFlowView } from '@/components/CashFlowView';
import { DependencyGraphView } from '@/components/DependencyGraphView';
import { ScenarioSimulatorView } from '@/components/ScenarioSimulatorView';
import { RiskCenterView } from '@/components/RiskCenterView';
import { AIAssistantView } from '@/components/AIAssistantView';
import { ObligationDetailDrawer } from '@/components/ObligationDetailDrawer';
import { SEEDED_OBLIGATIONS, BASE_STARTING_CASH, MINIMUM_LIQUIDITY_BUFFER, REFERENCE_DATE } from '@/data/seedData';
import { FinancialEngine } from '@/engine/financialEngine';
import { RiskEngine } from '@/engine/riskEngine';
import { Obligation, DashboardSummary, RiskAnalysis } from '@/types';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [obligations, setObligations] = useState<Obligation[]>(SEEDED_OBLIGATIONS);
  const [selectedObligationId, setSelectedObligationId] = useState<string | null>(null);
  const [graphFocusNodeId, setGraphFocusNodeId] = useState<string | null>(null);
  const [isHeroDemoActive, setIsHeroDemoActive] = useState<boolean>(false);

  // Compute live dashboard data
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

  const heroRec = obligations.find((o) => o.id === 'nexus-rec-01');
  const heroDependents = obligations.filter((o) => heroRec?.dependentObligations.includes(o.id));
  const amountAtRisk = heroDependents.reduce((acc, curr) => acc + curr.amount, 0);

  const dashboardData: DashboardSummary = {
    currentCash: BASE_STARTING_CASH,
    minimumBuffer: MINIMUM_LIQUIDITY_BUFFER,
    inflows30Days: cashSummary.totalExpectedInflows,
    outflows30Days: cashSummary.totalExpectedOutflows,
    netCash30Days: cashSummary.netCashChange,
    amountAtRisk: 840000,
    liquidityRiskLevel: 'MEDIUM',
    liquidityRiskScore: 48,
    activeObligationsCount: obligations.length,
    atRiskObligationsCount: obligations.filter((o) => o.riskLevel === 'HIGH' || o.riskLevel === 'MEDIUM').length,
    criticalDependenciesCount: 6,
    earlyWarnings,
    cashFlowTimeline: cashSummary.timeline,
  };

  // Selected obligation for drawer
  const selectedObligation = selectedObligationId
    ? obligations.find((o) => o.id === selectedObligationId) || null
    : null;

  const selectedRiskAnalysis: RiskAnalysis | null = selectedObligation
    ? RiskEngine.evaluateObligationRisk(selectedObligation, obligations, cashSummary, REFERENCE_DATE)
    : null;

  // Handlers
  const handleSelectObligation = (id: string) => {
    setSelectedObligationId(id);
  };

  const handleCloseDrawer = () => {
    setSelectedObligationId(null);
  };

  const handleOpenInGraph = (id: string) => {
    setSelectedObligationId(null);
    setGraphFocusNodeId(id);
    setActiveTab('graph');
  };

  const handleSimulateObligationDelay = (id: string) => {
    setSelectedObligationId(null);
    setIsHeroDemoActive(true);
    setActiveTab('scenarios');
  };

  const handleTriggerHeroDemo = () => {
    setIsHeroDemoActive(true);
    setActiveTab('scenarios');
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onTriggerHeroDemo={handleTriggerHeroDemo}
        isHeroDemoActive={isHeroDemoActive && activeTab === 'scenarios'}
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            dashboardData={dashboardData}
            obligations={obligations}
            onSelectObligation={handleSelectObligation}
            onNavigateTab={(t) => {
              setActiveTab(t);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onRunHeroScenario={handleTriggerHeroDemo}
          />
        )}

        {activeTab === 'obligations' && (
          <ObligationsView
            obligations={obligations}
            onSelectObligation={handleSelectObligation}
            onOpenInGraph={handleOpenInGraph}
            onSimulateObligationDelay={handleSimulateObligationDelay}
          />
        )}

        {activeTab === 'cashflow' && (
          <CashFlowView
            obligations={obligations}
            onSelectObligation={handleSelectObligation}
          />
        )}

        {activeTab === 'graph' && (
          <DependencyGraphView
            obligations={obligations}
            selectedNodeId={graphFocusNodeId}
            onSelectObligation={handleSelectObligation}
            onSimulateDelay={handleSimulateObligationDelay}
          />
        )}

        {activeTab === 'scenarios' && (
          <ScenarioSimulatorView
            obligations={obligations}
            initialHeroDelay={isHeroDemoActive}
            onSelectObligation={handleSelectObligation}
            onNavigateTab={(t) => {
              setActiveTab(t);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {activeTab === 'risks' && (
          <RiskCenterView
            obligations={obligations}
            onSelectObligation={handleSelectObligation}
            onRunScenario={handleTriggerHeroDemo}
            onOpenInGraph={handleOpenInGraph}
          />
        )}

        {activeTab === 'assistant' && (
          <AIAssistantView
            obligations={obligations}
            onSelectObligation={handleSelectObligation}
            onNavigateTab={(t) => {
              setActiveTab(t);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onTriggerHeroScenario={handleTriggerHeroDemo}
          />
        )}
      </main>

      {/* Obligation Detail Drawer */}
      <ObligationDetailDrawer
        obligation={selectedObligation}
        riskAnalysis={selectedRiskAnalysis}
        allObligations={obligations}
        onClose={handleCloseDrawer}
        onSelectObligation={handleSelectObligation}
        onOpenInGraph={handleOpenInGraph}
        onSimulateObligationDelay={handleSimulateObligationDelay}
      />
    </div>
  );
}
