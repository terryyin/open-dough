// Helpers for the authenticated read boundary's revision-stream specs
// (./authenticated-read-revision-stream.spec.ts): a lowered-pace development
// or preview server, stream URLs, EventSource-shaped opens, and matching-refs
// accounting against the synthetic `gh`.

import { expect } from "../../tests/support/pageTest.ts";
import {
  builtDashboardDir,
  developmentBoundary,
  startDashboardServer,
  type DashboardServer,
} from "../../tests/support/dashboardServer.ts";
import { openEventStream, rawRequest } from "../../tests/support/rawHttp.ts";
import { askedSince } from "../../tests/support/sharedReads.ts";

export const paceMs = 80;

export async function streamServer(
  extraEnv: Readonly<Record<string, string>> = {},
  mode: "boundary" | "preview" = "boundary",
): Promise<DashboardServer> {
  return startDashboardServer({
    ...(mode === "boundary"
      ? developmentBoundary
      : { mode: "preview", prebuilt: builtDashboardDir }),
    extraEnv: {
      DOUGH_REVISION_STREAM_MS: String(paceMs),
      ...extraEnv,
    },
  });
}

export function streamUrl(
  server: DashboardServer,
  query: string,
  source = "open-dough",
): string {
  return `${server.baseURL}/__authenticated-read?source=${source}${query}`;
}

export function openStream(
  server: DashboardServer,
  query: string,
  headers: Readonly<Record<string, string>> = {},
) {
  return openEventStream({
    url: streamUrl(server, query),
    headers: { Origin: server.origin, ...headers },
  });
}

export function matchingRefsSince(
  server: DashboardServer,
  before: number,
): number {
  return askedSince(server, before).filter((ask) => ask === "matching-refs")
    .length;
}

export async function warmProfiles(
  server: DashboardServer,
  revision: string,
): Promise<void> {
  expect(
    (
      await rawRequest({
        url: streamUrl(server, `&revision=${revision}&agents=profiles`),
        headers: { Origin: server.origin },
      })
    ).status,
  ).toBe(200);
}
