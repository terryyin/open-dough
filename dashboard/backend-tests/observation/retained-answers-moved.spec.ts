// A later PinnedTexts reuses a non-backlog path across a moved revision
// (../../server/pinnedMemo.ts, ../../server/pinnedTexts.ts): once a process
// answered the backlog at A, a process whose ref names B reads that path from
// A's retained text when the comparison says it is untouched. A path the
// comparison touched, a comparison that establishes nothing, and a process
// that has not heard B each ask the file reader at B.

import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, onTestFinished, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { touchedBetweenViaGh } from "../../server/commitsBetween.ts";
import {
  PinnedTexts,
  type RepositoryFileRead,
} from "../../server/pinnedTexts.ts";
import { RetainedAnswers } from "../../server/retainedAnswers.ts";
import { RevisionMemo } from "../../server/revisionMemo.ts";

const revisionA = "a7e1a4c0d19f4e2a8c6b0d3e5f7a9c1b2d4e6f80";
const revisionB = "b7e1a4c0d19f4e2a8c6b0d3e5f7a9c1b2d4e6f80";
const backlogPath = ".planning/PRODUCT-BACKLOG.md";
const recordPath = ".planning/seeds/SEED-413.md";
const otherPath = ".planning/seeds/SEED-1.md";
const repository = "terryyin/open-dough";
const heldAtA = "# Seed\nRetained at A.\n";
const readAtB = "# Seed\nRead at B.\n";

const source = makeMe.aPublishedSource
  .with({
    ...makeMe.aPublishedSource.openDough.please(),
    backlogPath,
  })
  .please();

function temporaryDirectory(): string {
  const directory = mkdtempSync(path.join(tmpdir(), "moved-pins-"));
  onTestFinished(() => {
    rmSync(directory, { recursive: true, force: true });
  });
  return directory;
}

function pins(
  directory: string,
  readFile: RepositoryFileRead,
  touchedBetween?: typeof touchedBetweenViaGh,
): PinnedTexts {
  const memo = new RevisionMemo(new RetainedAnswers({ directory }));
  return touchedBetween === undefined
    ? new PinnedTexts(memo, readFile)
    : new PinnedTexts(memo, readFile, touchedBetween);
}

function readerOf(answer: string): {
  readonly calls: string[];
  readonly readFile: RepositoryFileRead;
} {
  const calls: string[] = [];
  const readFile: RepositoryFileRead = (
    readRepository,
    filePath,
    fileRevision,
  ) => {
    calls.push(`${readRepository} ${filePath}@${fileRevision}`);
    return Promise.resolve(answer);
  };
  return { calls, readFile };
}

function comparisonReturning(touched: readonly string[] | null): {
  readonly calls: { repository: string; base: string; head: string }[];
  readonly touchedBetween: typeof touchedBetweenViaGh;
} {
  const calls: { repository: string; base: string; head: string }[] = [];
  const touchedBetween: typeof touchedBetweenViaGh = (repository, between) => {
    calls.push({
      repository,
      base: between.base,
      head: between.head,
    });
    return Promise.resolve(touched);
  };
  return { calls, touchedBetween };
}

const askedAt = (revision: string) => `${repository} ${recordPath}@${revision}`;

async function retainAtA(directory: string): Promise<void> {
  const earlier = pins(directory, readerOf(heldAtA).readFile);
  earlier.answeredBacklog(source, revisionA);
  earlier.heardNamed(source, revisionA);
  await earlier.reader(
    source,
    revisionA,
    new AbortController().signal,
  )(recordPath);
}

test("after the backlog was answered at A and the ref names B, a path the comparison says is untouched is returned from A's retained text and the file reader is not called", async () => {
  const directory = temporaryDirectory();
  await retainAtA(directory);
  const upstream = readerOf(readAtB);
  const comparison = comparisonReturning([otherPath]);
  const later = pins(directory, upstream.readFile, comparison.touchedBetween);
  later.namedByRef(source, revisionB);

  const answered = await later.reader(
    source,
    revisionB,
    new AbortController().signal,
  )(recordPath);

  expect(answered).toBe(heldAtA);
  expect(upstream.calls).toEqual([]);
  expect(comparison.calls).toEqual([
    { repository, base: revisionA, head: revisionB },
  ]);
});

test("a path the comparison says was touched is read at B and that new text is what the read returns", async () => {
  const directory = temporaryDirectory();
  await retainAtA(directory);
  const upstream = readerOf(readAtB);
  const comparison = comparisonReturning([recordPath]);
  const later = pins(directory, upstream.readFile, comparison.touchedBetween);
  later.namedByRef(source, revisionB);

  const answered = await later.reader(
    source,
    revisionB,
    new AbortController().signal,
  )(recordPath);

  expect(comparison.calls).toEqual([
    { repository, base: revisionA, head: revisionB },
  ]);
  expect(upstream.calls).toEqual([askedAt(revisionB)]);
  expect(answered).toBe(readAtB);
});

test("when the comparison returns null, the file reader is called and the read does not return A's text", async () => {
  const directory = temporaryDirectory();
  await retainAtA(directory);
  const upstream = readerOf(readAtB);
  const comparison = comparisonReturning(null);
  const later = pins(directory, upstream.readFile, comparison.touchedBetween);
  later.namedByRef(source, revisionB);

  const answered = await later.reader(
    source,
    revisionB,
    new AbortController().signal,
  )(recordPath);

  expect(upstream.calls).toEqual([askedAt(revisionB)]);
  expect(answered).toBe(readAtB);
});

test("when this process has not heard B, the file reader is called even though A's text is on disk", async () => {
  const directory = temporaryDirectory();
  await retainAtA(directory);
  const upstream = readerOf(readAtB);
  const comparison = comparisonReturning([otherPath]);
  const later = pins(directory, upstream.readFile, comparison.touchedBetween);

  const answered = await later.reader(
    source,
    revisionB,
    new AbortController().signal,
  )(recordPath);

  expect(upstream.calls).toEqual([askedAt(revisionB)]);
  expect(answered).toBe(readAtB);
});
