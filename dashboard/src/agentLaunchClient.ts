// The browser's requests to the local launch boundary
// (`../server/agentLaunchPlugin.ts`): an ordinary same-origin JSON POST that
// launches, a GET of one project's launch records, and a POST that marks one
// recorded session done. Every launch outcome
// answers with a launch result; a refusal answers an error the boundary
// explains. What it answers crossed a process/HTTP boundary, so it is checked
// as external input. When no launch answer can be trusted, the launch may or
// may not have started a session, and the result says so.

import { z } from "zod";
import {
  agentLaunchEndpoint,
  launchRecordsSchema,
  launchResultSchema,
  type AgentLaunchRequest,
  type LaunchRecord,
  type LaunchWithState,
  type LaunchResult,
} from "./agentLaunch.ts";
import { agentDoneEndpoint, markDoneAnswerSchema } from "./doneMark.ts";

const refusal = z.object({ error: z.string().min(1) });

// Why nothing was, or may not have been, launched. The boundary's reason
// categories are not needed by the card.
export type LaunchProblem = {
  readonly kind: "failed" | "uncertain";
  readonly explanation: string;
};

// What the card shows: a launched record, or a launch problem.
export type LaunchAnswer =
  Extract<LaunchResult, { readonly kind: "launched" }> | LaunchProblem;

const checkAgents = "Check `claude agents` for it before starting again.";

function noTrustedAnswer(what: string): LaunchAnswer {
  return {
    kind: "uncertain",
    explanation: `The local dashboard server ${what}, so the session may or may not have started. ${checkAgents}`,
  };
}

export async function requestAgentLaunch(
  request: AgentLaunchRequest,
): Promise<LaunchAnswer> {
  let response: Response;
  try {
    response = await fetch(agentLaunchEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
  } catch {
    return noTrustedAnswer("could not be reached");
  }
  const body: unknown = await response.json().catch(() => undefined);
  if (!response.ok) {
    // A refusal happens before any host process starts.
    const refused = refusal.safeParse(body);
    return refused.success
      ? {
          kind: "failed",
          explanation: `${refused.data.error} Nothing was launched.`,
        }
      : noTrustedAnswer(`answered HTTP ${String(response.status)}`);
  }
  const result = launchResultSchema.safeParse(body);
  return result.success
    ? result.data
    : noTrustedAnswer("answered in a shape this dashboard does not understand");
}

// The launch records this machine keeps for one project, oldest first, each
// with its session's current state, or undefined when no trustworthy answer
// came.
export async function readLaunchRecords(
  sourceId: string,
): Promise<readonly LaunchWithState[] | undefined> {
  try {
    const response = await fetch(
      `${agentLaunchEndpoint}?source=${encodeURIComponent(sourceId)}`,
    );
    if (!response.ok) return undefined;
    const answer = launchRecordsSchema.safeParse(await response.json());
    return answer.success ? answer.data.records : undefined;
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
      }),
    });
    if (!response.ok) return undefined;
    const answer = markDoneAnswerSchema.safeParse(await response.json());
    return answer.success ? answer.data.record : undefined;
  } catch {
    return undefined;
  }
}
