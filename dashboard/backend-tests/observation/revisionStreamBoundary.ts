// Helpers for the authenticated read boundary's revision-stream specs
// (./authenticated-read-revision-stream.spec.ts): a lowered-pace development
// or preview server, stream URLs, EventSource-shaped opens, settling within a
// bound, matching-refs accounting and fixed failing answers against the
// synthetic `gh`.

import { expect } from "../../tests/support/pageTest.ts";
import {
  sharedDashboardBuild,
  developmentBoundary,
  startDashboardServer,
  type DashboardServer,
} from "../../tests/support/dashboardServer.ts";
import type { OriginAnswer } from "../../tests/originAnswers.ts";
import type { RepositoryAnswerer } from "../../tests/support/fakeGitHub.ts";
import type { GhRequest } from "../../tests/support/ghRequest.ts";
import { openEventStream, rawRequest } from "../../tests/support/rawHttp.ts";
import { askedSince } from "../../tests/support/sharedReads.ts";

export const paceMs = 80;

// Answers as `published` does, except each request kind in `fixed` with its
// fixed answer, such as a failing matching-refs listing.
export function answeringInstead(
  published: RepositoryAnswerer,
  fixed: Partial<Record<GhRequest["kind"], OriginAnswer>>,
): RepositoryAnswerer {
  return (call) => {
    const answer = fixed[call.request.kind];
    return answer === undefined ? published(call) : Promise.resolve(answer);
  };
}

// What `answer` settles to, or timed out when it has not settled within `ms`.
export function settledWithin<T>(
  answer: Promise<T>,
  ms: number,
): Promise<{ timedOut: false; value: T } | { timedOut: true }> {
  return Promise.race([
    answer.then((value) => ({ timedOut: false as const, value })),
    new Promise<{ timedOut: true }>((resolve) =>
      setTimeout(() => {
        resolve({ timedOut: true });
      }, ms),
    ),
  ]);
}

export async function streamServer(
  extraEnv: Readonly<Record<string, string>> = {},
  mode: "boundary" | "preview" = "boundary",
): Promise<DashboardServer> {
  return startDashboardServer({
    ...(mode === "boundary"
      ? developmentBoundary
      : { mode: "preview", prebuilt: sharedDashboardBuild }),
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
