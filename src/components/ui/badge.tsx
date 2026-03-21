import { cn } from "@/lib/utils";

type BadgeVariant = "live" | "completed" | "pending";

const variantStyles: Record<BadgeVariant, string> = {
  live: "bg-accent-primary/15 text-accent-primary border-accent-primary/30",
  completed: "bg-accent-secondary/15 text-accent-secondary border-accent-secondary/30",
  pending: "bg-bg-raised text-text-muted border-border-default",
};

export function Badge({
  variant,
  children,
  className,
}: {
  variant: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        variantStyles[variant],
        className
      )}
    >
      {variant === "live" && (
        <span className="h-1.5 w-1.5 rounded-full bg-accent-primary animate-live-pulse" />
      )}
      {children}
    </span>
  );
}
