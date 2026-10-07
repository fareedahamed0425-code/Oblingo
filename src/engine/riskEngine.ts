import { Obligation, RiskAnalysis, RiskFactor, EarlyWarning, RiskLevel, CashFlowSummary } from '@/types';
import { getDaysDifference, formatINR } from '@/utils/formatters';
import { REFERENCE_DATE, MINIMUM_LIQUIDITY_BUFFER } from '@/data/seedData';

/**
 * Transparent Analytical Risk Engine
 * Computes deterministic risk scores (0-100) from weighted financial factors
 * and produces explainable early warning triggers.
 */

export class RiskEngine {
  /**
   * Evaluates granular risk metrics for a single obligation
   */
  public static evaluateObligationRisk(
    obligation: Obligation,
    allObligations: Obligation[],
    cashSummary: CashFlowSummary,
    referenceDate: string = REFERENCE_DATE
  ): RiskAnalysis {
    const factors: RiskFactor[] = [];
    const date = obligation.expectedDate || obligation.dueDate;
    const daysUntilDue = getDaysDifference(referenceDate, date);

    // Factor 1: Liquidity Buffer Pressure (0 - 30 points)
    // Checks projected cash on the date of this obligation
    const timelinePt = cashSummary.timeline.find((t) => t.date === date);
    const projectedCashOnDate = timelinePt ? timelinePt.projectedCash : cashSummary.endingProjectedCash;
    let bufferScore = 0;
    let bufferStatus: 'SAFE' | 'WARNING' | 'DANGER' = 'SAFE';

    if (projectedCashOnDate < 0) {
      bufferScore = 30;
      bufferStatus = 'DANGER';
    } else if (projectedCashOnDate < cashSummary.minimumBuffer) {
      bufferScore = 24;
      bufferStatus = 'DANGER';
    } else if (projectedCashOnDate < cashSummary.minimumBuffer * 1.5) {
      bufferScore = 14;
      bufferStatus = 'WARNING';
    } else {
      bufferScore = 4;
      bufferStatus = 'SAFE';
    }

    factors.push({
      name: 'Liquidity Buffer Proximity',
      weight: 30,
      score: bufferScore,
      description: `Projected cash on ${date} is ${formatINR(projectedCashOnDate, true)} vs minimum buffer of ${formatINR(cashSummary.minimumBuffer, true)}.`,
      status: bufferStatus,
    });

    // Factor 2: Timing Pressure (0 - 25 points)
    let timingScore = 0;
    let timingStatus: 'SAFE' | 'WARNING' | 'DANGER' = 'SAFE';
    if (daysUntilDue < 0) {
      timingScore = 25; // Overdue
      timingStatus = 'DANGER';
    } else if (daysUntilDue <= 7) {
      timingScore = 20; // Imminent
      timingStatus = 'WARNING';
    } else if (daysUntilDue <= 15) {
      timingScore = 12;
      timingStatus = 'SAFE';
    } else {
      timingScore = 5;
      timingStatus = 'SAFE';
    }

    factors.push({
      name: 'Timing & Schedule Window',
      weight: 25,
      score: timingScore,
      description: daysUntilDue < 0 ? `Overdue by ${Math.abs(daysUntilDue)} days.` : `Due in ${daysUntilDue} days (${date}).`,
      status: timingStatus,
    });

    // Factor 3: Magnitude & Cash Ratio (0 - 25 points)
    const ratioToBuffer = obligation.amount / cashSummary.minimumBuffer;
    let magnitudeScore = 0;
    let magnitudeStatus: 'SAFE' | 'WARNING' | 'DANGER' = 'SAFE';
    if (ratioToBuffer >= 2.0) {
      magnitudeScore = 25;
      magnitudeStatus = 'DANGER';
    } else if (ratioToBuffer >= 1.0) {
      magnitudeScore = 18;
      magnitudeStatus = 'WARNING';
    } else if (ratioToBuffer >= 0.5) {
      magnitudeScore = 10;
      magnitudeStatus = 'SAFE';
    } else {
      magnitudeScore = 4;
      magnitudeStatus = 'SAFE';
    }

    factors.push({
      name: 'Capital Exposure Magnitude',
      weight: 25,
      score: magnitudeScore,
      description: `Obligation amount of ${formatINR(obligation.amount, true)} represents ${(ratioToBuffer * 100).toFixed(0)}% of liquidity buffer.`,
      status: magnitudeStatus,
    });

    // Factor 4: Dependency Depth & Cascade Exposure (0 - 20 points)
    const depCount = obligation.dependentObligations.length;
    let depScore = 0;
    let depStatus: 'SAFE' | 'WARNING' | 'DANGER' = 'SAFE';
    if (depCount >= 3) {
      depScore = 20;
      depStatus = 'DANGER';
    } else if (depCount >= 1) {
      depScore = 12;
      depStatus = 'WARNING';
    } else {
      depScore = 3;
      depStatus = 'SAFE';
    }

    factors.push({
      name: 'Downstream Cascade Depth',
      weight: 20,
      score: depScore,
      description: `${depCount} downstream obligations directly rely on timely settlement of this item.`,
      status: depStatus,
    });

    const overallScore = Math.min(100, bufferScore + timingScore + magnitudeScore + depScore);

    let riskLevel: RiskLevel = 'LOW';
    if (overallScore >= 75) {
      riskLevel = 'CRITICAL';
    } else if (overallScore >= 50) {
      riskLevel = 'HIGH';
    } else if (overallScore >= 30) {
      riskLevel = 'MEDIUM';
    }

    // Explainability traces
    const dependentNames = obligation.dependentObligations
      .map((id) => allObligations.find((o) => o.id === id))
      .filter(Boolean)
      .map((o) => `${o!.counterparty} (${formatINR(o!.amount, true)})`);

    const why = obligation.category === 'INFLOW'
      ? `Inflow concentration of ${formatINR(obligation.amount, true)} anchors ${depCount} vital month-end payables and payroll disbursements.`
      : `Committed outflow due in ${daysUntilDue} days requires available cash buffer during a tight liquidity cycle.`;

    const when = daysUntilDue <= 0 ? 'Immediately active' : `Within ${daysUntilDue} days (on ${date})`;
    const howMuch = obligation.amount;

    const recommendedActions = obligation.category === 'INFLOW'
      ? [
          'Confirm payment schedule and invoice milestone approval with client finance team.',
          'Review account receivable status and send automated reminder notice.',
          'Verify alternative backup receivables to mitigate potential 7-10 day slippage.'
        ]
      : [
          'Ensure requisite cash buffer is ring-fenced 48 hours prior to debit.',
          'Prioritize statutory and payroll disbursal over discretionary vendor dues.',
          'Monitor incoming collections scheduled immediately preceding this outflow.'
        ];

    return {
      obligationId: obligation.id,
      overallScore,
      riskLevel,
      factors,
      why,
      whatIsAffected: dependentNames,
      when,
      howMuch,
      recommendedActions,
    };
  }

