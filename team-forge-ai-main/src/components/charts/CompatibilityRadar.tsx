import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { CompatibilityBreakdown } from "@/types";

export function CompatibilityRadar({ breakdown }: { breakdown: CompatibilityBreakdown }) {
  const data = [
    { metric: "Skill coverage", value: breakdown.skillCoverage },
    { metric: "Role balance", value: breakdown.roleBalance },
    { metric: "Experience mix", value: breakdown.experienceMix },
    { metric: "Project alignment", value: breakdown.projectAlignment },
    { metric: "Collaboration", value: breakdown.collaborationPotential },
  ];
  return (
    <ResponsiveContainer width="100%" height={280}>
      <RadarChart data={data} outerRadius="72%">
        <PolarGrid stroke="var(--border)" />
        <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
        <Radar
          dataKey="value"
          stroke="var(--chart-1)"
          fill="var(--chart-1)"
          fillOpacity={0.35}
        />
        <Tooltip
          contentStyle={{
            background: "var(--popover)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            color: "var(--popover-foreground)",
          }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}