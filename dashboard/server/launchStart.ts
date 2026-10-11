// Run the shared workflow's deterministic start and format its handoff before
// the native session begins. A slow start warns while it keeps running.
// Before a launch is accepted, a start in the default checkout first observes
// its existing changes: changes the request did not confirm, or that changed
// since, answer with what was observed, and nothing starts.
import {
  policyOf,
  type AgentLaunchRequest,
  type ExistingChangesFound,
  type LaunchRecord,
  type LaunchResult,
  type PublicationReceipt,
  type SessionPolicy,
} from "../src/agentLaunch.ts";
import { existingChanges } from "./defaultCheckoutChanges.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import type { EstablishedLaunch } from "./hostLaunch.ts";
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

const defaultStartWaitMs = 120_000;

// How long a start may run before a slow-start warning is noted; elapsed
// time never aborts the script or settles its attempt. Tests may shorten it.
export function startTimeoutMs(): number {
  const configured = Number(process.env["DOUGH_START_TIMEOUT_MS"]);
  return Number.isFinite(configured) && configured > 0
    ? configured
    : defaultStartWaitMs;
}

// How a launch's start ended: there was none to run, it established the
// workspace the session opens in, or the launch stops with this answer,
// knowing it published nothing (`publishedNothing`) or not.
export type Started =
  | { readonly kind: "none" }
  | ({
      readonly kind: "established";
      readonly workflow: StartWorkflow;
      // The policy the start ran with, a kept start's own.
      readonly policy: SessionPolicy;
    } & EstablishedLaunch)
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

// What a story launch's start answers before the launch is accepted, with
// nothing run: a kept start another host owns is refused, and changes in the
// default checkout the request did not confirm, or that changed since, are
// answered for the developer to confirm.
export async function unconfirmedStart(
  source: PublishedSource,
  request: AgentLaunchRequest,
  folder: ProjectFolder,
): Promise<ExistingChangesFound | undefined> {
  if (request.workflow === "ad-hoc" || startOf(request.workflow) === undefined)
    return undefined;
  const kept = await keptStart(source.id, request.identity, request.workflow);
  requireStartHost(request.host, kept);
  if (policyOf(kept ?? request).workspace !== "default-checkout")
    return undefined;
  const found = await existingChanges(folder);
  return found !== undefined && found.fingerprint !== request.existingChanges
    ? found
    : undefined;
}

// The start a launch's workflow runs before its session. Past the warning
// threshold the attempt keeps following the script through its result.
export async function started(
  source: PublishedSource,
  request: AgentLaunchRequest,
  folder: ProjectFolder,
  progress: StartProgress,
  noteSlow: (slowSince: string) => Promise<void> = async () => {},
  noteWorker: (pid: number) => Promise<void> = async () => {},
): Promise<Started> {
  if (request.workflow === "ad-hoc") {
    return { kind: "none" };
  }
  const workflow = startOf(request.workflow);
  if (workflow === undefined) {
    return { kind: "none" };
  }
  const scoped = progress.for(request.workflow);
  const planned = await workflow.begin(
    source,
    request,
    folder,
    scoped,
    noteWorker,
  );
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
  let slowNoted: Promise<void> | undefined;
  const timer = setTimeout(() => {
    slowNoted = noteSlow(new Date().toISOString());
  }, startTimeoutMs());
  const attempt = await planned.attempt.finally(async () => {
    clearTimeout(timer);
    // Finish the warning write before a publication receipt or outcome can
    // follow it, so a slow note never overwrites later evidence.
    await slowNoted;
  });
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
// otherwise may or may not have published. A
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
