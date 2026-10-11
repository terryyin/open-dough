// The script of an unattached session's start (`./unattachedStart.ts`): the
// installed shared start run for the chosen workspace and branch, kept with
// its launch attempt (`./sessionStartStore.ts`) before it runs, and followed
// to its result however long the launch waited for it.

import { realpath } from "node:fs/promises";
import { unattachedStartPolicy } from "../../src/skills/dough-execute-plan/scripts/session-policy.mjs";
import {
  unattachedPolicyOf,
  type AgentLaunchRequest,
  type EstablishedSession,
} from "../src/agentLaunch.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import { runStartScript } from "./executionStart.ts";
import type { WorkspaceChoice } from "./launchWorkspace.ts";
import type { ProjectFolder } from "./projectFolders.ts";
import {
  keepEstablishedSession,
  keepSessionStart,
  removeSessionStart,
} from "./sessionStartStore.ts";
import { policyArguments } from "./startPolicy.ts";
import { record } from "./startRecording.ts";
import type { StartResult } from "./startResult.ts";

export type UnattachedRequest = Extract<
  AgentLaunchRequest,
  { workflow: "ad-hoc" }
>;

// The attempts whose start script this server still runs.
const running = new Set<string>();

// Whether this server still runs the attempt's start script, whose result a
// continuation must not be mistaken for.
export const runsSessionStart = (attempt: string) => running.has(attempt);

// Hand a kept workspace to older installed starts by its real path: those
// starts require the spelling Git uses for its top level. Current source
// accepts equivalent symlinks; keep this conversion until the installed
// release payload includes that comparison.
const asGitNames = (workspace: string) =>
  realpath(workspace).catch(() => workspace);

// Runs the installed start for `chosen`, kept with its attempt before the
// script runs; `again` for a kept start's workspace. The kept start follows
// the script's result even when the launch stopped waiting for it: the
// session it established is kept with it, and a script that stopped leaves
// nothing to resume, so its start is removed.
export async function scriptSession(
  source: PublishedSource,
  request: UnattachedRequest,
  project: ProjectFolder,
  attempt: string,
  chosen: WorkspaceChoice,
  again: boolean,
): Promise<EstablishedSession | Exclude<StartResult, { kind: "prepared" }>> {
  const policy = unattachedPolicyOf(request);
  const where = {
    workspace: chosen.workspace.path,
    branch: chosen.branch,
    remote: "origin",
    target: source.ref,
  } as const;
  running.add(attempt);
  try {
    await keepSessionStart(source.id, attempt, {
      host: request.host,
      workspace: where.workspace,
      branch: where.branch,
      startedAt: new Date().toISOString(),
    });
    const result = await runStartScript(
      [
        ...policyArguments(unattachedStartPolicy(policy), project),
        "--workspace",
        again ? await asGitNames(where.workspace) : where.workspace,
        "--branch",
        where.branch,
        "--mode",
        "story-branch",
        "--remote",
        where.remote,
        "--target",
        where.target,
        "--workspace-authorized",
      ],
      project,
      request.host,
      async () => {},
    );
    if (result.kind !== "prepared") {
      await record(() => removeSessionStart(source.id, attempt));
      return result;
    }
    const session: EstablishedSession = {
      ...where,
      role: result.role ?? "isolated",
      landing: policy.landing,
      startingRevision: result.startingRevision,
      ...(result.fetched === undefined ? {} : { fetched: result.fetched }),
    };
    await record(() => keepEstablishedSession(source.id, attempt, session));
    return session;
  } finally {
    running.delete(attempt);
  }
}
