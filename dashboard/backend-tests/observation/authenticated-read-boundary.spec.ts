// The read boundary returns allowlisted canonical records at their pin and
// encodes provider paths. Its revision-check failure responses are observed by
// ./authenticated-read-http.spec.ts.

import { expect, test } from "../../test-support/support/pageTest.ts";
import {
  developmentBoundary,
  startDashboardServer,
  type DashboardServer,
} from "../../test-support/support/dashboardServer.ts";
import {
  everyRepository,
  publishes,
} from "../../test-support/support/fakeGitHub.ts";
import { rawRequest } from "../../test-support/support/rawHttp.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { describedFiles } from "../../test-support/describedRevisions.ts";
import { backlogPath } from "../../test-support/publishedOriginBasics.ts";
import { expectServedHomesReach } from "../../test-support/support/fixtureOriginRoute.ts";

test.describe.configure({ mode: "serial" });

const knownSourceId = "open-dough";
const knownRepository = "terryyin/open-dough";

test.describe("authenticated read boundary (development environment)", () => {
  let server: DashboardServer;

  test.beforeAll(async () => {
    server = await startDashboardServer(developmentBoundary);
  });

  test.afterAll(async () => {
    await server.close();
  });

  test("reads an allowlisted canonical path pinned to the supplied revision exactly as origin publishes it, a literal control-character escape included, reusing records already read at that revision", async () => {
    // Content at one commit never changes, so this case publishes its
    // different backlog at its own revision.
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
    const files = describedFiles({
      backlog: {
        queued: [story],
      },
      // The exact seed bytes this case reads back.
      files: { [seedPath]: seedBody },
    });
    // Unnamed paths answer the backlog the description publishes.
    const published = publishes({ files, backlog: files[backlogPath] ?? "" });
    const { revision } = published;
    server.github.serve(everyRepository, published);
    expectServedHomesReach(server.github, knownRepository, revision);
    const membership = await rawRequest({
      url: `${server.baseURL}/__authenticated-read?source=${knownSourceId}`,
      headers: { Origin: server.origin },
    });
    expect(membership.status).toBe(200);
    expect(JSON.parse(membership.body)).toMatchObject({ revision });
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

  test("encodes the space in a canonical path when asking GitHub for that record alone", async () => {
    const recordPath = "docs/release notes/2026.md";
    const recordText = "# Release notes for 2026\n";
    const story = makeMe.aBacklogEntry
      .with({
        title: "Read the release notes",
        identity: "SEED-boundary#release-notes",
        href: "/docs/release%20notes/2026.md",
      })
      .please();
    const published = publishes({
      files: describedFiles({
        backlog: { queued: [story] },
        files: { [recordPath]: recordText },
      }),
    });
    const { revision } = published;
    server.github.serve(everyRepository, published);
    expectServedHomesReach(server.github, knownRepository, revision);
    const membership = await rawRequest({
      url: `${server.baseURL}/__authenticated-read?source=${knownSourceId}`,
      headers: { Origin: server.origin },
    });
    expect(membership.status).toBe(200);
    expect(JSON.parse(membership.body)).toMatchObject({ revision });

    const callsBefore = server.ghCalls().length;
    const response = await rawRequest({
      url: `${server.baseURL}/__authenticated-read?source=${knownSourceId}&revision=${revision}&path=${encodeURIComponent(recordPath)}`,
      headers: { Origin: server.origin },
    });
    expect(response.status).toBe(200);
    expect(JSON.parse(response.body)).toEqual({
      revision,
      path: recordPath,
      text: recordText,
    });
    expect(server.ghCalls().slice(callsBefore)).toEqual([
      [
        "api",
        "--include",
        "-H",
        "Accept: application/vnd.github.raw",
        `repos/${knownRepository}/contents/docs/release%20notes/2026.md?ref=${revision}`,
      ],
    ]);
  });
});
