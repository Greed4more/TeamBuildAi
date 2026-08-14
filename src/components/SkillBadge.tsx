import { cn } from "@/lib/utils";

export function SkillBadge({
  skill,
  active = false,
  className,
}: {
  skill: string;
  active?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
        active
          ? "border-primary/40 bg-primary/15 text-primary"
          : "border-border bg-secondary/50 text-muted-foreground",
        className,
      )}
    >
      {skill}
    </span>
  );
}