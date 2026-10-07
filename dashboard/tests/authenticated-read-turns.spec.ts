// One dashboard process has at most eight reads under way at GitHub
// (../server/readAdmission.ts), at the local authenticated read boundary
// over real HTTP with the synthetic `gh`: further reads wait their turn and
// begin in arrival order as answers come; a waiting request that leaves never
// reaches GitHub, and one waiting past its bound is answered as timed out
// without reaching it; a request the boundary refuses on its own terms is
// answered while every turn is taken; closing the server ends the waiting
// reads with the outstanding ones. GitHub holds every answer and releases
// them one at a time (./support/heldGitHubAnswer.ts), and reports the most
// `gh` calls it had unanswered at once: a call beyond the bound would stay
// unanswered and be counted. Each request's pinned reads before its held one
// are made first, as ./authenticated-read-shared.spec.ts makes them. Two tabs
// across two projects: ./read-turns-across-tabs.spec.ts.

import { expect, test } from "./support/pageTest.ts";
import {
  startDashboardServer,
  type DashboardServer,
} from "./support/dashboardServer.ts";
import { everyRepository, publishes } from "./support/fakeGitHub.ts";
import type { GhRequest } from "./support/ghRequest.ts";
import { heldInTurn } from "./support/heldGitHubAnswer.ts";
import { processRunning } from "./support/processGroup.ts";
import { abandonedRequest } from "./support/rawHttp.ts";
import { onServerOfItsOwn } from "./support/directedWait.ts";
import { askedSince, readAt, refusedMarker } from "./support/sharedReads.ts";

test.describe.configure({ mode: "serial" });

const revisionOf = (pair: string) => pair.repeat(20);
const turns = 8;

// Twelve seeds the backlog names, so each is a different pinned read.
const seedPaths = Array.from(
  Array(12).keys(),
  (index) => `.planning/seeds/SEED-turn-${String(index + 1)}.md`,
);
const backlog = `# Product backlog

## Taken

## Backlog list

${seedPaths
  .map((path, index) => {
    const identity = `SEED-turn-${String(index + 1)}#turn`;
    return `- [Turn ${String(index + 1)}](${path.replace(".planning/", "")}#turn) — ${identity}`;
  })
  .join("\n")}
`;
const publishedAt = (revision: string) =>
  publishes({
    revision,
    backlog,
    files: Object.fromEntries(seedPaths.map((path) => [path, `# ${path}\n`])),
  });

const seedRead = (revision: string, path: string) =>
  `&revision=${revision}&path=${encodeURIComponent(path)}`;
const asked = (revision: string, paths: readonly string[]) =>
  paths.map((path) => `content ${path}@${revision}`);
const isSeed = (request: GhRequest) =>
  request.kind === "content" && seedPaths.includes(request.path);

// Serves `revision` with its backlog already read, then holds every seed
// read until released one at a time.
async function servedInTurn(server: DashboardServer, revision: string) {
  const published = publishedAt(revision);
  server.github.serve(everyRepository, published);
  expect((await readAt(server, `&revision=${revision}`)).status).toBe(200);
  const held = heldInTurn(published, isSeed);
  server.github.serve(everyRepository, held.answer);
  return { ...held, before: server.github.calls.length };
}

const arrived = (server: DashboardServer, before: number, count: number) =>
  expect
    .poll(() => askedSince(server, before).length, { timeout: 10_000 })
    .toBe(count);

// Sends one read for each of `paths` at `revision`, each reaching GitHub
// before the next is sent, so they arrive in order.
async function underWay(
  server: DashboardServer,
  revision: string,
  before: number,
  paths: readonly string[],
) {
  const answers = [];
  for (const path of paths) {
    answers.push(readAt(server, seedRead(revision, path)));
    await arrived(server, before, askedSince(server, before).length + 1);
  }
  return answers;
}

