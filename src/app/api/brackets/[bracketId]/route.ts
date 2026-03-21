import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { getCreatorToken } from "@/lib/voter";
import type { FullBracketState } from "@/types/bracket";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/brackets/[bracketId]">
) {
  const { bracketId } = await ctx.params;
  const supabase = createServiceClient();

  const [bracketResult, optionsResult, matchupsResult, votesResult] =
    await Promise.all([
      supabase.from("brackets").select("*").eq("id", bracketId).single(),
      supabase
        .from("bracket_options")
        .select("*")
        .eq("bracket_id", bracketId)
        .order("seed"),
      supabase
        .from("matchups")
        .select("*")
        .eq("bracket_id", bracketId)
        .order("round")
        .order("position"),
      supabase
        .from("votes")
        .select("id", { count: "exact" })
        .in(
          "matchup_id",
          (
            await supabase
              .from("matchups")
              .select("id")
              .eq("bracket_id", bracketId)
          ).data?.map((m) => m.id) ?? []
        ),
    ]);

  if (bracketResult.error || !bracketResult.data) {
    return NextResponse.json({ error: "Bracket not found" }, { status: 404 });
  }

  const result: FullBracketState = {
    bracket: bracketResult.data,
    options: optionsResult.data ?? [],
    matchups: matchupsResult.data ?? [],
    totalVotes: votesResult.count ?? 0,
  };

  return NextResponse.json(result, {
    headers: { "Cache-Control": "no-store" },
  });
}

export async function PATCH(
  request: Request,
  ctx: RouteContext<"/api/brackets/[bracketId]">
) {
  const { bracketId } = await ctx.params;
  const supabase = createServiceClient();

  // Verify creator token
  const creatorToken = await getCreatorToken();
  const { data: bracket } = await supabase
    .from("brackets")
    .select("creator_token")
    .eq("id", bracketId)
    .single();

  if (!bracket || bracket.creator_token !== creatorToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await request.json();
  const { action } = body;

  // Update title/description
  if (action === "update") {
    const updates: Record<string, string> = {};
    if (body.title) updates.title = body.title;
    if (body.description !== undefined) updates.description = body.description;

    const { data, error } = await supabase
      .from("brackets")
      .update(updates)
      .eq("id", bracketId)
      .select()
      .single();

    if (error)
      return NextResponse.json({ error: "Update failed" }, { status: 500 });
    return NextResponse.json(data);
  }

  // Force-close a matchup
  if (action === "force_close") {
    const { matchup_id } = body;
    const { data: matchup } = await supabase
      .from("matchups")
      .select("*")
      .eq("id", matchup_id)
      .single();

    if (!matchup || matchup.status !== "active") {
      return NextResponse.json(
        { error: "Matchup not active" },
        { status: 400 }
      );
    }

    // Winner is whoever has more votes (tie → option_a)
    const winnerId =
      matchup.votes_a >= matchup.votes_b
        ? matchup.option_a_id
        : matchup.option_b_id;

    await supabase
      .from("matchups")
      .update({ status: "completed", winner_id: winnerId })
      .eq("id", matchup_id);

    // Advance winner
    if (matchup.next_matchup_id && winnerId) {
      const field =
        matchup.next_slot === "a"
          ? { option_a_id: winnerId }
          : { option_b_id: winnerId };
      await supabase
        .from("matchups")
        .update(field)
        .eq("id", matchup.next_matchup_id);

      const { data: next } = await supabase
        .from("matchups")
        .select("option_a_id, option_b_id")
        .eq("id", matchup.next_matchup_id)
        .single();

      if (next?.option_a_id && next?.option_b_id) {
        await supabase
          .from("matchups")
          .update({ status: "active" })
          .eq("id", matchup.next_matchup_id);
      }
    } else if (!matchup.next_matchup_id && winnerId) {
      // This was the final — complete the bracket
      const { data: winnerOpt } = await supabase
        .from("bracket_options")
        .select("name")
        .eq("id", winnerId)
        .single();

      await supabase
        .from("brackets")
        .update({
          status: "completed",
          winner_name: winnerOpt?.name ?? "Unknown",
        })
        .eq("id", bracketId);
    }

    return NextResponse.json({ success: true });
  }

  // Reset bracket
  if (action === "reset") {
    // Delete all votes
    const { data: matchupIds } = await supabase
      .from("matchups")
      .select("id")
      .eq("bracket_id", bracketId);

    if (matchupIds?.length) {
      await supabase
        .from("votes")
        .delete()
        .in(
          "matchup_id",
          matchupIds.map((m) => m.id)
        );
    }

    // Reset all matchups
    await supabase
      .from("matchups")
      .update({
        votes_a: 0,
        votes_b: 0,
        winner_id: null,
        status: "pending",
      })
      .eq("bracket_id", bracketId);

    // Re-seed round 1: set active for non-BYE, completed for BYE
    const { data: round1 } = await supabase
      .from("matchups")
      .select("*, bracket_options!matchups_option_a_id_fkey(is_bye)")
      .eq("bracket_id", bracketId)
      .eq("round", 1);

    if (round1) {
      for (const m of round1) {
        // Check if either option is a BYE
        const { data: optA } = await supabase
          .from("bracket_options")
          .select("is_bye")
          .eq("id", m.option_a_id)
          .single();
        const { data: optB } = await supabase
          .from("bracket_options")
          .select("is_bye")
          .eq("id", m.option_b_id)
          .single();

        const isBye = optA?.is_bye || optB?.is_bye;
        if (isBye) {
          const winnerId = optA?.is_bye ? m.option_b_id : m.option_a_id;
          await supabase
            .from("matchups")
            .update({ status: "completed", winner_id: winnerId })
            .eq("id", m.id);

          // Advance BYE winner
          if (m.next_matchup_id && winnerId) {
            const field =
              m.next_slot === "a"
                ? { option_a_id: winnerId }
                : { option_b_id: winnerId };
            await supabase
              .from("matchups")
              .update(field)
              .eq("id", m.next_matchup_id);
          }
        } else {
          await supabase
            .from("matchups")
            .update({ status: "active" })
            .eq("id", m.id);
        }
      }

      // Check if any round 2 matchups now have both options
      const { data: round2 } = await supabase
        .from("matchups")
        .select("*")
        .eq("bracket_id", bracketId)
        .eq("round", 2);

      if (round2) {
        for (const m of round2) {
          if (m.option_a_id && m.option_b_id) {
            await supabase
              .from("matchups")
              .update({ status: "active" })
              .eq("id", m.id);
          }
        }
      }
    }

    // Reset bracket status
    await supabase
      .from("brackets")
      .update({ status: "active", winner_name: null })
      .eq("id", bracketId);

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
