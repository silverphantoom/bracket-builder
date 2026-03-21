"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface VoteButtonProps {
  optionName: string;
  optionId: string;
  matchupId: string;
  hasVoted: boolean;
  votedForThis: boolean;
  disabled: boolean;
  onVote: (matchupId: string, optionId: string) => Promise<void>;
}

export function VoteButton({
  optionName,
  optionId,
  matchupId,
  hasVoted,
  votedForThis,
  disabled,
  onVote,
}: VoteButtonProps) {
  const [loading, setLoading] = useState(false);
  const [animating, setAnimating] = useState(false);

  async function handleClick() {
    if (hasVoted || disabled || loading) return;
    setLoading(true);
    try {
      await onVote(matchupId, optionId);
      setAnimating(true);
      setTimeout(() => setAnimating(false), 300);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={hasVoted || disabled || loading}
      className={cn(
        "relative w-full min-h-[44px] rounded-lg px-3 py-2.5 text-sm font-semibold transition-all duration-150 cursor-pointer",
        "disabled:cursor-default",
        animating && "animate-vote-confirm",
        votedForThis
          ? "bg-accent-primary/20 border-2 border-accent-primary text-accent-primary"
          : hasVoted
            ? "bg-bg-raised border border-border-default text-text-muted"
            : "bg-bg-raised border border-border-default text-text-primary hover:border-border-active hover:bg-bg-surface active:scale-[0.98]"
      )}
    >
      <span className="flex items-center justify-center gap-2">
        {votedForThis && <Check size={14} />}
        {optionName}
      </span>
    </button>
  );
}
