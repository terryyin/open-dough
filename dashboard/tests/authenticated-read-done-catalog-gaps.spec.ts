// What the local authenticated read boundary (../server/doneCatalogRead.ts)
// answers when the done catalog cannot be trusted or does not list what a
// read names: a revision listing no record file has an empty catalog; records
// the catalog does not describe as published are a gap, never no records,
// and none of them is read; and a record name the agreeing catalog does not
// list takes no read. Tested directly against real HTTP and a synthetic `gh`
// answering from the fake GitHub, observing the `gh` calls that reach it
// (./support/doneCatalogReads.ts).

import { expect, test } from "./support/pageTest.ts";
import {
  startDashboardServer,
  type DashboardServer,
} from "./support/dashboardServer.ts";
import { everyRepository, publishes } from "./support/fakeGitHub.ts";
import {
  answerOf,
  catalogPath,
  doneCatalogReads,
  doneDirectory,
  doneRecords,
  fileOf,
  identityOf,
  pathOf,
  revisionOf,
} from "./support/doneCatalogReads.ts";
import { doneCatalogOf, withDoneCatalog } from "./doneCatalogAnswers.ts";
import {
  doneRecordPath,
  renderDoneRecord,
} from "../../src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs";

test.describe.configure({ mode: "serial" });

test.describe("authenticated done catalog gaps (dev launch mode)", () => {
  let server: DashboardServer;

  test.beforeAll(async () => {
    server = await startDashboardServer({ mode: "dev" });
  });

  test.afterAll(async () => {
    await server.close();
  });

  const { catalogAt, bodiesAt, asked, contentAsked } = doneCatalogReads(
    () => server,
  );

  test("a revision with no done record has an empty catalog", async () => {
    const empty = revisionOf("f6");
    server.github.serve(
      everyRepository,
      publishes({ revision: empty, files: {} }),
    );
    expect(answerOf(await catalogAt(empty))).toEqual({
      revision: empty,
      catalog: `${JSON.stringify({ schemaVersion: 1, records: [], unreadable: [] }, null, 2)}\n`,
    });

    // A catalog left behind with no record file beside it lists nothing.
    const leftBehind = revisionOf("f7");
    server.github.serve(
      everyRepository,
      publishes({
        revision: leftBehind,
        files: {
          [`${doneDirectory}/README.md`]: "Not a done record.\n",
          [catalogPath]: doneCatalogOf(doneRecords("gone", 2), doneDirectory),
        },
      }),
    );
    const before = server.github.calls.length;
    expect(answerOf(await catalogAt(leftBehind))).toMatchObject({
      catalog: expect.stringContaining('"records": []'),
    });
    expect(contentAsked(before)).toEqual([]);
  });

  // Records the catalog does not describe as published: none of them is
  // trusted, none is read, and the catalog is a gap, not an empty one.
  const records = doneRecords("gap", 3);
  const changed = pathOf(identityOf("gap", 1));
  for (const { gap, files, problem, index } of [
    {
      gap: "a catalog missing beside the records",
      files: records,
      problem: "done catalog is not published beside the 3 done records",
    },
    {
      gap: "a catalog describing an earlier record",
      files: {
        ...withDoneCatalog(records, doneDirectory),
        [changed]: renderDoneRecord({
          identity: identityOf("gap", 1),
          title: "Rewritten by an older writer",
          completedAt: "2026-10-01T01:00:00.000Z",
        }),
      },
      problem: `done catalog describes an earlier ${changed.replace(".planning/", "")}`,
    },
    {
      gap: "a catalog missing a published record",
      files: {
        ...withDoneCatalog(records, doneDirectory),
        [pathOf("SEED-300#unlisted")]: renderDoneRecord({
          identity: "SEED-300#unlisted",
          title: "Completed by an older writer",
          completedAt: "2026-10-03T00:00:00.000Z",
        }),
      },
      problem: `done catalog does not list ${doneRecordPath("SEED-300#unlisted")}`,
    },
    {
      gap: "a catalog that is not JSON",
      files: { ...records, [catalogPath]: "{ not json" },
      problem: "done catalog is not JSON",
    },
    {
      gap: "a catalog in an unsupported format",
      files: {
        ...records,
        [catalogPath]:
          '{ "schemaVersion": 2, "records": [], "unreadable": [] }\n',
      },
      problem: "done catalog schemaVersion must be 1",
    },
  ].map((each, index) => ({ ...each, index }))) {
    test(`${gap} is a gap, and no record is read`, async () => {
      const revision = revisionOf(`8${String(index)}`);
      server.github.serve(everyRepository, publishes({ revision, files }));
      const before = server.github.calls.length;
      const catalog = await catalogAt(revision);
      expect(catalog.status).toBe(200);
      expect(answerOf(catalog)).toEqual({ revision, gap: problem });

      const bodies = await bodiesAt(revision, [fileOf(identityOf("gap", 0))]);
      expect(bodies.status).toBe(404);
      expect(answerOf(bodies).error).toBe(
        `The done catalog at this revision lists no record to read: ${problem}.`,
      );
      expect(
        contentAsked(before).filter(
          (question) => question !== `content ${catalogPath}@${revision}`,
        ),
      ).toEqual([]);
    });
  }

  test("a record name the catalog does not list takes no read, even beside listed ones", async () => {
    const revision = revisionOf("9a");
    const files = withDoneCatalog(doneRecords("unlisted", 2), doneDirectory);
    server.github.serve(everyRepository, publishes({ revision, files }));
    const listed = fileOf(identityOf("unlisted", 0));
    expect((await catalogAt(revision)).status).toBe(200);

    const before = server.github.calls.length;
    for (const named of [
      ["SEED-999_unlisted.json"],
      [listed, "SEED-999_x.json"],
    ]) {
      const response = await bodiesAt(revision, named);
      expect(response.status).toBe(404);
      expect(answerOf(response).error).toBe(
        "That done record is not listed by the done catalog at this revision.",
      );
    }
    expect(asked(before)).toEqual([]);
  });
});
