// Test Optimization Candidates pinned read for the local authenticated read
// boundary (../../server/intentCandidatesRead.ts): names only a pinned
// revision, admits no client path, and answers absent / unreadable / text
// for the fixed record path.

import { expect, test } from "../support/pageTest.ts";
import {
  developmentBoundary,
  startDashboardServer,
  type DashboardServer,
} from "../support/dashboardServer.ts";
import { everyRepository, publishes } from "../support/fakeGitHub.ts";
import { notFoundAnswer } from "../originAnswers.ts";
import { rawRequest } from "../support/rawHttp.ts";
import { testOptimizationCandidatesPath } from "../../src/testOptimizationCandidatesPath.ts";

test.describe.configure({ mode: "serial" });

const knownSourceId = "open-dough";
const backlog = `# Product backlog

## Taken

## Backlog list
`;
const settingsPath = ".planning/open-dough.json";
const settings = JSON.stringify({
  intent: {
    locations: [{ path: "dashboard/tests", kind: "typescript" }],
  },
});
const recordText = `# Test Optimization Candidates

## Pending candidates

None.

## Accepted necessary costs

None.

## Profile-only exclusions

None.

## Transferred obligations

None.
`;

const revisionOf = (byte: string) => byte.repeat(20);

test.describe("authenticated Intent candidates read (development environment)", () => {
  let server: DashboardServer;

  test.beforeAll(async () => {
    server = await startDashboardServer(developmentBoundary);
  });

  test.afterAll(async () => {
    await server.close();
  });

  test("answers the fixed record text at a pinned revision", async () => {
    const revision = revisionOf("c1");
    server.github.serve(
      everyRepository,
      publishes({
        revision,
        backlog,
        files: {
          [settingsPath]: settings,
          [testOptimizationCandidatesPath]: recordText,
        },
      }),
    );
    const response = await rawRequest({
      url: `${server.baseURL}/__authenticated-read?source=${knownSourceId}&revision=${revision}&intent=test-optimization-candidates`,
      headers: { Origin: server.origin },
    });
    expect(response.status).toBe(200);
    expect(JSON.parse(response.body)).toEqual({
      revision,
      candidates: recordText,
    });
  });

  test("answers absent when the fixed path is not published", async () => {
    const revision = revisionOf("c2");
    const published = publishes({
      revision,
      backlog,
      files: { [settingsPath]: settings },
    });
    // `publishes` falls back to the backlog for unnamed paths; absent is a
    // GitHub 404 for the fixed candidates path only.
    server.github.serve(everyRepository, async (call) => {
      if (
        call.request.kind === "content" &&
        call.request.path === testOptimizationCandidatesPath
      ) {
        return notFoundAnswer();
      }
      return published(call);
    });
    const response = await rawRequest({
      url: `${server.baseURL}/__authenticated-read?source=${knownSourceId}&revision=${revision}&intent=test-optimization-candidates`,
      headers: { Origin: server.origin },
    });
    expect(response.status).toBe(200);
    expect(JSON.parse(response.body)).toEqual({
      revision,
      candidates: null,
    });
  });

  test("answers unreadable distinctly when the fixed path cannot be read", async () => {
    const revision = revisionOf("c3");
    const published = publishes({
      revision,
      backlog,
      files: {
        [settingsPath]: settings,
        [testOptimizationCandidatesPath]: recordText,
      },
    });
    server.github.serve(everyRepository, async (call) => {
      if (
        call.request.kind === "content" &&
        call.request.path === testOptimizationCandidatesPath
      ) {
        return { exitCode: 1, stderr: "connection reset" };
      }
      return published(call);
    });
    const response = await rawRequest({
      url: `${server.baseURL}/__authenticated-read?source=${knownSourceId}&revision=${revision}&intent=test-optimization-candidates`,
      headers: { Origin: server.origin },
    });
    expect(response.status).toBe(200);
    expect(JSON.parse(response.body)).toEqual({
      revision,
      candidates: null,
      candidatesProblem: "unreadable",
    });
  });

  test("refuses a client-supplied path and any mix with other read parameters", async () => {
    const revision = revisionOf("c4");
    server.github.serve(
      everyRepository,
      publishes({
        revision,
        backlog,
        files: {
          [settingsPath]: settings,
          [testOptimizationCandidatesPath]: recordText,
        },
      }),
    );
    const withPath = await rawRequest({
      url: `${server.baseURL}/__authenticated-read?source=${knownSourceId}&revision=${revision}&intent=test-optimization-candidates&path=${encodeURIComponent(testOptimizationCandidatesPath)}`,
      headers: { Origin: server.origin },
    });
    expect(withPath.status).toBe(400);
    expect(withPath.body).toContain(
      "A Test Optimization Candidates read names only a pinned revision.",
    );

    const unpinned = await rawRequest({
      url: `${server.baseURL}/__authenticated-read?source=${knownSourceId}&intent=test-optimization-candidates`,
      headers: { Origin: server.origin },
    });
    expect(unpinned.status).toBe(400);

    const unknownIntent = await rawRequest({
      url: `${server.baseURL}/__authenticated-read?source=${knownSourceId}&revision=${revision}&intent=something-else`,
      headers: { Origin: server.origin },
    });
    expect(unknownIntent.status).toBe(400);
    expect(unknownIntent.body).toContain(
      "An Intent read names only a pinned revision and a known Intent request.",
    );
  });
});