test.describe("authenticated read boundary: reads take turns at GitHub (dev launch mode)", () => {
  let server: DashboardServer;

  test.beforeAll(async () => {
    server = await startDashboardServer({ mode: "dev" });
  });

  test.afterAll(async () => {
    await server.close();
  });

  test("twelve reads while GitHub answers none: eight reach it and four wait, a refused request is answered meanwhile, and each answer lets the next waiting one begin in arrival order", async () => {
    const revision = revisionOf("8a");
    const held = await servedInTurn(server, revision);
    const most = server.github.observeUnanswered();
    const first = await underWay(
      server,
      revision,
      held.before,
      seedPaths.slice(0, turns),
    );
    const waiting = [];
    for (const path of seedPaths.slice(turns)) {
      waiting.push(readAt(server, seedRead(revision, path)));
      // Refused on its own terms, so answered while every turn is taken.
      await refusedMarker(server);
    }
    expect(askedSince(server, held.before)).toEqual(
      asked(revision, seedPaths.slice(0, turns)),
    );

    for (let next = turns; next < seedPaths.length; next += 1) {
      held.releaseOldest();
      await arrived(server, held.before, next + 1);
    }
    held.releaseAll();

    const answers = await Promise.all([...first, ...waiting]);
    expect(answers.map(({ status }) => status)).toEqual(
      seedPaths.map(() => 200),
    );
    expect(
      answers.map(({ body }) => (JSON.parse(body) as { text: string }).text),
    ).toEqual(seedPaths.map((path) => `# ${path}\n`));
    expect(askedSince(server, held.before)).toEqual(asked(revision, seedPaths));
    expect(most()).toBe(turns);
  });

  test("a waiting request that leaves never reaches GitHub, and the next waiting one takes its place", async () => {
    const revision = revisionOf("8b");
    const held = await servedInTurn(server, revision);
    const first = await underWay(
      server,
      revision,
      held.before,
      seedPaths.slice(0, turns),
    );
    const [leftPath, nextPath] = seedPaths.slice(turns) as [string, string];
    const left = abandonedRequest({
      url: `${server.baseURL}/__authenticated-read?source=open-dough${seedRead(revision, leftPath)}`,
      headers: { Origin: server.origin },
    });
    await refusedMarker(server);
    const next = readAt(server, seedRead(revision, nextPath));
    await refusedMarker(server);
    left.cutAfter(0);
    await refusedMarker(server);

    held.releaseOldest();
    await arrived(server, held.before, turns + 1);
    held.releaseAll();
    expect((await next).status).toBe(200);
    expect((await Promise.all(first)).map(({ status }) => status)).toEqual(
      seedPaths.slice(0, turns).map(() => 200),
    );
    expect(askedSince(server, held.before)).toEqual(
      asked(revision, [...seedPaths.slice(0, turns), nextPath]),
    );
  });
});

test("a request still waiting its turn at its bound is answered as timed out, and its read never reaches GitHub", async () => {
  await onServerOfItsOwn(
    async (server) => {
      const revision = revisionOf("8c");
      const opened = revisionOf("8d");
      const isHeld = (request: GhRequest) =>
        request.kind === "ref" || isSeed(request);
      const published = publishedAt(opened);
      server.github.serve(everyRepository, published);
      expect((await readAt(server, `&revision=${revision}`)).status).toBe(200);
      const held = heldInTurn(published, isHeld);
      server.github.serve(everyRepository, held.answer);
      const before = server.github.calls.length;

      // Opening the project resolves its ref, held, then reads its backlog
      // at the revision found: by then every turn is taken by a read that
      // began after this request, so none ends at its own bound first.
      let settled = false;
      const opening = readAt(server, "").finally(() => {
        settled = true;
      });
      await arrived(server, before, 1);
      const taking = seedPaths
        .slice(0, turns)
        .map((path) => readAt(server, seedRead(revision, path)));
      await arrived(server, before, turns);
      await refusedMarker(server);
      held.releaseOldest();
      await arrived(server, before, turns + 1);
      expect(settled).toBe(false);

      const answer = await opening;
      expect(answer.status).toBe(502);
      expect(answer.body).toContain(
        "The local GitHub CLI did not answer within 6 seconds",
      );
      expect(askedSince(server, before)).not.toContain(
        `content .planning/PRODUCT-BACKLOG.md@${opened}`,
      );
      expect(askedSince(server, before)[0]).toBe("ref main");
      held.releaseAll();
      await Promise.all(taking);
    },
    { mode: "dev", readTimeoutMs: 6_000 },
  );
});

test("closing the server ends the waiting reads with the outstanding ones", async () => {
  const server = await startDashboardServer({ mode: "dev" });
  const revision = revisionOf("8e");
  const held = await servedInTurn(server, revision);
  const url = (path: string) =>
    `${server.baseURL}/__authenticated-read?source=open-dough${seedRead(revision, path)}`;
  for (const path of seedPaths.slice(0, turns)) {
    abandonedRequest({ url: url(path), headers: { Origin: server.origin } });
  }
  await arrived(server, held.before, turns);
  for (const path of seedPaths.slice(turns)) {
    abandonedRequest({ url: url(path), headers: { Origin: server.origin } });
  }
  await refusedMarker(server);
  const ghPid = server.ghPid();
  await server.close();
  expect(processRunning(ghPid)).toBe(false);
  expect(
    askedSince(server, held.before).filter((read) =>
      asked(revision, seedPaths.slice(turns)).includes(read),
    ),
  ).toEqual([]);
  expect(askedSince(server, held.before)).toHaveLength(turns);
});
