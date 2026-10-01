// The installed preparation command and its handoff formatter. These stay in
// the selected host installation; the dashboard runs their public contracts.
import { realpath, stat } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import type {
  EstablishedPreparation,
  SessionPolicy,
  StoryLaunchRequest,
} from "../src/agentLaunch.ts";
import { installedSkillPath } from "./launchHosts.ts";
import type { ProjectFolder } from "./projectFolders.ts";
import { isFile, runStartCommand } from "./startLaunch.ts";
import { policyArguments } from "./startPolicy.ts";
import {
  readPreparationResult,
  type PreparationResult,
} from "./preparationResult.ts";

const refinementSkill = "dough-story-refinement";
const startScript = "preparation-assignment.mjs";
const formatterScript = "established-preparation.mjs";

// Where and for which story the command runs.
type PreparationFacts = Pick<
  EstablishedPreparation,
  "identity" | "workspace" | "branch" | "remote" | "target"
>;

// The command's arguments for one start: where and for which story it runs,
// the policy, host and model, and, for a continuation, the assignment it
// expects to find already published.
export function preparationArguments(
  project: ProjectFolder,
  {
    policy,
    facts,
    host,
    model,
    expected,
  }: {
    readonly policy: SessionPolicy;
    readonly facts: PreparationFacts;
    readonly host: StoryLaunchRequest["host"];
    readonly model: string | undefined;
    readonly expected:
      | {
          readonly agent?: string | undefined;
          readonly publishedSha?: string | undefined;
        }
      | undefined;
  },
): string[] {
  return [
    ...policyArguments(policy, project),
    "--workspace",
    facts.workspace,
    "--branch",
    facts.branch,
    "--identity",
    facts.identity,
    "--remote",
    facts.remote,
    "--target",
    facts.target,
    "--host",
    host,
    ...(model === undefined ? [] : ["--model", model]),
    ...(expected?.agent === undefined
      ? []
      : ["--expected-agent", expected.agent]),
    ...(expected?.publishedSha === undefined
      ? []
      : ["--expected-allocation", expected.publishedSha]),
  ];
}

// Whether an established preparation is the one the command would establish
// from these facts: the same workspace, however its path is spelled, branch,
// story, remote, and target.
export async function establishedFor(
  preparation: EstablishedPreparation,
  facts: PreparationFacts,
): Promise<boolean> {
  const [kept, chosen] = await Promise.all(
    [preparation.workspace, facts.workspace].map((file) =>
      realpath(file).catch(() => resolve(file)),
    ),
  );
  return (
    kept === chosen &&
    preparation.branch === facts.branch &&
    preparation.identity === facts.identity &&
    preparation.remote === facts.remote &&
    preparation.target === facts.target
  );
}

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
