"use client";

import type { Matchup, BracketOption } from "@/types/bracket";
import { MatchupCard } from "./MatchupCard";
import { getRoundName } from "@/lib/utils";

interface RoundColumnProps {
  round: number;
  totalRounds: number;
  matchups: Matchup[];
  optionsMap: Map<string, BracketOption>;
  votedMatchups: Map<string, string>;
  isCreator: boolean;
  onVote: (matchupId: string, optionId: string) => Promise<void>;
  onForceClose?: (matchupId: string) => void;
}

export function RoundColumn({
  round,
  totalRounds,
  matchups,
  optionsMap,
  votedMatchups,
  isCreator,
  onVote,
  onForceClose,
}: RoundColumnProps) {
  const roundName = getRoundName(round, totalRounds);

  return (
    <div className="flex flex-col items-center">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
        {roundName}
      </h3>
      <div className="flex flex-col justify-around gap-4 flex-1">
        {matchups.map((matchup) => (
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
            votedOptionId={votedMatchups.get(matchup.id) ?? null}
            isCreator={isCreator}
            onVote={onVote}
            onForceClose={onForceClose}
            compact
          />
        ))}
      </div>
    </div>
  );
}
