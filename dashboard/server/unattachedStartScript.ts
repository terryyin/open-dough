// The script of an unattached session's start (`./unattachedStart.ts`): the
// installed shared start run for the chosen workspace and branch, kept with
// its launch attempt (`./sessionStartStore.ts`) before it runs, and followed
// to its result however long the launch waited for it.

import { admitsAdHocStory } from "../src/launchRequest.ts";
import { realpath } from "node:fs/promises";
import { unattachedStartPolicy } from "../../Distribution/src/skills/dough-execute-plan/scripts/session-policy.mjs";
import {
  establishesSession,
  unattachedPolicyOf,
  type AgentLaunchRequest,
  type EstablishedSession,
} from "../src/agentLaunch.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import { runStartScript } from "./executionStartCommands.ts";
import type { WorkspaceChoice } from "./launchWorkspace.ts";
import type { LocalFolder } from "./localFolder.ts";
import {
  keepEstablishedSession,
  keptSessionStart,
  keepSessionStart,
  removeSessionStart,
  type SessionStart,
} from "./sessionStartStore.ts";
import { git } from "./startGit.ts";
import { machineDashboardPath } from "./machineHome.ts";
import { policyArguments } from "./startPolicy.ts";
import { record } from "./startRecording.ts";
import type { StartResult } from "./startResult.ts";
import {
  admitAdHocStory,
  type AdHocStoryAdmissionRefusal,
} from "./adHocStoryAdmission.ts";

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

type Place = Pick<
  EstablishedSession,
  "workspace" | "branch" | "remote" | "target"
>;

// The session the installed start establishes in `where`.
async function establishedByScript(
  request: UnattachedRequest,
  project: LocalFolder,
  where: Place,
  again: boolean,
): Promise<EstablishedSession | Exclude<StartResult, { kind: "prepared" }>> {
  const policy = unattachedPolicyOf(request);
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
  if (result.kind !== "prepared") return result;
  return {
    ...where,
    role: result.role ?? "isolated",
    landing: policy.landing,
    startingRevision: result.startingRevision,
    ...(result.fetched === undefined ? {} : { fetched: result.fetched }),
  };
}

// The execution checkout as it is, borrowed by a launch with default choices.
async function borrowedCheckout(
  chosen: WorkspaceChoice,
  where: Place,
  landing: EstablishedSession["landing"],
): Promise<EstablishedSession | AdHocStoryAdmissionRefusal> {
  const [revision, branch] = await Promise.all([
    git(chosen.workspace, ["rev-parse", "--verify", "HEAD"]),
    git(chosen.workspace, ["rev-parse", "--abbrev-ref", "HEAD"]),
  ]);
  if (!revision.trim() || !branch.trim())
    return {
      kind: "refused",
      explanation: `Cannot read the execution checkout at ${chosen.workspace.shown}. Nothing was launched.`,
      publication: { kind: "none" },
    };
  return {
    ...where,
    branch: branch.trim(),
    role: "default-checkout",
    landing,
    startingRevision: revision.trim(),
  };
}

// Runs the installed start for `chosen`, kept with its attempt before the
// script runs; `again` for a kept start's workspace. The kept start follows
// the script's result even when the launch stopped waiting for it: the
// session it established is kept with it, and a script that stopped leaves
// nothing to resume, so its start is removed.
export async function scriptSession(
  source: PublishedSource,
  request: UnattachedRequest,
  project: LocalFolder,
  attempt: string,
  chosen: WorkspaceChoice,
  again: boolean,
  began: Date,
  noteWorker: (pid: number) => Promise<void>,
): Promise<
  | EstablishedSession
  | AdHocStoryAdmissionRefusal
  | Exclude<StartResult, { kind: "prepared" }>
> {
  const policy = unattachedPolicyOf(request);
  const admitting = admitsAdHocStory(request);
  const where = {
    workspace: chosen.workspace.path,
    branch: chosen.branch,
    remote: "origin",
    target: source.ref,
  } as const;
  running.add(attempt);
  try {
    const placement: SessionStart = (again
      ? await keptSessionStart(source.id, attempt)
      : undefined) ?? {
      host: request.host,
      workspace: where.workspace,
      branch: where.branch,
      startedAt: began.toISOString(),
    };
    await keepSessionStart(source.id, attempt, placement);
    if (admitting && policy.workspace === "isolated") {
      const admission = await admitAdHocStory(
        source,
        request,
        project,
        attempt,
        placement,
        noteWorker,
      );
      if (admission.kind === "refused") return admission;
      const session: EstablishedSession = {
        ...where,
        role: "isolated",
        landing: policy.landing,
        startingRevision: admission.revision,
      };
      await keepEstablishedSession(source.id, attempt, session);
      return session;
    }
    const session =
      placement.session ??
      (establishesSession(request)
        ? await establishedByScript(request, project, where, again)
        : await borrowedCheckout(chosen, where, policy.landing));
    if ("kind" in session) {
      await record(() => removeSessionStart(source.id, attempt));
      return session;
    }
    if (!admitting) {
      await record(() => keepEstablishedSession(source.id, attempt, session));
      return session;
    }
    // The claim may be rewound or refreshed by the installed workflow, so it
    // is published from an owned checkout outside the borrowed one.
    const claimed: SessionStart = {
      ...placement,
      branch: session.branch,
      session,
      claimCheckout: placement.claimCheckout ?? {
        workspace: machineDashboardPath("admission-worktrees", attempt),
        branch: `dough/admit-${attempt}`,
      },
    };
    await keepSessionStart(source.id, attempt, claimed);
    const admission = await admitAdHocStory(
      source,
      request,
      project,
      attempt,
      claimed,
      noteWorker,
    );
    return admission.kind === "refused" ? admission : session;
  } finally {
    running.delete(attempt);
  }
}
