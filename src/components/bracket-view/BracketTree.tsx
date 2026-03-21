"use client";

import type { Matchup, BracketOption } from "@/types/bracket";
import { RoundColumn } from "./RoundColumn";

interface BracketTreeProps {
  matchups: Matchup[];
  optionsMap: Map<string, BracketOption>;
  votedMatchups: Map<string, string>;
  isCreator: boolean;
  totalRounds: number;
  onVote: (matchupId: string, optionId: string) => Promise<void>;
  onForceClose?: (matchupId: string) => void;
}

export function BracketTree({
  matchups,
  optionsMap,
  votedMatchups,
  isCreator,
  totalRounds,
  onVote,
  onForceClose,
}: BracketTreeProps) {
  // Group matchups by round
  const roundGroups = new Map<number, Matchup[]>();
  for (const matchup of matchups) {
    const existing = roundGroups.get(matchup.round) ?? [];
    existing.push(matchup);
    roundGroups.set(matchup.round, existing);
  }

  // Sort rounds
  const rounds = Array.from(roundGroups.entries())
    .sort(([a], [b]) => a - b)
    .map(([round, roundMatchups]) => ({
      round,
      matchups: roundMatchups.sort((a, b) => a.position - b.position),
    }));

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-6 min-w-max items-stretch">
        {rounds.map(({ round, matchups: roundMatchups }) => (
          <div key={round} className="w-52 shrink-0">
            <RoundColumn
              round={round}
              totalRounds={totalRounds}
              matchups={roundMatchups}
              optionsMap={optionsMap}
              votedMatchups={votedMatchups}
              isCreator={isCreator}
              onVote={onVote}
              onForceClose={onForceClose}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
