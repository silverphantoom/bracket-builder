import { z } from "zod/v4";

// ─── Database Row Types ────────────────────────────────────────

export interface Bracket {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  creator_token: string;
  option_count: number;
  bracket_size: 4 | 8 | 16 | 32;
  vote_threshold: number;
  status: "draft" | "active" | "completed";
  winner_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface BracketOption {
  id: string;
  bracket_id: string;
  name: string;
  seed: number;
  image_url: string | null;
  is_bye: boolean;
  created_at: string;
}

export interface Matchup {
  id: string;
  bracket_id: string;
  round: number;
  position: number;
  option_a_id: string | null;
  option_b_id: string | null;
  votes_a: number;
  votes_b: number;
  winner_id: string | null;
  next_matchup_id: string | null;
  next_slot: "a" | "b" | null;
  status: "pending" | "active" | "completed";
  created_at: string;
  updated_at: string;
}

export interface Vote {
  id: string;
  matchup_id: string;
  option_id: string;
  voter_id: string;
  voter_ip: string | null;
  created_at: string;
}

// ─── Derived Types ─────────────────────────────────────────────

export interface MatchupWithOptions extends Matchup {
  option_a?: BracketOption;
  option_b?: BracketOption;
  winner?: BracketOption;
}

export interface FullBracketState {
  bracket: Bracket;
  options: BracketOption[];
  matchups: Matchup[];
  totalVotes: number;
}

// ─── Bracket Logic Types ───────────────────────────────────────

export interface SeededOption {
  name: string;
  seed: number;
  is_bye: boolean;
}

export interface MatchupShell {
  tempId: string;
  round: number;
  position: number;
  nextMatchupTempId: string | null;
  nextSlot: "a" | "b" | null;
}

// ─── API Request/Response Types ────────────────────────────────

export interface PollResponse {
  status: "active" | "completed";
  winner_name: string | null;
  matchups: {
    id: string;
    status: "pending" | "active" | "completed";
    votes_a: number;
    votes_b: number;
    winner_id: string | null;
    option_a_id: string | null;
    option_b_id: string | null;
  }[];
  totalVotes: number;
}

export interface VoteResponse {
  matchup: Matchup;
  bracket_completed: boolean;
  winner_name?: string;
}

// ─── Zod Schemas ───────────────────────────────────────────────

export const CreateBracketSchema = z.object({
  title: z.string().min(1).max(80),
  description: z.string().max(200).optional(),
  entries: z.array(z.string().min(1).max(80)).min(3).max(32),
  vote_threshold: z.number().int().min(5).max(50).default(10),
  bracket_size: z
    .union([z.literal(4), z.literal(8), z.literal(16), z.literal(32)])
    .optional(),
});

export type CreateBracketInput = z.infer<typeof CreateBracketSchema>;

export const CastVoteSchema = z.object({
  matchup_id: z.string().uuid(),
  option_id: z.string().uuid(),
});

export type CastVoteInput = z.infer<typeof CastVoteSchema>;
