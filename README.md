# OBLIGO — Financial Obligation Intelligence Platform

> **"What happens next if one financial obligation changes?"**

OBLIGO is a forward-looking financial intelligence layer that models relationships between financial obligations (receivables, supplier payables, payroll, loan EMIs, taxes) and determines how a change or delay in one commitment cascades into future cash flows and downstream commitments.

---

## ⚡ Key Features

- **Interactive Financial Dependency Graph:** Visual 4-tier architecture modeling causal links between Customer Inflows, Central Working Capital Buffers, and Committed Outflows with downstream cascade tracing.
- **Scenario Simulator ("What-If" Engine):** Real-time stress testing of payment delays, unexpected expenses, and capital infusions with dual-curve cash flow trajectory comparisons.
- **Forward-Looking Cash Flow Timeline:** 7 to 90-day projection curves with automatic liquidity safety buffer breach detection.
- **Analytical Risk Center & Explainability Engine:** 4-factor deterministic scoring (Liquidity Buffer Proximity, Timing Pressure, Capital Exposure Ratio, Downstream Cascade Depth) providing granular *Why*, *What is Affected*, *When*, and *How Much* diagnostics.
- **Specialized AI Assistant:** Powered by NVIDIA Nemotron-3 Super LLM with hardcoded domain constraints grounded directly in live deterministic obligation models.
- **Hero Demo Scenario:** 1-Click simulation of Customer A (₹12.0L) 10-day payment delay and its cascading impact on Supplier B (₹8.0L), Core Engineering Payroll (₹6.0L), and Loan EMIs.

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 18+ or 20+
- npm

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Copy the example environment configuration:
```bash
cp .env.example .env.local
```
Add your NVIDIA API key to `.env.local`:
```env
NVIDIA_API_KEY=your_nvidia_api_key_here
NVIDIA_BASE_URL=https://integrate.api.nvidia.com/v1
NVIDIA_MODEL=nvidia/nemotron-3-super-120b-a12b
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Production Build
```bash
npm run build
npm run start
```

---

## 🏗️ Architecture

```
src/
├── app/
│   ├── api/
│   │   ├── assistant/      # AI Intelligence LLM Endpoint
│   │   ├── cashflow/       # Cash Flow Timeline Calculation
│   │   ├── dashboard/      # Dashboard Overview & Early Warnings
│   │   ├── dependencies/   # Graph Nodes, Edges & Cascade Engine
│   │   ├── obligations/    # Obligation Directory & Filter API
│   │   ├── risks/          # Risk Scoring & Explainability API
│   │   └── scenarios/      # "What-If" Scenario Simulation API
│   ├── layout.tsx
│   ├── page.tsx            # Main Application Workspace
│   └── globals.css
├── components/
│   ├── Navbar.tsx
│   ├── DashboardView.tsx
│   ├── ObligationsView.tsx
│   ├── ObligationDetailDrawer.tsx
│   ├── CashFlowView.tsx
│   ├── DependencyGraphView.tsx
│   ├── ScenarioSimulatorView.tsx
│   ├── RiskCenterView.tsx
│   └── AIAssistantView.tsx
├── engine/
│   ├── financialEngine.ts  # Deterministic Cash Flow Math
│   ├── riskEngine.ts       # 4-Factor Analytical Risk Scoring
│   ├── graphEngine.ts      # Graph Generation & Cascade Traversal
│   └── aiAssistantEngine.ts
├── data/
│   └── seedData.ts         # Realistic SMB Seeded Dataset (INR ₹)
├── types/
│   └── index.ts            # TypeScript Interfaces & Models
└── utils/
    └── formatters.ts       # Indian Rupee & Date Formatters
```
