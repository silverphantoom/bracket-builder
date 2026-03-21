import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createServiceClient();

  const { data: brackets, error } = await supabase
    .from("brackets")
    .select("id, slug, title, status, created_at")
    .in("status", ["active", "completed"])
    .order("created_at", { ascending: false })
    .limit(6);

  if (error) {
    return NextResponse.json(
      { error: "Failed to fetch brackets" },
      { status: 500 }
    );
  }

  // Get vote counts for each bracket
  const results = await Promise.all(
    (brackets ?? []).map(async (b) => {
      const { data: matchups } = await supabase
        .from("matchups")
        .select("votes_a, votes_b")
        .eq("bracket_id", b.id);

      const totalVotes = (matchups ?? []).reduce(
        (sum, m) => sum + m.votes_a + m.votes_b,
        0
      );

      return { ...b, totalVotes };
    })
  );

  return NextResponse.json(results, {
    headers: { "Cache-Control": "no-store" },
  });
}
