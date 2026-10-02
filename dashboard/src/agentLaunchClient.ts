// The browser's requests to the local launch boundary
// (`../server/agentLaunchPlugin.ts`): an ordinary same-origin JSON POST that
// asks the launch owner to accept a launch, or to continue a kept attempt
// that needs reconciliation, or to note that a settled attempt reconciled with
// published state, or to verify an uncertain launch, a GET that waits for an
// accepted attempt to change, and a GET of the machine's sessions; requests
// about one recorded session are `./sessionRecordRequests.ts`. A launch request answers
// once the owner accepted it, or with what was answered before anything was
// accepted; a refusal answers an error the boundary explains. What it answers
// crossed a process/HTTP boundary, so it is checked as external input. When
// no acceptance answer can be trusted, the launch may or may not have been
// accepted and started, and the answer says so.

import { z } from "zod";
import {
  acceptanceSchema,
  agentAcceptEndpoint,
  agentLaunchEndpoint,
  agentChangedEndpoint,
  agentContinueEndpoint,
  agentReconciledEndpoint,
  agentVerifyEndpoint,
  changedAnswerSchema,
  launchRecordsSchema,
  type Acceptance,
  type AgentLaunchRequest,
  type AttemptObservation,
  type MachineAnswer,
  type VerifiedAnswer,
  verifiedAnswerSchema,
} from "./agentLaunch.ts";
import { hostDescription } from "./hostDescription.ts";

export const refusal = z.object({ error: z.string().min(1) });

// An ordinary same-origin JSON POST.
export const postJson = (endpoint: string, body: unknown) =>
  fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

// What names a kept attempt to the boundary.
const attemptReference = (attempt: AttemptObservation) => ({
  source: attempt.request.source,
  attempt: attempt.id,
});

// Why nothing was, or may not have been, launched. The boundary's reason
// categories are not needed by the card.
export type LaunchProblem = {
  readonly kind: "failed" | "uncertain";
  readonly explanation: string;
};

// What asking for a launch answers the page: the attempt the local service
// accepted, or a launch problem (`unacknowledged` when no answer could be
// trusted, so the service may have accepted it); or, for its dialog, the
// default checkout's existing changes to confirm before anything starts.
export type AcceptanceAnswer =
  | Extract<Acceptance, { readonly kind: "accepted" | "existing-changes" }>
  | (LaunchProblem & { readonly unacknowledged?: true });

function noTrustedAnswer(
  what: string,
  host: AgentLaunchRequest["host"],
): AcceptanceAnswer {
  const hint = hostDescription(host).uncertaintyHint;
  return {
    kind: "uncertain",
    unacknowledged: true,
    explanation: `The local dashboard server ${what}, so the launch may or may not have been accepted and its session may or may not have started.${hint === undefined ? "" : ` ${hint}`}`,
  };
}

export function requestAgentAcceptance(
  request: AgentLaunchRequest,
): Promise<AcceptanceAnswer> {
  return askAcceptance(agentAcceptEndpoint, request, request.host);
}

// Asks the local service to continue the project's kept attempt that needs
// reconciliation, answered as a launch is.
export function requestAttemptContinuation(
  attempt: AttemptObservation,
): Promise<AcceptanceAnswer> {
  return askAcceptance(
    agentContinueEndpoint,
    attemptReference(attempt),
    attempt.request.host,
  );
}

async function askAcceptance(
  endpoint: string,
  body: unknown,
  host: AgentLaunchRequest["host"],
): Promise<AcceptanceAnswer> {
  let response: Response;
  try {
    response = await postJson(endpoint, body);
  } catch {
    return noTrustedAnswer("could not be reached", host);
  }
  const answered: unknown = await response.json().catch(() => undefined);
  if (!response.ok) {
    // A refusal happens before anything is accepted.
    const refused = refusal.safeParse(answered);
    return refused.success
      ? {
          kind: "failed",
          explanation: `${refused.data.error} Nothing was launched.`,
        }
      : noTrustedAnswer(`answered HTTP ${String(response.status)}`, host);
  }
  const answer = acceptanceSchema.safeParse(answered);
  return answer.success
    ? answer.data
    : noTrustedAnswer(
        "answered in a shape this dashboard does not understand",
        host,
      );
}

// Notes with the local service that a settled attempt reconciled with the
// published state this page shows, so every page on this machine reads it
// so. Whatever it answers, or none, changes nothing on this page.
export async function noteAttemptReconciled(
  attempt: AttemptObservation,
): Promise<void> {
  try {
    await postJson(agentReconciledEndpoint, attemptReference(attempt));
  } catch {
    // Another page judges it again.
  }
}

// Asks the local service to settle a story attempt whose launch is uncertain
// from its host's own session listing: the attempt as settled, or why it
// stays unresolved, including when no trustworthy answer came.
export async function requestLaunchVerification(
  attempt: AttemptObservation,
): Promise<VerifiedAnswer> {
  const unanswered = (what: string): VerifiedAnswer => ({
    kind: "unresolved",
    explanation: `The local dashboard server ${what}, so whether this launch started its session is still not known.`,
  });
  try {
    const response = await postJson(
      agentVerifyEndpoint,
      attemptReference(attempt),
    );
    const answered: unknown = await response.json().catch(() => undefined);
    if (!response.ok) {
      const refused = refusal.safeParse(answered);
      return refused.success
        ? { kind: "unresolved", explanation: refused.data.error }
        : unanswered(`answered HTTP ${String(response.status)}`);
    }
    const answer = verifiedAnswerSchema.safeParse(answered);
    return answer.success
      ? answer.data
      : unanswered("answered in a shape this dashboard does not understand");
  } catch {
    return unanswered("could not be reached");
  }
}

// Waits for an accepted attempt to change: whether it changed, or undefined
// when no trustworthy answer came.
export async function awaitAttemptChange(
  attempt: string,
  signal: AbortSignal,
): Promise<boolean | undefined> {
  try {
    const response = await fetch(
      `${agentChangedEndpoint}?${new URLSearchParams({ attempt }).toString()}`,
      { signal },
    );
    if (!response.ok) return undefined;
    const answer = changedAnswerSchema.safeParse(await response.json());
    return answer.success ? answer.data.changed : undefined;
  } catch {
    return undefined;
  }
}

// The machine's sessions: the launch records this machine keeps for every
// project, each naming its project, oldest first within it, with its
// session's current state, and whether the server can alert, or undefined
// when no trustworthy answer came.
export async function readMachineSessions(): Promise<
  MachineAnswer | undefined
> {
  try {
    const response = await fetch(agentLaunchEndpoint);
    if (!response.ok) return undefined;
    const answer = launchRecordsSchema.safeParse(await response.json());
    return answer.success ? answer.data : undefined;
  } catch {
    return undefined;
  }
}
