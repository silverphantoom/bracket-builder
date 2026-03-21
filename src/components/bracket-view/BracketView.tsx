"use client";

import { useState, useCallback } from "react";
import type { Bracket, BracketOption, Matchup } from "@/types/bracket";
import { BracketHeader } from "./BracketHeader";
import { BracketTree } from "./BracketTree";
import { MatchupCard } from "./MatchupCard";
import { ShareButton } from "@/components/share/ShareButton";
import { FinalWinner } from "@/components/results/FinalWinner";
import { LiveResults } from "@/components/results/LiveResults";
import { useToast } from "@/components/ui/toast";
import { getRoundName } from "@/lib/utils";
import { RotateCcw } from "lucide-react";

interface BracketViewProps {
  bracket: Bracket;
  options: BracketOption[];
  initialMatchups: Matchup[];
  totalVotes: number;
  isCreator: boolean;
  initialVotedMatchups: Record<string, string>;
}

export function BracketView({
  bracket,
  options,
  initialMatchups,
  totalVotes: initialTotalVotes,
  isCreator,
  initialVotedMatchups,
}: BracketViewProps) {
  const { toast } = useToast();
  const [votedMatchups, setVotedMatchups] = useState<Map<string, string>>(
    new Map(Object.entries(initialVotedMatchups))
  );

  const optionsMap = new Map(options.map((o) => [o.id, o]));
  const totalRounds = Math.log2(bracket.bracket_size);

  const handleVote = useCallback(
    async (matchupId: string, optionId: string) => {
      // Optimistic update
      setVotedMatchups((prev) => new Map(prev).set(matchupId, optionId));

      try {
        const res = await fetch("/api/vote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ matchup_id: matchupId, option_id: optionId }),
        });

        if (!res.ok) {
          const data = await res.json();
          if (res.status === 409) {
            toast("Already voted in this matchup!", "info");
          } else {
            // Rollback
            setVotedMatchups((prev) => {
              const next = new Map(prev);
              next.delete(matchupId);
              return next;
            });
            toast(data.error || "Vote failed", "error");
          }
        }
      } catch {
        setVotedMatchups((prev) => {
          const next = new Map(prev);
          next.delete(matchupId);
          return next;
        });
        toast("Network error. Try again.", "error");
      }
    },
    [toast]
  );

  const handleForceClose = useCallback(
    async (matchupId: string) => {
      if (!confirm("Close this matchup early? Current leader wins.")) return;
      try {
        const res = await fetch(`/api/brackets/${bracket.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "force_close", matchup_id: matchupId }),
        });
        if (res.ok) {
          toast("Matchup closed!", "success");
        } else {
          toast("Failed to close matchup", "error");
        }
      } catch {
        toast("Network error", "error");
      }
    },
    [bracket.id, toast]
  );

  const handleReset = useCallback(async () => {
    if (
      !confirm(
        "This will delete all votes and reset all matchups. Are you sure?"
      )
    )
      return;
    try {
      const res = await fetch(`/api/brackets/${bracket.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset" }),
      });
      if (res.ok) {
        toast("Bracket reset!", "success");
        setVotedMatchups(new Map());
        window.location.reload();
      } else {
        toast("Failed to reset", "error");
      }
    } catch {
      toast("Network error", "error");
    }
  }, [bracket.id, toast]);

  return (
    <LiveResults
      bracketId={bracket.id}
      initialMatchups={initialMatchups}
      initialStatus={bracket.status}
      initialTotalVotes={initialTotalVotes}
    >
      {({ matchups, bracketStatus, totalVotes, winnerName }) => (
        <div className="space-y-6">
          <BracketHeader
            bracket={{ ...bracket, status: bracketStatus as Bracket["status"] }}
            totalVotes={totalVotes}
          >
            <ShareButton title={bracket.title} />
          </BracketHeader>

          {/* Creator controls */}
          {isCreator && (
            <div className="flex items-center gap-3 rounded-lg border border-border-default bg-bg-surface px-4 py-2.5 text-sm">
              <span className="text-text-secondary flex-1">
                You created this bracket.
              </span>
              <button
                onClick={handleReset}
                className="flex items-center gap-1 text-xs text-text-muted hover:text-danger cursor-pointer transition-colors"
              >
                <RotateCcw size={12} /> Reset
              </button>
            </div>
          )}

          {/* Winner celebration */}
          {bracketStatus === "completed" && winnerName && (
            <FinalWinner
              winnerName={winnerName}
              bracketTitle={bracket.title}
              slug={bracket.slug}
            />
          )}

          {/* Desktop: bracket tree */}
          <div className="hidden md:block">
            <BracketTree
              matchups={matchups}
              optionsMap={optionsMap}
              votedMatchups={votedMatchups}
              isCreator={isCreator}
              totalRounds={totalRounds}
              onVote={handleVote}
              onForceClose={isCreator ? handleForceClose : undefined}
            />
          </div>

          {/* Mobile: card stack */}
          <div className="md:hidden space-y-6">
            {Array.from({ length: totalRounds }, (_, i) => i + 1).map(
              (round) => {
                const roundMatchups = matchups
                  .filter((m) => m.round === round)
                  .sort((a, b) => a.position - b.position);

                const hasActive = roundMatchups.some(
                  (m) => m.status === "active"
                );
                const allCompleted = roundMatchups.every(
                  (m) => m.status === "completed"
                );

                return (
                  <div key={round}>
                    <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-muted">
                      {getRoundName(round, totalRounds)}
                      {allCompleted && (
                        <span className="ml-2 text-success">✓</span>
                      )}
                    </h3>
                    <div
                      className={`space-y-3 ${
                        !hasActive && allCompleted ? "opacity-60" : ""
                      }`}
                    >
                      {roundMatchups.map((matchup) => (
                        <MatchupCard
                          key={matchup.id}
                          matchup={matchup}
                          optionA={
                            matchup.option_a_id
                              ? optionsMap.get(matchup.option_a_id)
                              : undefined
                          }
                          optionB={
                            matchup.option_b_id
                              ? optionsMap.get(matchup.option_b_id)
                              : undefined
                          }
                          votedOptionId={
                            votedMatchups.get(matchup.id) ?? null
                          }
                          isCreator={isCreator}
                          onVote={handleVote}
                          onForceClose={
                            isCreator ? handleForceClose : undefined
                          }
                        />
                      ))}
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>
      )}
    </LiveResults>
  );
}
