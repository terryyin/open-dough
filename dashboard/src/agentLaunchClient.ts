// The one request the browser makes to the local launch boundary
// (`../server/agentLaunchPlugin.ts`): an ordinary same-origin JSON POST. Every
// launch outcome answers with a launch result; a refusal answers an error the
// boundary explains. What it answers crossed a process/HTTP boundary, so it is
// checked as external input. When no answer can be trusted, the launch may or
// may not have started a session, and the result says so.

import { z } from "zod";
import {
  agentLaunchEndpoint,
  launchResultSchema,
  type AgentLaunchRequest,
  type LaunchResult,
} from "./agentLaunch.ts";

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
