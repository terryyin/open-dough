// Which commit added an agent profile's current allocation, as the local
// authenticated read boundary (../server/authenticatedRead.ts) answers it with
// `committed=added`, tested directly against real HTTP and a synthetic `gh`
// on this spec's own isolated server process's PATH that answers from a fake
// GitHub recording every invocation. It is asked only for a profile the
// pinned revision lists, walks that profile's history no further than its
// addition, and refuses anything else before asking GitHub. What the page
// shows from it is covered in ./agent-roster-attribution.spec.ts. Shares this
// suite's harness (./support/dashboardServer.ts) and
// ./authenticated-read-boundary.spec.ts's approach.

import { expect, test } from "@playwright/test";
import {
  startDashboardServer,
  type DashboardServer,
} from "./support/dashboardServer.ts";
import { everyRepository, publishes } from "./support/fakeGitHub.ts";
import { renderAgentProfile } from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import { rawRequest } from "./support/rawHttp.ts";

test.describe.configure({ mode: "serial" });

const knownSourceId = "open-dough";
const knownRepository = "terryyin/open-dough";
const revision = "fa".repeat(20);
const backlog = "# Product backlog\n\n## Taken\n\n## Backlog list\n";
const agents = ".planning/agents";

test.describe("authenticated profile addition read (dev launch mode)", () => {
  let server: DashboardServer;

  test.beforeAll(async () => {
    server = await startDashboardServer({ mode: "dev" });
  });

  test.afterAll(async () => {
    await server.close();
  });

  test("answers which commit added a listed agent profile's current allocation, walking its history at the pinned revision no further than that addition", async () => {
    const yuiPath = `${agents}/yui-chan.json`;
    const akihoPath = `${agents}/akiho-chan.json`;
    const commit = (pair: string) => pair.repeat(20);
    const profile = (name: string) =>
      renderAgentProfile({
        name,
        identity: "SEED-clock#story",
        activity: "preparation",
      });
    server.github.serve(
      everyRepository,
      publishes({
        revision,
        backlog,
        files: { [yuiPath]: profile("Yui"), [akihoPath]: profile("Akiho") },
        history: {
          [yuiPath]: [
            { sha: commit("e1"), status: "modified", committer: "Mo Modifier" },
            {
              sha: commit("e2"),
              status: "added",
              committer: "Terry Yin",
              committedAt: new Date("2026-09-23T08:30:00Z"),
              login: "terryyin",
            },
            { sha: commit("e3"), status: "removed", committer: "Olde" },
            { sha: commit("e4"), status: "added", committer: "Olde" },
          ],
          // Added by a commit whose committer name is blank.
          [akihoPath]: [{ sha: commit("e5"), status: "added", committer: " " }],
        },
      }),
    );
    const additionOf = (path: string) =>
      rawRequest({
        url: `${server.baseURL}/__authenticated-read?source=${knownSourceId}&revision=${revision}&path=${encodeURIComponent(path)}&committed=added`,
        headers: { Origin: server.origin },
      });

    let callsBefore = server.ghCalls().length;
    const answered = await additionOf(yuiPath);
    expect(answered.status).toBe(200);
    expect(answered.headers["cache-control"]).toBe("no-store");
    expect(JSON.parse(answered.body)).toEqual({
      revision,
      path: yuiPath,
      added: {
        commit: commit("e2"),
        committerName: "Terry Yin",
        committedAt: "2026-09-23T08:30:00.000Z",
        login: "terryyin",
      },
    });
    // The listing authorizes the profile; its history is listed at the pinned
    // revision and walked to the addition, never into the older allocation.
    expect(server.ghCalls().slice(callsBefore)).toEqual([
      [
        "api",
        "-H",
        "Accept: application/vnd.github+json",
        `repos/${knownRepository}/contents/${agents}?ref=${revision}`,
      ],
      [
        "api",
        `repos/${knownRepository}/commits?sha=${revision}&path=${encodeURIComponent(yuiPath)}&per_page=10`,
      ],
      ["api", `repos/${knownRepository}/commits/${commit("e1")}`],
      ["api", `repos/${knownRepository}/commits/${commit("e2")}`],
    ]);

    callsBefore = server.ghCalls().length;
    expect((await additionOf(yuiPath)).status).toBe(200);
    expect(server.ghCalls()).toHaveLength(callsBefore);

    const unnamed = await additionOf(akihoPath);
    expect(JSON.parse(unnamed.body)).toEqual({
      revision,
      path: akihoPath,
      added: {
        commit: commit("e5"),
        committerName: null,
        committedAt: "2026-09-20T08:00:00.000Z",
        login: null,
      },
    });

    // A profile-shaped path the revision does not list is never asked about.
    callsBefore = server.ghCalls().length;
    const unlisted = await additionOf(`${agents}/rina-chan.json`);
    expect(unlisted.status).toBe(404);
    expect(JSON.parse(unlisted.body)).toEqual({
      error: "That path is not reachable from this source revision.",
    });
    expect(server.ghCalls()).toHaveLength(callsBefore);
  });

  // An addition read asks which commit added one agent profile, only at a
  // pinned trunk revision and only for a path shaped as a profile: never an
  // arbitrary record, a traversal, a moving ref, or a branch.
  const yuiProfile = encodeURIComponent(`${agents}/yui-chan.json`);
  const onlyProfile = "An addition read names only an agent profile path.";
  for (const refused of [
    {
      read: "at a moving ref instead of a commit sha",
      query: `revision=main&path=${yuiProfile}`,
      error: "The pinned revision is not a commit sha.",
    },
    {
      read: "without a pinned revision",
      query: `path=${yuiProfile}`,
      error: "The pinned revision is not a commit sha.",
    },
    {
      read: "for a record that is not an agent profile",
      query: `revision=${revision}&path=${encodeURIComponent(".planning/PRODUCT-BACKLOG.md")}`,
      error: onlyProfile,
    },
    {
      read: "for a profile-named path that leaves its directory",
      query: `revision=${revision}&path=${encodeURIComponent(".planning/agents/../secrets/yui-chan.json")}`,
      error: onlyProfile,
    },
    {
      read: "combined with a revision check",
      query: `since=${revision}&path=${yuiProfile}`,
      error:
        "An addition read names only a pinned revision and an agent profile path.",
    },
    {
      read: "on a story branch",
      query: `revision=${revision}&branch=story%2Fexample&head=${revision}&path=${yuiProfile}`,
      error:
        "A commit time read names only a pinned revision and repository path.",
    },
  ]) {
    test(`refuses an addition read ${refused.read} before launching gh`, async () => {
      server.github.serve(everyRepository, publishes({ revision, backlog }));
      const callsBefore = server.ghCalls().length;
      const response = await rawRequest({
        url: `${server.baseURL}/__authenticated-read?source=${knownSourceId}&committed=added&${refused.query}`,
        headers: { Origin: server.origin },
      });
      expect(response.status).toBe(400);
      expect(JSON.parse(response.body)).toMatchObject({ error: refused.error });
      expect(server.ghCalls()).toHaveLength(callsBefore);
    });
  }
  test("refuses an addition read for another repository before launching gh", async () => {
    const callsBefore = server.ghCalls().length;
    const response = await rawRequest({
      url: `${server.baseURL}/__authenticated-read?source=${encodeURIComponent("someone/elses-repo")}&committed=added&revision=${revision}&path=${yuiProfile}`,
      headers: { Origin: server.origin },
    });
    expect(response.status).toBe(404);
    expect(server.ghCalls()).toHaveLength(callsBefore);
  });
});
