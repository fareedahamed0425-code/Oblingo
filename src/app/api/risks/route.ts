import { NextResponse } from 'next/server';
import { SEEDED_OBLIGATIONS, BASE_STARTING_CASH, MINIMUM_LIQUIDITY_BUFFER, REFERENCE_DATE } from '@/data/seedData';
import { RiskEngine } from '@/engine/riskEngine';
import { FinancialEngine } from '@/engine/financialEngine';

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

    const analyzedObligations = SEEDED_OBLIGATIONS.map((ob) =>
      RiskEngine.evaluateObligationRisk(ob, SEEDED_OBLIGATIONS, cashSummary, REFERENCE_DATE)
    );

    return NextResponse.json({
      overallLiquidityRisk: 'MEDIUM',
      overallScore: 48,
      earlyWarnings,
      analyzedObligations,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error evaluating risks' }, { status: 500 });
  }
}
