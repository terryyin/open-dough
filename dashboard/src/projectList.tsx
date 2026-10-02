import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { PublishedSource } from "./publishedSource.ts";
import { projectListEndpoint } from "./projectConfiguration.ts";

const ProjectsContext = createContext<readonly PublishedSource[] | undefined>(
  undefined,
);

export function ProjectsOnPage({
  projects,
  children,
}: {
  readonly projects: readonly PublishedSource[];
  readonly children: ReactNode;
}) {
  return <ProjectsContext value={projects}>{children}</ProjectsContext>;
}

export function useProjects(): readonly PublishedSource[] {
  const projects = useContext(ProjectsContext);
  if (projects === undefined)
    throw new Error("Projects must be loaded before the dashboard opens.");
  return projects;
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
        if (!response.ok)
          throw new Error("The dashboard project list could not be read.");
        return (await response.json()) as readonly PublishedSource[];
      })
      .then(setProjects, (error: unknown) => {
        if (!controller.signal.aborted)
          setProblem(error instanceof Error ? error.message : String(error));
      });
    return () => {
      controller.abort();
    };
  }, []);
  return { projects, problem };
}
