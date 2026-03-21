import Link from "next/link";
import { Trophy } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border-default bg-bg-primary py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 text-center">
        <Link
          href="/"
          className="text-accent-primary font-semibold hover:underline"
        >
          Create your own bracket &rarr;
        </Link>
        <div className="flex items-center gap-1.5 text-xs text-text-muted">
          <Trophy size={12} />
          <span>Bracket Builder</span>
        </div>
      </div>
    </footer>
  );
}
