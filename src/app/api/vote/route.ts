import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { CastVoteSchema } from "@/types/bracket";
import { getOrCreateVoterId } from "@/lib/voter";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = CastVoteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { matchup_id, option_id } = parsed.data;

    // Rate limit by IP
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      "unknown";
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again in a minute." },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }

    const voterId = await getOrCreateVoterId();
    const supabase = createServiceClient();

    // Validate matchup exists and is active
    const { data: matchup, error: matchupError } = await supabase
      .from("matchups")
      .select("*")
      .eq("id", matchup_id)
      .single();

    if (matchupError || !matchup) {
      return NextResponse.json(
        { error: "Matchup not found" },
        { status: 404 }
      );
    }

    if (matchup.status !== "active") {
      return NextResponse.json(
        { error: "This matchup is not currently accepting votes." },
        { status: 410 }
      );
    }

    // Validate option belongs to this matchup
    if (option_id !== matchup.option_a_id && option_id !== matchup.option_b_id) {
      return NextResponse.json(
        { error: "Option does not belong to this matchup" },
        { status: 400 }
      );
    }

    // Insert vote (unique constraint catches double votes)
    const { error: voteError } = await supabase.from("votes").insert({
      matchup_id,
      option_id,
      voter_id: voterId,
      voter_ip: ip,
    });

    if (voteError) {
      if (voteError.code === "23505") {
        return NextResponse.json(
          { error: "Already voted in this matchup." },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: "Failed to cast vote" },
        { status: 500 }
      );
    }

    // Increment vote count
    const isOptionA = option_id === matchup.option_a_id;
    const newVotesA = matchup.votes_a + (isOptionA ? 1 : 0);
    const newVotesB = matchup.votes_b + (isOptionA ? 0 : 1);

    await supabase
      .from("matchups")
      .update({
        votes_a: newVotesA,
        votes_b: newVotesB,
      })
      .eq("id", matchup_id);

    // Check if threshold reached
    const totalVotes = newVotesA + newVotesB;

    // Get the bracket's vote_threshold
    const { data: bracket } = await supabase
      .from("brackets")
      .select("vote_threshold, id")
      .eq("id", matchup.bracket_id)
      .single();

    const threshold = bracket?.vote_threshold ?? 10;
    let bracketCompleted = false;
    let winnerName: string | undefined;

    if (totalVotes >= threshold) {
      // Determine winner (tie → option_a by convention)
      const winnerId =
        newVotesA >= newVotesB ? matchup.option_a_id : matchup.option_b_id;

      await supabase
        .from("matchups")
        .update({ status: "completed", winner_id: winnerId })
        .eq("id", matchup_id);

      // Advance winner to next round
      if (matchup.next_matchup_id && winnerId) {
        const field =
          matchup.next_slot === "a"
            ? { option_a_id: winnerId }
            : { option_b_id: winnerId };
        await supabase
          .from("matchups")
          .update(field)
          .eq("id", matchup.next_matchup_id);

        // Check if next matchup now has both options
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
        // Final matchup — bracket complete
        const { data: winnerOpt } = await supabase
          .from("bracket_options")
          .select("name")
          .eq("id", winnerId)
          .single();

        winnerName = winnerOpt?.name ?? "Unknown";
        await supabase
          .from("brackets")
          .update({ status: "completed", winner_name: winnerName })
          .eq("id", matchup.bracket_id);

        bracketCompleted = true;
      }
    }

    // Fetch updated matchup
    const { data: updatedMatchup } = await supabase
      .from("matchups")
      .select("*")
      .eq("id", matchup_id)
      .single();

    return NextResponse.json({
      matchup: updatedMatchup,
      bracket_completed: bracketCompleted,
      winner_name: winnerName,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
