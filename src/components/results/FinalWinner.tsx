"use client";

import { useEffect, useRef } from "react";
import { Trophy } from "lucide-react";
import Link from "next/link";
import confetti from "canvas-confetti";

interface FinalWinnerProps {
  winnerName: string;
  bracketTitle: string;
  slug: string;
}

export function FinalWinner({ winnerName, bracketTitle, slug }: FinalWinnerProps) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;

    // 3-burst confetti
    const fire = (opts: confetti.Options) =>
      confetti({
        ...opts,
        particleCount: 80,
        spread: 70,
        origin: { y: 0.3 },
        colors: ["#f97316", "#eab308", "#10b981", "#ef4444", "#f8fafc"],
      });

    fire({ angle: 60, origin: { x: 0.1, y: 0.3 } });
    setTimeout(() => fire({ angle: 90, origin: { x: 0.5, y: 0.3 } }), 150);
    setTimeout(() => fire({ angle: 120, origin: { x: 0.9, y: 0.3 } }), 300);
  }, []);

  return (
    <div className="rounded-xl border border-accent-secondary/30 bg-accent-secondary/10 p-6 text-center">
      <Trophy size={40} className="mx-auto text-accent-secondary mb-3" />
      <p className="text-sm uppercase tracking-wider text-accent-secondary font-semibold mb-1">
        Champion
      </p>
      <h2 className="text-3xl font-extrabold text-accent-secondary">
        {winnerName}
      </h2>
      <p className="mt-2 text-sm text-text-secondary">{bracketTitle}</p>

      <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          onClick={() => {
            const text = `🏆 ${bracketTitle} winner: ${winnerName}! Did you agree? Vote → ${window.location.href} #BracketBuilder`;
            if (navigator.share) {
              navigator.share({ text, url: window.location.href });
            } else {
              navigator.clipboard.writeText(text);
            }
          }}
          className="rounded-lg bg-accent-secondary px-4 py-2.5 text-sm font-semibold text-black hover:bg-yellow-400 transition-colors cursor-pointer"
        >
          Share the winner
        </button>
        <Link
          href="/"
          className="text-sm font-semibold text-accent-primary hover:underline"
        >
          Create your own bracket &rarr;
        </Link>
      </div>
    </div>
  );
}
