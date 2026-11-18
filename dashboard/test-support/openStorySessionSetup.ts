// Test setup when an earlier open story session would block a later start:
// close every still-open launch record, or build a launch request for a
// distinct story identity.

import { expect } from "@playwright/test";
import {
  launchRequest,
  markDone,
  machineSessions,
} from "./agentLaunchBoundary.ts";
import type { DashboardServer } from "./support/dashboardServer.ts";

// Marks every still-open launch record done so a later start of the same
// story is not refused for an open session. Used by specs that relaunch the
// same identity after an earlier successful launch on a shared server.
export async function closeOpenSessions(
  server: DashboardServer,
  source?: string,
): Promise<void> {
  for (const listed of await machineSessions(server)) {
    const record = listed as {
      request: { source: string };
      session: { sessionId: string; host?: string };
      doneAt?: string;
    };
    if (record.doneAt !== undefined) continue;
    if (source !== undefined && record.request.source !== source) continue;
    const response = await markDone(server, {
      source: record.request.source,
      session: record.session.sessionId,
      ...(record.session.host === undefined
        ? {}
        : { host: record.session.host }),
    });
    expect(response.status, response.body).toBe(200);
  }
}

// A launch request for another story so it can stay open beside an existing
// open session of `base`'s identity.
export function distinctStoryRequest(
  label: string,
  base: typeof launchRequest = launchRequest,
  title = `${base.title} ${label}`,
): typeof launchRequest {
  return {
    ...base,
    identity: `${base.identity}#${label}`,
    title,
  };
}
