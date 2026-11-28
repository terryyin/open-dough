import { beforeEach, expect, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { doneRecordPath } from "../../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs";
import { performDoneCatalogRead } from "../../server/doneCatalogRead.ts";
import { GhFailure, runGh } from "../../server/ghRead.ts";
import { PinnedTexts } from "../../server/pinnedTexts.ts";
import { parseRequestedRead } from "../../server/requestedRead.ts";
import { RetainedAnswers } from "../../server/retainedAnswers.ts";
import { RevisionMemo } from "../../server/revisionMemo.ts";
import type { PublishedSource } from "../../src/publishedSource.ts";
import {
  directoryListingAnswer,
  listedFiles,
} from "../../test-support/listingAnswers.ts";
import {
  catalogOf,
  catalogPath,
  doneDirectory,
  doneRecords,
  fileOf,
  identityOf,
  publishedDone,
  revisionOf,
} from "../../test-support/support/doneCatalogReads.ts";
import { parseRequest } from "../../test-support/support/ghRequest.ts";

vi.mock(import("../../server/ghRead.ts"), async (importOriginal) => ({
  ...(await importOriginal()),
  runGh: vi.fn(),
}));

const openDough = makeMe.aPublishedSource.openDough.please();
const otherProject = makeMe.aPublishedSource.pygardon.please();
const revision = revisionOf("d4");
const earlier = revisionOf("a1");
const upstream = vi.mocked(runGh);
type PublishedFiles = ReturnType<typeof publishedDone>;
const origins = new Map<string, PublishedFiles>();
const key = (repository: string, pin: string) => `${repository}@${pin}`;
let pinned: PinnedTexts;

beforeEach(() => {
  pinned = new PinnedTexts(new RevisionMemo(new RetainedAnswers()));
  origins.clear();
  upstream.mockReset();
  upstream.mockImplementation((args) => {
    const request = parseRequest(args);
    if (request.kind !== "listing" && request.kind !== "content")
      throw new Error(`Unexpected GitHub request: ${args.join(" ")}`);
    const files = origins.get(key(request.repository, request.revision));
    if (files === undefined)
      throw new Error(`No publication at ${request.revision}`);
    if (request.kind === "listing") {
      const listing = directoryListingAnswer(request.path, listedFiles(files));
      if (listing.status === 200) return Promise.resolve(listing.body);
    } else {
      const text = files[request.path];
      if (text !== undefined) return Promise.resolve(text);
    }
    return Promise.reject(new GhFailure({ kind: "http", status: 404 }));
  });
});

function publish(files: PublishedFiles, source = openDough, pin = revision) {
  origins.set(key(source.repository, pin), files);
}

function read(source: PublishedSource, pin: string, files?: readonly string[]) {
  const params = new URLSearchParams({
    source: source.id,
    revision: pin,
    done: files === undefined ? "catalog" : "bodies",
  });
  for (const file of files ?? []) params.append("file", file);
  const requested = parseRequestedRead(params);
  if (
    requested.kind !== "done-catalog-at" &&
    requested.kind !== "done-bodies-at"
  )
    throw new Error(`Unexpected read: ${requested.kind}`);
  return performDoneCatalogRead(
    pinned,
    source,
    requested,
    new AbortController().signal,
    vi.fn(),
  );
}

const asked = () => upstream.mock.calls.map(([args]) => parseRequest(args));
const catalogAnswer = (catalog: string | undefined, pin = revision) => ({
  kind: "answered",
  answer: { revision: pin, catalog },
});
async function expectAgreedCatalog(files: PublishedFiles) {
  await expect(read(openDough, revision)).resolves.toEqual(
    catalogAnswer(files[catalogPath]),
  );
  expect(asked()).toMatchObject([
    { kind: "listing", path: doneDirectory },
    { kind: "content", path: catalogPath },
  ]);
}

test("answers an empty catalog for a pin publishing no Done records", async () => {
  publish({}, openDough, earlier);
  const stale = publishedDone({ doneRecords: doneRecords("gone", 2) });
  publish(
    publishedDone({ files: { [catalogPath]: stale[catalogPath] ?? "" } }),
  );
  const empty = `${JSON.stringify({ schemaVersion: 1, records: [], unreadable: [] }, null, 2)}\n`;
  for (const pin of [earlier, revision]) {
    await expect(read(openDough, pin)).resolves.toEqual(
      catalogAnswer(empty, pin),
    );
  }
  expect(asked().map(({ kind }) => kind)).toEqual(["listing", "listing"]);
});

const records = doneRecords("gap", 3);
const changedRecord = identityOf("gap", 1);
const unlistedRecord = "SEED-300#unlisted";
const priorCatalog = publishedDone({ doneRecords: records })[catalogPath] ?? "";
const changed = makeMe.aDoneRecord
  .with({
    identity: changedRecord,
    title: "Rewritten by an older writer",
    completedAt: "2026-10-01T01:00:00.000Z",
  })
  .please();
const unlisted = makeMe.aDoneRecord
  .with({
    identity: unlistedRecord,
    title: "Completed by an older writer",
    completedAt: "2026-10-03T00:00:00.000Z",
  })
  .please();
const withCatalog = (text: string, done = records) =>
  publishedDone({ doneRecords: done, files: { [catalogPath]: text } });
const rewritten = records.map((record) =>
  record.identity === changedRecord ? changed : record,
);

test.each([
  [
    "a missing catalog",
    publishedDone({ doneRecords: records, remove: [catalogPath] }),
    "done catalog is not published beside the 3 done records",
  ],
  [
    "a catalog with an earlier blob",
    withCatalog(priorCatalog, rewritten),
    `done catalog describes an earlier ${doneRecordPath(changedRecord)}`,
  ],
  [
    "a catalog missing a published record",
    withCatalog(priorCatalog, [...records, unlisted]),
    `done catalog does not list ${doneRecordPath(unlistedRecord)}`,
  ],
  ["a non-JSON catalog", withCatalog("{ not json"), "done catalog is not JSON"],
  [
    "a catalog in an unsupported format",
    withCatalog('{ "schemaVersion": 2, "records": [], "unreadable": [] }\n'),
    "done catalog schemaVersion must be 1",
  ],
] as const)(
  "reports a gap for %s and reads no record body",
  async (...[, files, problem]) => {
    publish(files);
    await expect(read(openDough, revision)).resolves.toEqual({
      kind: "answered",
      answer: { revision, gap: problem },
    });
    await expect(
      read(openDough, revision, [fileOf(identityOf("gap", 0))]),
    ).resolves.toEqual({
      kind: "refused",
      status: 404,
      message: `The done catalog at this revision lists no record to read: ${problem}.`,
    });
    expect(
      asked().filter(
        (request) => request.kind === "content" && request.path !== catalogPath,
      ),
    ).toEqual([]);
  },
);

test("refuses a name an agreeing catalog omits even beside a listed name", async () => {
  const files = publishedDone({ doneRecords: doneRecords("unlisted", 2) });
  publish(files);
  await expectAgreedCatalog(files);
  upstream.mockClear();
  const listed = fileOf(identityOf("unlisted", 0));
  for (const named of [
    ["SEED-999_unlisted.json"],
    [listed, "SEED-999_x.json"],
  ]) {
    await expect(read(openDough, revision, named)).resolves.toEqual({
      kind: "refused",
      status: 404,
      message:
        "That done record is not listed by the done catalog at this revision.",
    });
  }
  expect(upstream).not.toHaveBeenCalled();
});

test("returns the agreed catalog bytes and order without reading record bodies", async () => {
  const named = doneRecords("named", 12);
  const files = publishedDone({ doneRecords: named });
  publish(files);
  await expectAgreedCatalog(files);
  const catalog = catalogOf(files);
  expect(catalog.records.map(({ identity }) => identity)).toEqual(
    named.map(({ identity }) => identity).reverse(),
  );
});

test("keeps an unreadable published record listed at its blob", async () => {
  const file = "SEED-200_malformed.json";
  const path = `${doneDirectory}/${file}`;
  const files = publishedDone({
    doneRecords: doneRecords("malformed", 2),
    files: { [path]: '{"schemaVersion":2}\n' },
  });
  publish(files);
  await expectAgreedCatalog(files);
  const catalog = catalogOf(files);
  expect(catalog.unreadable.map(({ fileName }) => fileName)).toEqual([file]);
});

test("isolates catalog evidence by project even at the same pin", async () => {
  const ours = publishedDone({ doneRecords: doneRecords("ours", 2) });
  const theirs = publishedDone({ doneRecords: doneRecords("theirs", 3) });
  publish(ours);
  publish(theirs, otherProject);
  await expect(read(openDough, revision)).resolves.toEqual(
    catalogAnswer(ours[catalogPath]),
  );
  await expect(read(otherProject, revision)).resolves.toEqual(
    catalogAnswer(theirs[catalogPath]),
  );
  expect(asked()).toMatchObject(
    [openDough, otherProject].flatMap(({ repository }) => [
      { kind: "listing", repository, revision, path: doneDirectory },
      { kind: "content", repository, revision, path: catalogPath },
    ]),
  );
});
