// Simultaneous reads at the local authenticated read boundary
// (../server/ghRead.ts): requests needing the same GitHub answer while it is
// outstanding wait on one `gh` call, which belongs to its waiters. Tested
// directly against real HTTP and the synthetic `gh`. Coincidence is made by
// an event, never elapsed time: GitHub's answer is held, the participating
// requests are sent, then a marker the boundary refuses without `gh`; once
// the marker is answered, every earlier request waits on its call
// (./support/sharedReads.ts). Each request's pinned reads before the shared
// one are made first, so nothing but its handler runs before its `gh` call.
// Leaving waiters and closing the server:
// ./authenticated-read-shared-waiters.spec.ts.

import { expect, test } from "./support/pageTest.ts";
import {
  startDashboardServer,
  type DashboardServer,
} from "./support/dashboardServer.ts";
import {
  answeredTogether,
  askedSince,
  heads,
  otherSeedPath,
  otherSeedText,
  readAt,
  servedHolding,
  sharedSeedPath,
  sharedSeedRead,
  sharedSeedText,
} from "./support/sharedReads.ts";

test.describe.configure({ mode: "serial" });

const revisionOf = (pair: string) => pair.repeat(20);

test.describe("authenticated read boundary: simultaneous reads share one GitHub request (dev launch mode)", () => {
  let server: DashboardServer;

  test.beforeAll(async () => {
    server = await startDashboardServer({ mode: "dev" });
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

  test("two opens resolve the ref once, read the backlog once, and answer the same asked time; a later open asks again", async () => {
    const revision = revisionOf("5b");
    const holding = await servedHolding(
      server,
      revision,
      ({ kind }) => kind === "ref",
    );
    const { answers, whileHeld } = await answeredTogether(
      server,
      holding,
      ["", ""],
      1,
    );
    const [one, two] = answers.map(
      ({ body }) => JSON.parse(body) as { revision: string; askedAt: string },
    );
    expect(one).toMatchObject({ revision });
    expect(two).toEqual(one);
    expect(whileHeld).toEqual(["ref main"]);
    expect(askedSince(server, holding.before)).toEqual([
      "ref main",
      `content .planning/PRODUCT-BACKLOG.md@${revision}`,
    ]);

    const later = server.github.calls.length;
    expect((await readAt(server, "")).status).toBe(200);
    expect(askedSince(server, later)).toEqual(["ref main"]);
  });

  test("checks of different revisions and of different watched branches share one head listing, each learning its own answer; a later check asks again", async () => {
    const revision = revisionOf("5c");
    const watching = (branch: string) =>
      `&since=${revision}&watch=${encodeURIComponent(branch)}`;
    const holding = await servedHolding(
      server,
      revision,
      ({ kind }) => kind === "matching-refs",
      [watching("story/one"), watching("story/two")],
    );
    const { answers, whileHeld } = await answeredTogether(
      server,
      holding,
      [
        `&since=${revision}`,
        `&since=${revisionOf("5d")}`,
        watching("story/one"),
        watching("story/two"),
      ],
      1,
    );
    const learned = (changed: boolean, branch?: string) => ({
      revision,
      changed,
      branches: branch === undefined ? [] : [{ branch, head: heads[branch] }],
    });
    expect(answers.map(({ body }) => JSON.parse(body) as unknown)).toEqual([
      learned(false),
      learned(true),
      learned(false, "story/one"),
      learned(false, "story/two"),
    ]);
    expect(whileHeld).toEqual(["matching-refs"]);
    expect(askedSince(server, holding.before)).toEqual(["matching-refs"]);

    const later = server.github.calls.length;
    expect((await readAt(server, `&since=${revision}`)).status).toBe(200);
    expect(askedSince(server, later)).toEqual(["matching-refs"]);
  });

  test("reads differing in repository, revision, path, or kind are asked separately and answered for their own question", async () => {
    const revision = revisionOf("5e");
    const otherRevision = revisionOf("5f");
    const holding = await servedHolding(server, revision, () => true, [
      `&revision=${revision}`,
    ]);
    const { answers } = await answeredTogether(
      server,
      holding,
      [
        "",
        { source: "pygardon", query: "" },
        `&revision=${otherRevision}`,
        sharedSeedRead(revision),
        `&revision=${revision}&path=${encodeURIComponent(otherSeedPath)}`,
        `${sharedSeedRead(revision)}&committed=last`,
      ],
      6,
    );
    expect(statuses(answers)).toEqual([200, 200, 200, 200, 200, 200]);
    const bodies = answers.map(({ body }) => JSON.parse(body) as unknown);
    expect(bodies[2]).toMatchObject({ revision: otherRevision });
    expect(bodies[3]).toMatchObject({ text: sharedSeedText });
    expect(bodies[4]).toMatchObject({ text: otherSeedText });
    expect(bodies[5]).toMatchObject({
      committedAt: "2026-10-01T08:00:00.000Z",
    });
    const ours = (asked: string) => `terryyin/open-dough ${asked}`;
    expect(askedSince(server, holding.before, true).sort()).toEqual(
      [
        ours("ref main"),
        "terryyin/pygardon ref main",
        `terryyin/pygardon content .planning/PRODUCT-BACKLOG.md@${revision}`,
        ours(`content .planning/PRODUCT-BACKLOG.md@${otherRevision}`),
        ours(`content ${sharedSeedPath}@${revision}`),
        ours(`content ${otherSeedPath}@${revision}`),
        ours(`commit-list ${sharedSeedPath}@${revision}`),
      ].sort(),
    );
  });
});
