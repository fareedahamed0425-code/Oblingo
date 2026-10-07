import { Obligation, CashFlowPoint, CashFlowSummary, ScenarioInput, ScenarioResult, RiskLevel } from '@/types';
import { addDaysToDate, getDaysDifference } from '@/utils/formatters';
import { BASE_STARTING_CASH, MINIMUM_LIQUIDITY_BUFFER, REFERENCE_DATE } from '@/data/seedData';

/**
 * Deterministic Financial Calculation Engine
 * Strictly computes projected cash, liquidity gaps, buffer deficits, and scenario deltas.
 */

export class FinancialEngine {
  /**
   * Generates a forward-looking cash flow timeline starting from a reference date
   */
  public static calculateCashFlowTimeline(
    obligations: Obligation[],
    startingCash: number = BASE_STARTING_CASH,
    minimumBuffer: number = MINIMUM_LIQUIDITY_BUFFER,
    horizonDays: number = 30,
    startDate: string = REFERENCE_DATE
  ): CashFlowSummary {
    const timeline: CashFlowPoint[] = [];
    let currentBalance = startingCash;
    let totalInflows = 0;
    let totalOutflows = 0;
    let minimumProjectedCash = startingCash;
    let minimumCashDate: string | null = null;
    let maxLiquidityGap = 0;
    let breachDaysCount = 0;

    // Group obligations by effective expected date
    const dateMap = new Map<string, Obligation[]>();
    for (const ob of obligations) {
      const date = ob.expectedDate || ob.dueDate;
      if (!dateMap.has(date)) {
        dateMap.set(date, []);
      }
      dateMap.get(date)!.push(ob);
    }

    for (let dayOffset = 0; dayOffset <= horizonDays; dayOffset++) {
      const currentDate = addDaysToDate(startDate, dayOffset);
      const eventsOnDate = dateMap.get(currentDate) || [];

      let dayInflows = 0;
      let dayOutflows = 0;
      const formattedEvents: CashFlowPoint['events'] = [];

      for (const ev of eventsOnDate) {
        if (ev.category === 'INFLOW') {
          dayInflows += ev.amount;
        } else {
          dayOutflows += ev.amount;
        }
        formattedEvents.push({
          id: ev.id,
          type: ev.type,
          counterparty: ev.counterparty,
          amount: ev.amount,
          category: ev.category,
          riskLevel: ev.riskLevel,
        });
      }

      totalInflows += dayInflows;
      totalOutflows += dayOutflows;
      const netDayChange = dayInflows - dayOutflows;
      currentBalance += netDayChange;

      const isBreached = currentBalance < minimumBuffer;
      const bufferDeficit = isBreached ? minimumBuffer - currentBalance : 0;

      if (isBreached) {
        breachDaysCount++;
        if (bufferDeficit > maxLiquidityGap) {
          maxLiquidityGap = bufferDeficit;
        }
      }

      if (currentBalance < minimumProjectedCash) {
        minimumProjectedCash = currentBalance;
        minimumCashDate = currentDate;
      }

      timeline.push({
        date: currentDate,
        inflows: dayInflows,
        outflows: dayOutflows,
        netDayChange,
        projectedCash: currentBalance,
        events: formattedEvents,
        isBreached,
        bufferDeficit,
      });
    }

    return {
      startingCash,
      minimumBuffer,
      horizonDays,
      totalExpectedInflows: totalInflows,
      totalExpectedOutflows: totalOutflows,
      netCashChange: totalInflows - totalOutflows,
      endingProjectedCash: currentBalance,
      minimumProjectedCash,
      minimumCashDate,
      liquidityBreachDays: breachDaysCount,
      maxLiquidityGap,
      timeline,
    };
  }

