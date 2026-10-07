// What a rate limit GitHub directed reaches beyond reads of its own server
// process (../server/readAdmission.ts), and what starts no wait, at the local
// authenticated read boundary over real HTTP with the synthetic `gh`
// (./support/sharedReads.ts publishes the revision): a rate-limited setting
// file fails its read with the limit rather than being taken as absent; a
// second server asks at once; adding a project while the wait stands is held
// back like a read; and an unmarked `403`, a `404`, a timeout, and an
// unreachable GitHub hold back nothing. How the wait holds back every
// read of its process: ./authenticated-read-cooldown.spec.ts.

import { expect, test } from "./support/pageTest.ts";
import {
  startDashboardServer,
  type DashboardServer,
} from "./support/dashboardServer.ts";
import {
  everyRepository,
  hangs,
  startFakeGitHub,
  type RepositoryAnswerer,
} from "./support/fakeGitHub.ts";
import type { GhRequest } from "./support/ghRequest.ts";
import { onServerOfItsOwn } from "./support/directedWait.ts";
import {
  expectHeldBack,
  heldBackPattern,
  servedRefusing,
  timedRead,
} from "./support/heldBackReads.ts";
import { projectAddMachine } from "./support/projectAddMachine.ts";
import { rawRequest } from "./support/rawHttp.ts";
import {
  noConnection,
  notFoundAnswer,
  rateLimitedAnswer,
} from "./originAnswers.ts";
import {
  askedSince,
  readAt,
  sharedReadsPublished,
  sharedSeedPath,
  sharedSeedRead,
  sharedSeedText,
} from "./support/sharedReads.ts";
import { agentSettingsPath } from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";

const revision = "c3".repeat(20);
const profilesRead = `&revision=${revision}&agents=profiles`;
const isContent = (request: GhRequest, path: string) =>
  request.kind === "content" && request.path === path;

test.describe("authenticated read boundary: what a directed rate limit reaches beyond its own process's reads (dev launch mode)", () => {
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

  test("a second server on the same GitHub asks at once while the first still holds back its reads", async () => {
    const github = await startFakeGitHub();
    const limited = await startDashboardServer({ mode: "dev", github });
    let server: DashboardServer | undefined;
    try {
      servedRefusing(limited, revision, (request) =>
        request.kind === "ref"
          ? rateLimitedAnswer(429, { "Retry-After": "600" })
          : undefined,
      );
      const refused = await timedRead(limited, "");
      expect(refused.body).toMatchObject({ retryAfterSeconds: 600 });
      server = await startDashboardServer({ mode: "dev", github });
      const before = github.calls.length;
      const asked = await readAt(server, `&revision=${revision}`);
      expect(asked.status).toBe(200);
      expect(askedSince(server, before)).toEqual([
        `content .planning/PRODUCT-BACKLOG.md@${revision}`,
      ]);
      expectHeldBack(
        await timedRead(limited, `&revision=${revision}`),
        refused,
        "the first server",
      );
      expect(askedSince(server, before)).toHaveLength(1);
    } finally {
      await server?.close();
      await limited.close();
      await github.close();
    }
  });
});

test.describe("authenticated read boundary: adding a project while a directed rate limit stands", () => {
  let fixture: ReturnType<typeof projectAddMachine>;
  test.beforeEach(() => {
    fixture = projectAddMachine();
  });
  test.afterEach(async () => fixture.close());

  test("a check GitHub limits says so, and later additions and reads are held back without asking GitHub", async () => {
    await onServerOfItsOwn(
      async (server) => {
        servedRefusing(server, revision, (request) =>
          request.kind === "repository"
            ? rateLimitedAnswer(429, { "Retry-After": "600" })
            : undefined,
        );
        const add = () =>
          rawRequest({
            url: `${server.baseURL}/__project-configuration/add`,
            method: "POST",
            headers: {
              Origin: server.origin,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              githubUrl: "https://github.com/example/sample-app",
              localPath: "~/work/private-checkout",
            }),
          });
        const limited = await add();
        expect(limited.status).toBe(400);
        expect(JSON.parse(limited.body)).toEqual({
          field: "githubUrl",
          error:
            "GitHub limited the rate of the local GitHub CLI's requests while checking the repository example/sample-app. Try again in 600 seconds.",
        });
        const limitedAt = Date.now();
        const before = server.github.calls.length;

        const heldBack = await add();
        expect(heldBack.status).toBe(400);
        const { field, error } = JSON.parse(heldBack.body) as {
          field: string;
          error: string;
        };
        expect(field).toBe("githubUrl");
        const seconds = Number(
          /^GitHub limited the rate of the local GitHub CLI's requests, so the repository example\/sample-app was not asked of GitHub\. Try again in (\d+) seconds\.$/.exec(
            error,
          )?.[1],
        );
        expect(seconds).toBeGreaterThan(590);
        expect(seconds).toBeLessThanOrEqual(600);

        const read = await timedRead(server, "");
        expect(read.status).toBe(502);
        expect(read.body.error).toMatch(heldBackPattern);
        expect(
          read.arrivedAt + (read.body.retryAfterSeconds ?? 0) * 1000,
        ).toBeGreaterThanOrEqual(limitedAt + 599_000);
        expect(askedSince(server, before)).toEqual([]);
      },
      { mode: "dev", machine: fixture.machine },
    );
  });
});

test.describe("authenticated read boundary: failures that direct no wait hold back nothing (dev launch mode)", () => {
  let server: DashboardServer;
  // Short enough to observe a timeout, long enough for every answered read.
  const boundMs = 5_000;

  test.beforeAll(async () => {
    server = await startDashboardServer({
      mode: "dev",
      readTimeoutMs: boundMs,
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
