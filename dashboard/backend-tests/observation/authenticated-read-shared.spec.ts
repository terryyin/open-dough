// Simultaneous reads at the local authenticated read boundary
// (../../server/ghRead.ts): requests needing the same GitHub answer while it is
// outstanding wait on one `gh` call, which belongs to its waiters. Tested
// directly against real HTTP and the synthetic `gh`. Coincidence is made by
// an event, never elapsed time: GitHub's answer is held, the participating
// requests are sent, then a marker the boundary refuses without `gh`; once
// the marker is answered, every earlier request waits on its call
// (../../test-support/support/sharedReads.ts). Each request's pinned reads before the shared
// one are made first, so nothing but its handler runs before its `gh` call.
// Leaving waiters and closing the server:
// ./authenticated-read-shared-waiters.spec.ts. Opens sharing one verified Git
// trunk check: ./authenticated-read-shared-trunk.spec.ts.

import { expect, test } from "../../test-support/support/pageTest.ts";
import {
  developmentBoundary,
  startDashboardServer,
  type DashboardServer,
} from "../../test-support/support/dashboardServer.ts";
import { everyRepository } from "../../test-support/support/fakeGitHub.ts";
import {
  answeredTogether,
  askedSince,
  otherSeedPath,
  otherSeedText,
  readAt,
  servedHolding,
  sharedReadsPublished,
  sharedSeedPath,
  sharedSeedRead,
  sharedSeedText,
} from "../../test-support/support/sharedReads.ts";

test.describe.configure({ mode: "serial" });

const revisionOf = (pair: string) => pair.repeat(20);

test.describe("authenticated read boundary: simultaneous reads share one GitHub request (development environment)", () => {
  let server: DashboardServer;

  test.beforeAll(async () => {
    server = await startDashboardServer(developmentBoundary);
  });

  test.afterAll(async () => {
    await server.close();
  });

  const statuses = (answers: readonly { status: number }[]) =>
    answers.map(({ status }) => status);

  test("a pinned file, a directory listing, and a history read are each asked once for two requests, and a kept file is not asked again", async () => {
    const revision = revisionOf("5a");
    const holding = await servedHolding(server, revision, () => true, [
      `&revision=${revision}`,
    ]);
    const profiles = `&revision=${revision}&agents=profiles`;
    const history = `${sharedSeedRead(revision)}&committed=last`;
    const { answers, whileHeld } = await answeredTogether(
      server,
      holding,
      [
        sharedSeedRead(revision),
        sharedSeedRead(revision),
        profiles,
        profiles,
        history,
        history,
      ],
      3,
    );
    expect(statuses(answers)).toEqual([200, 200, 200, 200, 200, 200]);
    expect(JSON.parse(answers[0]?.body ?? "")).toMatchObject({
      text: sharedSeedText,
    });
    for (const pair of [0, 2, 4]) {
      expect(answers[pair + 1]?.body).toBe(answers[pair]?.body);
    }
    expect([...whileHeld].sort()).toEqual([
      `commit-list ${sharedSeedPath}@${revision}`,
      `content ${sharedSeedPath}@${revision}`,
      `listing .planning/agents@${revision}`,
    ]);
    expect(askedSince(server, holding.before).slice(3).sort()).toEqual([
      `content .planning/agents/akiho-chan.json@${revision}`,
      `content .planning/agents/yui-chan.json@${revision}`,
      `content .planning/open-dough.json@${revision}`,
    ]);

    const later = server.github.calls.length;
    expect((await readAt(server, sharedSeedRead(revision))).status).toBe(200);
    expect(askedSince(server, later)).toEqual([]);
  });

  test("reads differing in repository, revision, path, or kind are asked separately and answered for their own question", async () => {
    const revision = revisionOf("5e");
    const otherRevision = revisionOf("5f");
    const backlog = `&revision=${revision}`;
    server.github.serve(everyRepository, sharedReadsPublished(revision));
    const otherBacklog = await readAt(server, {
      source: "pygardon",
      query: backlog,
    });
    expect(otherBacklog.status).toBe(200);
    const holding = await servedHolding(server, revision, () => true, [
      backlog,
      `&revision=${otherRevision}`,
    ]);
    const { answers } = await answeredTogether(
      server,
      holding,
      [
        { source: "pygardon", query: sharedSeedRead(revision) },
        sharedSeedRead(otherRevision),
        sharedSeedRead(revision),
        `&revision=${revision}&path=${encodeURIComponent(otherSeedPath)}`,
        `${sharedSeedRead(revision)}&committed=last`,
      ],
      5,
    );
    expect(statuses(answers)).toEqual([200, 200, 200, 200, 200]);
    const bodies = answers.map(({ body }) => JSON.parse(body) as unknown);
    expect(bodies[0]).toMatchObject({ revision, text: sharedSeedText });
    expect(bodies[1]).toMatchObject({
      revision: otherRevision,
      text: sharedSeedText,
    });
    expect(bodies[2]).toMatchObject({ revision, text: sharedSeedText });
    expect(bodies[3]).toMatchObject({ revision, text: otherSeedText });
    expect(bodies[4]).toMatchObject({
      committedAt: "2026-10-01T08:00:00.000Z",
    });
    const ours = (asked: string) => `terryyin/open-dough ${asked}`;
    const asked = askedSince(server, holding.before, true);
    expect(asked.sort()).toEqual(
      [
        `terryyin/pygardon content ${sharedSeedPath}@${revision}`,
        ours(`content ${sharedSeedPath}@${otherRevision}`),
        ours(`content ${sharedSeedPath}@${revision}`),
        ours(`content ${otherSeedPath}@${revision}`),
        ours(`commit-list ${sharedSeedPath}@${revision}`),
      ].sort(),
    );
  });
});
