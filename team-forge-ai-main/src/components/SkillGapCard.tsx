import { AlertTriangle, ShieldAlert, Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { SkillGap } from "@/types";

const styles = {
  high: { badge: "bg-destructive/15 text-destructive border-destructive/30", Icon: ShieldAlert },
  medium: { badge: "bg-warning/15 text-warning border-warning/30", Icon: AlertTriangle },
  low: { badge: "bg-primary/15 text-primary border-primary/30", Icon: Info },
} as const;

export function SkillGapCard({ gap, index = 0 }: { gap: SkillGap; index?: number }) {
  const { badge, Icon } = styles[gap.severity];
  return (
    <Card
      className="glass card-hover animate-rise gap-3 p-5"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold">{gap.skill}</h3>
        </div>
        <span
          className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${badge}`}
        >
          {gap.severity} priority
        </span>
      </div>
      <p className="text-sm text-muted-foreground">{gap.explanation}</p>
      <p className="rounded-xl border border-border bg-secondary/40 p-3 text-sm">
        <span className="font-medium">Recommended: </span>
        {gap.recommendation}
      </p>
    </Card>
  );
}