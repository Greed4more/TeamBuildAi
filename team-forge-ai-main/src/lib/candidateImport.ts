import { extractCandidateSkills, recommendRoles } from "@/services/engine";
import type { Candidate, RolePreference } from "@/types";

export type NewCandidate = Omit<Candidate, "id">;

const splitList = (v: string) =>
  v
    .split(/[;|,]/)
    .map((s) => s.trim())
    .filter(Boolean);

function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]!;
    if (ch === '"') {
      if (quoted && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else quoted = !quoted;
    } else if (ch === "," && !quoted) {
      out.push(cur);
      cur = "";
    } else cur += ch;
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

export const CSV_TEMPLATE =
  "name,role,skills,experienceYears,weeklyHours,rolePreference,strengths,weaknesses\n" +
  'Ana Costa,Frontend Engineer,"React;TypeScript;Tailwind CSS",4,20,lead,"Design systems;Speed","Testing discipline"\n' +
  'Marco Silva,Backend Engineer,"Node.js;PostgreSQL;Docker",6,15,contributor,"API design","Frontend polish"';

/**
 * Parses a CSV export (headers required) into candidates.
 * Unknown columns are ignored; missing columns fall back to sensible defaults.
 */
export function parseCandidatesCsv(text: string): { candidates: NewCandidate[]; errors: string[] } {
  const errors: string[] = [];
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length < 2) return { candidates: [], errors: ["Add a header row and at least one candidate row."] };

  const headers = splitCsvLine(lines[0]!).map((h) => h.toLowerCase().replace(/[^a-z]/g, ""));
  const idx = (...names: string[]) => headers.findIndex((h) => names.includes(h));
  const iName = idx("name", "fullname");
  if (iName === -1) return { candidates: [], errors: ["CSV needs a 'name' column."] };
  const iRole = idx("role", "primaryrole");
  const iSkills = idx("skills");
  const iYears = idx("experienceyears", "years", "experience");
  const iHours = idx("weeklyhours", "hoursperweek", "hours");
  const iPref = idx("rolepreference", "preference");
  const iStrengths = idx("strengths");
  const iWeak = idx("weaknesses", "developmentareas");
  const iGithub = idx("github", "githuburl");
  const iLinkedin = idx("linkedin", "linkedinurl");

  const candidates: NewCandidate[] = [];
  lines.slice(1).forEach((line, n) => {
    const cells = splitCsvLine(line);
    const name = cells[iName] ?? "";
    if (!name) {
      errors.push(`Row ${n + 2}: missing name — skipped.`);
      return;
    }
    const skills = iSkills >= 0 ? splitList(cells[iSkills] ?? "") : [];
    if (!skills.length) {
      errors.push(`Row ${n + 2}: no skills for ${name} — skipped.`);
      return;
    }
    const years = Number(iYears >= 0 ? cells[iYears] : 3) || 3;
    const weeklyHours = Number(iHours >= 0 ? cells[iHours] : 20) || 20;
    const prefRaw = (iPref >= 0 ? cells[iPref] : "either")?.toLowerCase();
    const rolePreference: RolePreference =
      prefRaw === "lead" || prefRaw === "contributor" ? prefRaw : "either";
    candidates.push(
      makeCandidate({
        name,
        role: (iRole >= 0 ? cells[iRole] : "") || recommendRoles(skills)[0] || "Generalist Engineer",
        skills,
        experienceYears: years,
        weeklyHours,
        rolePreference,
        strengths: iStrengths >= 0 ? splitList(cells[iStrengths] ?? "") : skills.slice(0, 3),
        weaknesses: iWeak >= 0 ? splitList(cells[iWeak] ?? "") : [],
        ...(iGithub >= 0 && cells[iGithub] ? { githubUrl: cells[iGithub]! } : {}),
        ...(iLinkedin >= 0 && cells[iLinkedin] ? { linkedinUrl: cells[iLinkedin]! } : {}),
      }),
    );
  });

  return { candidates, errors };
}

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

const PROFILE_STACKS = [
  ["React", "TypeScript", "Tailwind CSS", "Next.js", "Accessibility"],
  ["Node.js", "PostgreSQL", "REST APIs", "Redis", "GraphQL"],
  ["Python", "Machine Learning", "PyTorch", "Computer Vision", "NLP"],
  ["Docker", "Kubernetes", "CI/CD", "Cloud", "Terraform"],
  ["Figma", "UI/UX", "Prototyping", "Design Systems", "User Research"],
  ["SQL", "Airflow", "Spark", "Data Modeling", "Data Visualization"],
];

export function detectProfileSource(url: string): "github" | "linkedin" | null {
  const u = url.toLowerCase();
  if (u.includes("github.com")) return "github";
  if (u.includes("linkedin.com")) return "linkedin";
  return null;
}

/**
 * Simulated profile import. No network call is made — the handle is used to
 * deterministically derive a realistic starting profile that the user edits.
 */
export function parseProfileUrl(
  url: string,
  extraText = "",
): { candidate: NewCandidate; source: "github" | "linkedin" } | null {
  const source = detectProfileSource(url);
  if (!source) return null;
  const handle = url.replace(/\/+$/, "").split("/").filter(Boolean).pop() ?? "";
  if (!handle) return null;

  const seed = hash(handle);
  const fromText = extractCandidateSkills(extraText).skills;
  const stack = PROFILE_STACKS[seed % PROFILE_STACKS.length]!;
  const skills = [...new Set([...fromText, ...stack])];
  const years = 2 + (seed % 7);
  const name = handle
    .replace(/[-_.]+/g, " ")
    .replace(/\d+/g, "")
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0]!.toUpperCase() + w.slice(1))
    .join(" ");

  return {
    source,
    candidate: makeCandidate({
      name: name || handle,
      role: recommendRoles(skills)[0] ?? "Generalist Engineer",
      skills,
      experienceYears: years,
      weeklyHours: 10 + (seed % 5) * 5,
      rolePreference: seed % 3 === 0 ? "lead" : "contributor",
      strengths: skills.slice(0, 3),
      weaknesses: [],
      bio:
        extraText.trim() ||
        `Imported from ${source === "github" ? "GitHub" : "LinkedIn"} profile @${handle}.`,
      ...(source === "github" ? { githubUrl: url } : { linkedinUrl: url }),
    }),
  };
}

/** Fills in every field the store requires from a partial profile. */
export function makeCandidate(
  input: Partial<NewCandidate> & { name: string; role: string; skills: string[] },
): NewCandidate {
  const years = input.experienceYears ?? 3;
  const weeklyHours = input.weeklyHours ?? 20;
  return {
    name: input.name,
    role: input.role,
    skills: input.skills,
    experienceYears: years,
    strengths: input.strengths?.length ? input.strengths : input.skills.slice(0, 3),
    weaknesses: input.weaknesses ?? [],
    bio: input.bio ?? `${input.role} with ${years} years of experience.`,
    availability: input.availability ?? Math.min(100, Math.round((weeklyHours / 40) * 100)),
    weeklyHours,
    rolePreference: input.rolePreference ?? "either",
    ...(input.githubUrl ? { githubUrl: input.githubUrl } : {}),
    ...(input.linkedinUrl ? { linkedinUrl: input.linkedinUrl } : {}),
    collaborationScore: input.collaborationScore ?? 80,
    leadershipScore:
      input.leadershipScore ??
      Math.min(95, (input.rolePreference === "lead" ? 65 : 45) + years * 5),
    pastProjects: input.pastProjects ?? [],
  };
}