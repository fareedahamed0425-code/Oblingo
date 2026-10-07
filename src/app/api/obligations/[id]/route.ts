import { NextRequest, NextResponse } from 'next/server';
import { SEEDED_OBLIGATIONS, BASE_STARTING_CASH, MINIMUM_LIQUIDITY_BUFFER, REFERENCE_DATE } from '@/data/seedData';
import { RiskEngine } from '@/engine/riskEngine';
import { FinancialEngine } from '@/engine/financialEngine';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const obligation = SEEDED_OBLIGATIONS.find((o) => o.id === id);

    if (!obligation) {
      return NextResponse.json({ error: `Obligation with ID ${id} not found.` }, { status: 404 });
    }

    const cashSummary = FinancialEngine.calculateCashFlowTimeline(
      SEEDED_OBLIGATIONS,
      BASE_STARTING_CASH,
      MINIMUM_LIQUIDITY_BUFFER,
      30,
      REFERENCE_DATE
    );

    const riskAnalysis = RiskEngine.evaluateObligationRisk(
      obligation,
      SEEDED_OBLIGATIONS,
      cashSummary,
      REFERENCE_DATE
    );

    const resolvedDependencies = SEEDED_OBLIGATIONS.filter((o) => obligation.dependencies.includes(o.id));
    const resolvedDependents = SEEDED_OBLIGATIONS.filter((o) => obligation.dependentObligations.includes(o.id));

    return NextResponse.json({
      obligation,
      riskAnalysis,
      dependencies: resolvedDependencies,
      dependentObligations: resolvedDependents,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error fetching obligation detail' }, { status: 500 });
  }
}
