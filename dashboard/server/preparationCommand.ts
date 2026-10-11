// The installed preparation command and its handoff formatter. These stay in
// the selected host installation; the dashboard runs their public contracts.
import type {
  EstablishedPreparation,
  SessionPolicy,
  StoryLaunchRequest,
} from "../src/agentLaunch.ts";
import { installedSkillPath } from "./launchHosts.ts";
import type { ProjectFolder } from "./projectFolders.ts";
import { installedExports, isFile, runStartCommand } from "./startLaunch.ts";
import { policyArguments } from "./startPolicy.ts";
import {
  readPreparationResult,
  type PreparationResult,
} from "./preparationResult.ts";

const refinementSkill = "dough-story-refinement";
const startScript = "preparation-assignment.mjs";
const formatterScript = "established-preparation.mjs";

// The selected start and retained assignment spell the installed command's
// arguments here, beside the command contract they invoke.
export async function runPreparationCommand(
  start: {
    readonly identity: string;
    readonly workspace: string;
    readonly branch: string;
    readonly remote: string;
    readonly target: string;
    readonly policy: SessionPolicy;
    readonly host: StoryLaunchRequest["host"];
    readonly model?: string | undefined;
    readonly assigned?:
      Exclude<EstablishedPreparation, { tracking: "one-shot" }> | undefined;
  },
  project: ProjectFolder,
  operation: "start" | "continue",
): Promise<PreparationResult> {
  const { host, model, assigned } = start;
  const args = [
    ...policyArguments(start.policy, project),
    "--workspace",
    start.workspace,
    "--branch",
    start.branch,
    "--identity",
    start.identity,
    "--remote",
    start.remote,
    "--target",
    start.target,
    "--host",
    host,
    ...(model === undefined ? [] : ["--model", model]),
    ...(assigned === undefined
      ? operation === "continue"
        ? ["--recover-unannounced"]
        : []
      : [
          ...(assigned.agent === undefined
            ? []
            : ["--expected-agent", assigned.agent]),
          ...(assigned.publishedSha === undefined
            ? []
            : ["--expected-allocation", assigned.publishedSha]),
        ]),
  ];
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
  host: StoryLaunchRequest["host"],
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
  host: StoryLaunchRequest["host"],
): Promise<string> {
  const file = installedSkillPath(
    host,
    project,
    refinementSkill,
    "scripts",
    formatterScript,
  );
  const formatter = await installedExports<{
    formatEstablishedPreparation: (preparation: object) => string;
  }>(file);
  return formatter.formatEstablishedPreparation({
    ...preparation,
    integration: project.path,
  });
}
