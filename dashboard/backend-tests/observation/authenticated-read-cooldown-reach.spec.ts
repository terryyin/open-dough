// What a rate limit GitHub directed reaches beyond reads of its own server
// process (github-request-admission.mjs), and what starts no wait, at the local
// authenticated read boundary over real HTTP with the synthetic `gh`
// (../../test-support/support/sharedReads.ts publishes the revision): a rate-limited setting
// file fails its read with the limit rather than being taken as absent; a
// project can be added through Git while the API wait stands; and an unmarked
// `403`, a `404`, a timeout, and an unreachable GitHub hold back nothing. How
// the wait holds back every read of its process:
// ./authenticated-read-cooldown.spec.ts. Shared-owner wiring belongs to
// ./shared-request-owner.spec.ts; actual login isolation belongs to
// ../../../Distribution/tests/skills/dough-execute-plan/github-request-login.test.mjs.

import { expect, test } from "../../test-support/support/pageTest.ts";
import {
  developmentBoundary,
  startDashboardServer,
  type DashboardServer,
} from "../../test-support/support/dashboardServer.ts";
import {
  everyRepository,
  hangs,
  publishes,
  type RepositoryAnswerer,
} from "../../test-support/support/fakeGitHub.ts";
import type { GhRequest } from "../../test-support/support/ghRequest.ts";
import { onServerOfItsOwn } from "../../test-support/support/directedWait.ts";
import {
  heldBackPattern,
  servedRefusing,
  timedRead,
} from "../../test-support/support/heldBackReads.ts";
import {
  addedBranch,
  addedLocalPath,
  addedRepository,
  projectAddMachine,
} from "../../test-support/support/projectAddMachine.ts";
import { rawRequest } from "../../test-support/support/rawHttp.ts";
import {
  noConnection,
  notFoundAnswer,
  rateLimitedAnswer,
} from "../../test-support/originAnswers.ts";
import {
  askedSince,
  readAt,
  sharedReadsPublished,
  sharedSeedPath,
  sharedSeedRead,
  sharedSeedText,
} from "../../test-support/support/sharedReads.ts";
import { agentSettingsPath } from "../../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";

const revision = "c3".repeat(20);
const profilesRead = `&revision=${revision}&agents=profiles`;
const isContent = (request: GhRequest, path: string) =>
  request.kind === "content" && request.path === path;

test.describe("authenticated read boundary: what a directed rate limit reaches beyond its own process's reads (development environment)", () => {
  test("a setting file GitHub's rate limit refuses fails the profile read with the limit, never answering it as absent", async () => {
    await onServerOfItsOwn(async (limited) => {
      servedRefusing(limited, revision, (request) =>
        isContent(request, agentSettingsPath)
          ? rateLimitedAnswer(429, { "Retry-After": "600" })
          : undefined,
      );
      const refused = await timedRead(limited, profilesRead);
      expect({ status: refused.status, body: refused.body }).toEqual({
        status: 502,
        body: {
          error: `GitHub limited the rate of the local GitHub CLI's requests (HTTP 429) while reading ${agentSettingsPath} at ${revision}. GitHub asked to wait 600 seconds before asking again.`,
          retryAfterSeconds: 600,
        },
      });
    });
  });
});

test.describe("authenticated read boundary: adding a project while a directed rate limit stands", () => {
  let fixture: ReturnType<typeof projectAddMachine>;
  test.beforeEach(() => {
    fixture = projectAddMachine();
  });
  test.afterEach(async () => fixture.close());

  test("Add discovers the branch through Git while API reads remain held back", async () => {
    await onServerOfItsOwn(
      async (server) => {
        server.github.serve(
          addedRepository,
          publishes({ defaultBranch: addedBranch }),
        );
        servedRefusing(server, revision, (request) =>
          isContent(request, sharedSeedPath)
            ? rateLimitedAnswer(429, { "Retry-After": "600" })
            : undefined,
        );
        const limited = await timedRead(server, sharedSeedRead(revision));
        expect(limited.status).toBe(502);
        expect(limited.body.retryAfterSeconds).toBe(600);
        const before = server.github.calls.length;
        const added = await rawRequest({
          url: `${server.baseURL}/__project-configuration/add`,
          method: "POST",
          headers: {
            Origin: server.origin,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            githubUrl: `https://github.com/${addedRepository}`,
            localPath: addedLocalPath,
          }),
        });
        expect(added.status).toBe(200);
        expect(JSON.parse(added.body)).toMatchObject({
          project: { repository: addedRepository, ref: addedBranch },
        });

        const read = await timedRead(server, "");
        expect(read.status).toBe(502);
        expect(read.body.error).toMatch(heldBackPattern);
        expect(
          read.arrivedAt + (read.body.retryAfterSeconds ?? 0) * 1000,
        ).toBeGreaterThanOrEqual(limited.arrivedAt + 599_000);
        expect(askedSince(server, before)).toEqual([]);
      },
      { ...developmentBoundary, machine: fixture.machine },
    );
  });
});

test.describe("authenticated read boundary: failures that direct no wait hold back nothing (development environment)", () => {
  let server: DashboardServer;
  // Short enough to observe a timeout, long enough for every answered read.
  const boundMs = 5_000;

  test.beforeAll(async () => {
    server = await startDashboardServer({
      ...developmentBoundary,
      readTimeoutMs: boundMs,
      liveServer: "the server reads the GitHub request bound once per process",
    });
  });

  test.afterAll(async () => {
    await server.close();
  });

  const failures: ReadonlyArray<{
    readonly label: string;
    readonly answer: RepositoryAnswerer;
  }> = [
    {
      label: "an unmarked 403",
      answer: () =>
        Promise.resolve({
          status: 403,
          contentType: "application/json; charset=utf-8",
          body: JSON.stringify({
            message: "Resource not accessible by integration",
          }),
        }),
    },
    { label: "a 404", answer: () => Promise.resolve(notFoundAnswer()) },
    {
      label: "an unreachable GitHub",
      answer: () => Promise.resolve(noConnection),
    },
    { label: "a timeout", answer: hangs },
  ];

  for (const [index, failure] of failures.entries()) {
    test(`after ${failure.label}, the next read reaches GitHub and is answered`, async () => {
      const at = String(index + 1)
        .padStart(2, "0")
        .repeat(20);
      const published = sharedReadsPublished(at);
      let failing = true;
      server.github.serve(everyRepository, (call) =>
        failing && isContent(call.request, sharedSeedPath)
          ? failure.answer(call)
          : published(call),
      );
      const failed = await readAt(server, sharedSeedRead(at));
      expect(failed.status).toBe(502);
      expect(JSON.parse(failed.body)).not.toHaveProperty("retryAfterSeconds");
      failing = false;
      const before = server.github.calls.length;
      const next = await readAt(server, sharedSeedRead(at));
      expect(next.status).toBe(200);
      expect(JSON.parse(next.body)).toMatchObject({ text: sharedSeedText });
      expect(askedSince(server, before)).toEqual([
        `content ${sharedSeedPath}@${at}`,
      ]);
    });
  }
});
