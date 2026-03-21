import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { getCreatorToken, getVoterId } from "@/lib/voter";
import { BracketView } from "@/components/bracket-view/BracketView";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ToastProvider } from "@/components/ui/toast";
import type { Metadata } from "next";
import type { Bracket, BracketOption, Matchup } from "@/types/bracket";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = createServiceClient();

  const { data: bracket } = await supabase
    .from("brackets")
    .select("title, status, winner_name")
    .eq("slug", slug)
    .single();

  if (!bracket) return { title: "Bracket Not Found" };

  const desc =
    bracket.status === "completed"
      ? `🏆 Winner: ${bracket.winner_name}`
      : "Vote now!";

  return {
    title: `${bracket.title} — Bracket Builder`,
    description: desc,
    openGraph: {
      title: `${bracket.title} — Bracket Builder`,
      description: desc,
    },
    twitter: { card: "summary_large_image" },
  };
}

export default async function BracketPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = createServiceClient();

  // Fetch bracket
  const { data: bracket } = await supabase
    .from("brackets")
    .select("*")
    .eq("slug", slug)
    .single<Bracket>();

  if (!bracket) notFound();

  // Fetch options and matchups
  const [optionsRes, matchupsRes] = await Promise.all([
    supabase
      .from("bracket_options")
      .select("*")
      .eq("bracket_id", bracket.id)
      .order("seed")
      .returns<BracketOption[]>(),
    supabase
      .from("matchups")
      .select("*")
      .eq("bracket_id", bracket.id)
      .order("round")
      .order("position")
      .returns<Matchup[]>(),
  ]);

  const options = optionsRes.data ?? [];
  const matchups = matchupsRes.data ?? [];

  // Calculate total votes
  const totalVotes = matchups.reduce(
    (sum, m) => sum + m.votes_a + m.votes_b,
    0
  );

  // Check if current user is the creator
  const creatorToken = await getCreatorToken();
  const isCreator = creatorToken === bracket.creator_token;

  // Get voter's existing votes for this bracket
  const voterId = await getVoterId();
  let votedMatchups: Record<string, string> = {};

  if (voterId) {
    const matchupIds = matchups.map((m) => m.id);
    if (matchupIds.length > 0) {
      const { data: votes } = await supabase
        .from("votes")
        .select("matchup_id, option_id")
        .eq("voter_id", voterId)
        .in("matchup_id", matchupIds);

      if (votes) {
        votedMatchups = Object.fromEntries(
          votes.map((v) => [v.matchup_id, v.option_id])
        );
      }
    }
  }

  return (
    <ToastProvider>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-6">
          <BracketView
            bracket={bracket}
            options={options}
            initialMatchups={matchups}
            totalVotes={totalVotes}
            isCreator={isCreator}
            initialVotedMatchups={votedMatchups}
          />
        </main>
        <Footer />
      </div>
    </ToastProvider>
  );
}
