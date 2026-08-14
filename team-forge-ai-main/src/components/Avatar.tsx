import { cn } from "@/lib/utils";

const palette = [
  "from-cyan-400/30 to-blue-500/30",
  "from-emerald-400/30 to-teal-500/30",
  "from-amber-400/30 to-orange-500/30",
  "from-sky-400/30 to-indigo-500/30",
  "from-rose-400/30 to-pink-500/30",
];

export function InitialsAvatar({
  name,
  size = "md",
  className,
}: {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const hue = palette[name.length % palette.length];
  const sizes = {
    sm: "h-9 w-9 text-xs",
    md: "h-12 w-12 text-sm",
    lg: "h-16 w-16 text-lg",
  } as const;

  return (
    <div
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center rounded-2xl border border-border bg-gradient-to-br font-semibold text-foreground",
        hue,
        sizes[size],
        className,
      )}
    >
      {initials}
    </div>
  );
}