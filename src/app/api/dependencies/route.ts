import { NextRequest, NextResponse } from 'next/server';
import { SEEDED_OBLIGATIONS } from '@/data/seedData';
import { GraphEngine } from '@/engine/graphEngine';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const traceNodeId = searchParams.get('traceNodeId');

    const graph = GraphEngine.buildDependencyGraph(SEEDED_OBLIGATIONS);

    if (traceNodeId) {
      const cascade = GraphEngine.traceDownstreamCascade(traceNodeId, graph);
      return NextResponse.json({
        graph,
        cascade: {
          impactedNodeIds: Array.from(cascade.impactedNodeIds),
          impactedEdgeIds: Array.from(cascade.impactedEdgeIds),
          totalExposedAmount: cascade.totalExposedAmount,
          highestRisk: cascade.highestRisk,
        },
      });
    }

    return NextResponse.json({ graph });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error generating dependency graph' }, { status: 500 });
  }
}
