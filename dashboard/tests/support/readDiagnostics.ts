// Shared helpers for local authenticated-read diagnostics inspection
// (`../authenticated-read-diagnostics.spec.ts` and
// `../authenticated-read-diagnostics-bounds.spec.ts`).

import {
  startDashboardServer,
  type DashboardServer,
} from "./dashboardServer.ts";
import { rawRequest } from "./rawHttp.ts";

export const knownSourceId = "open-dough";
export const secretMarker = "gho_should-never-reach-a-browser-1234567890";
export const oversized = "x".repeat(257);

export type DiagnosticFailure = {
  readonly at: string;
  readonly source: string;
  readonly category: string;
  readonly pin?: string;
  readonly cause: string;
  readonly elapsedMs: number;
  readonly status?: number;
  readonly requestId?: string;
  readonly rateLimit?: {
    readonly limit?: number;
    readonly remaining?: number;
    readonly reset?: number;
    readonly resource?: string;
    readonly retryAfterSeconds?: number;
  };
};

export function diagnosticsUrl(
  server: DashboardServer,
  source = knownSourceId,
) {
  return `${server.baseURL}/__authenticated-read-diagnostics?source=${source}`;
}

export async function inspect(
  server: DashboardServer,
  source = knownSourceId,
): Promise<{
  readonly status: number;
  readonly body: string;
  readonly failures: DiagnosticFailure[];
}> {
  const response = await rawRequest({
    url: diagnosticsUrl(server, source),
    headers: { Origin: server.origin },
  });
  const parsed = JSON.parse(response.body) as {
    failures?: DiagnosticFailure[];
    error?: string;
  };
  return {
    status: response.status,
    body: response.body,
    failures: parsed.failures ?? [],
  };
}

export { startDashboardServer, type DashboardServer };
