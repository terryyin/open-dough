// The installed preparation command and its handoff formatter. These stay in
// the selected host installation; the dashboard runs their public contracts.
import { stat } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import type {
  EstablishedPreparation,
  StoryLaunchRequest,
} from "../src/agentLaunch.ts";
import { installedSkillPath } from "./launchHosts.ts";
import type { ProjectFolder } from "./projectFolders.ts";
import { isFile, runStartCommand } from "./startLaunch.ts";
import {
  readPreparationResult,
  type PreparationResult,
} from "./preparationResult.ts";

const refinementSkill = "dough-story-refinement";
const startScript = "preparation-assignment.mjs";
const formatterScript = "established-preparation.mjs";

export async function runPreparationCommand(
  args: readonly string[],
  project: ProjectFolder,
  host: StoryLaunchRequest["host"],
  operation: "start" | "continue",
): Promise<PreparationResult> {
  const stdout = await runStartCommand(
    installedSkillPath(host, project, refinementSkill, "scripts", startScript),
    args,
    project,
    operation,
  );
  return stdout === undefined
    ? { kind: "unreadable" }
    : readPreparationResult(stdout);
}

// Whether the project's installed skill can establish a preparation: it ships
// the start command and the formatter.
export async function establishesPreparation(
  project: ProjectFolder,
  host: StoryLaunchRequest["host"] = "claude",
): Promise<boolean> {
  const script = (name: string) =>
    installedSkillPath(host, project, refinementSkill, "scripts", name);
  return (
    (await isFile(script(startScript))) &&
    (await isFile(script(formatterScript)))
  );
}

// The established preparation as the session's instruction carries it,
// written by the formatter the installed skill ships beside its start
// command.
export async function formattedPreparation(
  project: ProjectFolder,
  preparation: EstablishedPreparation,
  host: StoryLaunchRequest["host"] = "claude",
): Promise<string> {
  const file = installedSkillPath(
    host,
    project,
    refinementSkill,
    "scripts",
    formatterScript,
  );
  const url = `${pathToFileURL(file).href}?modified=${String((await stat(file)).mtimeMs)}`;
  const formatter = (await import(/* @vite-ignore */ url)) as {
    formatEstablishedPreparation: (preparation: object) => string;
  };
  return formatter.formatEstablishedPreparation({
    ...preparation,
    integration: project.path,
  });
}
