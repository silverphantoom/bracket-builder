import type { SeededOption, MatchupShell } from "@/types/bracket";

/**
 * Compute smallest bracket size (power of 2) that fits the entry count.
 * Minimum 4, maximum 32.
 */
export function computeBracketSize(count: number): 4 | 8 | 16 | 32 {
  if (count <= 4) return 4;
  if (count <= 8) return 8;
  if (count <= 16) return 16;
  return 32;
}

/**
 * Pad entries with BYEs and assign seeds.
 * Entries keep their order (manual seeding). BYEs fill the bottom seeds.
 */
export function generateSeededOptions(
  entries: string[],
  bracketSize: number
): SeededOption[] {
  const options: SeededOption[] = entries.map((name, i) => ({
    name,
    seed: i + 1,
    is_bye: false,
  }));

  for (let i = entries.length; i < bracketSize; i++) {
    options.push({
      name: "BYE",
      seed: i + 1,
      is_bye: true,
    });
  }

  return options;
}

/**
 * Build round 1 matchup pairs using standard bracket seeding.
 * Seed 1 vs seed N, seed 2 vs seed N-1, etc.
 * The pairs are ordered so that seeds 1 and 2 can only meet in the final.
 */
export function buildRound1Pairs(
  options: SeededOption[]
): [SeededOption, SeededOption][] {
  const n = options.length;
  const order = getStandardBracketOrder(n);
  const pairs: [SeededOption, SeededOption][] = [];

  for (let i = 0; i < order.length; i += 2) {
    const a = options.find((o) => o.seed === order[i])!;
    const b = options.find((o) => o.seed === order[i + 1])!;
    pairs.push([a, b]);
  }

  return pairs;
}

/**
 * Generate standard bracket seeding order.
 * For 8 entries: [1,8, 4,5, 2,7, 3,6]
 * This ensures top seeds are distributed across the bracket.
 */
function getStandardBracketOrder(size: number): number[] {
  if (size === 2) return [1, 2];

  const halved = getStandardBracketOrder(size / 2);
  const result: number[] = [];

  for (const seed of halved) {
    result.push(seed);
    result.push(size + 1 - seed);
  }

  return result;
}

/**
 * Determine which slot (a or b) a matchup's winner fills in the next round.
 * Even positions fill slot 'a', odd positions fill slot 'b'.
 */
export function computeNextSlot(position: number): "a" | "b" {
  return position % 2 === 0 ? "a" : "b";
}

/**
 * Generate all matchup shells for the entire bracket.
 * Returns a flat array with temp IDs and next_matchup links.
 */
export function generateAllMatchups(bracketSize: number): MatchupShell[] {
  const totalRounds = Math.log2(bracketSize);
  const matchups: MatchupShell[] = [];

  // Create all matchup shells
  for (let round = 1; round <= totalRounds; round++) {
    const matchupsInRound = bracketSize / Math.pow(2, round);
    for (let pos = 0; pos < matchupsInRound; pos++) {
      matchups.push({
        tempId: `r${round}p${pos}`,
        round,
        position: pos,
        nextMatchupTempId: null,
        nextSlot: null,
      });
    }
  }

  // Link each matchup to its next-round matchup
  for (const matchup of matchups) {
    if (matchup.round < totalRounds) {
      const nextPos = Math.floor(matchup.position / 2);
      const nextRound = matchup.round + 1;
      const next = matchups.find(
        (m) => m.round === nextRound && m.position === nextPos
      );
      if (next) {
        matchup.nextMatchupTempId = next.tempId;
        matchup.nextSlot = computeNextSlot(matchup.position);
      }
    }
  }

  return matchups;
}
