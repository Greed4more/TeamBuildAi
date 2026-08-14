import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

export function DashboardCard({
  label,
  value,
  hint,
  icon: Icon,
  index = 0,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  index?: number;
}) {
  return (
    <Card
      className="glass card-hover animate-rise gap-2 p-5"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <span className="rounded-xl border border-border bg-primary/10 p-2 text-primary">
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="text-3xl font-semibold tracking-tight">{value}</p>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </Card>
  );
}