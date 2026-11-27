import { beforeEach, expect, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { performDoneCatalogRead } from "../../server/doneCatalogRead.ts";
import { GhFailure, runGh } from "../../server/ghRead.ts";
import { PinnedTexts } from "../../server/pinnedTexts.ts";
import { reportedFailure } from "../../server/readFailureMessage.ts";
import { RetainedAnswers } from "../../server/retainedAnswers.ts";
import { RevisionMemo } from "../../server/revisionMemo.ts";
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
  pathOf,
  publishedDone,
  revisionOf,
} from "../../test-support/support/doneCatalogReads.ts";
import { parseRequest } from "../../test-support/support/ghRequest.ts";

vi.mock(import("../../server/ghRead.ts"), async (original) => ({
  ...(await original()),
  runGh: vi.fn(),
}));

const source = makeMe.aPublishedSource.openDough.please();
const first = revisionOf("a1");
const later = revisionOf("b2");
const upstream = vi.mocked(runGh);
let pinned: PinnedTexts;
beforeEach(() => {
  pinned = new PinnedTexts(new RevisionMemo(new RetainedAnswers()));
  upstream.mockReset();
});

type Files = ReturnType<typeof publishedDone>;
function serve(
  pins: Readonly<Record<string, Files>>,
  body: (path: string, text: string) => Promise<string> = (...[, text]) =>
    Promise.resolve(text),
) {
  upstream.mockImplementation((args) => {
    const request = parseRequest(args);
    if (
      (request.kind !== "content" && request.kind !== "listing") ||
      request.repository !== source.repository
    )
      throw new Error(`Unexpected GitHub request: ${args.join(" ")}`);
    const files = pins[request.revision];
    if (files === undefined)
      throw new Error(`Missing fixture pin ${request.revision}`);
    if (request.kind === "listing")
      return Promise.resolve(
        directoryListingAnswer(request.path, listedFiles(files)).body,
      );
    const text = files[request.path];
    if (text === undefined) throw new Error(`Unpublished path ${request.path}`);
    return request.path === catalogPath
      ? Promise.resolve(text)
      : body(request.path, text);
  });
}

const contentPaths = () =>
  upstream.mock.calls
    .map(([args]) => parseRequest(args))
    .flatMap((request) => (request.kind === "content" ? [request.path] : []));
const catalog = (revision: string) =>
  performDoneCatalogRead(
    pinned,
    source,
    { kind: "done-catalog-at", revision },
    new AbortController().signal,
    vi.fn(),
  );
const bodies = (revision: string, files: readonly string[], naming = vi.fn()) =>
  performDoneCatalogRead(
    pinned,
    source,
    { kind: "done-bodies-at", revision, files },
    new AbortController().signal,
    naming,
  );
const recordsIn = (files: Files) =>
  catalogOf(files).records.map(({ fileName }) => fileName);
const catalogAnswer = (revision: string, files: Files) => ({
  kind: "answered",
  answer: { revision, catalog: files[catalogPath] },
});
const bodyAnswer = (
  revision: string,
  files: Files,
  names: readonly string[],
) => ({
  kind: "answered",
  answer: {
    revision,
    records: names.map((name) => {
      const path = `${doneDirectory}/${name}`;
      return { path, text: files[path] };
    }),
  },
});

function holdingBodies() {
  let resolve = () => {};
  const promise = new Promise<void>((release) => {
    resolve = release;
  });
  return { promise, resolve };
}

test("reads just the requested catalogued records and reuses the same blobs", async () => {
  const files = publishedDone({ doneRecords: doneRecords("named", 12) });
  serve({ [first]: files });
  await expect(catalog(first)).resolves.toEqual(catalogAnswer(first, files));
  expect(contentPaths()).toEqual([catalogPath]);
  const named = recordsIn(files).slice(0, 3);
  const next = fileOf(identityOf("named", 8));
  upstream.mockClear();
  await expect(bodies(first, named)).resolves.toEqual(
    bodyAnswer(first, files, named),
  );
  expect(contentPaths()).toEqual(
    named.map((name) => `${doneDirectory}/${name}`),
  );
  upstream.mockClear();
  await expect(bodies(first, [...named, next])).resolves.toEqual(
    bodyAnswer(first, files, [...named, next]),
  );
  expect(contentPaths()).toEqual([`${doneDirectory}/${next}`]);
});

