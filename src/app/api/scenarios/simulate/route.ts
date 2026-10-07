import { NextRequest, NextResponse } from 'next/server';
import { SEEDED_OBLIGATIONS, BASE_STARTING_CASH, MINIMUM_LIQUIDITY_BUFFER, REFERENCE_DATE } from '@/data/seedData';
import { FinancialEngine } from '@/engine/financialEngine';
import { ScenarioInput } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: ScenarioInput = await request.json();

    const simulation = FinancialEngine.simulateScenario(
      SEEDED_OBLIGATIONS,
      body,
      BASE_STARTING_CASH,
      MINIMUM_LIQUIDITY_BUFFER,
      45,
      REFERENCE_DATE
    );

    return NextResponse.json(simulation);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error simulating scenario' }, { status: 500 });
  }
}
