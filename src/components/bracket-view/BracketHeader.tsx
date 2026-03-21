"use client";

import type { Bracket } from "@/types/bracket";
import { Badge } from "@/components/ui/badge";
import { formatVoteCount } from "@/lib/utils";

interface BracketHeaderProps {
  bracket: Bracket;
  totalVotes: number;
  children?: React.ReactNode;
}

export function BracketHeader({
  bracket,
  totalVotes,
  children,
}: BracketHeaderProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
            {bracket.title}
          </h1>
          {bracket.description && (
            <p className="mt-1 text-sm text-text-secondary">
              {bracket.description}
            </p>
          )}
        </div>
        {children}
      </div>
      <div className="flex items-center gap-3">
        <Badge
          variant={bracket.status === "completed" ? "completed" : "live"}
        >
          {bracket.status === "completed" ? "COMPLETED" : "LIVE"}
        </Badge>
        <span className="text-sm text-text-muted">
          {formatVoteCount(totalVotes)}
        </span>
      </div>
    </div>
  );
}