  /**
   * Evaluates a "What-If" scenario against baseline obligations
   */
  public static simulateScenario(
    baselineObligations: Obligation[],
    scenario: ScenarioInput,
    startingCash: number = BASE_STARTING_CASH,
    minimumBuffer: number = MINIMUM_LIQUIDITY_BUFFER,
    horizonDays: number = 45,
    startDate: string = REFERENCE_DATE
  ): ScenarioResult {
    // 1. Calculate baseline cash flow
    const baselineSummary = this.calculateCashFlowTimeline(
      baselineObligations,
      startingCash,
      minimumBuffer,
      horizonDays,
      startDate
    );

    // 2. Clone and adjust obligations for scenario
    let adjustedStartingCash = startingCash;
    if (scenario.additionalCashInfusion) {
      adjustedStartingCash += scenario.additionalCashInfusion.amount;
    }

    const modifiedObligations: Obligation[] = baselineObligations.map((ob) => {
      const clone = { ...ob };

      // Customer delay applied to specific obligation
      if (scenario.customerDelayDays && scenario.customerDelayDays[ob.id]) {
        const delay = scenario.customerDelayDays[ob.id];
        clone.expectedDate = addDaysToDate(clone.dueDate, delay);
        clone.status = delay > 0 ? 'DELAYED' : clone.status;
      } else if (
        scenario.globalCustomerDelayDays &&
        scenario.globalCustomerDelayDays > 0 &&
        ob.category === 'INFLOW'
      ) {
        clone.expectedDate = addDaysToDate(clone.dueDate, scenario.globalCustomerDelayDays);
        clone.status = 'DELAYED';
      }

      // Supplier payment delay
      if (scenario.supplierDelayDays && scenario.supplierDelayDays[ob.id]) {
        const delay = scenario.supplierDelayDays[ob.id];
        clone.expectedDate = addDaysToDate(clone.dueDate, delay);
      }

      return clone;
    });

    // Add unexpected expense if specified
    if (scenario.unexpectedExpense && scenario.unexpectedExpense.amount > 0) {
      modifiedObligations.push({
        id: 'scenario-unexpected-expense',
        type: 'OTHER',
        category: 'OUTFLOW',
        counterparty: 'Emergency Outflow / Contingency',
        counterpartyType: 'VENDOR',
        description: scenario.unexpectedExpense.description || 'Unexpected Operational Expense',
        amount: scenario.unexpectedExpense.amount,
        currency: 'INR',
        dueDate: scenario.unexpectedExpense.date || startDate,
        expectedDate: scenario.unexpectedExpense.date || startDate,
        status: 'UPCOMING',
        priority: 'HIGH',
        confidence: 100,
        source: 'Scenario Input',
        dependencies: [],
        dependentObligations: [],
        riskLevel: 'HIGH',
      });
    }

    // 3. Compute scenario cash flow
    const scenarioSummary = this.calculateCashFlowTimeline(
      modifiedObligations,
      adjustedStartingCash,
      minimumBuffer,
      horizonDays,
      startDate
    );

    // 4. Identify obligations falling during liquidity breach or deficit windows
    const affectedObligations: ScenarioResult['affectedObligations'] = [];
    const cascade: ScenarioResult['cascade'] = [];

    // Find earliest breach date and days to pressure
    let daysToPressure: number | null = null;
    let earliestBreachDate: string | null = null;

    for (let i = 0; i < scenarioSummary.timeline.length; i++) {
      const pt = scenarioSummary.timeline[i];
      if (pt.isBreached && earliestBreachDate === null) {
        earliestBreachDate = pt.date;
        daysToPressure = getDaysDifference(startDate, pt.date);
      }
    }

    // Analyze which outflows are stressed
    for (const ob of modifiedObligations) {
      if (ob.category === 'OUTFLOW') {
        const obDate = ob.expectedDate || ob.dueDate;
        const timelinePt = scenarioSummary.timeline.find((t) => t.date === obDate);
        const baselinePt = baselineSummary.timeline.find((t) => t.date === obDate);

        const isExposedInScenario = timelinePt ? timelinePt.isBreached : false;
        const wasExposedInBaseline = baselinePt ? baselinePt.isBreached : false;

        if (isExposedInScenario) {
          let newRisk: RiskLevel = 'HIGH';
          if (timelinePt && timelinePt.projectedCash < 0) {
            newRisk = 'CRITICAL';
          }

          let cause = 'Cash balance projected below minimum buffer on obligation due date';
          if (timelinePt && timelinePt.projectedCash < 0) {
            cause = `Projected cash deficit of ${Math.abs(timelinePt.projectedCash).toLocaleString('en-IN')}`;
          }

          affectedObligations.push({
            id: ob.id,
            counterparty: ob.counterparty,
            type: ob.type,
            amount: ob.amount,
            originalDueDate: ob.dueDate,
            effectiveDate: obDate,
            originalRisk: ob.riskLevel,
            newRisk,
            causeOfExposure: cause,
          });
        }
      }
    }

    // Build the causal cascade steps
    let stepCount = 1;
    // Step 1: Inflow delay
    if (scenario.customerDelayDays && Object.keys(scenario.customerDelayDays).length > 0) {
      for (const [obId, delay] of Object.entries(scenario.customerDelayDays)) {
        if (delay > 0) {
          const delayOb = baselineObligations.find((o) => o.id === obId);
          if (delayOb) {
            cascade.push({
              step: stepCount++,
              sourceNode: delayOb.counterparty,
              impactedNode: 'Expected Cash Inflow',
              description: `${delayOb.counterparty} payment of ₹${(delayOb.amount / 100000).toFixed(1)}L shifted by ${delay} days (from ${delayOb.dueDate} to ${addDaysToDate(delayOb.dueDate, delay)}).`,
              financialMagnitude: delayOb.amount,
              criticality: delay >= 10 ? 'HIGH' : 'MEDIUM',
            });
          }
        }
      }
    }

    // Step 2: Available cash depletion
    const cashDifference = scenarioSummary.minimumProjectedCash - baselineSummary.minimumProjectedCash;
    if (cashDifference < 0) {
      cascade.push({
        step: stepCount++,
        sourceNode: 'Inflow Timing Shift',
        impactedNode: 'Available Liquidity Buffer',
        description: `Projected minimum cash balance drops from ₹${(baselineSummary.minimumProjectedCash / 100000).toFixed(1)}L to ₹${(scenarioSummary.minimumProjectedCash / 100000).toFixed(1)}L (Net drop of ₹${(Math.abs(cashDifference) / 100000).toFixed(1)}L).`,
        financialMagnitude: Math.abs(cashDifference),
        criticality: scenarioSummary.minimumProjectedCash < minimumBuffer ? 'HIGH' : 'MEDIUM',
      });
    }

    // Step 3: Outflow exposure
    for (const aff of affectedObligations.slice(0, 4)) {
      cascade.push({
        step: stepCount++,
        sourceNode: 'Available Liquidity Buffer',
        impactedNode: aff.counterparty,
        description: `${aff.type.replace('_', ' ')} of ₹${(aff.amount / 100000).toFixed(1)}L due on ${aff.effectiveDate} becomes exposed due to depleted buffer.`,
        financialMagnitude: aff.amount,
        criticality: aff.newRisk,
      });
    }

    // Determine overall scenario risk
    let scenarioRiskLevel: RiskLevel = 'LOW';
    if (scenarioSummary.minimumProjectedCash < 0) {
      scenarioRiskLevel = 'CRITICAL';
    } else if (scenarioSummary.minimumProjectedCash < minimumBuffer) {
      scenarioRiskLevel = 'HIGH';
    } else if (scenarioSummary.minimumProjectedCash < minimumBuffer * 1.5) {
      scenarioRiskLevel = 'MEDIUM';
    }

    let baselineRiskLevel: RiskLevel = 'LOW';
    if (baselineSummary.minimumProjectedCash < 0) {
      baselineRiskLevel = 'CRITICAL';
    } else if (baselineSummary.minimumProjectedCash < minimumBuffer) {
      baselineRiskLevel = 'HIGH';
    } else if (baselineSummary.minimumProjectedCash < minimumBuffer * 1.5) {
      baselineRiskLevel = 'MEDIUM';
    }

    // Generate explainability breakdown
    const why = `Expected customer cash inflows shifted beyond the payment windows of committed payables and statutory obligations.`;
    const whatIsAffected = affectedObligations.map((o) => `${o.counterparty} (₹${(o.amount / 100000).toFixed(1)}L)`).join(', ') || 'No critical obligations breached';
    const when = daysToPressure !== null ? `Liquidity pressure projected in ${daysToPressure} days (${earliestBreachDate})` : 'No liquidity breach projected in horizon';
    const howMuch = `Projected minimum cash buffer contracts by ₹${(Math.abs(cashDifference) / 100000).toFixed(1)}L, resulting in a maximum buffer gap of ₹${(scenarioSummary.maxLiquidityGap / 100000).toFixed(1)}L.`;

    const recommendedActions = [
      'Initiate priority collection and escalation with delayed counterparties.',
      'Negotiate 5 to 7 day payment extension with non-statutory vendor payables.',
      'Protect core payroll and tax obligations from liquidity displacement.',
      'Review short-term working capital overdraft drawdown limits.'
    ];

    return {
      scenarioName: scenario.name || 'Custom What-If Simulation',
      baselineStartingCash: startingCash,
      baselineMinCash: baselineSummary.minimumProjectedCash,
      scenarioMinCash: scenarioSummary.minimumProjectedCash,
      difference: cashDifference,
      baselineRiskLevel,
      scenarioRiskLevel,
      baselineLiquidityGap: baselineSummary.maxLiquidityGap,
      scenarioLiquidityGap: scenarioSummary.maxLiquidityGap,
      daysToPressure,
      earliestBreachDate,
      affectedObligations,
      cascade,
      explanation: {
        why,
        whatIsAffected,
        when,
        howMuch,
      },
      recommendedActions,
      timelineComparison: {
        baselineTimeline: baselineSummary.timeline,
        scenarioTimeline: scenarioSummary.timeline,
      },
    };
  }
}
