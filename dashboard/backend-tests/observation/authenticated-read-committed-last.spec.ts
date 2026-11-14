// When a reachable record was last committed (`committed=last`), as the local
// authenticated read boundary (../../server/authenticatedRead.ts) answers it,
// tested directly against real HTTP and a synthetic `gh` on this suite's own
// isolated server process's PATH that answers from a fake GitHub recording
// every invocation. Reachable paths pin once per revision and path; an agent
// profile or unreached path is refused without asking for that path's content
// or commit list, though refusal may still read Intent settings at the pinned
// revision for containment. Shares this suite's harness
// (../../tests/support/dashboardServer.ts) and ./authenticated-read-boundary.spec.ts's
// approach. Profile addition (`committed=added`) is
// ./authenticated-read-profile-addition.spec.ts.

import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { expect, test } from "../../tests/support/pageTest.ts";
import {
  developmentBoundary,
  startDashboardServer,
  type DashboardServer,
} from "../../tests/support/dashboardServer.ts";
import { everyRepository, publishes } from "../../tests/support/fakeGitHub.ts";
import {
  describedRevision,
  withBacklogFallback,
} from "../../tests/describedRevisions.ts";
import { rawRequest } from "../../tests/support/rawHttp.ts";

test.describe.configure({ mode: "serial" });

const knownSourceId = "open-dough";
const knownRepository = "terryyin/open-dough";
const revision = "ef".repeat(20);
const seedPath = ".planning/seeds/SEED-clock.md";
const profilePath = ".planning/agents/yui-chan.json";
const secretsPath = ".planning/secrets/not-in-backlog.md";
const settingsPath = ".planning/open-dough.json";
const updatedAt = "2026-09-23T08:30:00Z";
const clockStory = makeMe.aBacklogEntry
  .with({
    title: "Clock story",
    identity: "SEED-clock#story",
    href: "seeds/SEED-clock.md#story",
  })
  .please();
// Yui holds the Taken clock story on trunk.
const published = describedRevision(
  makeMe.aRepository
    .withRevision("clock", {
      backlog: {
        taken: [clockStory],
      },
      files: {
        [seedPath]: `# Seed\n\n**Identity:** ${clockStory.identity}\n`,
      },
      agentProfiles: [
        makeMe.anAgentProfile
          .executing({
            name: "Yui",
            identity: clockStory.identity,
            mode: "trunk",
            branch: "origin/main",
          })
          .please(),
      ],
    })
    .please(),
  revision,
);

test.describe("authenticated read committed=last (development environment)", () => {
  let server: DashboardServer;

  test.beforeAll(async () => {
    server = await startDashboardServer(developmentBoundary);
  });

  test.afterAll(async () => {
    await server.close();
  });

  const publishClockRevision = () => {
    server.github.serve(
      everyRepository,
      publishes({
        ...withBacklogFallback(published),
        committed: {
          [seedPath]: new Date(updatedAt),
          [profilePath]: new Date(updatedAt),
        },
      }),
    );
  };

  const read = (query: string) =>
    rawRequest({
      url: `${server.baseURL}/__authenticated-read?source=${knownSourceId}${query}`,
      headers: { Origin: server.origin },
    });

  // The membership and the canonical record are read first, as the page
  // reads them, so the records deciding reachability are already pinned.
  const pinReachability = async () => {
    expect((await read("")).status).toBe(200);
    expect(
      (await read(`&revision=${revision}&path=${encodeURIComponent(seedPath)}`))
        .status,
    ).toBe(200);
  };

  test("answers when a reachable record was last committed and pins once per revision and path", async () => {
    publishClockRevision();
    await pinReachability();

    const commitTime = `&revision=${revision}&path=${encodeURIComponent(seedPath)}&committed=last`;
    let callsBefore = server.ghCalls().length;
    const answered = await read(commitTime);
    expect(answered.status).toBe(200);
    expect(JSON.parse(answered.body)).toEqual({
      revision,
      path: seedPath,
      committedAt: "2026-09-23T08:30:00.000Z",
    });
    // The pinned backlog authorizes the path; the commit list is asked at the
    // pinned revision for that one path.
    expect(server.ghCalls().slice(callsBefore)).toEqual([
      [
        "api",
        "--include",
        `repos/${knownRepository}/commits?sha=${revision}&path=${encodeURIComponent(seedPath)}&per_page=1`,
        "--jq",
        ".[0].commit.committer.date",
      ],
    ]);

    callsBefore = server.ghCalls().length;
    expect((await read(commitTime)).status).toBe(200);
    expect(server.ghCalls()).toHaveLength(callsBefore);
  });

  test("refuses an agent profile or an unreached path without asking for that path", async () => {
    publishClockRevision();
    await pinReachability();

    // A listed agent profile's Take is its addition (`committed=added`),
    // never its last commit. Refusal may still read Intent settings at the
    // pinned revision for containment; it must not ask for the profile's
    // content or commit list.
    let callsBefore = server.ghCalls().length;
    const profileCommitTime = await read(
      `&revision=${revision}&path=${encodeURIComponent(profilePath)}&committed=last`,
    );
    expect(profileCommitTime.status).toBe(404);
    expect(JSON.parse(profileCommitTime.body)).toEqual({
      error: "That path is not reachable from this source revision.",
    });
    expect(server.ghCalls().slice(callsBefore)).toEqual([
      [
        "api",
        "--include",
        "-H",
        "Accept: application/vnd.github.raw",
        `repos/${knownRepository}/contents/${settingsPath}?ref=${revision}`,
      ],
    ]);

    callsBefore = server.ghCalls().length;
    const unreached = await read(
      `&revision=${revision}&path=${encodeURIComponent(secretsPath)}&committed=last`,
    );
    expect(unreached.status).toBe(404);
    expect(JSON.parse(unreached.body)).toEqual({
      error: "That path is not reachable from this source revision.",
    });
    // Settings are already pinned; refusal still asks neither the secrets
    // path's content nor its commit list.
    expect(server.ghCalls()).toHaveLength(callsBefore);
  });
});
