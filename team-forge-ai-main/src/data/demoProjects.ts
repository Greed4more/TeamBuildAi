import type { Project } from "@/types";

const weeksFromNow = (weeks: number) =>
  new Date(Date.UTC(2026, 7, 10) + weeks * 7 * 24 * 60 * 60 * 1000).toISOString();

/** Central demo project set — the workspace loads with real, populated work. */
export const demoProjects: Project[] = [
  {
    id: "p1",
    name: "AI Waste Management Platform",
    description:
      "A computer-vision powered platform that classifies municipal waste, routes collection trucks and reports recycling analytics to city administrators.",
    teamSize: 5,
    requiredSkills: ["React", "Node.js", "Python", "Machine Learning", "UI/UX", "Cloud"],
    durationWeeks: 12,
    createdAt: "2026-05-02T09:00:00.000Z",
    deadline: weeksFromNow(10),
    status: "in-progress",
  },
  {
    id: "p2",
    name: "Campus Health Companion",
    description:
      "A student wellbeing app with appointment booking, symptom triage and anonymised campus health dashboards for university staff.",
    teamSize: 4,
    requiredSkills: ["React", "TypeScript", "Node.js", "PostgreSQL", "UI/UX", "Automated Testing"],
    durationWeeks: 8,
    createdAt: "2026-06-18T09:00:00.000Z",
    deadline: weeksFromNow(6),
    status: "team-formation",
  },
  {
    id: "p3",
    name: "Campus Marketplace",
    description:
      "A peer-to-peer marketplace for students to buy, sell and lend textbooks, equipment and furniture with escrow payments and campus pickup points.",
    teamSize: 4,
    requiredSkills: ["React", "Node.js", "PostgreSQL", "Cloud", "UI/UX", "CI/CD"],
    durationWeeks: 10,
    createdAt: "2026-07-04T09:00:00.000Z",
    deadline: weeksFromNow(9),
    status: "planning",
  },
];