// Shared launch-boundary HTTP helpers for Start, Continue, update-worktree,
// reconciliation, done/delete, and machine session reads.

import {
  agentAcceptEndpoint,
  agentContinueEndpoint,
  agentReconciledEndpoint,
  agentUpdateWorktreeEndpoint,
  type AttemptObservation,
} from "../src/agentLaunch.ts";
import { agentDeleteEndpoint } from "../src/deleteRecord.ts";
import { agentDoneEndpoint } from "../src/doneMark.ts";
import { settledOutcome } from "./acceptedAttempts.ts";
import {
  attempts,
  establishingPreparation,
  establishingProjects,
  keptStarts,
  machineFolder,
  machineSessions,
  openDoughFolder,
  projectRecords,
  recordsOf,
  runningStarts,
} from "./agentLaunchSessions.ts";
import type { DashboardServer } from "./support/dashboardServer.ts";
import { rawRequest, type RawResponse } from "./support/rawHttp.ts";

export {
  attempts,
  establishingPreparation,
  establishingProjects,
  keptStarts,
  machineFolder,
  machineSessions,
  openDoughFolder,
  projectRecords,
  recordsOf,
  runningStarts,
};

export const identity = "SEED-052#launch-claude-planned-execution";
export const title = "Launch execution in a Claude Code background session";
export const launchRequest = {
  source: "open-dough",
  identity,
  title,
  workflow: "execution",
  host: "claude",
};
export const refinementRequest = { ...launchRequest, workflow: "refinement" };

// Asks for a launch and answers what it settled to, as a launch result: the
// acceptance answer itself when nothing was accepted (or the request was
// refused), otherwise the accepted attempt's outcome once it settled, a
// launched one with its record as the machine's sessions list it.
// Settlement is followed through the attempt's own change answers (or, once
// no server runs it, what this machine keeps of it), so no read of the
// machine's sessions, and its host listing, runs before the launch settled.
// A base-CI confirmation answer is resent with that judgment (see `accept`),
// so callers that are not asserting the gate continue past it as Continue does.
export async function launch(
  server: DashboardServer,
  body: unknown,
  headers: Record<string, string> = { Origin: server.origin },
): Promise<RawResponse> {
  return followed(server, await accept(server, body, headers));
}

// Asks to continue the project's kept attempt `attempt` and answers what it
// settled to, as `launch` does.
export async function continued(
  server: DashboardServer,
  attempt: string,
): Promise<RawResponse> {
  return followed(server, await continueAttempt(server, attempt));
}

// Applies the release updater to the attempt's worktree, then continues it.
export async function updateWorktreeRetried(
  server: DashboardServer,
  attempt: string,
): Promise<RawResponse> {
  return followed(server, await updateWorktreeAttempt(server, attempt));
}

// The acceptance answer when nothing was accepted, otherwise what the
// accepted attempt settled to.
async function followed(
  server: DashboardServer,
  accepted: RawResponse,
): Promise<RawResponse> {
  if (accepted.status !== 200) return accepted;
  const answer = JSON.parse(accepted.body) as {
    kind: string;
    attempt?: AttemptObservation;
  };
  if (answer.kind !== "accepted" || answer.attempt === undefined) {
    return accepted;
  }
  const outcome = await settledOutcome(server, answer.attempt.id);
  if (outcome.kind !== "launched") {
    return { ...accepted, body: JSON.stringify(outcome) };
  }
  const { session } = outcome;
  const record = (await machineSessions(server)).find((listed) => {
    const { host, sessionId } = (
      listed as { session: { host: string; sessionId: string } }
    ).session;
    return host === session.host && sessionId === session.sessionId;
  });
  return { ...accepted, body: JSON.stringify({ kind: "launched", record }) };
}

// What a launch of a story already starting on this machine is answered.
export const alreadyStarting = {
  kind: "failed",
  reason: "already-starting",
  explanation:
    "This story is already starting on this machine, so a second start was not made. Wait for the running start to end; its card shows its progress. Nothing was launched.",
};

// What a launch matching one this server is still running is answered.
export const alreadySubmitted = {
  kind: "uncertain",
  reason: "unconfirmed",
  explanation:
    "This launch is already being reconciled or submitted. Wait for its result; no duplicate input or conversation was created.",
};

// A JSON POST of `body` to the boundary's `endpoint`, from this dashboard's
// own origin unless `headers` say otherwise.
function post(
  server: DashboardServer,
  endpoint: string,
  body: unknown,
  headers: Record<string, string> = { Origin: server.origin },
): Promise<RawResponse> {
  return rawRequest({
    url: `${server.baseURL}${endpoint}`,
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

// Asks for a launch answered once the boundary's launch owner accepted it.
// When the boundary answers `kind: "base-ci"` (non-pass origin CI, including
// unread), resends the same body with `baseCi: { revision, state }` from that
// answer — the same confirmation Continue sends in the dialog. Specs that are
// not asserting the base-CI gate thus continue past it; they never invent a
// pass when the boundary asked. Page journeys that assert the dialog use the
// UI, not this helper.
export async function accept(
  server: DashboardServer,
  body: unknown,
  headers?: Record<string, string>,
): Promise<RawResponse> {
  const first = await post(server, agentAcceptEndpoint, body, headers);
  if (first.status !== 200) return first;
  let answer: {
    kind?: string;
    revision?: string;
    state?: string;
  };
  try {
    answer = JSON.parse(first.body) as typeof answer;
  } catch {
    return first;
  }
  if (
    answer.kind !== "base-ci" ||
    typeof answer.revision !== "string" ||
    typeof answer.state !== "string" ||
    typeof body !== "object" ||
    body === null
  )
    return first;
  return post(
    server,
    agentAcceptEndpoint,
    {
      ...(body as Record<string, unknown>),
      baseCi: { revision: answer.revision, state: answer.state },
    },
    headers,
  );
}

// Asks to continue the project's kept attempt `attempt`, answered once it is
// accepted again or with why not.
export const continueAttempt = (
  server: DashboardServer,
  attempt: string,
  source = "open-dough",
) => post(server, agentContinueEndpoint, { source, attempt });

export const updateWorktreeAttempt = (
  server: DashboardServer,
  attempt: string,
  source = "open-dough",
) => post(server, agentUpdateWorktreeEndpoint, { source, attempt });

// Notes that the project's kept attempt `attempt` reconciled with published
// state, answered with the attempt so noted or why not.
export const noteReconciled = (
  server: DashboardServer,
  attempt: string,
  source = "open-dough",
) => post(server, agentReconciledEndpoint, { source, attempt });

export const markDone = (
  server: DashboardServer,
  body: unknown,
  headers?: Record<string, string>,
) => post(server, agentDoneEndpoint, body, headers);

export const deleteRecord = (
  server: DashboardServer,
  body: unknown,
  headers?: Record<string, string>,
) => post(server, agentDeleteEndpoint, body, headers);
