import { Trophy } from "lucide-react";

interface WinnerBadgeProps {
  name: string;
}

export function WinnerBadge({ name }: WinnerBadgeProps) {
  return (
    <div className="flex items-center gap-1.5 rounded-full bg-success/15 border border-success/30 px-2.5 py-1 text-xs font-semibold text-success">
      <Trophy size={12} />
      <span>{name}</span>
    </div>
  );
}