test("a later catalog fetches only new or changed bodies and keeps the earlier pin", async () => {
  const done = doneRecords("changed", 4);
  const removed = identityOf("changed", 0);
  const changed = identityOf("changed", 1);
  const added = identityOf("changed", 9);
  const oldFiles = publishedDone({ doneRecords: done });
  const newFiles = publishedDone({
    doneRecords: [
      ...done.filter(
        ({ identity }) => identity !== changed && identity !== removed,
      ),
      makeMe.aDoneRecord
        .completed({ identity: changed, title: "Retitled" })
        .please(),
      makeMe.aDoneRecord
        .completed({ identity: added, title: "Newly done" })
        .please(),
    ],
  });
  serve({ [first]: oldFiles, [later]: newFiles });
  const oldNames = recordsIn(oldFiles);
  await expect(bodies(first, oldNames)).resolves.toEqual(
    bodyAnswer(first, oldFiles, oldNames),
  );
  upstream.mockClear();
  await expect(catalog(later)).resolves.toEqual(catalogAnswer(later, newFiles));
  const newNames = recordsIn(newFiles);
  await expect(bodies(later, newNames)).resolves.toEqual(
    bodyAnswer(later, newFiles, newNames),
  );
  expect(contentPaths().sort()).toEqual(
    [catalogPath, pathOf(added), pathOf(changed)].sort(),
  );
  upstream.mockClear();
  await expect(bodies(later, [fileOf(removed)])).resolves.toMatchObject({
    kind: "refused",
    status: 404,
  });
  await expect(bodies(first, [fileOf(changed)])).resolves.toEqual(
    bodyAnswer(first, oldFiles, [fileOf(changed)]),
  );
  expect(upstream).not.toHaveBeenCalled();
});

test("returns a catalogued unreadable body as published", async () => {
  const name = "SEED-200_malformed.json";
  const path = `${doneDirectory}/${name}`;
  const text = '{"schemaVersion":2}\n';
  const files = publishedDone({
    doneRecords: doneRecords("malformed", 2),
    files: { [path]: text },
  });
  serve({ [first]: files });
  await expect(bodies(first, [name])).resolves.toEqual({
    kind: "answered",
    answer: { revision: first, records: [{ path, text }] },
  });
  expect(contentPaths()).toEqual([catalogPath, path]);
});

test("reads independent record blobs together with at most four outstanding", async () => {
  const files = publishedDone({ doneRecords: doneRecords("parallel", 6) });
  const names = recordsIn(files);
  const { promise: held, resolve: release } = holdingBodies();
  let active = 0;
  let highWater = 0;
  serve({ [first]: files }, async (...[, text]) => {
    active += 1;
    highWater = Math.max(active, highWater);
    await held;
    active -= 1;
    return text;
  });
  const answer = bodies(first, names);
  try {
    await expect.poll(() => active).toBe(4);
  } finally {
    release();
  }
  await expect(answer).resolves.toEqual(bodyAnswer(first, files, names));
  expect(highWater).toBe(4);
});

test.each(["before", "after"] as const)(
  "names the failed path when a sibling is requested %s it",
  async (order) => {
    const files = publishedDone({ doneRecords: doneRecords("failed", 3) });
    const failedIdentity = identityOf("failed", 1);
    const siblingIdentity = identityOf("failed", 2);
    const failed = pathOf(failedIdentity);
    const sibling = pathOf(siblingIdentity);
    const naming = vi.fn<(reading: string) => void>();
    const { promise: started, resolve: siblingStarted } = holdingBodies();
    serve({ [first]: files }, async (record, text) => {
      if (record === sibling) siblingStarted();
      if (record === failed) {
        await started;
        throw new GhFailure({ kind: "unreachable" });
      }
      return text;
    });
    const names = [failedIdentity, siblingIdentity].map(fileOf);
    if (order === "before") names.reverse();
    const outcome = await bodies(first, names, naming).catch((error: unknown) =>
      reportedFailure(error, source, naming.mock.lastCall?.[0] ?? ""),
    );
    expect(outcome).toMatchObject({
      message: `The local GitHub CLI could not reach GitHub while reading ${failed} at ${first}.`,
      recovery: "transient",
    });
  },
);
