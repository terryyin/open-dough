// The done catalog published beside the backlog, and the done records it
// lists, as the local authenticated read boundary
// (../server/doneCatalogRead.ts) reads them at a pinned revision: the catalog
// is answered without reading a record, and only records that catalog lists
// are read, each only when named and once per blob, at the revision and in
// the project named. Gaps are in ./authenticated-read-done-catalog-gaps.spec.ts,
// refused, failing, and abandoned reads in
// ./authenticated-read-done-catalog-refusal.spec.ts. Tested directly against
// real HTTP and a synthetic `gh` answering from the fake GitHub, observing the
// `gh` calls that reach it (./support/doneCatalogReads.ts).

import { expect, test } from "./support/pageTest.ts";
import {
  startDashboardServer,
  type DashboardServer,
} from "./support/dashboardServer.ts";
import { everyRepository, publishes } from "./support/fakeGitHub.ts";
import {
  answerOf,
  catalogOf,
  catalogPath,
  doneCatalogReads,
  doneDirectory,
  doneRecords,
  fileOf,
  identityOf,
  pathOf,
  revisionOf,
} from "./support/doneCatalogReads.ts";
import { withDoneCatalog } from "./doneCatalogAnswers.ts";
import {
  parseDoneRecordFile,
  renderDoneRecord,
} from "../../src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs";

test.describe.configure({ mode: "serial" });

