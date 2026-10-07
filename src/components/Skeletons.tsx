'use client';

import React from 'react';

/**
 * Premium Fintech Shimmer Skeleton Components
 * Designed for light theme with subtle gradients and pulse animations.
 */

export const ShimmerBlock: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-slate-200/80 animate-pulse rounded-xl ${className}`} />
);

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <ShimmerBlock className="h-7 w-64" />
            <ShimmerBlock className="h-5 w-24 rounded-md" />
          </div>
          <ShimmerBlock className="h-4 w-96" />
        </div>
        <div className="flex items-center space-x-3">
          <ShimmerBlock className="h-9 w-36 rounded-xl" />
          <ShimmerBlock className="h-9 w-44 rounded-xl" />
        </div>
      </div>

      {/* Top 5 KPI Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="fintech-card p-5 rounded-2xl space-y-3 bg-white">
            <div className="flex justify-between items-center">
              <ShimmerBlock className="h-4 w-24" />
              <ShimmerBlock className="h-8 w-8 rounded-xl" />
            </div>
            <ShimmerBlock className="h-8 w-28" />
            <ShimmerBlock className="h-3.5 w-36" />
            <ShimmerBlock className="h-3 w-28 pt-2" />
          </div>
        ))}
      </div>

      {/* Early Warnings Banner Skeleton */}
      <div className="space-y-3">
        <ShimmerBlock className="h-5 w-44" />
        <div className="fintech-card p-5 rounded-2xl bg-white space-y-3">
          <div className="flex justify-between items-start">
            <div className="space-y-2 flex-1">
              <div className="flex items-center space-x-2">
                <ShimmerBlock className="h-5 w-20 rounded" />
                <ShimmerBlock className="h-5 w-64" />
              </div>
              <ShimmerBlock className="h-4 w-3/4" />
              <div className="flex space-x-4 pt-1">
                <ShimmerBlock className="h-3.5 w-36" />
                <ShimmerBlock className="h-3.5 w-32" />
                <ShimmerBlock className="h-3.5 w-28" />
              </div>
            </div>
            <div className="flex flex-col space-y-2">
              <ShimmerBlock className="h-8 w-28 rounded-xl" />
              <ShimmerBlock className="h-8 w-28 rounded-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Chart Skeleton */}
      <div className="fintech-card p-6 rounded-2xl space-y-4 bg-white">
        <div className="flex justify-between items-center">
          <div className="space-y-1.5">
            <ShimmerBlock className="h-5 w-72" />
            <ShimmerBlock className="h-3.5 w-96" />
          </div>
          <ShimmerBlock className="h-4 w-28" />
        </div>
        <div className="h-64 w-full flex items-end justify-between gap-2 pt-6 px-4">
          {[40, 65, 30, 80, 50, 90, 45, 70, 85, 60, 95, 55, 75, 40, 65].map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
              <div
                style={{ height: `${h}%` }}
                className="w-full bg-slate-200 animate-pulse rounded-t-md"
              />
              <ShimmerBlock className="h-3 w-6" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const ObligationsSkeleton: React.FC = () => {
  return (
    <div className="space-y-5 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="space-y-2">
          <ShimmerBlock className="h-6 w-48" />
          <ShimmerBlock className="h-4 w-96" />
        </div>
        <ShimmerBlock className="h-9 w-72 rounded-xl" />
      </div>

      {/* Filter Tabs Skeleton */}
      <div className="flex items-center space-x-2">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <ShimmerBlock key={i} className="h-8 w-28 rounded-xl" />
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="fintech-card rounded-2xl overflow-hidden border-slate-200 bg-white">
        <div className="p-4 border-b border-slate-100 flex justify-between">
          <ShimmerBlock className="h-4 w-32" />
          <ShimmerBlock className="h-4 w-24" />
        </div>
        <div className="divide-y divide-slate-100">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <ShimmerBlock className="h-8 w-8 rounded-lg" />
                <div className="space-y-1.5">
                  <ShimmerBlock className="h-4 w-40" />
                  <ShimmerBlock className="h-3 w-60" />
                </div>
              </div>
              <ShimmerBlock className="h-5 w-24" />
              <ShimmerBlock className="h-4 w-20" />
              <ShimmerBlock className="h-5 w-16 rounded-md" />
              <ShimmerBlock className="h-5 w-16 rounded-md" />
              <ShimmerBlock className="h-7 w-16 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const CashFlowSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      <div className="flex justify-between items-center border-b border-slate-200 pb-4">
        <div className="space-y-2">
          <ShimmerBlock className="h-6 w-64" />
          <ShimmerBlock className="h-4 w-80" />
        </div>
        <ShimmerBlock className="h-9 w-60 rounded-2xl" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="fintech-card p-4 rounded-2xl space-y-2 bg-white">
            <ShimmerBlock className="h-3.5 w-24" />
            <ShimmerBlock className="h-7 w-28" />
            <ShimmerBlock className="h-3 w-20" />
          </div>
        ))}
      </div>

      <div className="fintech-card p-6 rounded-2xl space-y-4 bg-white">
        <ShimmerBlock className="h-5 w-80" />
        <div className="h-72 w-full bg-slate-100 rounded-xl animate-pulse" />
      </div>
    </div>
  );
};

export const DependencyGraphSkeleton: React.FC = () => {
  return (
    <div className="space-y-5 animate-fadeIn pb-12">
      <div className="flex justify-between items-center border-b border-slate-200 pb-4">
        <div className="space-y-2">
          <ShimmerBlock className="h-6 w-72" />
          <ShimmerBlock className="h-4 w-96" />
        </div>
        <ShimmerBlock className="h-8 w-56 rounded-xl" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <ShimmerBlock className="h-10 w-full rounded-2xl" />
          <div className="fintech-card rounded-2xl p-6 min-h-[500px] bg-white space-y-8 flex flex-col justify-between">
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3].map((i) => (
                <ShimmerBlock key={i} className="h-20 rounded-2xl" />
              ))}
            </div>
            <div className="flex justify-center">
              <ShimmerBlock className="h-24 w-80 rounded-2xl" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3].map((i) => (
                <ShimmerBlock key={i} className="h-20 rounded-2xl" />
              ))}
            </div>
          </div>
        </div>

        <div className="fintech-card p-5 rounded-2xl space-y-4 bg-white">
          <ShimmerBlock className="h-4 w-32" />
          <ShimmerBlock className="h-6 w-48" />
          <ShimmerBlock className="h-16 w-full rounded-xl" />
          <ShimmerBlock className="h-32 w-full rounded-xl" />
          <ShimmerBlock className="h-10 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
};

export const ScenarioSimulatorSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      <div className="flex justify-between items-center border-b border-slate-200 pb-4">
        <div className="space-y-2">
          <ShimmerBlock className="h-6 w-72" />
          <ShimmerBlock className="h-4 w-96" />
        </div>
        <div className="flex space-x-2">
          <ShimmerBlock className="h-9 w-60 rounded-xl" />
          <ShimmerBlock className="h-9 w-20 rounded-xl" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="fintech-card p-5 rounded-2xl space-y-5 bg-white">
          <ShimmerBlock className="h-5 w-40" />
          <div className="space-y-4 pt-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between">
                  <ShimmerBlock className="h-3.5 w-32" />
                  <ShimmerBlock className="h-3.5 w-16" />
                </div>
                <ShimmerBlock className="h-2 w-full rounded-lg" />
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <ShimmerBlock key={i} className="h-20 rounded-2xl" />
            ))}
          </div>
          <ShimmerBlock className="h-64 w-full rounded-2xl" />
          <ShimmerBlock className="h-40 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
};

export const RiskCenterSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="space-y-2">
          <ShimmerBlock className="h-6 w-80" />
          <ShimmerBlock className="h-4 w-96" />
        </div>
        <ShimmerBlock className="h-9 w-40 rounded-xl" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="fintech-card p-4 rounded-2xl space-y-2 bg-white">
            <ShimmerBlock className="h-3.5 w-24" />
            <ShimmerBlock className="h-7 w-28" />
            <ShimmerBlock className="h-3 w-32" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="fintech-card p-5 rounded-2xl space-y-4 bg-white">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <ShimmerBlock className="h-5 w-48" />
                <ShimmerBlock className="h-3.5 w-32" />
              </div>
              <ShimmerBlock className="h-6 w-20 rounded-full" />
            </div>
            <div className="space-y-2 pt-2">
              <ShimmerBlock className="h-3 w-full" />
              <ShimmerBlock className="h-3 w-5/6" />
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <ShimmerBlock className="h-10 rounded-xl" />
              <ShimmerBlock className="h-10 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const AIAssistantSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="space-y-2">
          <ShimmerBlock className="h-6 w-80" />
          <ShimmerBlock className="h-4 w-96" />
        </div>
        <div className="flex space-x-2">
          <ShimmerBlock className="h-8 w-32 rounded-xl" />
          <ShimmerBlock className="h-8 w-20 rounded-xl" />
        </div>
      </div>

      <div className="fintech-card rounded-2xl bg-white overflow-hidden flex flex-col h-[600px]">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <ShimmerBlock className="h-8 w-8 rounded-xl" />
            <div className="space-y-1">
              <ShimmerBlock className="h-4 w-40" />
              <ShimmerBlock className="h-3 w-24" />
            </div>
          </div>
          <ShimmerBlock className="h-6 w-28 rounded-full" />
        </div>

        <div className="flex-1 p-6 space-y-5">
          <div className="flex space-x-3">
            <ShimmerBlock className="h-8 w-8 rounded-xl shrink-0" />
            <div className="space-y-2 max-w-lg">
              <ShimmerBlock className="h-16 w-80 rounded-2xl" />
              <ShimmerBlock className="h-24 w-96 rounded-2xl" />
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <ShimmerBlock className="h-12 w-64 rounded-2xl" />
            <ShimmerBlock className="h-8 w-8 rounded-xl shrink-0" />
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 flex gap-3">
          <ShimmerBlock className="h-11 flex-1 rounded-xl" />
          <ShimmerBlock className="h-11 w-11 rounded-xl" />
        </div>
      </div>
    </div>
  );
};

