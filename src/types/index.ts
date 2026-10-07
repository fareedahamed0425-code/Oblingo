export type ObligationType =
  | 'RECEIVABLE'
  | 'PAYABLE'
  | 'SUPPLIER_PAYMENT'
  | 'PAYROLL'
  | 'TAX'
  | 'LOAN'
  | 'EMI'
  | 'RENT'
  | 'UTILITY'
  | 'OTHER';

export type ObligationStatus =
  | 'EXPECTED'
  | 'UPCOMING'
  | 'DUE'
  | 'PAID'
  | 'DELAYED'
  | 'AT_RISK'
  | 'OVERDUE';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type PriorityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface Obligation {
  id: string;
  type: ObligationType;
  category: 'INFLOW' | 'OUTFLOW';
  counterparty: string;
  counterpartyType: 'CUSTOMER' | 'SUPPLIER' | 'EMPLOYEES' | 'TAX_AUTHORITY' | 'BANK' | 'LANDLORD' | 'VENDOR';
  description: string;
  amount: number; // in INR
  currency: string;
  dueDate: string; // ISO date YYYY-MM-DD
  expectedDate: string; // ISO date YYYY-MM-DD
  status: ObligationStatus;
  priority: PriorityLevel;
  recurrence?: 'NONE' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';
  confidence: number; // 0 to 100 percentage
  source: string; // e.g. 'Invoice #INV-2026-88', 'Contract #CT-401', 'Statutory Schedule'
  dependencies: string[]; // IDs of obligations or counterparties this obligation relies on (e.g. Inflows needed to fund this outflow)
  dependentObligations: string[]; // IDs of obligations that rely on this one
  riskLevel: RiskLevel;
  riskScore?: number; // 0 to 100
  notes?: string;
  metadata?: Record<string, any>;
}

export interface CashFlowPoint {
  date: string; // YYYY-MM-DD
  inflows: number;
  outflows: number;
  netDayChange: number;
  projectedCash: number;
  events: Array<{
    id: string;
    type: ObligationType;
    counterparty: string;
    amount: number;
    category: 'INFLOW' | 'OUTFLOW';
    riskLevel: RiskLevel;
  }>;
  isBreached: boolean;
  bufferDeficit: number;
}

export interface CashFlowSummary {
  startingCash: number;
  minimumBuffer: number;
  horizonDays: number;
  totalExpectedInflows: number;
  totalExpectedOutflows: number;
  netCashChange: number;
  endingProjectedCash: number;
  minimumProjectedCash: number;
  minimumCashDate: string | null;
  liquidityBreachDays: number;
  maxLiquidityGap: number;
  timeline: CashFlowPoint[];
}

export interface RiskFactor {
  name: string;
  weight: number;
  score: number;
  description: string;
  status: 'SAFE' | 'WARNING' | 'DANGER';
}

export interface RiskAnalysis {
  obligationId: string;
  overallScore: number;
  riskLevel: RiskLevel;
  factors: RiskFactor[];
  why: string;
  whatIsAffected: string[];
  when: string;
  howMuch: number;
  recommendedActions: string[];
}

export interface EarlyWarning {
  id: string;
  title: string;
  severity: RiskLevel;
  cause: string;
  affectedObligations: string[];
  affectedObligationDetails?: Array<{
    id: string;
    title: string;
    counterparty: string;
    amount: number;
    dueDate: string;
  }>;
  financialImpact: number;
  timeHorizon: string;
  explanation: string;
  recommendedActions: string[];
  triggerObligationId: string;
}

export interface DependencyGraphNode {
  id: string;
  label: string;
  type: 'customer' | 'supplier' | 'receivable' | 'payable' | 'payroll' | 'tax' | 'loan' | 'emi' | 'cash_account' | 'liquidity_position';
  category: 'INFLOW' | 'OUTFLOW' | 'ENTITY' | 'ACCOUNT';
  amount?: number;
  dueDate?: string;
  expectedDate?: string;
  riskLevel: RiskLevel;
  riskScore?: number;
  counterparty?: string;
  status?: ObligationStatus;
  dependencyCount: number;
  dependentCount: number;
  isHero?: boolean;
}

export interface DependencyGraphEdge {
  id: string;
  source: string;
  target: string;
  relationship: 'depends_on' | 'funds' | 'affects' | 'exposed_to' | 'scheduled_before' | 'scheduled_after';
  label?: string;
  weight?: number;
  isExposed?: boolean;
  isCascadePath?: boolean;
}

export interface DependencyGraphData {
  nodes: DependencyGraphNode[];
  edges: DependencyGraphEdge[];
}

export interface ScenarioInput {
  name?: string;
  customerDelayDays?: Record<string, number>; // obligationId -> delay days
  globalCustomerDelayDays?: number;
  supplierDelayDays?: Record<string, number>;
  unexpectedExpense?: {
    amount: number;
    date: string;
    description: string;
  };
  additionalCashInfusion?: {
    amount: number;
    date: string;
    source: string;
  };
}

export interface ScenarioResult {
  scenarioName: string;
  baselineStartingCash: number;
  baselineMinCash: number;
  scenarioMinCash: number;
  difference: number;
  baselineRiskLevel: RiskLevel;
  scenarioRiskLevel: RiskLevel;
  baselineLiquidityGap: number;
  scenarioLiquidityGap: number;
  daysToPressure: number | null;
  earliestBreachDate: string | null;
  affectedObligations: Array<{
    id: string;
    counterparty: string;
    type: ObligationType;
    amount: number;
    originalDueDate: string;
    effectiveDate: string;
    originalRisk: RiskLevel;
    newRisk: RiskLevel;
    causeOfExposure: string;
  }>;
  cascade: Array<{
    step: number;
    sourceNode: string;
    impactedNode: string;
    description: string;
    financialMagnitude: number;
    criticality: RiskLevel;
  }>;
  explanation: {
    why: string;
    whatIsAffected: string;
    when: string;
    howMuch: string;
  };
  recommendedActions: string[];
  timelineComparison: {
    baselineTimeline: CashFlowPoint[];
    scenarioTimeline: CashFlowPoint[];
  };
}

export interface DashboardSummary {
  currentCash: number;
  minimumBuffer: number;
  inflows30Days: number;
  outflows30Days: number;
  netCash30Days: number;
  amountAtRisk: number;
  liquidityRiskLevel: RiskLevel;
  liquidityRiskScore: number;
  activeObligationsCount: number;
  atRiskObligationsCount: number;
  criticalDependenciesCount: number;
  earlyWarnings: EarlyWarning[];
  cashFlowTimeline: CashFlowPoint[];
}

export interface AIAssistantMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  insights?: {
    tracedObligations?: Obligation[];
    impactAmount?: number;
    riskShift?: string;
    cascadeChain?: string[];
    recommendedActions?: string[];
    scenarioRef?: ScenarioInput;
  };
}
