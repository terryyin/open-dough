import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { PublishedSource } from "./publishedSource.ts";
import { projectListEndpoint } from "./projectConfiguration.ts";
import { refusalMessage } from "./refusalMessage.ts";

type ProjectList = {
  readonly configuredProjects: readonly PublishedSource[];
  readonly visibleProjects: readonly PublishedSource[];
  readonly replaceProjects: (projects: readonly PublishedSource[]) => void;
};
const ProjectsContext = createContext<ProjectList | undefined>(undefined);

export function visibleProjectsOf(
  projects: readonly PublishedSource[],
): readonly PublishedSource[] {
  return projects.filter((project) => !project.hidden);
}

export function selectionAfterProjectChange({
  previousVisible,
  saved,
  changed,
  selectedId,
}: {
  readonly previousVisible: readonly PublishedSource[];
  readonly saved: readonly PublishedSource[];
  readonly changed: PublishedSource;
  readonly selectedId: string | undefined;
}): PublishedSource | undefined {
  const visible = visibleProjectsOf(saved);
  if (selectedId === undefined) {
    return visible.find((project) => project.id === changed.id) ?? visible[0];
  }
  const current = visible.find((project) => project.id === selectedId);
  if (current !== undefined) {
    return current;
  }
  const index = previousVisible.findIndex(
    (project) => project.id === selectedId,
  );
  return index >= 0 ? (visible[index] ?? visible[0]) : visible[0];
}

export function ProjectsOnPage({
  projects,
  replaceProjects,
  children,
}: {
  readonly projects: readonly PublishedSource[];
  readonly replaceProjects: ProjectList["replaceProjects"];
  readonly children: ReactNode;
}) {
  const visibleProjects = useMemo(
    () => visibleProjectsOf(projects),
    [projects],
  );
  return (
    <ProjectsContext
      value={{
        configuredProjects: projects,
        visibleProjects,
        replaceProjects,
      }}
    >
      {children}
    </ProjectsContext>
  );
}

// The catalog label for a launch's project, or the id when it is not listed.
export function projectLabel(
  projects: readonly PublishedSource[],
  sourceId: string,
): string {
  return projects.find((project) => project.id === sourceId)?.label ?? sourceId;
}

export function useProjects(): readonly PublishedSource[] {
  const projects = useContext(ProjectsContext);
  if (projects === undefined)
    throw new Error("Projects must be loaded before the dashboard opens.");
  return projects.configuredProjects;
}

export function useVisibleProjects(): readonly PublishedSource[] {
  const projects = useContext(ProjectsContext);
  if (projects === undefined)
    throw new Error("Projects must be loaded before the dashboard opens.");
  return projects.visibleProjects;
}

export function useReplaceProjects(): ProjectList["replaceProjects"] {
  const list = useContext(ProjectsContext);
  if (list === undefined)
    throw new Error("Projects must be loaded before they can change.");
  return list.replaceProjects;
}

export function firstProject(
  projects: readonly PublishedSource[],
): PublishedSource {
  const first = projects[0];
  if (first === undefined) throw new Error("No projects configured.");
  return first;
}

// Load the server-owned list before mounting any project-consuming dashboard.
export function useProjectConfiguration() {
  const [projects, setProjects] = useState<
    readonly PublishedSource[] | undefined
  >();
  const [problem, setProblem] = useState<string | undefined>();
  useEffect(() => {
    const controller = new AbortController();
    void fetch(projectListEndpoint, { signal: controller.signal })
      .then(async (response) => {
        const answer: unknown = await response.json();
        if (!response.ok)
          throw new Error(
            refusalMessage(
              answer,
              "The dashboard project list could not be read.",
            ),
          );
        return answer as readonly PublishedSource[];
      })
      .then(setProjects, (error: unknown) => {
        if (!controller.signal.aborted)
          setProblem(error instanceof Error ? error.message : String(error));
      });
    return () => {
      controller.abort();
    };
  }, []);
  return { projects, problem, replaceProjects: setProjects };
}
