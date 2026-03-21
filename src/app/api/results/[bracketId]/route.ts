import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import type { PollResponse } from "@/types/bracket";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/results/[bracketId]">
) {
  const { bracketId } = await ctx.params;
  const supabase = createServiceClient();

  const [bracketResult, matchupsResult] = await Promise.all([
    supabase
      .from("brackets")
      .select("status, winner_name")
      .eq("id", bracketId)
      .single(),
    supabase
      .from("matchups")
      .select(
        "id, status, votes_a, votes_b, winner_id, option_a_id, option_b_id"
      )
      .eq("bracket_id", bracketId),
  ]);

  if (bracketResult.error || !bracketResult.data) {
    return NextResponse.json({ error: "Bracket not found" }, { status: 404 });
  }

  const totalVotes = (matchupsResult.data ?? []).reduce(
    (sum, m) => sum + m.votes_a + m.votes_b,
    0
  );

  const result: PollResponse = {
    status: bracketResult.data.status as "active" | "completed",
    winner_name: bracketResult.data.winner_name,
    matchups: (matchupsResult.data ?? []).map((m) => ({
      id: m.id,
      status: m.status,
      votes_a: m.votes_a,
      votes_b: m.votes_b,
      winner_id: m.winner_id,
      option_a_id: m.option_a_id,
      option_b_id: m.option_b_id,
    })),
    totalVotes,
  };

  return NextResponse.json(result, {
    headers: { "Cache-Control": "no-store" },
  });
}
