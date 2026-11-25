// The installed execution command and formatter, shared by story starts and
// unattached starts. The caller owns the arguments for its workflow.

import type {
  EstablishedStart,
  StoryLaunchRequest,
} from "../src/agentLaunch.ts";
import { installedSkillPath } from "./launchHosts.ts";
import type { LocalFolder } from "./localFolder.ts";
import { installedExports, isFile, runStartCommand } from "./startLaunch.ts";
import { readStartResult, type StartResult } from "./startResult.ts";

const executePlanSkill = "dough-execute-plan";
const startScript = "execution-start.mjs";
const formatterScript = "established-start.mjs";

// A script the selected host's installed execution skill ships.
export const executePlanScript = (
  project: LocalFolder,
  host: StoryLaunchRequest["host"],
  name: string,
) => installedSkillPath(host, project, executePlanSkill, "scripts", name);

// Whether the installation ships the shared start command.
export const shipsStartScript = (
  project: LocalFolder,
  host: StoryLaunchRequest["host"],
) => isFile(executePlanScript(project, host, startScript));

// The installed start command's result for these arguments.
export async function runStartScript(
  args: readonly string[],
  project: LocalFolder,
  host: StoryLaunchRequest["host"],
  noteWorker?: (pid: number) => Promise<void>,
  env?: NodeJS.ProcessEnv,
): Promise<StartResult> {
  const output = await runStartCommand(
    executePlanScript(project, host, startScript),
    args,
    project,
    "start",
    noteWorker,
    env,
  );
  // A command that could not run leaves no result to read. Execution start
  // still reads stdout only; stderr is not part of its refusal wording.
  return output === undefined
    ? { kind: "unreadable" }
    : readStartResult(output.stdout);
}

// Whether the project's installed skill can continue from a start: it ships
// the start command and formatter, shared by admission and machine reads.
export async function establishesStart(
  project: LocalFolder,
  host: StoryLaunchRequest["host"],
): Promise<boolean> {
  return (
    (await shipsStartScript(project, host)) &&
    (await isFile(executePlanScript(project, host, formatterScript)))
  );
}

// The handoff is written by the selected installation's own formatter.
export async function formattedStart(
  project: LocalFolder,
  start: EstablishedStart,
  host: StoryLaunchRequest["host"],
): Promise<string> {
  const formatter = await installedExports<{
    formatEstablishedStart: (start: EstablishedStart) => string;
  }>(executePlanScript(project, host, formatterScript));
  return formatter.formatEstablishedStart(start);
}
