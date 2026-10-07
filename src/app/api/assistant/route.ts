import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { SEEDED_OBLIGATIONS, BASE_STARTING_CASH, MINIMUM_LIQUIDITY_BUFFER, REFERENCE_DATE } from '@/data/seedData';
import { FinancialEngine } from '@/engine/financialEngine';
import { AIAssistantEngine } from '@/engine/aiAssistantEngine';

const apiKey = process.env.NVIDIA_API_KEY || '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';
const baseURL = process.env.NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1';
const defaultModel = process.env.NVIDIA_MODEL || 'nvidia/nemotron-3-super-120b-a12b';

const openaiClient = new OpenAI({
  apiKey,
  baseURL,
});

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Query message is required.' }, { status: 400 });
    }

    const trimmed = message.trim();

    // 1. Calculate live deterministic context
    const cashSummary = FinancialEngine.calculateCashFlowTimeline(
      SEEDED_OBLIGATIONS,
      BASE_STARTING_CASH,
      MINIMUM_LIQUIDITY_BUFFER,
      30,
      REFERENCE_DATE
    );

    // Context serialization for the system prompt
    const obligationsSummary = SEEDED_OBLIGATIONS.map((o) => ({
      id: o.id,
      counterparty: o.counterparty,
      type: o.type,
      category: o.category,
      amount: o.amount,
      amountFormatted: `₹${(o.amount / 100000).toFixed(1)}L`,
      dueDate: o.dueDate,
      expectedDate: o.expectedDate,
      riskLevel: o.riskLevel,
      status: o.status,
      dependencies: o.dependencies,
      dependentObligations: o.dependentObligations,
    }));

    const systemPrompt = `You are OBLIGO Intelligence — a specialized financial obligation intelligence AI.

CORE LIVE FINANCIAL SYSTEM DATA (Anchored on Reference Date: 15 Sept 2026):
- Current Available Cash: ₹24,80,000 (₹24.8L)
- Minimum Safety Buffer: ₹5,00,000 (₹5.0L)
- 30-Day Expected Inflows: ₹${(cashSummary.totalExpectedInflows / 100000).toFixed(1)}L
- 30-Day Committed Outflows: ₹${(cashSummary.totalExpectedOutflows / 100000).toFixed(1)}L
- Projected Ending Cash: ₹${(cashSummary.endingProjectedCash / 100000).toFixed(1)}L
- Lowest Projected Cash Trough: ₹${(cashSummary.minimumProjectedCash / 100000).toFixed(1)}L on ${cashSummary.minimumCashDate || 'Sept 22'}
- Key Anchor Receivable (Customer A / Nexus Retail Tech): ₹12,00,000 due Sept 20, 2026
- Direct Downstream Dependencies of Customer A:
  1. Supplier B (Paramount Components): ₹8,00,000 due Sept 22, 2026
  2. Core Engineering Payroll: ₹6,00,000 due Sept 30, 2026
  3. HDFC Term Loan EMI: ₹2,50,000 due Oct 02, 2026
  4. GST Tax Liability Filing: ₹3,00,000 due Oct 10, 2026

ACTIVE OBLIGATIONS DATABASE:
${JSON.stringify(obligationsSummary, null, 2)}

STRICT OPERATIONAL DIRECTIVES & HARDCODED CONSTRAINTS:
1. EXCLUSIVE DOMAIN RESTRICTION: You are strictly and exclusively an intelligence assistant for OBLIGO financial obligations, cash flow timelines, liquidity risk, dependency graphs, and scenario simulations.
2. ABSOLUTELY NO CODE GENERATION: Never write code, programming scripts (Python, JS, React, SQL, etc.), or debug software. If asked for code or programming, respond strictly: "I am strictly restricted to OBLIGO financial obligation and liquidity intelligence. I cannot generate code."
3. ABSOLUTELY NO OFF-TOPIC OR GENERAL ADVICE: Never provide relationship advice, personal counseling, recipes, homework solutions, creative stories, or general trivia. If asked anything outside financial obligations and cash flow in OBLIGO, politely and firmly decline.
4. NO TEMPLATE OR BOILERPLATE ANSWERS: Never use generic fill-in-the-blank placeholders, generic templates, or robotic corporate disclaimers. Give direct, sharp, analytical responses written from the perspective of an expert fintech liquidity analyst citing the exact figures from the live data above.
5. FINANCIAL DETERMINISM: All amounts, dates, and counterparties must strictly match the provided system data. Never invent or hallucinate financial figures.`;

    try {
      // Call NVIDIA API
      const completion = await openaiClient.chat.completions.create({
        model: defaultModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: trimmed },
        ],
        temperature: 0.3,
        top_p: 0.95,
        max_tokens: 1024,
      });

      const responseText = completion.choices[0]?.message?.content || '';

      if (responseText.trim()) {
        // Also trace any referenced obligations for UI badges
        const referencedObligations = SEEDED_OBLIGATIONS.filter((o) =>
          responseText.toLowerCase().includes(o.counterparty.toLowerCase().split('(')[0].trim().toLowerCase()) ||
          (o.id === 'nexus-rec-01' && (trimmed.toLowerCase().includes('customer a') || trimmed.toLowerCase().includes('nexus'))) ||
          (o.id === 'paramount-pay-01' && (trimmed.toLowerCase().includes('supplier b') || trimmed.toLowerCase().includes('paramount')))
        ).slice(0, 4);

        return NextResponse.json({
          id: `ai-msg-${Date.now()}`,
          role: 'assistant',
          content: responseText,
          timestamp: new Date().toISOString(),
          insights: {
            tracedObligations: referencedObligations.length > 0 ? referencedObligations : undefined,
          },
        });
      }
    } catch (apiError: any) {
      console.warn('NVIDIA API call failed or encountered error, falling back to deterministic calculation engine:', apiError?.message);
    }

    // Fallback: Deterministic Engine
    const fallbackResponse = AIAssistantEngine.processUserQuery(
      trimmed,
      SEEDED_OBLIGATIONS,
      BASE_STARTING_CASH,
      MINIMUM_LIQUIDITY_BUFFER,
      REFERENCE_DATE
    );

    return NextResponse.json(fallbackResponse);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error processing AI assistant request' }, { status: 500 });
  }
}