  /**
   * Generates early warnings across all obligations and forward cash positions
   */
  public static generateEarlyWarnings(
    obligations: Obligation[],
    cashSummary: CashFlowSummary,
    referenceDate: string = REFERENCE_DATE
  ): EarlyWarning[] {
    const warnings: EarlyWarning[] = [];

    // 1. Hero Warning: Check Customer A (Nexus Retail) dependency chain
    const heroRec = obligations.find((o) => o.id === 'nexus-rec-01');
    if (heroRec) {
      const heroDependents = obligations.filter((o) => heroRec.dependentObligations.includes(o.id));
      const totalDependentAmount = heroDependents.reduce((acc, curr) => acc + curr.amount, 0);

      warnings.push({
        id: 'warn-hero-nexus',
        title: 'Customer Inflow Concentration — High Dependency Cascade',
        severity: 'HIGH',
        cause: `Customer A (${heroRec.counterparty}) expected ₹12.0L inflow on ${heroRec.expectedDate} directly anchors multiple downstream payables.`,
        affectedObligations: heroDependents.map((d) => d.counterparty),
        affectedObligationDetails: heroDependents.map((d) => ({
          id: d.id,
          title: d.description,
          counterparty: d.counterparty,
          amount: d.amount,
          dueDate: d.dueDate,
        })),
        financialImpact: totalDependentAmount,
        timeHorizon: 'Next 7–15 days',
        explanation: `If Customer A payment delays by 7–10 days, available cash drops significantly, leaving Supplier B (₹8.0L), Payroll (₹6.0L), and Loan EMI (₹2.5L) exposed to buffer breach.`,
        recommendedActions: [
          'Follow up with Nexus Retail accounts team for early remittance confirmation.',
          'Simulate a 10-day delay scenario in OBLIGO to review exact liquidity gap.',
          'Prepare contingency vendor payment rescheduling if collection slips past Sept 22.'
        ],
        triggerObligationId: heroRec.id,
      });
    }

    // 2. Warning: Month-end Statutory and Payroll Clustered Outflows
    const monthEndOutflows = obligations.filter((o) => {
      if (o.category !== 'OUTFLOW') return false;
      const d = getDaysDifference(referenceDate, o.expectedDate || o.dueDate);
      return d >= 10 && d <= 20;
    });

    const monthEndTotal = monthEndOutflows.reduce((acc, o) => acc + o.amount, 0);
    if (monthEndTotal > cashSummary.startingCash) {
      warnings.push({
        id: 'warn-monthend-clustering',
        title: 'Clustered Month-End Commitments Exceed Opening Buffer',
        severity: 'MEDIUM',
        cause: 'Aggregated Payroll, Tax, and Loan EMI obligations clustered between Sept 28 and Oct 10.',
        affectedObligations: ['Payroll Core Team', 'HDFC Loan EMI', 'GST Monthly Filing'],
        affectedObligationDetails: monthEndOutflows.slice(0, 4).map((d) => ({
          id: d.id,
          title: d.description,
          counterparty: d.counterparty,
          amount: d.amount,
          dueDate: d.dueDate,
        })),
        financialImpact: monthEndTotal,
        timeHorizon: 'Sept 28 – Oct 10 (14-25 days)',
        explanation: `Total commitments of ${formatINR(monthEndTotal, true)} exceed current uncommitted cash of ${formatINR(cashSummary.startingCash, true)}, relying on ₹17.5L expected customer receivables.`,
        recommendedActions: [
          'Monitor daily realization of scheduled receivables from Apex Logistics and Tata AutoComp.',
          'Lock core statutory payroll buffer 5 business days in advance.',
          'Stagger non-critical vendor disbursements into subsequent fortnightly cycle.'
        ],
        triggerObligationId: 'payroll-eng-01',
      });
    }

    return warnings;
  }
}
