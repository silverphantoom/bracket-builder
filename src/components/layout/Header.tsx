import Link from "next/link";
import { Trophy } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border-default bg-bg-primary/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Trophy size={20} className="text-accent-primary" />
          <span className="text-lg font-bold tracking-tight">
            Bracket Builder
          </span>
        </Link>
        <Link
          href="/"
          className="rounded-lg bg-accent-primary px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
        >
          Create Bracket
        </Link>
      </div>
    </header>
  );
}
