'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  BotMessageSquare,
  Send,
  Sparkles,
  User,
  ShieldCheck,
  AlertCircle,
  GitFork,
  ArrowRight,
  SlidersHorizontal,
  RotateCcw,
  RefreshCw,
} from 'lucide-react';
import { Obligation, AIAssistantMessage } from '@/types';
import { formatINR } from '@/utils/formatters';
import { BASE_STARTING_CASH, MINIMUM_LIQUIDITY_BUFFER, REFERENCE_DATE } from '@/data/seedData';

interface AIAssistantViewProps {
  obligations: Obligation[];
  onSelectObligation: (id: string) => void;
  onNavigateTab: (tab: 'dashboard' | 'obligations' | 'cashflow' | 'graph' | 'scenarios' | 'risks' | 'assistant') => void;
  onTriggerHeroScenario: () => void;
}

export const AIAssistantView: React.FC<AIAssistantViewProps> = ({
  obligations,
  onSelectObligation,
  onNavigateTab,
  onTriggerHeroScenario,
}) => {
  const [messages, setMessages] = useState<AIAssistantMessage[]>([
    {
      id: 'welcome-msg',
      role: 'assistant',
      content: `👋 Hello. I am the **OBLIGO Financial Intelligence Assistant**.

I am strictly specialized in analyzing your financial obligations, cash flow dependencies, liquidity risk, and scenario stress tests.

**Popular Analytical Queries:**
- *"What happens if Customer A pays 10 days late?"*
- *"How much cash do I need over the next 30 days?"*
- *"Which payments are most at risk?"*
- *"What obligations depend on Customer A?"*
- *"Why is my liquidity risk high?"*`,
      timestamp: new Date().toISOString(),
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedPrompts = [
    'What happens if Customer A pays 10 days late?',
    'How much cash do I need over the next 30 days?',
    'Which payments are most at risk?',
    'What obligations depend on Customer A?',
    'Why is my liquidity risk high?',
    'Show me my largest dependency chain',
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputQuery).trim();
    if (!text || isTyping) return;

    const userMessage: AIAssistantMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputQuery('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });

      if (!res.ok) {
        throw new Error(`API returned ${res.status}`);
      }

      const data: AIAssistantMessage = await res.json();
      setMessages((prev) => [...prev, data]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: `⚠️ **Unable to process query.** Connection error: ${err.message || 'Server unavailable'}.`,
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome-msg',
        role: 'assistant',
        content: `Conversation reset. Ask any question about your **${obligations.length} financial obligations**, cash flow timeline, or scenario projections.`,
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  return (
    <div className="space-y-4 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800/60 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center space-x-2">
            <BotMessageSquare className="w-5 h-5 text-indigo-400" />
            <span>Financial Intelligence AI Assistant</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Strictly bounded to OBLIGO financial obligation models, cash-flow consequence chains, and deterministic liquidity math.
          </p>
        </div>

        {/* Controls & Guardrail Notice */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleClearChat}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Chat</span>
          </button>
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs">
            <ShieldCheck className="w-4 h-4" />
            <span className="font-semibold">OBLIGO Exclusive Mode</span>
          </div>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="fintech-card rounded-2xl overflow-hidden border-slate-800 flex flex-col h-[600px] shadow-2xl">
        {/* Messages Container */}
        <div className="flex-1 p-6 overflow-y-auto space-y-5">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start space-x-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shrink-0 shadow-md shadow-indigo-600/20 mt-1">
                  <BotMessageSquare className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-2xl p-4 rounded-2xl text-xs space-y-3 leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-600/20'
                    : 'bg-slate-900/90 text-slate-200 border border-slate-800 rounded-tl-none shadow-lg'
                }`}
              >
                {/* Content formatted */}
                <div className="space-y-2 whitespace-pre-line font-sans">
                  {msg.content}
                </div>

                {/* Structured Insights Drawer if present */}
                {msg.insights && (
                  <div className="pt-3 mt-2 border-t border-slate-800/80 space-y-2.5">
                    {msg.insights.cascadeChain && (
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-1">
                          Traced Causal Cascade:
                        </span>
                        <div className="flex flex-wrap items-center gap-1 text-[11px] text-slate-300">
                          {msg.insights.cascadeChain.map((step, idx) => (
                            <React.Fragment key={idx}>
                              <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-200 font-mono">
                                {step}
                              </span>
                              {idx < msg.insights!.cascadeChain!.length - 1 && (
                                <ArrowRight className="w-3 h-3 text-slate-500" />
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    )}

                    {msg.insights.tracedObligations && msg.insights.tracedObligations.length > 0 && (
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block mb-1">
                          Referenced Obligations:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {msg.insights.tracedObligations.map((ob) => (
                            <button
                              key={ob.id}
                              onClick={() => onSelectObligation(ob.id)}
                              className="text-left p-2 rounded bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 flex items-center justify-between text-[11px] transition-colors"
                            >
                              <span className="truncate font-semibold text-slate-200">{ob.counterparty}</span>
                              <span className="font-mono text-emerald-400 font-bold">{formatINR(ob.amount, true)}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0 mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center space-x-2 text-slate-400 text-xs pl-11">
              <div className="flex space-x-1">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span>Analyzing live financial dependency graph...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Queries Pill Bar */}
        <div className="p-3 bg-slate-900/60 border-t border-slate-800/80 overflow-x-auto no-scrollbar flex items-center space-x-2">
          <span className="text-[10px] uppercase font-bold text-slate-500 whitespace-nowrap pl-1">
            Suggested:
          </span>
          {suggestedPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(prompt)}
              className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 text-[11px] whitespace-nowrap transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Query Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-4 bg-slate-900 border-t border-slate-800 flex items-center space-x-3"
        >
          <input
            type="text"
            placeholder="Ask an obligation or liquidity question (e.g., 'What happens if Customer A pays 10 days late?')..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || isTyping}
            className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white shadow-md shadow-indigo-600/20 transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Strict Mandate Guardrail Notice */}
      <div className="flex items-center space-x-2 text-[11px] text-slate-400 px-2">
        <AlertCircle className="w-3.5 h-3.5 shrink-0 text-indigo-400" />
        <span>
          OBLIGO AI is hardcoded exclusively for financial obligation intelligence, cash-flow consequence analysis, and scenario stress testing. It strictly refuses code generation and non-financial queries.
        </span>
      </div>
    </div>
  );
};
