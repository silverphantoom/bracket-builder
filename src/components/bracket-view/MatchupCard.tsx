"use client";

import type { Matchup, BracketOption } from "@/types/bracket";
import { VoteButton } from "./VoteButton";
import { VoteProgressBar } from "./VoteProgressBar";
import { WinnerBadge } from "./WinnerBadge";
import { cn } from "@/lib/utils";

interface MatchupCardProps {
  matchup: Matchup;
  optionA?: BracketOption;
  optionB?: BracketOption;
  votedOptionId: string | null;
  isCreator: boolean;
  onVote: (matchupId: string, optionId: string) => Promise<void>;
  onForceClose?: (matchupId: string) => void;
  compact?: boolean;
}

export function MatchupCard({
  matchup,
  optionA,
  optionB,
  votedOptionId,
  isCreator,
  onVote,
  onForceClose,
  compact = false,
}: MatchupCardProps) {
  const isCompleted = matchup.status === "completed";
  const isPending = matchup.status === "pending";
  const isActive = matchup.status === "active";
  const isBye = optionA?.is_bye || optionB?.is_bye;
  const hasVoted = votedOptionId !== null;
  const showCounts = hasVoted || isCompleted;

  const winnerOption =
    matchup.winner_id === optionA?.id
      ? optionA
      : matchup.winner_id === optionB?.id
        ? optionB
        : null;

  return (
    <div
      className={cn(
        "rounded-xl border bg-bg-surface transition-colors",
        isActive && !isBye
          ? "border-border-active shadow-[0_0_0_1px_rgba(249,115,22,0.2),0_4px_24px_rgba(0,0,0,0.3)]"
          : "border-border-default",
        compact ? "p-3" : "p-4"
      )}
    >
      {/* BYE matchup */}
      {isBye && (
        <div className="text-center">
          <p className="text-xs text-text-muted uppercase tracking-wider mb-1">
            Auto-advance
          </p>
          <p className="text-sm font-semibold text-text-secondary">
            {optionA?.is_bye ? optionB?.name : optionA?.name}
          </p>
        </div>
      )}

      {/* Pending matchup */}
      {isPending && !isBye && (
        <div className="text-center py-2">
          <p className="text-sm text-text-muted">
            {optionA?.name ?? "TBD"}{" "}
            <span className="text-xs font-bold text-vs mx-2">VS</span>{" "}
            {optionB?.name ?? "TBD"}
          </p>
          <p className="mt-1 text-xs text-text-muted">
            Waiting for earlier round
          </p>
        </div>
      )}

      {/* Active or completed matchup */}
      {(isActive || isCompleted) && !isBye && (
        <div className="space-y-2">
          {/* Option A */}
          {isActive && !isCreator ? (
            <VoteButton
              optionName={optionA?.name ?? "TBD"}
              optionId={optionA?.id ?? ""}
              matchupId={matchup.id}
              hasVoted={hasVoted}
              votedForThis={votedOptionId === optionA?.id}
              disabled={!optionA}
              onVote={onVote}
            />
          ) : (
            <div
              className={cn(
                "rounded-lg px-3 py-2.5 text-sm font-semibold text-center",
                matchup.winner_id === optionA?.id
                  ? "bg-success/15 border border-success/30 text-success"
                  : "bg-bg-raised border border-border-default text-text-secondary"
              )}
            >
              {optionA?.name ?? "TBD"}
            </div>
          )}

          {/* VS badge */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-border-default" />
            <span className="text-xs font-bold text-vs">VS</span>
            <div className="flex-1 h-px bg-border-default" />
          </div>

          {/* Option B */}
          {isActive && !isCreator ? (
            <VoteButton
              optionName={optionB?.name ?? "TBD"}
              optionId={optionB?.id ?? ""}
              matchupId={matchup.id}
              hasVoted={hasVoted}
              votedForThis={votedOptionId === optionB?.id}
              disabled={!optionB}
              onVote={onVote}
            />
          ) : (
            <div
              className={cn(
                "rounded-lg px-3 py-2.5 text-sm font-semibold text-center",
                matchup.winner_id === optionB?.id
                  ? "bg-success/15 border border-success/30 text-success"
                  : "bg-bg-raised border border-border-default text-text-secondary"
              )}
            >
              {optionB?.name ?? "TBD"}
            </div>
          )}

          {/* Progress bar */}
          <VoteProgressBar
            votesA={matchup.votes_a}
            votesB={matchup.votes_b}
            show={showCounts}
          />

          {/* Winner badge */}
          {isCompleted && winnerOption && (
            <div className="flex justify-center pt-1">
              <WinnerBadge name={winnerOption.name} />
            </div>
          )}

          {/* Creator: force close */}
          {isCreator && isActive && onForceClose && (
            <button
              onClick={() => onForceClose(matchup.id)}
              className="w-full text-xs text-text-muted hover:text-accent-primary cursor-pointer transition-colors pt-1"
            >
              Close matchup early
            </button>
          )}

          {/* Creator notice */}
          {isCreator && isActive && (
            <p className="text-xs text-text-muted text-center">
              You created this bracket — you can&apos;t vote.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