test.describe("authenticated done catalog read (dev launch mode)", () => {
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

  test("the catalog is answered without reading a record, and only the named records are read, once", async () => {
    const revision = revisionOf("a1");
    const files = withDoneCatalog(doneRecords("named", 12), doneDirectory);
    server.github.serve(everyRepository, publishes({ revision, files }));
    const catalog = catalogOf(files);

    let before = server.github.calls.length;
    const answered = await catalogAt(revision);
    expect(answered.status).toBe(200);
    expect(answerOf(answered)).toEqual({
      revision,
      catalog: files[catalogPath],
    });
    expect(asked(before)).toEqual([
      `listing ${doneDirectory}@${revision}`,
      `content ${catalogPath}@${revision}`,
    ]);
    expect(catalog.records.map(({ identity }) => identity)).toEqual(
      [...Array(12).keys()]
        .reverse()
        .map((index) => identityOf("named", index)),
    );

    // The newest three, as a reader would name them from the catalog.
    const named = catalog.records.slice(0, 3).map(({ fileName }) => fileName);
    before = server.github.calls.length;
    const bodies = await bodiesAt(revision, named);
    expect(bodies.status).toBe(200);
    expect(answerOf(bodies)).toEqual({
      revision,
      records: named.map((file) => {
        const path = `${doneDirectory}/${file}`;
        return { path, text: files[path] };
      }),
    });
    expect(contentAsked(before).sort()).toEqual(
      named
        .map((file) => `content ${doneDirectory}/${file}@${revision}`)
        .sort(),
    );

    // Asked again, with the next one: only that one reaches GitHub.
    const next = catalog.records[3]?.fileName ?? "";
    before = server.github.calls.length;
    expect((await catalogAt(revision)).status).toBe(200);
    expect((await bodiesAt(revision, [...named, next])).status).toBe(200);
    expect(asked(before)).toEqual([
      `content ${doneDirectory}/${next}@${revision}`,
    ]);
  });

  test("a later revision reads its own catalog and asks only for changed records named", async () => {
    const first = revisionOf("b2");
    const second = revisionOf("c3");
    const records = doneRecords("later", 4);
    const changedIdentity = identityOf("later", 1);
    const removedIdentity = identityOf("later", 0);
    const added = identityOf("later", 9);
    const laterRecords = Object.fromEntries([
      ...Object.entries(records).filter(
        ([path]) => path !== pathOf(removedIdentity),
      ),
      [
        pathOf(changedIdentity),
        renderDoneRecord({
          identity: changedIdentity,
          title: "Finish later 1, retitled",
          completedAt: "2026-10-01T01:00:00.000Z",
          developer: "Terry Yin",
        }),
      ],
      [
        pathOf(added),
        renderDoneRecord({
          identity: added,
          title: "Finish later 9",
          completedAt: "2026-10-02T00:00:00.000Z",
          developer: "Terry Yin",
        }),
      ],
    ]);
    const files = withDoneCatalog(records, doneDirectory);
    const later = withDoneCatalog(laterRecords, doneDirectory);
    const everyFile = (published: Readonly<Record<string, string>>) =>
      catalogOf(published).records.map(({ fileName }) => fileName);

    server.github.serve(everyRepository, publishes({ revision: first, files }));
    expect((await catalogAt(first)).status).toBe(200);
    expect((await bodiesAt(first, everyFile(files))).status).toBe(200);

    server.github.serve(
      everyRepository,
      publishes({ revision: second, files: later }),
    );
    let before = server.github.calls.length;
    const catalog = await catalogAt(second);
    expect(answerOf(catalog)).toEqual({
      revision: second,
      catalog: later[catalogPath],
    });
    const bodies = await bodiesAt(second, everyFile(later));
    expect(answerOf(bodies)).toMatchObject({ revision: second });
    expect(contentAsked(before).sort()).toEqual(
      [catalogPath, pathOf(added), pathOf(changedIdentity)]
        .map((path) => `content ${path}@${second}`)
        .sort(),
    );

    // The record the later revision no longer has is read only at the
    // revision that lists it.
    before = server.github.calls.length;
    const removed = await bodiesAt(second, [fileOf(removedIdentity)]);
    expect(removed.status).toBe(404);
    expect(contentAsked(before)).toEqual([]);
    const earlier = await bodiesAt(first, [fileOf(changedIdentity)]);
    expect(answerOf(earlier)).toEqual({
      revision: first,
      records: [
        {
          path: pathOf(changedIdentity),
          text: files[pathOf(changedIdentity)],
        },
      ],
    });
    expect(contentAsked(before)).toEqual([]);
  });

  test("another project at the same revision is answered from its own catalog", async () => {
    const revision = revisionOf("d4");
    const ours = withDoneCatalog(doneRecords("ours", 2), doneDirectory);
    const theirs = withDoneCatalog(doneRecords("theirs", 3), doneDirectory);
    server.github.serve(everyRepository, publishes({ revision, files: ours }));
    server.github.serve(
      "nerds-odd-e/doughnut",
      publishes({ revision, files: theirs }),
    );
    expect(answerOf(await catalogAt(revision))).toEqual({
      revision,
      catalog: ours[catalogPath],
    });
    expect(answerOf(await catalogAt(revision, "doughnut"))).toEqual({
      revision,
      catalog: theirs[catalogPath],
    });
  });

  test("a record file the catalog could not read is listed by name and read as published", async () => {
    const revision = revisionOf("e5");
    const malformed = `${doneDirectory}/SEED-200_malformed.json`;
    const files = withDoneCatalog(
      {
        ...doneRecords("malformed", 2),
        [malformed]: '{"schemaVersion":2}\n',
      },
      doneDirectory,
    );
    server.github.serve(everyRepository, publishes({ revision, files }));
    expect(catalogOf(files).unreadable.map(({ fileName }) => fileName)).toEqual(
      ["SEED-200_malformed.json"],
    );
    expect((await catalogAt(revision)).status).toBe(200);
    const bodies = await bodiesAt(revision, ["SEED-200_malformed.json"]);
    expect(answerOf(bodies)).toEqual({
      revision,
      records: [{ path: malformed, text: files[malformed] }],
    });
    expect(
      parseDoneRecordFile("SEED-200_malformed.json", files[malformed] ?? ""),
    ).toMatchObject({ ok: false });
  });
});
