// The local dashboard server owns one saved project list for its launch mode.
// Only ENOENT permits seeding; unreadable files stay untouched and admit no project.
import { randomUUID } from "node:crypto";
import {
  mkdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import { z } from "zod";
import type { PublishedSource } from "../src/publishedSource.ts";
import { ProjectInputProblem } from "../src/projectInput.ts";
import { productionSeedProjects } from "./projectConfigurationSeed.ts";

export type ProjectEnvironment = "development" | "production";
export type ConfiguredProject = PublishedSource & {
  readonly localPath: string;
};

const projectSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  repository: z.string().min(1),
  ref: z.string().min(1),
  backlogPath: z.string().min(1),
  localPath: z.string().min(1),
});
const projectsSchema = z.array(projectSchema);
let environment: ProjectEnvironment | undefined;
let configurationFile: string | undefined;
let projects: readonly ConfiguredProject[] = [];
let problem: string | undefined;

export function projectConfigurationFile(next: ProjectEnvironment): string {
  return path.join(
    homedir(),
    ".open-dough",
    "dashboard",
    `projects-${next}.json`,
  );
}

// Synchronous replacement serializes writes in this server, including startup.
// Temporary-file cleanup never changes the predecessor when a write fails.
function writeConfiguration(
  file: string,
  saved: readonly ConfiguredProject[],
): void {
  mkdirSync(path.dirname(file), { recursive: true });
  const temporary = `${file}.${randomUUID()}.tmp`;
  try {
    writeFileSync(temporary, `${JSON.stringify(saved, null, 2)}\n`, {
      flag: "wx",
    });
    renameSync(temporary, file);
  } finally {
    rmSync(temporary, { force: true });
  }
}

export function initializeProjectConfiguration(next: ProjectEnvironment): void {
  const file = projectConfigurationFile(next);
  if (environment !== undefined && environment !== next)
    throw new Error("A dashboard server cannot use both project environments.");
  if (configurationFile === file) return;
  environment = next;
  configurationFile = file;
  projects = [];
  problem = undefined;
  try {
    let text: string;
    try {
      text = readFileSync(file, "utf8");
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      const initial = next === "production" ? productionSeedProjects : [];
      writeConfiguration(file, initial);
      projects = initial;
      return;
    }
    projects = projectsSchema.parse(JSON.parse(text));
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    problem = `The dashboard project configuration could not be read: ${file}. ${reason}`;
  }
}

export function configuredProjects(): readonly ConfiguredProject[] {
  return projects;
}

export function configuredProject(id: string): ConfiguredProject | undefined {
  return configuredProjects().find((project) => project.id === id);
}

// Local paths stay on the server. The browser only receives published-source facts.
export function publishedProjects(): readonly PublishedSource[] {
  if (problem !== undefined) throw new Error(problem);
  return configuredProjects().map(
    ({ id, label, repository, ref, backlogPath }) => ({
      id,
      label,
      repository,
      ref,
      backlogPath,
    }),
  );
}

// Recheck admission at the synchronous write boundary after asynchronous validation.
export function appendConfiguredProject(project: ConfiguredProject): void {
  if (problem !== undefined) throw new Error(problem);
  if (configurationFile === undefined)
    throw new Error("The dashboard project configuration is not initialized.");
  if (
    projects.some(
      (current) =>
        current.repository.toLowerCase() === project.repository.toLowerCase(),
    )
  ) {
    throw new ProjectInputProblem(
      "githubUrl",
      `${project.repository} is already configured.`,
    );
  }
  if (
    projects.some(
      (current) => current.id.toLowerCase() === project.id.toLowerCase(),
    )
  ) {
    throw new ProjectInputProblem(
      "githubUrl",
      `The project id ${project.id} is already configured. Projects sharing an id would share session records.`,
    );
  }
  const saved = [...projects, project];
  writeConfiguration(configurationFile, saved);
  projects = saved;
}

// Removing configuration never touches a checkout or retained session evidence.
export function removeConfiguredProject(id: string): void {
  if (problem !== undefined) throw new Error(problem);
  if (configurationFile === undefined)
    throw new Error("The dashboard project configuration is not initialized.");
  const saved = projects.filter((project) => project.id !== id);
  writeConfiguration(configurationFile, saved);
  projects = saved;
}
