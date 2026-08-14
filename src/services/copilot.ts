import type { Candidate, FullTeamResult, Project } from "@/types";

export interface CopilotContext {
  project?: Project;
  result?: FullTeamResult;
  candidates: Candidate[];
}

export const COPILOT_SUGGESTIONS = [
  "Why was this team chosen?",
  "What is our biggest risk?",
  "Who should learn what?",
  "Can we deliver on time?",
  "Who is the strongest pairing?",
];

/** Deterministic, grounded answers about the current workspace. */
export function answerCopilot(question: string, ctx: CopilotContext): string {
  const q = question.toLowerCase();
  const { project, result, candidates } = ctx;

  if (!project || !result) {
    return `I can answer questions once a project has a forged team. You currently have ${candidates.length} candidates in the pool — open a project and run the team builder, then ask me about fit, risks, learning paths or the timeline.`;
  }

  const match = (...keys: string[]) => keys.some((k) => q.includes(k));

  if (match("why", "chosen", "selected", "picked")) {
    return `${result.explanation}\n\n${result.members
      .map((m) => `• ${m.name} (${m.role}, ${m.matchScore}/100): ${m.reason}`)
      .join("\n")}`;
  }

  if (match("risk", "worry", "danger", "blocker")) {
    const open = result.projectRisks.filter((r) => !r.resolved);
    if (!open.length) return "Every identified risk on this project is currently marked resolved.";
    return `There ${open.length === 1 ? "is" : "are"} ${open.length} open risk${open.length === 1 ? "" : "s"} on ${project.name}:\n\n${open
      .map((r) => `• ${r.title} (${r.severity}, ~${r.probability}% likely) — ${r.impact} Mitigation: ${r.mitigation}`)
      .join("\n")}`;
  }

  if (match("learn", "upskill", "training", "gap", "missing")) {
    if (!result.gapDetails.length) return "No meaningful skill gaps were detected for this team.";
    return result.gapDetails
      .map(
        (g) =>
          `• ${g.assignee} should learn ${g.skill} (${g.severity} priority). Coverage is ${g.currentCoverage}% vs a target of ${g.requiredCoverage}%. Plan: ${g.weeks.map((w) => `week ${w.week} — ${w.focus} (${w.hours}h)`).join("; ")}.`,
      )
      .join("\n");
  }

  if (match("time", "deadline", "on time", "deliver", "schedule")) {
    const availability = Math.round(
      result.members.reduce((s, m) => {
        const c = candidates.find((x) => x.id === m.candidateId);
        return s + (c?.availability ?? 0);
      }, 0) / Math.max(1, result.members.length),
    );
    const confident = result.teamScore >= 75 && availability >= 70;
    return `${project.name} runs for ${project.durationWeeks} weeks with a team compatibility of ${result.teamScore}/100 and ${availability}% average availability. ${
      confident
        ? "That is enough slack to hit the deadline if scope stays fixed — protect the testing phase."
        : "That is tight. I would cut one non-critical feature, or extend by two weeks, to keep the testing phase intact."
    }`;
  }

  if (match("pair", "work together", "collaborat", "compatib")) {
    const top = result.pairs[0];
    const weakest = result.pairs[result.pairs.length - 1];
    if (!top) return "Not enough members to assess pairings.";
    return `Strongest pairing: ${top.a} + ${top.b} at ${top.score}/100 — ${top.reason}${
      weakest && weakest !== top
        ? `\n\nWeakest pairing: ${weakest.a} + ${weakest.b} at ${weakest.score}/100 — ${weakest.reason}`
        : ""
    }`;
  }

  if (match("alternative", "other team", "variant", "different team")) {
    return result.variants
      .map((v) => `• ${v.label} (${v.score}/100): ${v.memberNames.join(", ")}. ${v.tradeoff}`)
      .join("\n");
  }

  if (match("task", "next", "todo", "board")) {
    const active = result.tasks.filter((t) => t.status !== "done").slice(0, 5);
    return `Next up on ${project.name}:\n${active.map((t) => `• ${t.title} — ${t.assignee} (${t.priority} priority, phase ${t.phase})`).join("\n")}`;
  }

  if (match("who", "team", "member")) {
    return `The team for ${project.name} is:\n${result.members
      .map((m) => `• ${m.name} — ${m.role} (${m.matchScore}/100 fit)`)
      .join("\n")}`;
  }

  return `Here is where ${project.name} stands: compatibility ${result.teamScore}/100, ${result.members.length} members, ${result.projectRisks.filter((r) => !r.resolved).length} open risks and ${result.gapDetails.length} skill gaps. Ask me why the team was chosen, what the biggest risk is, who should learn what, or whether you can deliver on time.`;
}