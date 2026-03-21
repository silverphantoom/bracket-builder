"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { Matchup, PollResponse } from "@/types/bracket";

interface LiveResultsProps {
  bracketId: string;
  initialMatchups: Matchup[];
  initialStatus: string;
  initialTotalVotes: number;
  children: (props: {
    matchups: Matchup[];
    bracketStatus: string;
    totalVotes: number;
    winnerName: string | null;
  }) => React.ReactNode;
}

export function LiveResults({
  bracketId,
  initialMatchups,
  initialStatus,
  initialTotalVotes,
  children,
}: LiveResultsProps) {
  const [matchups, setMatchups] = useState<Matchup[]>(initialMatchups);
  const [bracketStatus, setBracketStatus] = useState(initialStatus);
  const [totalVotes, setTotalVotes] = useState(initialTotalVotes);
  const [winnerName, setWinnerName] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const poll = useCallback(async () => {
    try {
      const res = await fetch(`/api/results/${bracketId}`);
      if (!res.ok) return;

      const data: PollResponse = await res.json();

      // Merge matchup data into existing state
      setMatchups((prev) =>
        prev.map((m) => {
          const updated = data.matchups.find((u) => u.id === m.id);
          if (!updated) return m;
          return {
            ...m,
            status: updated.status as Matchup["status"],
            votes_a: updated.votes_a,
            votes_b: updated.votes_b,
            winner_id: updated.winner_id,
            option_a_id: updated.option_a_id,
            option_b_id: updated.option_b_id,
          };
        })
      );

      setBracketStatus(data.status);
      setTotalVotes(data.totalVotes);

      if (data.status === "completed") {
        setWinnerName(data.winner_name);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    } catch {
      // Silently fail polling
    }
  }, [bracketId]);

  useEffect(() => {
    if (bracketStatus === "completed") return;

    const getInterval = () =>
      document.visibilityState === "hidden" ? 10000 : 3000;

    intervalRef.current = setInterval(poll, getInterval());

    const handleVisibilityChange = () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (bracketStatus !== "completed") {
        intervalRef.current = setInterval(poll, getInterval());
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [poll, bracketStatus]);

  return <>{children({ matchups, bracketStatus, totalVotes, winnerName })}</>;
}
