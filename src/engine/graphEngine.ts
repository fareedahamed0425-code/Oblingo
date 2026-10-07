import { Obligation, DependencyGraphData, DependencyGraphNode, DependencyGraphEdge, RiskLevel } from '@/types';

/**
 * Dependency Graph Engine
 * Constructs relationship graphs between entities, receivables, payables, and liquidity states.
 * Traces cascading impact paths when nodes are simulated or delayed.
 */

export class GraphEngine {
  public static buildDependencyGraph(obligations: Obligation[]): DependencyGraphData {
    const nodes: DependencyGraphNode[] = [];
    const edges: DependencyGraphEdge[] = [];
    const entityMap = new Map<string, string>(); // counterparty -> entity node id

    // Central Liquidity Node
    const liquidityNodeId = 'node-central-liquidity';
    nodes.push({
      id: liquidityNodeId,
      label: 'Main Working Capital & Buffer',
      type: 'liquidity_position',
      category: 'ACCOUNT',
      amount: 2480000,
      riskLevel: 'LOW',
      dependencyCount: obligations.filter((o) => o.category === 'INFLOW').length,
      dependentCount: obligations.filter((o) => o.category === 'OUTFLOW').length,
    });

    // 1. Create nodes for all obligations
    for (const ob of obligations) {
      let nodeType: DependencyGraphNode['type'] = 'payable';
      if (ob.type === 'RECEIVABLE') nodeType = 'receivable';
      else if (ob.type === 'SUPPLIER_PAYMENT') nodeType = 'supplier';
      else if (ob.type === 'PAYROLL') nodeType = 'payroll';
      else if (ob.type === 'TAX') nodeType = 'tax';
      else if (ob.type === 'LOAN' || ob.type === 'EMI') nodeType = 'loan';

      nodes.push({
        id: ob.id,
        label: `${ob.counterparty}`,
        type: nodeType,
        category: ob.category,
        amount: ob.amount,
        dueDate: ob.dueDate,
        expectedDate: ob.expectedDate,
        riskLevel: ob.riskLevel,
        riskScore: ob.riskScore || 30,
        counterparty: ob.counterparty,
        status: ob.status,
        dependencyCount: ob.dependencies.length,
        dependentCount: ob.dependentObligations.length,
        isHero: ob.id === 'nexus-rec-01' || ob.id === 'paramount-pay-01' || ob.id === 'payroll-eng-01',
      });

      // Connect inflow to central liquidity
      if (ob.category === 'INFLOW') {
        edges.push({
          id: `edge-${ob.id}-to-liquidity`,
          source: ob.id,
          target: liquidityNodeId,
          relationship: 'funds',
          label: 'Funds Buffer',
          weight: ob.amount,
        });
      }

      // Connect central liquidity to outflow if not explicitly dependent
      if (ob.category === 'OUTFLOW' && ob.dependencies.length === 0) {
        edges.push({
          id: `edge-liquidity-to-${ob.id}`,
          source: liquidityNodeId,
          target: ob.id,
          relationship: 'depends_on',
          label: 'Funded By Buffer',
          weight: ob.amount,
        });
      }

      // Explicit direct causal dependency links
      for (const depId of ob.dependencies) {
        edges.push({
          id: `edge-dep-${depId}-${ob.id}`,
          source: depId,
          target: ob.id,
          relationship: 'depends_on',
          label: 'Directly Funds',
          weight: ob.amount,
        });
      }
    }

    return { nodes, edges };
  }

  /**
   * Traverses graph to find all downstream nodes exposed if a source node is delayed or fails
   */
  public static traceDownstreamCascade(
    startNodeId: string,
    graph: DependencyGraphData
  ): {
    impactedNodeIds: Set<string>;
    impactedEdgeIds: Set<string>;
    totalExposedAmount: number;
    highestRisk: RiskLevel;
  } {
    const impactedNodeIds = new Set<string>();
    const impactedEdgeIds = new Set<string>();
    const queue: string[] = [startNodeId];

    let totalExposedAmount = 0;
    let highestRisk: RiskLevel = 'LOW';

    while (queue.length > 0) {
      const current = queue.shift()!;
      impactedNodeIds.add(current);

      // Find all outgoing edges from current
      const outgoing = graph.edges.filter((e) => e.source === current);
      for (const edge of outgoing) {
        impactedEdgeIds.add(edge.id);
        if (!impactedNodeIds.has(edge.target)) {
          impactedNodeIds.add(edge.target);
          queue.push(edge.target);

          const targetNode = graph.nodes.find((n) => n.id === edge.target);
          if (targetNode && targetNode.amount) {
            totalExposedAmount += targetNode.amount;
            if (targetNode.riskLevel === 'CRITICAL') highestRisk = 'CRITICAL';
            else if (targetNode.riskLevel === 'HIGH' && highestRisk !== 'CRITICAL') highestRisk = 'HIGH';
            else if (targetNode.riskLevel === 'MEDIUM' && highestRisk === 'LOW') highestRisk = 'MEDIUM';
          }
        }
      }
    }

    return {
      impactedNodeIds,
      impactedEdgeIds,
      totalExposedAmount,
      highestRisk,
    };
  }
}
