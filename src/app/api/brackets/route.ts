import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { CreateBracketSchema } from "@/types/bracket";
import {
  computeBracketSize,
  generateSeededOptions,
  generateAllMatchups,
  buildRound1Pairs,
} from "@/lib/bracket-logic";
import { generateSlug } from "@/lib/slug";
import { setCreatorToken } from "@/lib/voter";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = CreateBracketSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { title, description, entries, vote_threshold } = parsed.data;
    const bracketSize =
      parsed.data.bracket_size ?? computeBracketSize(entries.length);

    // Generate slug with retry on collision
    const supabase = createServiceClient();
    let slug = "";
    for (let attempt = 0; attempt < 3; attempt++) {
      slug = generateSlug(title);
      const { data: existing } = await supabase
        .from("brackets")
        .select("id")
        .eq("slug", slug)
        .single();
      if (!existing) break;
    }

    // Generate seeded options and matchup structure
    const seededOptions = generateSeededOptions(entries, bracketSize);
    const matchupShells = generateAllMatchups(bracketSize);
    const round1Pairs = buildRound1Pairs(seededOptions);

    // Create creator token
    const creatorToken = crypto.randomUUID();

    // 1. Insert bracket
    const { data: bracket, error: bracketError } = await supabase
      .from("brackets")
      .insert({
        slug,
        title,
        description: description ?? null,
        creator_token: creatorToken,
        option_count: entries.length,
        bracket_size: bracketSize,
        vote_threshold,
        status: "active",
      })
      .select("id")
      .single();

    if (bracketError || !bracket) {
      return NextResponse.json(
        { error: "Failed to create bracket" },
        { status: 500 }
      );
    }

    // 2. Insert options
    const optionRows = seededOptions.map((opt) => ({
      bracket_id: bracket.id,
      name: opt.name,
      seed: opt.seed,
      is_bye: opt.is_bye,
    }));

    const { data: insertedOptions, error: optionsError } = await supabase
      .from("bracket_options")
      .insert(optionRows)
      .select("id, seed, is_bye, name");

    if (optionsError || !insertedOptions) {
      return NextResponse.json(
        { error: "Failed to create options" },
        { status: 500 }
      );
    }

    // Map seed -> option id
    const seedToId = new Map<number, string>();
    const seedToOption = new Map<
      number,
      { id: string; is_bye: boolean; name: string }
    >();
    for (const opt of insertedOptions) {
      seedToId.set(opt.seed, opt.id);
      seedToOption.set(opt.seed, opt);
    }

    // 3. Insert matchups (two passes: first create all, then update next_matchup_id)
    // First pass: insert all matchups without next_matchup_id
    const tempIdToDbId = new Map<string, string>();

    for (const shell of matchupShells) {
      const { data: matchup, error: matchupError } = await supabase
        .from("matchups")
        .insert({
          bracket_id: bracket.id,
          round: shell.round,
          position: shell.position,
          status: "pending",
        })
        .select("id")
        .single();

      if (matchupError || !matchup) {
        return NextResponse.json(
          { error: "Failed to create matchups" },
          { status: 500 }
        );
      }

      tempIdToDbId.set(shell.tempId, matchup.id);
    }

    // Second pass: set next_matchup_id links
    for (const shell of matchupShells) {
      if (shell.nextMatchupTempId) {
        const dbId = tempIdToDbId.get(shell.tempId)!;
        const nextDbId = tempIdToDbId.get(shell.nextMatchupTempId)!;
        await supabase
          .from("matchups")
          .update({
            next_matchup_id: nextDbId,
            next_slot: shell.nextSlot,
          })
          .eq("id", dbId);
      }
    }

    // 4. Seed round 1 matchups with options
    const round1Shells = matchupShells.filter((s) => s.round === 1);
    for (let i = 0; i < round1Pairs.length; i++) {
      const [optA, optB] = round1Pairs[i];
      const shell = round1Shells[i];
      const dbId = tempIdToDbId.get(shell.tempId)!;
      const optionAId = seedToId.get(optA.seed)!;
      const optionBId = seedToId.get(optB.seed)!;

      const isBye = optA.is_bye || optB.is_bye;
      const winnerId = optA.is_bye
        ? optionBId
        : optB.is_bye
          ? optionAId
          : null;

      await supabase
        .from("matchups")
        .update({
          option_a_id: optionAId,
          option_b_id: optionBId,
          status: isBye ? "completed" : "active",
          winner_id: winnerId,
        })
        .eq("id", dbId);

      // If BYE matchup, advance winner to next round
      if (isBye && winnerId && shell.nextMatchupTempId) {
        const nextDbId = tempIdToDbId.get(shell.nextMatchupTempId)!;
        const slot = shell.nextSlot!;
        const updateField =
          slot === "a"
            ? { option_a_id: winnerId }
            : { option_b_id: winnerId };

        await supabase.from("matchups").update(updateField).eq("id", nextDbId);

        // Check if next matchup now has both options filled
        const { data: nextMatchup } = await supabase
          .from("matchups")
          .select("option_a_id, option_b_id")
          .eq("id", nextDbId)
          .single();

        if (nextMatchup?.option_a_id && nextMatchup?.option_b_id) {
          await supabase
            .from("matchups")
            .update({ status: "active" })
            .eq("id", nextDbId);
        }
      }
    }

    // Set creator cookie
    await setCreatorToken(creatorToken);

    return NextResponse.json({ slug, bracketId: bracket.id }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
