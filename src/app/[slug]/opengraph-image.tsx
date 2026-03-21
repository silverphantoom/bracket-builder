import { ImageResponse } from "next/og";
import { createServiceClient } from "@/lib/supabase/server";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = createServiceClient();

  const { data: bracket } = await supabase
    .from("brackets")
    .select("id, title, status, winner_name")
    .eq("slug", slug)
    .single();

  if (!bracket) {
    return new ImageResponse(
      (
        <div
          style={{
            background: "#0a0a12",
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#f8fafc",
            fontSize: 40,
          }}
        >
          Bracket Not Found
        </div>
      ),
      { ...size }
    );
  }

  const { data: matchups } = await supabase
    .from("matchups")
    .select("votes_a, votes_b")
    .eq("bracket_id", bracket.id);

  const totalVotes = (matchups ?? []).reduce(
    (sum, m) => sum + m.votes_a + m.votes_b,
    0
  );

  return new ImageResponse(
    (
      <div
        style={{
          background: "#0a0a12",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
        }}
      >
        <div
          style={{
            color: "#f97316",
            fontSize: 24,
            fontWeight: 700,
            marginBottom: 16,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
          }}
        >
          BRACKET BUILDER
        </div>
        <div
          style={{
            color: "#f8fafc",
            fontSize: 64,
            fontWeight: 800,
            lineHeight: 1.1,
            maxWidth: "900px",
          }}
        >
          {bracket.title}
        </div>
        {bracket.status === "completed" ? (
          <div
            style={{
              color: "#eab308",
              fontSize: 36,
              marginTop: 32,
              fontWeight: 700,
            }}
          >
            Winner: {bracket.winner_name}
          </div>
        ) : (
          <div
            style={{
              color: "#94a3b8",
              fontSize: 28,
              marginTop: 32,
            }}
          >
            LIVE — {totalVotes} votes cast
          </div>
        )}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            right: 60,
            color: "#475569",
            fontSize: 20,
          }}
        >
          bracketbuilder.app
        </div>
      </div>
    ),
    { ...size }
  );
}
