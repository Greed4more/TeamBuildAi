import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { demoCandidates } from "@/data/demoCandidates";
import { demoProjects } from "@/data/demoProjects";
import type {
  BoardStatus,
  Candidate,
  FullTeamResult,
  Project,
  ProjectStatus,
  TaskStatus,
} from "@/types";

const KEY = "teamforge-state-v2";

interface PersistedState {
  candidates: Candidate[];
  projects: Project[];
  results: Record<string, FullTeamResult>;
  mode: "live" | "demo";
}

const initialState: PersistedState = {
  candidates: demoCandidates,
  projects: demoProjects,
  results: {},
  mode: "demo",
};

interface Store extends PersistedState {
  hydrated: boolean;
  addCandidate: (c: Omit<Candidate, "id">) => Candidate;
  removeCandidate: (id: string) => void;
  addProject: (p: Omit<Project, "id" | "createdAt">) => Project;
  removeProject: (id: string) => void;
  updateProject: (id: string, patch: Partial<Project>) => void;
  setProjectStatus: (id: string, status: ProjectStatus) => void;
  saveResult: (r: FullTeamResult) => void;
  setTaskStatus: (projectId: string, taskId: string, status: TaskStatus) => void;
  setBoardTaskStatus: (projectId: string, taskId: string, status: BoardStatus) => void;
  toggleRiskResolved: (projectId: string, riskId: string) => void;
  setMode: (mode: "live" | "demo") => void;
  resetDemoData: () => void;
}

const StoreContext = createContext<Store | null>(null);

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistedState>(initialState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) setState({ ...initialState, ...(JSON.parse(raw) as PersistedState) });
    } catch {
      /* ignore corrupted storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* storage full or unavailable */
    }
  }, [state, hydrated]);

  const addCandidate = useCallback((c: Omit<Candidate, "id">) => {
    const candidate: Candidate = { ...c, id: `c-${Date.now()}` };
    setState((s) => ({ ...s, candidates: [candidate, ...s.candidates] }));
    return candidate;
  }, []);

  const removeCandidate = useCallback((id: string) => {
    setState((s) => ({ ...s, candidates: s.candidates.filter((c) => c.id !== id) }));
  }, []);

  const addProject = useCallback((p: Omit<Project, "id" | "createdAt">) => {
    const project: Project = { ...p, id: `p-${Date.now()}`, createdAt: new Date().toISOString() };
    setState((s) => ({ ...s, projects: [project, ...s.projects] }));
    return project;
  }, []);

  const removeProject = useCallback((id: string) => {
    setState((s) => {
      const results = { ...s.results };
      delete results[id];
      return { ...s, projects: s.projects.filter((p) => p.id !== id), results };
    });
  }, []);

  const updateProject = useCallback((id: string, patch: Partial<Project>) => {
    setState((s) => ({
      ...s,
      projects: s.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    }));
  }, []);

  const setProjectStatus = useCallback(
    (id: string, status: ProjectStatus) => updateProject(id, { status }),
    [updateProject],
  );

  const saveResult = useCallback((r: FullTeamResult) => {
    setState((s) => ({ ...s, results: { ...s.results, [r.projectId]: r } }));
  }, []);

  const setBoardTaskStatus = useCallback(
    (projectId: string, taskId: string, status: BoardStatus) => {
      setState((s) => {
        const result = s.results[projectId];
        if (!result) return s;
        return {
          ...s,
          results: {
            ...s.results,
            [projectId]: {
              ...result,
              tasks: result.tasks.map((t) => (t.id === taskId ? { ...t, status } : t)),
            },
          },
        };
      });
    },
    [],
  );

  const toggleRiskResolved = useCallback((projectId: string, riskId: string) => {
    setState((s) => {
      const result = s.results[projectId];
      if (!result) return s;
      return {
        ...s,
        results: {
          ...s.results,
          [projectId]: {
            ...result,
            projectRisks: result.projectRisks.map((r) =>
              r.id === riskId ? { ...r, resolved: !r.resolved } : r,
            ),
          },
        },
      };
    });
  }, []);

  const setTaskStatus = useCallback((projectId: string, taskId: string, status: TaskStatus) => {
    setState((s) => {
      const result = s.results[projectId];
      if (!result) return s;
      return {
        ...s,
        results: {
          ...s.results,
          [projectId]: {
            ...result,
            roadmap: result.roadmap.map((phase) => ({
              ...phase,
              tasks: phase.tasks.map((t) => (t.id === taskId ? { ...t, status } : t)),
            })),
          },
        },
      };
    });
  }, []);

  const setMode = useCallback((mode: "live" | "demo") => setState((s) => ({ ...s, mode })), []);
  const resetDemoData = useCallback(() => setState(initialState), []);

  const value = useMemo<Store>(
    () => ({
      ...state,
      hydrated,
      addCandidate,
      removeCandidate,
      addProject,
      removeProject,
      updateProject,
      setProjectStatus,
      saveResult,
      setTaskStatus,
      setBoardTaskStatus,
      toggleRiskResolved,
      setMode,
      resetDemoData,
    }),
    [
      state,
      hydrated,
      addCandidate,
      removeCandidate,
      addProject,
      removeProject,
      updateProject,
      setProjectStatus,
      saveResult,
      setTaskStatus,
      setBoardTaskStatus,
      toggleRiskResolved,
      setMode,
      resetDemoData,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useAppStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useAppStore must be used inside AppStoreProvider");
  return ctx;
}