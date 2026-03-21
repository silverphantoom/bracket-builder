"use client";

import { cn } from "@/lib/utils";

interface VoteProgressBarProps {
  votesA: number;
  votesB: number;
  show: boolean;
}

export function VoteProgressBar({ votesA, votesB, show }: VoteProgressBarProps) {
  const total = votesA + votesB;
  const pctA = total > 0 ? Math.round((votesA / total) * 100) : 50;
  const pctB = 100 - pctA;

  if (!show) return null;

  return (
    <div className="mt-2 space-y-1">
      <div className="flex h-2 w-full overflow-hidden rounded-full bg-bg-raised">
        <div
          className={cn(
            "rounded-l-full transition-all duration-500 ease-out",
            votesA >= votesB ? "bg-accent-primary" : "bg-accent-primary/40"
          )}
          style={{ width: `${pctA}%` }}
        />
        <div
          className={cn(
            "rounded-r-full transition-all duration-500 ease-out",
            votesB > votesA ? "bg-accent-primary" : "bg-accent-primary/40"
          )}
          style={{ width: `${pctB}%` }}
        />
      </div>
      <div className="flex justify-between text-xs font-mono text-text-muted">
        <span>{votesA}</span>
        <span>{votesB}</span>
      </div>
    </div>
  );
}
