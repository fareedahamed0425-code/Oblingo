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
import {
  DashboardSkeleton,
  ObligationsSkeleton,
  CashFlowSkeleton,
  DependencyGraphSkeleton,
  ScenarioSimulatorSkeleton,
  RiskCenterSkeleton,
  AIAssistantSkeleton,
} from '@/components/Skeletons';
import { SEEDED_OBLIGATIONS, BASE_STARTING_CASH, MINIMUM_LIQUIDITY_BUFFER, REFERENCE_DATE } from '@/data/seedData';
import { FinancialEngine } from '@/engine/financialEngine';
import { RiskEngine } from '@/engine/riskEngine';
import { Obligation, DashboardSummary, RiskAnalysis } from '@/types';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [obligations] = useState<Obligation[]>(SEEDED_OBLIGATIONS);
  const [selectedObligationId, setSelectedObligationId] = useState<string | null>(null);
  const [graphFocusNodeId, setGraphFocusNodeId] = useState<string | null>(null);
  const [isHeroDemoActive, setIsHeroDemoActive] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initial smooth skeleton loading simulation (350ms) for high-grade market polish
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 350);
    return () => clearTimeout(timer);
  }, [activeTab]);

  const handleTabChange = (tab: TabType) => {
    setIsLoading(true);
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

  const selectedObligation = selectedObligationId
    ? obligations.find((o) => o.id === selectedObligationId) || null
    : null;

  const selectedRiskAnalysis: RiskAnalysis | null = selectedObligation
    ? RiskEngine.evaluateObligationRisk(selectedObligation, obligations, cashSummary, REFERENCE_DATE)
    : null;

  const handleSelectObligation = (id: string) => {
    setSelectedObligationId(id);
  };

  const handleCloseDrawer = () => {
    setSelectedObligationId(null);
  };

  const handleOpenInGraph = (id: string) => {
    setSelectedObligationId(null);
    setGraphFocusNodeId(id);
    handleTabChange('graph');
  };

  const handleSimulateObligationDelay = (id: string) => {
    setSelectedObligationId(null);
    setIsHeroDemoActive(true);
    handleTabChange('scenarios');
  };

  const handleTriggerHeroDemo = () => {
    setIsHeroDemoActive(true);
    handleTabChange('scenarios');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Floating Island Navigation */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={handleTabChange}
        onTriggerHeroDemo={handleTriggerHeroDemo}
        isHeroDemoActive={isHeroDemoActive && activeTab === 'scenarios'}
      />

      {/* Main Workspace with Skeleton Loaders */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {isLoading ? (
          <>
            {activeTab === 'dashboard' && <DashboardSkeleton />}
            {activeTab === 'obligations' && <ObligationsSkeleton />}
            {activeTab === 'cashflow' && <CashFlowSkeleton />}
            {activeTab === 'graph' && <DependencyGraphSkeleton />}
            {activeTab === 'scenarios' && <ScenarioSimulatorSkeleton />}
            {activeTab === 'risks' && <RiskCenterSkeleton />}
            {activeTab === 'assistant' && <AIAssistantSkeleton />}
          </>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <DashboardView
                dashboardData={dashboardData}
                obligations={obligations}
                onSelectObligation={handleSelectObligation}
                onNavigateTab={handleTabChange}
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
                onNavigateTab={handleTabChange}
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
                onNavigateTab={handleTabChange}
                onTriggerHeroScenario={handleTriggerHeroDemo}
              />
            )}
          </>
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
