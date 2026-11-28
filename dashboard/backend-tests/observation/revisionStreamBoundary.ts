// Helpers for the authenticated read boundary's revision-stream specs
// (./authenticated-read-revision-stream.spec.ts): a lowered-pace development
// or preview server, stream URLs, EventSource-shaped opens, settling within a
// bound, and a counted Git origin.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { RevisionFacts } from "../../../Distribution/tests/support/repositoryTestData.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { materializeRepository } from "../../../Distribution/tests/support/repository-fixture.mjs";
import { homeReviewRepository } from "../../test-support/support/reviewRepositoryFixture.ts";
import {
  heldUploadPack,
  signalFifo,
} from "../review/verifiedOriginTrunkCase.ts";
import {
  sharedDashboardBuild,
  developmentBoundary,
  startDashboardServer,
  type DashboardServer,
} from "../../test-support/support/dashboardServer.ts";
import { openEventStream } from "../../test-support/support/rawHttp.ts";

type StreamEndpoint = Pick<DashboardServer, "baseURL" | "origin">;

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
      DOUGH_REVISION_STREAM_MS: "80",
      ...extraEnv,
    },
  });
}

export function streamUrl(
  server: StreamEndpoint,
  query: string,
  source = "open-dough",
): string {
  return `${server.baseURL}/__authenticated-read?source=${source}${query}`;
}

export function openStream(
  server: StreamEndpoint,
  query: string,
  headers: Readonly<Record<string, string>> = {},
) {
  return openEventStream({
    url: streamUrl(server, query),
    headers: { Origin: server.origin, ...headers },
  });
}

// The boundary really probes and fetches this origin. A case can hold one
// transfer or leave the gate counting all operations without holding them.
export async function streamOrigin(
  home: string,
  heldFrom = Number.MAX_SAFE_INTEGER,
  older: RevisionFacts = { backlog: { taken: [] } },
) {
  const repository = await materializeRepository(
    makeMe.aRepository
      .withRevision("older", older)
      .withRevision("published", {
        files: { "publication.txt": "Second commit.\n" },
      })
      .please(),
  );
  const review = homeReviewRepository(home);
  const pack = heldUploadPack(repository.fixture, review, repository.origin, {
    heldFrom,
  });
  return {
    review,
    repository,
    pack,
    operations: () =>
      readFileSync(pack.log, "utf8")
        .split("\n")
        .filter((line) => line === "call").length,
    blockConfirmationWrite() {
      mkdirSync(path.join(review, "open-dough-board-confirmation.json.tmp"));
    },
    failOriginProbe(failure: "unavailable" | "credentials") {
      const stderr =
        failure === "credentials"
          ? "echo 'fatal: could not read Username' >&2\n"
          : "";
      writeFileSync(pack.gate, `#!/bin/sh\n${stderr}exit 128\n`);
    },
    close: async () => {
      await signalFifo(pack.releaseFifo, false);
      await repository.cleanup();
    },
  };
}

export async function withStreamOrigin<
  Server extends {
    readonly home: string;
    close(): Promise<void>;
  },
>(
  server: Server,
  prove: (
    origin: Awaited<ReturnType<typeof streamOrigin>>,
    server: Server,
  ) => Promise<void>,
  older?: RevisionFacts,
): Promise<void> {
  let origin: Awaited<ReturnType<typeof streamOrigin>> | undefined;
  try {
    origin = await streamOrigin(server.home, undefined, older);
    await prove(origin, server);
  } finally {
    try {
      await server.close();
    } finally {
      await origin?.close();
    }
  }
}
