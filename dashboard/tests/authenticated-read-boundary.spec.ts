// The local authenticated read boundary (../server/authenticatedRead.ts) --
// the one reader for every catalog project -- is tested here directly against
// real HTTP and a real, but controlled, subprocess -- not through the
// browser. A synthetic `gh` on this suite's own isolated server process's
// PATH answers exactly as each test arranges through a fake GitHub, which
// records every invocation, so these tests can assert what the boundary
// refuses before ever launching `gh`, what it pins into `gh`'s arguments, and
// what it never repeats into a failure response.
//
// This spec covers what the boundary reads and reports: successful
// resolve-then-read for every catalog source, reachable record reads,
// failure reporting, and dev/preview parity. Which requests it refuses before
// launching `gh` is covered in ./authenticated-read-refusal.spec.ts; its
// subprocess lifecycle -- cancellation on disconnect, timeout, and shutdown
// -- in ./authenticated-read-subprocess-lifecycle.spec.ts. All share this
// suite's harness (./support/dashboardServer.ts).
//
// This spec's servers are separate processes, each with its own PATH and its
// own fake `gh`, so nothing here can leak into -- or race with -- the page
// journeys' own servers.

import { expect, test } from "@playwright/test";
import {
  startDashboardServer,
  type DashboardServer,
} from "./support/dashboardServer";
import { notLoggedIn } from "./originAnswers";
import { rawRequest } from "./support/rawHttp";

test.describe.configure({ mode: "serial" });

const knownSourceId = "open-dough";
const knownRepository = "terryyin/open-dough";
const revision = "ab".repeat(20);
const backlog = "# Product backlog\n\n## Taken\n\n## Backlog list\n";
const secretMarker = "gho_should-never-reach-a-browser-1234567890";

// Every catalog source is answered by the same boundary through its own
// repository; none has a separate transport.
const catalogSources = [
  { id: "open-dough", repository: "terryyin/open-dough" },
  { id: "doughnut", repository: "nerds-odd-e/doughnut" },
  { id: "pygardon", repository: "terryyin/pygardon" },
] as const;

function membershipCalls(repository: string, pinned: string): string[][] {
  return [
    ["api", `repos/${repository}/commits/main`, "--jq", ".sha"],
    [
      "api",
      "-H",
      "Accept: application/vnd.github.raw+json",
      `repos/${repository}/contents/.planning/PRODUCT-BACKLOG.md?ref=${pinned}`,
    ],
  ];
}

