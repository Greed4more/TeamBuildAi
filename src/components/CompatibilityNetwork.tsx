import { Card } from "@/components/ui/card";
import type { PairCompatibility, TeamMember } from "@/types";

const colorFor = (score: number) =>
  score >= 80 ? "var(--status-done)" : score >= 65 ? "var(--status-progress)" : "var(--status-todo)";

/** Radial node graph of how well each pair of members works together. */
export function CompatibilityNetwork({
  members,
  pairs,
}: {
  members: TeamMember[];
  pairs: PairCompatibility[];
}) {
  const size = 360;
  const r = 128;
  const cx = size / 2;
  const cy = size / 2;
  const points = members.map((m, i) => {
    const angle = (i / Math.max(1, members.length)) * Math.PI * 2 - Math.PI / 2;
    return { name: m.name, role: m.role, x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  });
  const byName = new Map(points.map((p) => [p.name, p]));

  return (
    <Card className="glass gap-4 p-6">
      <div>
        <h2 className="font-semibold">Team compatibility network</h2>
        <p className="text-sm text-muted-foreground">
          Thicker, greener links mean smoother collaboration between two members.
        </p>
      </div>
      <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-start">
        <svg viewBox={`0 0 ${size} ${size}`} className="h-[360px] w-[360px] shrink-0">
          {pairs.map((p) => {
            const a = byName.get(p.a);
            const b = byName.get(p.b);
            if (!a || !b) return null;
            return (
              <line
                key={`${p.a}-${p.b}`}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke={colorFor(p.score)}
                strokeOpacity={0.28 + (p.score / 100) * 0.5}
                strokeWidth={1 + (p.score / 100) * 4}
              />
            );
          })}
          {points.map((p) => (
            <g key={p.name}>
              <circle cx={p.x} cy={p.y} r={26} fill="var(--primary)" fillOpacity={0.16} />
              <circle cx={p.x} cy={p.y} r={26} fill="none" stroke="var(--primary)" strokeOpacity={0.5} />
              <text
                x={p.x}
                y={p.y + 4}
                textAnchor="middle"
                fontSize="11"
                fill="var(--foreground)"
                fontWeight="600"
              >
                {p.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
              </text>
            </g>
          ))}
        </svg>
        <ul className="w-full space-y-2">
          {pairs.map((p) => (
            <li
              key={`${p.a}-${p.b}`}
              className="rounded-xl border border-border bg-secondary/40 p-3 text-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-medium">
                  {p.a} + {p.b}
                </span>
                <span style={{ color: colorFor(p.score) }} className="font-semibold">
                  {p.score}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{p.reason}</p>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}