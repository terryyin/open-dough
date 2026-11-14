// Reads the catalog and checks it against the listing at the same revision.
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  doneCatalogMismatch,
  parseDoneCatalog,
} from "../../src/skills/dough-product-backlog/scripts/product-backlog-done-catalog.mjs";
import { isDoneRecordFileName } from "../../src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs";
import { completedAt, daysBefore } from "./product-backlog-done-fixture.mjs";

test("a catalog is read only as written and is checked against a published listing", () => {
  const record = {
    fileName: "SEED-1_a.json",
    identity: "SEED-1#a",
    completedAt,
    blob: "a".repeat(40),
  };
  const older = {
    fileName: "SEED-2_b.json",
    identity: "SEED-2#b",
    completedAt: daysBefore(1),
    blob: "b".repeat(40),
  };
  const text = (data) => JSON.stringify(data);
  const valid = { schemaVersion: 1, records: [record, older], unreadable: [] };
  assert.equal(parseDoneCatalog(text(valid)).ok, true);

  for (const [data, error] of [
    [{ ...valid, schemaVersion: 2 }, /schemaVersion must be 1/],
    [{ ...valid, records: [older, record] }, /published order/],
    [{ ...valid, records: [{ ...record, title: "A" }] }, /exactly fileName/],
    [
      {
        ...valid,
        unreadable: [{ fileName: record.fileName, blob: "c".repeat(40) }],
      },
      /names one record file twice/,
    ],
    [{ ...valid, records: [{ ...record, blob: "nope" }] }, /Git blob hash/],
    [
      { ...valid, records: [{ ...record, identity: "SEED-9#z" }] },
      /names another identity/,
    ],
  ]) {
    const read = parseDoneCatalog(text(data));
    assert.equal(read.ok, false);
    assert.match(read.error, error);
  }
  assert.equal(parseDoneCatalog("{").ok, false);

  const catalog = parseDoneCatalog(text(valid)).catalog;
  const published = [
    { fileName: record.fileName, blob: record.blob },
    { fileName: older.fileName, blob: older.blob },
    { fileName: ".catalog.json", blob: "d".repeat(40) },
  ];
  assert.equal(doneCatalogMismatch(catalog, published), undefined);
  assert.match(
    doneCatalogMismatch(catalog, [
      ...published,
      { fileName: "SEED-3_c.json", blob: "e".repeat(40) },
    ]),
    /does not list done\/SEED-3_c\.json/,
  );
  assert.match(
    doneCatalogMismatch(catalog, [
      { fileName: record.fileName, blob: "f".repeat(40) },
      published[1],
    ]),
    /earlier done\/SEED-1_a\.json/,
  );
  assert.match(
    doneCatalogMismatch(catalog, [published[0]]),
    /lists done\/SEED-2_b\.json, which is not published/,
  );
  // The catalog's own name is never a done record's, so a reader listing
  // records by name, as the dashboard does, never takes it for one.
  assert.equal(isDoneRecordFileName(".catalog.json"), false);
});
