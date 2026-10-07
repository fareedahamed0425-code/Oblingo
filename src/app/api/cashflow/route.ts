import { NextRequest, NextResponse } from 'next/server';
import { SEEDED_OBLIGATIONS, BASE_STARTING_CASH, MINIMUM_LIQUIDITY_BUFFER, REFERENCE_DATE } from '@/data/seedData';
import { FinancialEngine } from '@/engine/financialEngine';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const horizon = parseInt(searchParams.get('horizon') || '30', 10);
    const startingCash = parseInt(searchParams.get('startingCash') || String(BASE_STARTING_CASH), 10);

    const summary = FinancialEngine.calculateCashFlowTimeline(
      SEEDED_OBLIGATIONS,
      startingCash,
      MINIMUM_LIQUIDITY_BUFFER,
      horizon,
      REFERENCE_DATE
    );

    return NextResponse.json(summary);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error generating cash flow' }, { status: 500 });
  }
}
