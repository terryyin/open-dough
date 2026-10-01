// Run the shared workflow's deterministic start and format its handoff before
// the native session begins. An expired wait leaves that start running. A
// start in the default checkout first observes its existing changes: changes
// the request did not confirm, or that changed since, answer with what was
// observed, and nothing starts.
import {
  policyOf,
  type AgentLaunchRequest,
  type LaunchResult,
  type SessionPolicy,
} from "../src/agentLaunch.ts";
import { existingChanges } from "./defaultCheckoutChanges.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import type { EstablishedLaunch } from "./hostLaunch.ts";
import type { ProjectFolder } from "./projectFolders.ts";
import { requireStartHost, type Established } from "./startLaunch.ts";
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
  const kept = await keptStart(source.id, request.identity, request.workflow);
  requireStartHost(request.host, kept);
  if (policyOf(kept ?? request).workspace === "default-checkout") {
    const found = await existingChanges(folder);
    if (found !== undefined && found.fingerprint !== request.existingChanges) {
      return { kind: "stopped", result: found };
    }
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
