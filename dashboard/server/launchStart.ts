// Run the shared workflow's deterministic start and format its handoff before
// the native session begins. An expired wait leaves that start running.
// Before a launch is accepted, a start in the default checkout first observes
// its existing changes: changes the request did not confirm, or that changed
// since, answer with what was observed, and nothing starts.
import {
  policyOf,
  unattachedPolicyOf,
  type AgentLaunchRequest,
  type ExistingChangesFound,
  type LaunchRecord,
  type LaunchResult,
  type PublicationReceipt,
  type SessionPolicy,
} from "../src/agentLaunch.ts";
import { existingChanges } from "./defaultCheckoutChanges.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import type { EstablishedLaunch, UnattachedEstablished } from "./hostLaunch.ts";
import type { ProjectFolder } from "./projectFolders.ts";
import {
  establishedFacts,
  requireStartHost,
  type Established,
} from "./startLaunch.ts";
import type { StartProgress } from "./startProgress.ts";
import { startOf, type StartWorkflow } from "./startWorkflows.ts";
import { keptStart } from "./startStore.ts";
import { launchStartContext } from "./launchRecord.ts";
import { withinStartWait } from "./startWait.ts";
import { unattachedStarted } from "./unattachedStart.ts";

// The established start a launch's session is handed, if its start made one.
export function establishedLaunch(
  start: Exclude<Started, { kind: "stopped" }>,
): EstablishedLaunch | undefined {
  return start.kind === "none" ? undefined : start;
}

// How a launch's start ended: there was none to run, it established the
// workspace a story's session opens in (`established`) or an unattached
// session's place (`session`), or the launch stops with this answer, knowing
// it published nothing (`publishedNothing`) or not.
export type Started =
  | { readonly kind: "none" }
  | ({
      readonly kind: "established";
      readonly workflow: StartWorkflow;
      // The policy the start ran with, a kept start's own.
      readonly policy: SessionPolicy;
    } & EstablishedLaunch<Established>)
  | ({ readonly kind: "session" } & EstablishedLaunch<UnattachedEstablished>)
  | {
      readonly kind: "stopped";
      readonly result: LaunchResult;
      readonly publishedNothing?: true;
    };

function startFailed(
  explanation: string,
  publishedNothing: boolean,
  reason: "start-refused" | "already-starting" = "start-refused",
): Started {
  return {
    kind: "stopped",
    result: { kind: "failed", reason, explanation },
    ...(publishedNothing ? { publishedNothing } : {}),
  };
}

// The workspace a launch's session runs in: an unattached session's own
// choice, the default checkout when it names none; a story start's policy, a
// kept start's own, whose kept start another host owns is refused; none for a
// story workflow with no start.
async function startWorkspace(
  source: PublishedSource,
  request: AgentLaunchRequest,
): Promise<SessionPolicy["workspace"] | undefined> {
  if (request.workflow === "ad-hoc")
    return unattachedPolicyOf(request).workspace;
  if (startOf(request.workflow) === undefined) return undefined;
  const kept = await keptStart(source.id, request.identity, request.workflow);
  requireStartHost(request.host, kept);
  return policyOf(kept ?? request).workspace;
}

// What a launch's start answers before the launch is accepted, with nothing
// run: a kept start another host owns is refused, and changes in the default
// checkout the request did not confirm, or that changed since, are answered
// for the developer to confirm.
export async function unconfirmedStart(
  source: PublishedSource,
  request: AgentLaunchRequest,
  folder: ProjectFolder,
): Promise<ExistingChangesFound | undefined> {
  if ((await startWorkspace(source, request)) !== "default-checkout")
    return undefined;
  const found = await existingChanges(folder);
  return found !== undefined && found.fingerprint !== request.existingChanges
    ? found
    : undefined;
}

// The start a launch's attempt (`attemptId`) runs before its session, a story
// workflow's or an unattached session's own, kept by that attempt, waiting for
// it only so long (`./startWait.ts`); the script goes on running when the
// wait ends.
export async function started(
  source: PublishedSource,
  request: AgentLaunchRequest,
  folder: ProjectFolder,
  progress: StartProgress,
  attemptId: string,
): Promise<Started> {
  if (request.workflow === "ad-hoc") {
    return unattachedStarted(source, request, folder, attemptId);
  }
  const workflow = startOf(request.workflow);
  if (workflow === undefined) {
    return { kind: "none" };
  }
  const scoped = progress.for(request.workflow);
  const planned = await workflow.begin(source, request, folder, scoped);
  if (planned.kind === "not-applicable") {
    return { kind: "none" };
  }
  // Refused before its command ran: nothing was published.
  if (planned.kind === "refused") {
    return startFailed(planned.explanation, true, planned.reason);
  }
  const place = {
    workspace: planned.workspace.shown,
    branch: planned.branch,
    policy: planned.policy,
  };
  const attempt = await withinStartWait(planned.attempt);
  if (attempt === "expired") {
    // No launch follows the script that goes on running, so its phase ends
    // with it.
    void planned.attempt.finally(() => {
      scoped.clear(source.id, request.identity);
    });
    return {
      kind: "stopped",
      result: {
        kind: "uncertain",
        reason: "timed-out",
        explanation: workflow.uncertain(place),
      },
    };
  }
  if (attempt.kind === "refused") {
    return startFailed(attempt.explanation, attempt.publishedNothing === true);
  }
  const established: Established =
    "start" in attempt
      ? { start: attempt.start }
      : { preparation: attempt.preparation };
  const context = launchStartContext(folder, {
    workspace: planned.workspace.path,
    policy: planned.policy,
    ...established,
  });
  try {
    return {
      kind: "established",
      workflow,
      policy: context.policy,
      handoff: {
        established,
        formatted: await workflow.format(folder, established, request.host),
      },
      workspace: context.workspace,
    };
  } catch {
    scoped.clear(source.id, request.identity);
    return startFailed(workflow.formatFailed(place), false);
  }
}

// What an attempt's start says of publication: an established claim or
// announcement is published, at the revision the start reported when it
// reported one; a one-shot start, a launch with no start, or a start refused
// knowing it published nothing publishes nothing; a start that stopped
// otherwise, its wait expired included, may or may not have published. A
// conversation resumed from its kept record carries the start it was launched
// with.
export function publicationOf(
  start: Started,
  pending: LaunchRecord | undefined,
): PublicationReceipt {
  const established =
    pending !== undefined
      ? (pending.start ?? pending.preparation)
      : start.kind === "established"
        ? establishedFacts(start.handoff.established)
        : undefined;
  if (established !== undefined) {
    if ("tracking" in established) return { kind: "none" };
    return established.publishedSha === undefined
      ? { kind: "published" }
      : { kind: "published", revision: established.publishedSha };
  }
  if (start.kind !== "stopped") return { kind: "none" };
  return start.publishedNothing === true
    ? { kind: "none" }
    : { kind: "unknown" };
}
