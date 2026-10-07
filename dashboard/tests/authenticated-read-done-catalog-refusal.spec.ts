// Done catalog and done record reads the local authenticated read boundary
// (../server/doneCatalogRead.ts) refuses, fails, or ends: a read naming
// anything but a pinned revision and record file names is refused before any
// `gh` call; a failing record read names that record; and a record read its
// request leaves is ended, to be asked again later. Tested directly against
// real HTTP and a synthetic `gh` answering from the fake GitHub, observing the
// `gh` calls that reach it (./support/doneCatalogReads.ts).

import { expect, test } from "./support/pageTest.ts";
import {
  startDashboardServer,
  waitUntil,
  type DashboardServer,
} from "./support/dashboardServer.ts";
import {
  everyRepository,
  publishes,
  type RepositoryAnswerer,
} from "./support/fakeGitHub.ts";
import { holdingAnswer } from "./support/heldGitHubAnswer.ts";
import { processAlive } from "./support/processGroup.ts";
import { abandonedRequest } from "./support/rawHttp.ts";
import {
  answerOf,
  doneCatalogReads,
  doneDirectory,
  doneRecords,
  fileOf,
  identityOf,
  pathOf,
  revisionOf,
} from "./support/doneCatalogReads.ts";
import { withDoneCatalog } from "./doneCatalogAnswers.ts";
import { doneCatalogFileName } from "../../src/skills/dough-product-backlog/scripts/product-backlog-done-catalog.mjs";

test.describe.configure({ mode: "serial" });

const bodiesRefusal =
  "A done record read names only a pinned revision and the catalogued record files.";
const catalogRefusal = "A done catalog read names only a pinned revision.";

test.describe("authenticated done catalog refusal (dev launch mode)", () => {
  let server: DashboardServer;

  test.beforeAll(async () => {
    server = await startDashboardServer({ mode: "dev" });
  });

  test.afterAll(async () => {
    await server.close();
  });

  const { readAt, catalogAt, bodiesAt, contentAsked } = doneCatalogReads(
    () => server,
  );

  // A done record read names only a pinned revision and record file names:
  // refused before any `gh` call otherwise.
  for (const { read, query, error, revision } of [
    {
      read: "naming a path",
      query: `done=bodies&file=SEED-001_x.json&path=${encodeURIComponent(".planning/secrets.json")}`,
      error: bodiesRefusal,
    },
    {
      read: "naming a file that is no record",
      query: `done=bodies&file=${encodeURIComponent("../secrets.json")}`,
      error: bodiesRefusal,
    },
    {
      read: "naming the catalog as a record",
      query: `done=bodies&file=${encodeURIComponent(doneCatalogFileName)}`,
      error: bodiesRefusal,
    },
    { read: "naming no record", query: "done=bodies", error: bodiesRefusal },
    {
      read: "naming too many records",
      query: `done=bodies${[...Array(101).keys()].map((index) => `&file=SEED-${String(index)}_x.json`).join("")}`,
      error: "A done record read names too many records.",
    },
    {
      read: "of the catalog naming a record",
      query: "done=catalog&file=SEED-001_x.json",
      error: catalogRefusal,
    },
    {
      read: "of the catalog with an agent profile read",
      query: "done=catalog&agents=profiles",
      error: catalogRefusal,
    },
    {
      read: "of every record naming a record",
      query: "done=records&file=SEED-001_x.json",
      error: "A done record read names only a pinned revision.",
    },
    {
      read: "of the catalog at a revision that is not a commit sha",
      query: "done=catalog",
      error: "The pinned revision is not a commit sha.",
      revision: "main",
    },
  ]) {
    test(`refuses a done read ${read} before launching gh`, async () => {
      const before = server.ghCalls().length;
      const response = await readAt(revision ?? revisionOf("9b"), query);
      expect(response.status).toBe(400);
      expect(answerOf(response)).toMatchObject({ error });
      expect(server.ghCalls()).toHaveLength(before);
    });
  }

  test("a failing record read names that record", async () => {
    const revision = revisionOf("9c");
    const files = withDoneCatalog(doneRecords("failing", 3), doneDirectory);
    const failing = pathOf(identityOf("failing", 1));
    const published = publishes({ revision, files });
    const answerer: RepositoryAnswerer = (call) =>
      call.request.kind === "content" && call.request.path === failing
        ? Promise.resolve({ exitCode: 1, stderr: "connection reset" })
        : published(call);
    server.github.serve(everyRepository, answerer);
    const response = await bodiesAt(revision, [
      fileOf(identityOf("failing", 2)),
      fileOf(identityOf("failing", 1)),
    ]);
    expect(response.status).toBe(502);
    expect(String(answerOf(response).error)).toContain(
      `while reading ${failing} at ${revision}.`,
    );
  });

  test("a record read its request leaves is ended, and a later request asks again", async () => {
    const revision = revisionOf("9d");
    const files = withDoneCatalog(doneRecords("leaving", 2), doneDirectory);
    const heldPath = pathOf(identityOf("leaving", 1));
    const held = holdingAnswer(
      publishes({ revision, files }),
      (request) => request.kind === "content" && request.path === heldPath,
    );
    server.github.serve(everyRepository, held.answer);
    expect((await catalogAt(revision)).status).toBe(200);

    const before = server.github.calls.length;
    const leaving = abandonedRequest({
      url: `${server.baseURL}/__authenticated-read?source=open-dough&revision=${revision}&done=bodies&file=${fileOf(identityOf("leaving", 1))}`,
      headers: { Origin: server.origin },
    });
    await expect
      .poll(() => contentAsked(before), { timeout: 5_000 })
      .toEqual([`content ${heldPath}@${revision}`]);
    leaving.cutAfter(0);
    expect(
      await waitUntil(() => !processAlive(server.ghPid()), {
        timeoutMs: 5_000,
      }),
    ).toBe(true);
    expect(server.ghExitedBy()).toBe("SIGTERM");

    held.release();
    const again = await bodiesAt(revision, [fileOf(identityOf("leaving", 1))]);
    expect(answerOf(again)).toEqual({
      revision,
      records: [{ path: heldPath, text: files[heldPath] }],
    });
    expect(contentAsked(before)).toEqual([
      `content ${heldPath}@${revision}`,
      `content ${heldPath}@${revision}`,
    ]);
  });
});
