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

    const systemPrompt = `You are the OBLIGO Financial Intelligence Assistant.

ROLE & PERSONA:
- You are a highly professional, respectful, polite, and articulate senior financial intelligence assistant for OBLIGO.
- When the user sends a greeting (such as "hi", "hello", "good day", "greetings"), respond warmly, courteously, and formally, acknowledging them with dignity and offering to help analyze their financial obligations, cash flow timelines, or scenario simulations.
- When answering financial questions, explain the numbers clearly and effortlessly with authoritative insight.
- DO NOT use any emojis.
- DO NOT use generic template disclaimers or robotic rejection text when greeted. Be natural, professional, and respectful.

LIVE FINANCIAL SYSTEM DATA (Anchored on Reference Date: 15 Sept 2026):
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

OPERATIONAL BOUNDARIES:
- Domain Focus: Financial obligations, cash flows, liquidity risks, dependencies, and scenario simulations.
- If asked for software code generation or personal relationship advice, decline politely and respectfully: "I specialize in OBLIGO financial obligation and liquidity intelligence. I am unable to assist with programming or non-financial matters, but I would be pleased to assist with your cash flow and obligation analysis."
- Use exact figures from the system data. Never invent monetary values.`;

    try {
      // Call NVIDIA API
      const completion = await openaiClient.chat.completions.create({
        model: defaultModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: trimmed },
        ],
        temperature: 0.5,
        top_p: 0.95,
        max_tokens: 1024,
      });

      const responseText = completion.choices[0]?.message?.content || '';

      if (responseText.trim()) {
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
