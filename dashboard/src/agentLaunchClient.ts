// The browser's requests to the local launch boundary
// (`../server/agentLaunchPlugin.ts`): an ordinary same-origin JSON POST that
// asks the launch owner to accept a launch, or to continue a kept attempt
// that needs reconciliation, a GET that waits for an accepted
// attempt to change, a GET of the machine's sessions,
// and a POST that marks one recorded session done. A launch request answers
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
  changedAnswerSchema,
  launchRecordsSchema,
  type Acceptance,
  type AgentLaunchRequest,
  type AttemptObservation,
  type LaunchRecord,
  type LaunchWithState,
  type MachineAnswer,
} from "./agentLaunch.ts";
import {
  agentDeleteEndpoint,
  deleteRecordAnswerSchema,
  type DeleteRecordAnswer,
} from "./deleteRecord.ts";
import { agentDoneEndpoint, markDoneAnswerSchema } from "./doneMark.ts";
import { hostDescription } from "./hostDescription.ts";

const refusal = z.object({ error: z.string().min(1) });

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
    { source: attempt.request.source, attempt: attempt.id },
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
    response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
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

// Marks the recorded session done, and answers its marked record with its
// session's state, or undefined when no trustworthy answer came.
export async function requestMarkDone(
  record: LaunchRecord,
): Promise<LaunchWithState | undefined> {
  try {
    const response = await fetch(agentDoneEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: record.request.source,
        session: record.session.sessionId,
        host: record.session.host,
      }),
    });
    if (!response.ok) return undefined;
    const answer = markDoneAnswerSchema.safeParse(await response.json());
    return answer.success ? answer.data.record : undefined;
  } catch {
    return undefined;
  }
}

// What asking the boundary to delete a record came to: what it did, or that
// it could not, with the reason it gave when it gave one.
export type DeleteRecordOutcome =
  | DeleteRecordAnswer
  | { readonly kind: "failed"; readonly reason: string | undefined };

const couldNotDelete = "The session record could not be deleted: ";

// Asks the boundary to delete the recorded session's record.
export async function requestDeleteRecord(
  record: LaunchRecord,
): Promise<DeleteRecordOutcome> {
  try {
    const response = await fetch(agentDeleteEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: record.request.source,
        session: record.session.sessionId,
        host: record.session.host,
      }),
    });
    const body: unknown = await response.json().catch(() => undefined);
    if (!response.ok) {
      const refused = refusal.safeParse(body);
      return {
        kind: "failed",
        reason: refused.success
          ? refused.data.error.replace(couldNotDelete, "")
          : undefined,
      };
    }
    const answer = deleteRecordAnswerSchema.safeParse(body);
    return answer.success ? answer.data : { kind: "failed", reason: undefined };
  } catch {
    return { kind: "failed", reason: undefined };
  }
}
