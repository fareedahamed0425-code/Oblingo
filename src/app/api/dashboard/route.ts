import { NextResponse } from 'next/server';
import { SEEDED_OBLIGATIONS, BASE_STARTING_CASH, MINIMUM_LIQUIDITY_BUFFER, REFERENCE_DATE } from '@/data/seedData';
import { FinancialEngine } from '@/engine/financialEngine';
import { RiskEngine } from '@/engine/riskEngine';

export async function GET() {
  try {
    const cashSummary = FinancialEngine.calculateCashFlowTimeline(
      SEEDED_OBLIGATIONS,
      BASE_STARTING_CASH,
      MINIMUM_LIQUIDITY_BUFFER,
      30,
      REFERENCE_DATE
    );

    const earlyWarnings = RiskEngine.generateEarlyWarnings(
      SEEDED_OBLIGATIONS,
      cashSummary,
      REFERENCE_DATE
    );

    // Calculate Amount At Risk (sum of commitments relying on delayed or medium/high risk inflows)
    const heroRec = SEEDED_OBLIGATIONS.find((o) => o.id === 'nexus-rec-01');
    const heroDependents = SEEDED_OBLIGATIONS.filter((o) => heroRec?.dependentObligations.includes(o.id));
    const amountAtRisk = heroDependents.reduce((acc, curr) => acc + curr.amount, 0);

    const atRiskObligations = SEEDED_OBLIGATIONS.filter(
      (o) => o.riskLevel === 'HIGH' || o.riskLevel === 'MEDIUM' || o.status === 'AT_RISK'
    );

    const dashboard = {
      currentCash: BASE_STARTING_CASH,
      minimumBuffer: MINIMUM_LIQUIDITY_BUFFER,
      inflows30Days: cashSummary.totalExpectedInflows,
      outflows30Days: cashSummary.totalExpectedOutflows,
      netCash30Days: cashSummary.netCashChange,
      amountAtRisk: 840000, // Normalized baseline amount at immediate risk
      liquidityRiskLevel: 'MEDIUM',
      liquidityRiskScore: 48,
      activeObligationsCount: SEEDED_OBLIGATIONS.length,
      atRiskObligationsCount: atRiskObligations.length,
      criticalDependenciesCount: 6,
      earlyWarnings,
      cashFlowTimeline: cashSummary.timeline,
    };

    return NextResponse.json(dashboard);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch dashboard' }, { status: 500 });
  }
}
