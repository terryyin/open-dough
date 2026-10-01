// Run the shared workflow's deterministic start and format its handoff before
// the native session begins. An expired wait leaves that start running.
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

const defaultStartWaitMs = 120_000;

// How long an execution's start may run before the launch answers uncertain;
// the start itself is never aborted. A test may shorten it through the
// environment.
function startTimeoutMs(): number {
  const configured = Number(process.env["DOUGH_START_TIMEOUT_MS"]);
  return Number.isFinite(configured) && configured > 0
    ? configured
    : defaultStartWaitMs;
}

// How a launch's start ended: there was none to run, it established the
// workspace the session opens in, or the launch stops with this answer.
export type Started =
  | { readonly kind: "none" }
  | ({
      readonly kind: "established";
      readonly workflow: StartWorkflow;
      // The policy the start ran with, a kept start's own.
      readonly policy: SessionPolicy;
    } & EstablishedLaunch)
  | { readonly kind: "stopped"; readonly result: LaunchResult };

function startFailed(
  explanation: string,
  reason: "start-refused" | "already-starting" = "start-refused",
): Started {
  return {
    kind: "stopped",
    result: { kind: "failed", reason, explanation },
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

// The start a launch's workflow runs before its session, waiting at most
// `startTimeoutMs()` for it; the script goes on running when the wait ends.
export async function started(
  source: PublishedSource,
  request: AgentLaunchRequest,
  folder: ProjectFolder,
  progress: StartProgress,
): Promise<Started> {
  if (request.workflow === "ad-hoc") {
    return { kind: "none" };
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
  if (planned.kind === "refused") {
    return startFailed(planned.explanation, planned.reason);
  }
  const place = {
    workspace: planned.workspace.shown,
    branch: planned.branch,
    policy: planned.policy,
  };
  let timer: NodeJS.Timeout | undefined;
  const expiry = new Promise<"expired">((resolve) => {
    timer = setTimeout(() => {
      resolve("expired");
    }, startTimeoutMs());
  });
  const attempt = await Promise.race([planned.attempt, expiry]);
  clearTimeout(timer);
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
    return startFailed(attempt.explanation);
  }
  const established: Established =
    "start" in attempt
      ? { start: attempt.start }
      : { preparation: attempt.preparation };
  try {
    return {
      kind: "established",
      workflow,
      policy: planned.policy,
      handoff: {
        established,
        formatted: await workflow.format(folder, established, request.host),
      },
      workspace: planned.workspace,
    };
  } catch {
    scoped.clear(source.id, request.identity);
    return startFailed(workflow.formatFailed(place));
  }
}

// What an attempt's start says of publication: an established claim or
// announcement is published, at the revision the start reported when it
// reported one; a one-shot start, a launch with no start, or a refusal before
// the start ran publishes nothing; a start that stopped otherwise may or may
// not have published. A conversation resumed from its kept record carries
// the start it was launched with.
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
  return start.result.kind === "failed" &&
    start.result.reason === "already-starting"
    ? { kind: "none" }
    : { kind: "unknown" };
}
