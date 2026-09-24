// The local authenticated read boundary (../server/authenticatedRead.ts) --
// the one reader for every catalog project -- is tested here directly against
// real HTTP and a real, but controlled, subprocess -- not through the
// browser. A synthetic `gh` on this suite's own isolated server process's
// PATH answers exactly as each test arranges through a fake GitHub, which
// records every invocation, so these tests can assert what the boundary
// refuses before ever launching `gh`, what it pins into `gh`'s arguments, and
// what it never repeats into a failure response.
//
// This spec covers what the boundary reads and reports: reachable record
// reads and failure reporting. Resolve-then-read for every catalog source, in
// both dev and preview launch modes with pinned `gh` arguments, is covered by
// ./authenticated-project-overview.spec.ts. Which requests it refuses before
// launching `gh` is covered in ./authenticated-read-refusal.spec.ts; its
// subprocess lifecycle -- cancellation on disconnect, timeout, and shutdown
// -- in ./authenticated-read-subprocess-lifecycle.spec.ts; reads on a story
// branch in ./authenticated-branch-read-boundary.spec.ts. All share this
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
import { everyRepository, failsWith, publishes } from "./support/fakeGitHub";
import { notLoggedIn } from "./originAnswers";
import { renderAgentProfile } from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import { rawRequest } from "./support/rawHttp";

test.describe.configure({ mode: "serial" });

const knownSourceId = "open-dough";
const knownRepository = "terryyin/open-dough";
const secretMarker = "gho_should-never-reach-a-browser-1234567890";

test.describe("authenticated read boundary (dev launch mode)", () => {
  let server: DashboardServer;
  const port = 4290;

  test.beforeAll(async () => {
    server = await startDashboardServer({ mode: "dev", port });
  });

  test.afterAll(async () => {
    await server.close();
  });

  test("answers a missing gh login with the selected project's actionable failure, never gh's own words", async () => {
    server.github.serve(
      everyRepository,
      failsWith(`${notLoggedIn.stderr}token file: ${secretMarker}\n`),
    );
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
    server.github.serve(everyRepository, failsWith(`fatal: ${secretMarker}\n`));
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
    server.github.serve(
      everyRepository,
      publishes({
        revision,
        backlog: backlogWithSeed,
        files: {
          ".planning/PRODUCT-BACKLOG.md": backlogWithSeed,
          [seedPath]: seedBody,
        },
      }),
    );
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

  test("answers when a listed agent profile was last committed, pinned once per revision and path, and refuses an unreached path before asking GitHub", async () => {
    const revision = "ef".repeat(20);
    const seedPath = ".planning/seeds/SEED-clock.md";
    const profilePath = ".planning/agents/yui-chan.json";
    const takenAt = "2026-09-23T08:30:00Z";
    const backlogTaken = `# Product backlog

## Taken

- [Clock story](seeds/SEED-clock.md#story) — SEED-clock#story

## Backlog list
`;
    server.github.serve(
      everyRepository,
      publishes({
        revision,
        backlog: backlogTaken,
        files: {
          ".planning/PRODUCT-BACKLOG.md": backlogTaken,
          [seedPath]: "# Seed\n\n**Identity:** SEED-clock#story\n",
          [profilePath]: renderAgentProfile({
            name: "Yui",
            identity: "SEED-clock#story",
            mode: "trunk",
            branch: "origin/main",
            host: undefined,
            model: undefined,
          }),
        },
        committed: { [profilePath]: new Date(takenAt) },
      }),
    );
    const read = (query: string) =>
      rawRequest({
        url: `${server.baseURL}/__authenticated-read?source=${knownSourceId}${query}`,
        headers: { Origin: server.origin },
      });
    // The membership and the canonical record are read first, as the page
    // reads them, so the records deciding reachability are already pinned.
    expect((await read("")).status).toBe(200);
    expect(
      (await read(`&revision=${revision}&path=${encodeURIComponent(seedPath)}`))
        .status,
    ).toBe(200);

    const commitTime = `&revision=${revision}&path=${encodeURIComponent(profilePath)}&committed=last`;
    let callsBefore = server.ghCalls().length;
    const answered = await read(commitTime);
    expect(answered.status).toBe(200);
    expect(JSON.parse(answered.body)).toEqual({
      revision,
      path: profilePath,
      committedAt: "2026-09-23T08:30:00.000Z",
    });
    // The profile directory's listing authorizes the path; the commit list
    // is asked at the pinned revision for that one path.
    expect(server.ghCalls().slice(callsBefore)).toEqual([
      [
        "api",
        "-H",
        "Accept: application/vnd.github+json",
        `repos/${knownRepository}/contents/.planning/agents?ref=${revision}`,
      ],
      [
        "api",
        `repos/${knownRepository}/commits?sha=${revision}&path=${encodeURIComponent(profilePath)}&per_page=1`,
        "--jq",
        ".[0].commit.committer.date",
      ],
    ]);

    callsBefore = server.ghCalls().length;
    expect((await read(commitTime)).status).toBe(200);
    expect(server.ghCalls()).toHaveLength(callsBefore);

    const unreached = await read(
      `&revision=${revision}&path=${encodeURIComponent(".planning/secrets/not-in-backlog.md")}&committed=last`,
    );
    expect(unreached.status).toBe(404);
    expect(JSON.parse(unreached.body)).toEqual({
      error: "That path is not reachable from this source revision.",
    });
    expect(server.ghCalls()).toHaveLength(callsBefore);
  });
});
