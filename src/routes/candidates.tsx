import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Github, Linkedin, Plus, Search, Sheet, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/layouts/AppLayout";
import { CandidateCard } from "@/components/CandidateCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppStore } from "@/hooks/useAppStore";
import { extractCandidateSkills } from "@/services/engine";
import {
  CSV_TEMPLATE,
  makeCandidate,
  parseCandidatesCsv,
  parseProfileUrl,
  type NewCandidate,
} from "@/lib/candidateImport";

export const Route = createFileRoute("/candidates")({
  head: () => ({
    meta: [
      { title: "Candidates — TeamForge AI" },
      {
        name: "description",
        content:
          "Browse and manage your talent pool. Paste a resume and TeamForge extracts skills, roles and strengths automatically.",
      },
      { property: "og:title", content: "Candidates — TeamForge AI" },
      {
        property: "og:description",
        content: "Search the talent pool by name, role or skill and add candidates from a resume.",
      },
    ],
  }),
  component: CandidatesPage,
});

const ROLES = [
  "Frontend Engineer",
  "Backend Engineer",
  "Full-Stack Engineer",
  "ML Engineer",
  "Data Engineer",
  "DevOps Engineer",
  "Product Designer",
  "Product Manager",
  "QA Engineer",
];

function CandidatesPage() {
  const { candidates, addCandidate, removeCandidate } = useAppStore();
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("all");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return candidates.filter((c) => {
      const matchesRole = role === "all" || c.role === role;
      const matchesQuery =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.role.toLowerCase().includes(q) ||
        c.skills.some((s) => s.toLowerCase().includes(q));
      return matchesRole && matchesQuery;
    });
  }, [candidates, query, role]);

  const roles = useMemo(() => [...new Set(candidates.map((c) => c.role))].sort(), [candidates]);

  return (
    <AppLayout
      title="Candidates"
      description={`${candidates.length} people in your talent pool.`}
      actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4" /> Add candidate
            </Button>
          </DialogTrigger>
          <AddCandidateDialog
            onAdd={(list) => {
              list.forEach((c) => addCandidate(c));
              setOpen(false);
              toast.success(
                list.length === 1
                  ? `${list[0]!.name} added to the talent pool`
                  : `${list.length} candidates imported`,
              );
            }}
          />
        </Dialog>
      }
    >
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, role or skill"
            className="pl-9"
            aria-label="Search candidates"
          />
        </div>
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger className="sm:w-56" aria-label="Filter by role">
            <SelectValue placeholder="All roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            {roles.map((r) => (
              <SelectItem key={r} value={r}>
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c, i) => (
            <div key={c.id} className="animate-rise" style={{ animationDelay: `${i * 60}ms` }}>
              <CandidateCard
                candidate={c}
                onRemove={() => {
                  removeCandidate(c.id);
                  toast.success(`${c.name} removed`);
                }}
              />
            </div>
          ))}
        </div>
      ) : (
        <Card className="glass items-center gap-2 p-12 text-center">
          <p className="font-medium">No candidates match that search</p>
          <p className="text-sm text-muted-foreground">
            Try a different skill or clear the role filter.
          </p>
        </Card>
      )}
    </AppLayout>
  );
}

function AddCandidateDialog({
  onSubmit,
}: {
  onSubmit: (c: {
    name: string;
    role: string;
    skills: string[];
    experienceYears: number;
    strengths: string[];
    weaknesses: string[];
    bio: string;
    availability: number;
    collaborationScore: number;
    leadershipScore: number;
    pastProjects: string[];
  }) => void;
}) {
  const [name, setName] = useState("");
  const [role, setRole] = useState(ROLES[0]!);
  const [years, setYears] = useState("3");
  const [resume, setResume] = useState("");
  const [skills, setSkills] = useState("");
  const [weakness, setWeakness] = useState("");

  const extract = () => {
    const { skills: found, role: detectedRole } = extractCandidateSkills(resume);
    if (!found.length) {
      toast.error("No known skills found in that text — add them manually.");
      return;
    }
    setSkills(found.join(", "));
    if (detectedRole && ROLES.includes(detectedRole)) setRole(detectedRole);
    toast.success(`Extracted ${found.length} skills`);
  };

  return (
    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>Add candidate</DialogTitle>
        <DialogDescription>
          Paste a resume and let TeamForge extract the skills, or enter them yourself.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="cand-name">Full name</Label>
          <Input id="cand-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ana Costa" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Primary role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="cand-years">Years of experience</Label>
            <Input
              id="cand-years"
              type="number"
              min={0}
              max={40}
              value={years}
              onChange={(e) => setYears(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cand-resume">Resume or bio</Label>
          <Textarea
            id="cand-resume"
            rows={5}
            value={resume}
            onChange={(e) => setResume(e.target.value)}
            placeholder="Paste the resume text here…"
          />
          <Button type="button" variant="secondary" size="sm" onClick={extract}>
            <Wand2 className="h-4 w-4" /> Extract skills
          </Button>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cand-skills">Skills (comma separated)</Label>
          <Input
            id="cand-skills"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            placeholder="React, TypeScript, Node.js"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cand-weak">Development areas (comma separated)</Label>
          <Input
            id="cand-weak"
            value={weakness}
            onChange={(e) => setWeakness(e.target.value)}
            placeholder="Testing discipline, Cloud infrastructure"
          />
        </div>
      </div>

      <DialogFooter>
        <Button
          onClick={() => {
            const skillList = skills
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean);
            if (!name.trim() || !skillList.length) {
              toast.error("A name and at least one skill are required.");
              return;
            }
            onSubmit({
              name: name.trim(),
              role,
              skills: skillList,
              experienceYears: Number(years) || 0,
              strengths: skillList.slice(0, 3),
              weaknesses: weakness
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
              bio: resume.trim() || `${role} with ${years} years of experience.`,
              availability: 80,
              collaborationScore: 80,
              leadershipScore: Math.min(95, 50 + (Number(years) || 0) * 5),
              pastProjects: [],
            });
          }}
        >
          Add candidate
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}