test.describe("authenticated read boundary (dev launch mode)", () => {
  let server: DashboardServer;
  const port = 4290;

  test.beforeAll(async () => {
    server = await startDashboardServer({ mode: "dev", port });
  });

  test.afterAll(async () => {
    await server.close();
  });

  for (const { id, repository } of catalogSources) {
    test(`resolves ${id}'s own repository ref then reads its backlog pinned to that resolved revision`, async () => {
      server.setControl({ mode: "normal", revision, backlog });
      const callsBefore = server.ghCalls().length;
      const response = await rawRequest({
        url: `${server.baseURL}/__authenticated-read?source=${id}`,
        headers: { Origin: server.origin },
      });
      expect(response.status).toBe(200);
      expect(response.headers["cache-control"]).toBe("no-store");
      expect(JSON.parse(response.body)).toEqual({ revision, backlog });
      expect(server.ghCalls().slice(callsBefore)).toEqual(
        membershipCalls(repository, revision),
      );
    });
  }

  test("answers a missing gh login with the selected project's actionable failure, never gh's own words", async () => {
    server.setControl({
      mode: "error",
      errorMessage: `${notLoggedIn.stderr}token file: ${secretMarker}\n`,
    });
    const response = await rawRequest({
      url: `${server.baseURL}/__authenticated-read?source=pygardon`,
      headers: { Origin: server.origin },
    });
    expect(response.status).toBe(502);
    expect(response.headers["cache-control"]).toBe("no-store");
    expect(JSON.parse(response.body)).toEqual({
      error:
        "The local GitHub CLI is not logged in, so main of terryyin/pygardon could not be read. Run `gh auth login` (check with `gh auth status`), then press Retry.",
    });
    expect(response.body).not.toContain(secretMarker);
    expect(response.body).not.toContain("GH_TOKEN");
  });

  test("never forwards gh's raw stderr or a credential-like marker into the failure response", async () => {
    const callsBefore = server.ghCalls().length;
    server.setControl({
      mode: "error",
      errorMessage: `fatal: ${secretMarker}\n`,
    });
    const response = await rawRequest({
      url: `${server.baseURL}/__authenticated-read?source=${knownSourceId}`,
      headers: { Origin: server.origin },
    });
    expect(response.status).toBe(502);
    expect(response.body).not.toContain(secretMarker);
    expect(response.body).not.toContain("fatal:");
    // The ref resolution itself failed, so the content read is never
    // attempted with whatever partial/undefined revision that would imply.
    expect(server.ghCalls()).toHaveLength(callsBefore + 1);
  });

  test("reads an allowlisted canonical path pinned to the supplied revision, reusing records already read at that revision", async () => {
    // Content at one commit never changes, so this case publishes its
    // different backlog at its own revision.
    const revision = "cd".repeat(20);
    const seedPath = ".planning/seeds/SEED-boundary.md";
    const seedBody = "# Seed\n\n**Identity:** SEED-boundary#story\n";
    const backlogWithSeed = `# Product backlog

## Taken

## Backlog list

- [Boundary story](seeds/SEED-boundary.md#story) — SEED-boundary#story
`;
    server.setControl({
      mode: "normal",
      revision,
      backlog: backlogWithSeed,
      files: {
        ".planning/PRODUCT-BACKLOG.md": backlogWithSeed,
        [seedPath]: seedBody,
      },
    });
    const membership = await rawRequest({
      url: `${server.baseURL}/__authenticated-read?source=${knownSourceId}`,
      headers: { Origin: server.origin },
    });
    expect(membership.status).toBe(200);
    const callsBefore = server.ghCalls().length;
    const response = await rawRequest({
      url: `${server.baseURL}/__authenticated-read?source=${knownSourceId}&revision=${revision}&path=${encodeURIComponent(seedPath)}`,
      headers: { Origin: server.origin },
    });
    expect(response.status).toBe(200);
    // The backlog read at this revision already decided reachability; only
    // the record itself is asked of GitHub.
    expect(server.ghCalls().slice(callsBefore)).toEqual([
      [
        "api",
        "-H",
        "Accept: application/vnd.github.raw+json",
        `repos/${knownRepository}/contents/.planning/seeds/SEED-boundary.md?ref=${revision}`,
      ],
    ]);
    expect(response.headers["cache-control"]).toBe("no-store");
    const body = JSON.parse(response.body) as {
      revision: string;
      path: string;
      text: string;
    };
    expect(body.revision).toBe(revision);
    expect(body.path).toBe(seedPath);
    expect(body.text).toBe(seedBody);
  });
});

test.describe("authenticated read boundary (preview launch mode)", () => {
  test("configurePreviewServer mounts the identical middleware for every catalog source", async () => {
    const server = await startDashboardServer({
      mode: "preview",
      port: 4293,
    });
    try {
      server.setControl({ mode: "normal", revision, backlog });
      for (const { id, repository } of catalogSources) {
        const callsBefore = server.ghCalls().length;
        const response = await rawRequest({
          url: `${server.baseURL}/__authenticated-read?source=${id}`,
          headers: { Origin: server.origin },
        });
        expect(response.status).toBe(200);
        expect(JSON.parse(response.body)).toEqual({ revision, backlog });
        expect(response.headers["cache-control"]).toBe("no-store");
        expect(server.ghCalls().slice(callsBefore)).toEqual(
          membershipCalls(repository, revision),
        );
      }
    } finally {
      await server.close();
    }
  });
});
