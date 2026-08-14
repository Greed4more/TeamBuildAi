import type { FullTeamResult, Project } from "@/types";

/** Markdown export of the generated roadmap, team and gap report. */
export function resultToMarkdown(project: Project, result: FullTeamResult): string {
  const lines: string[] = [];
  lines.push(`# ${project.name} — TeamForge AI report`);
  lines.push("");
  lines.push(`_${project.description}_`);
  lines.push("");
  lines.push(
    `- Team score: **${result.teamScore}/100**`,
    `- Duration: ${project.durationWeeks} weeks`,
    `- Generated: ${new Date(result.createdAt).toLocaleString()}`,
    `- Source: ${result.source === "live-ai" ? "Live AI" : "Demo intelligence"}`,
  );

  lines.push("", "## Team", "");
  lines.push("| Member | Role | Match | Why selected |", "| --- | --- | --- | --- |");
  result.members.forEach((m) => {
    lines.push(`| ${m.name} | ${m.role} | ${m.matchScore}% | ${m.reason.replace(/\|/g, "/")} |`);
  });

  lines.push("", "## Skill gaps", "");
  result.skillGaps.forEach((g) => {
    lines.push(`### ${g.skill} — ${g.severity} severity`);
    lines.push(`- Why it matters: ${g.explanation}`);
    lines.push(`- Recommended action: ${g.recommendation}`, "");
  });

  lines.push("## Learning paths", "");
  result.learningPaths.forEach((p) => {
    lines.push(`### ${p.skill} — ${p.assignedTo} (${p.totalHours}h)`);
    p.steps.forEach((s) => lines.push(`- **${s.title}** (${s.hours}h): ${s.description}`));
    lines.push("");
  });

  lines.push("## Roadmap", "");
  result.roadmap.forEach((phase) => {
    lines.push(`### Phase ${phase.phase} — ${phase.title}`);
    lines.push(`${phase.summary}`, "");
    phase.tasks.forEach((t) => {
      lines.push(
        `- [${t.status === "done" ? "x" : " "}] ${t.title} — ${t.assignee} (${t.role}), ${t.duration}`,
      );
    });
    lines.push("");
  });

  lines.push("## Risks", "");
  result.projectRisks.forEach((r) => {
    lines.push(
      `- **${r.title}** (${r.severity}, ${r.probability}% likely) — ${r.description} Mitigation: ${r.mitigation} Owner: ${r.owner}.`,
    );
  });

  lines.push("", "---", "Generated with TeamForge AI.");
  return lines.join("\n");
}

/** Plain-text variant without markdown syntax noise. */
export function markdownToPlainText(md: string): string {
  return md
    .replace(/^#+\s*/gm, "")
    .replace(/\*\*/g, "")
    .replace(/^_|_$/gm, "")
    .replace(/\|/g, " ");
}

export function downloadTextFile(filename: string, content: string, type = "text/markdown") {
  const blob = new Blob([content], { type: `${type};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Opens the browser print dialog with a printable report (save as PDF). */
export function printReport(title: string, markdown: string) {
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title>
  <style>body{font:14px/1.6 ui-sans-serif,system-ui,sans-serif;margin:40px;color:#111}
  h1{font-size:24px}h2{font-size:18px;margin-top:28px}h3{font-size:15px;margin-top:18px}
  table{border-collapse:collapse;width:100%}td,th{border:1px solid #ddd;padding:6px;text-align:left}
  pre{white-space:pre-wrap;font:inherit}</style></head>
  <body><pre>${markdown.replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" })[c]!)}</pre>
  <script>window.onload=()=>window.print()<\/script></body></html>`;
  const w = window.open("", "_blank", "width=900,height=1000");
  if (!w) return false;
  w.document.write(html);
  w.document.close();
  return true;
}