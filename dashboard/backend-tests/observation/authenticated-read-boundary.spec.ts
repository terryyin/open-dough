// The local authenticated read boundary (../../server/authenticatedRead.ts) --
// the one reader for every catalog project -- is tested here directly against
// real HTTP and a real, but controlled, subprocess -- not through the
// browser. A synthetic `gh` on this suite's own isolated server process's
// PATH answers exactly as each test arranges through a fake GitHub, which
// records every invocation, so these tests can assert what the boundary
// refuses before ever launching `gh`, what it pins into `gh`'s arguments, and
// what it never repeats into a failure response.
//
// This spec covers what the boundary reads and reports: reachable record
// reads and failure reporting. Resolve-then-read for every catalog source
// from the page, with pinned `gh` arguments, is covered by
// ../../tests/observation/authenticated-project-observation.spec.ts; that the dev server answers a
// read as the preview does, by ../runtime/serving-modes.spec.ts. Which requests it refuses before
// launching `gh` is covered in ./authenticated-read-refusal.spec.ts, and
// which commit added an agent profile in
// ./authenticated-read-profile-addition.spec.ts; when a reachable record was
// last committed, and refusal without asking for an unreachable path, in
// ./authenticated-read-committed-last.spec.ts; which backlog a membership
// read or a read at a known revision answers, and when it asks GitHub for it,
// in ./authenticated-read-revision-backlog.spec.ts; its
// subprocess lifecycle -- cancellation on disconnect, timeout, and shutdown
// -- in ./authenticated-read-subprocess-lifecycle.spec.ts; reads on a story
// branch in ./authenticated-branch-read-boundary.spec.ts. All share this
// suite's harness (../../tests/support/dashboardServer.ts).
//
// This spec's servers are separate processes, each with its own PATH and its
// own fake `gh`, so nothing here can leak into -- or race with -- the page
// journeys' own servers.

import { expect, test } from "../../tests/support/pageTest.ts";
import {
  developmentBoundary,
  startDashboardServer,
  type DashboardServer,
} from "../../tests/support/dashboardServer.ts";
import {
  everyRepository,
  failsWith,
  publishes,
} from "../../tests/support/fakeGitHub.ts";
import { notLoggedIn } from "../../tests/originAnswers.ts";
import { rawRequest } from "../../tests/support/rawHttp.ts";
import { makeMe } from "../../../tests/support/makeMe.mjs";
import {
  describedRevision,
  withBacklogFallback,
} from "../../tests/describedRevisions.ts";

test.describe.configure({ mode: "serial" });

const knownSourceId = "open-dough";
const knownRepository = "terryyin/open-dough";
const secretMarker = "gho_should-never-reach-a-browser-1234567890";

test.describe("authenticated read boundary (development environment)", () => {
  let server: DashboardServer;

  test.beforeAll(async () => {
    server = await startDashboardServer(developmentBoundary);
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
        "The local GitHub CLI is not logged in, so main of terryyin/pygardon could not be read. Run `gh auth login` (check with `gh auth status`), then reload the page.",
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

  test("reads an allowlisted canonical path pinned to the supplied revision exactly as origin publishes it, a literal control-character escape included, reusing records already read at that revision", async () => {
    // Content at one commit never changes, so this case publishes its
    // different backlog at its own revision.
    const revision = "cd".repeat(20);
    const seedPath = ".planning/seeds/SEED-boundary.md";
    const story = makeMe.aBacklogEntry
      .with({
        title: "Boundary story",
        identity: "SEED-boundary#story",
        href: "seeds/SEED-boundary.md#story",
      })
      .please();
    // `gh` would print a JSON-typed answer's literal `\u0002` as `^B`.
    // Deliberate control-character bytes stay at the call site.
    const seedBody = `# Seed\n\n**Identity:** ${story.identity}\n\nCtrl+B then Enter records a line holding \`\\u0002\`.\n`;
    const published = describedRevision(
      makeMe.aRepository
        .withRevision("boundary", {
          backlog: {
            queued: [story],
          },
          // The exact seed bytes this case reads back.
          files: { [seedPath]: seedBody },
        })
        .please(),
      revision,
    );
    server.github.serve(
      everyRepository,
      publishes(withBacklogFallback(published)),
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
    expect(response.headers["cache-control"]).toBe("no-store");
    const body = JSON.parse(response.body) as {
      revision: string;
      path: string;
      text: string;
    };
    expect(body.revision).toBe(revision);
    expect(body.path).toBe(seedPath);
    expect(body.text).toBe(seedBody);
    // The backlog read at this revision already decided reachability; only
    // the record itself is asked of GitHub.
    expect(server.ghCalls().slice(callsBefore)).toEqual([
      [
        "api",
        "--include",
        "-H",
        "Accept: application/vnd.github.raw",
        `repos/${knownRepository}/contents/.planning/seeds/SEED-boundary.md?ref=${revision}`,
      ],
    ]);
  });
});
