// A later PinnedTexts answers a pin it has heard from the retained directory
// (../../server/pinnedTexts.ts). Another directory reads afresh. A revision
// this process has not heard asks the file reader even when the text is
// already on disk, and a rejected reader of that unheard pin answers none
// of that text.

import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, onTestFinished, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  PinnedTexts,
  type RepositoryFileRead,
} from "../../server/pinnedTexts.ts";
import { RetainedAnswers } from "../../server/retainedAnswers.ts";
import { RevisionMemo } from "../../server/revisionMemo.ts";

const revision = "b7e1a4c0d19f4e2a8c6b0d3e5f7a9c1b2d4e6f80";
const backlogPath = ".planning/PRODUCT-BACKLOG.md";
const repository = "terryyin/open-dough";

const source = makeMe.aPublishedSource
  .with({
    ...makeMe.aPublishedSource.openDough.please(),
    backlogPath,
  })
  .please();

function temporaryDirectory(): string {
  const directory = mkdtempSync(path.join(tmpdir(), "heard-pins-"));
  onTestFinished(() => {
    rmSync(directory, { recursive: true, force: true });
  });
  return directory;
}

function pins(directory: string, readFile: RepositoryFileRead): PinnedTexts {
  return new PinnedTexts(
    new RevisionMemo(new RetainedAnswers({ directory })),
    readFile,
  );
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

function rejectingReader(reason: Error): {
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
    return Promise.reject(reason);
  };
  return { calls, readFile };
}

const asked = `${repository} ${backlogPath}@${revision}`;

test("a PinnedTexts that has heard the revision stores the upstream text, and a second on the same directory returns it without reading again", async () => {
  const text = "# Product backlog\nHeard upstream.\n";
  const directory = temporaryDirectory();
  const signal = new AbortController().signal;
  const upstream = readerOf(text);

  const stored = await pins(directory, upstream.readFile).namedRevisionText(
    source,
    revision,
    backlogPath,
    signal,
  );
  expect(stored).toBe(text);
  expect(upstream.calls).toEqual([asked]);

  const later = pins(directory, upstream.readFile);
  later.heardNamed(source, revision);
  const answered = await later.reader(source, revision, signal)(backlogPath);
  expect(answered).toBe(text);
  expect(upstream.calls).toEqual([asked]);
});

test("a PinnedTexts on a different directory, after hearing the revision, calls the reader", async () => {
  const held = "# Product backlog\nHeld on the first directory.\n";
  const upstreamText = "# Product backlog\nRead for the other directory.\n";
  const signal = new AbortController().signal;
  const first = readerOf(held);
  await pins(temporaryDirectory(), first.readFile).namedRevisionText(
    source,
    revision,
    backlogPath,
    signal,
  );

  const upstream = readerOf(upstreamText);
  const other = pins(temporaryDirectory(), upstream.readFile);
  other.heardNamed(source, revision);
  const answered = await other.reader(source, revision, signal)(backlogPath);
  expect(upstream.calls).toEqual([asked]);
  expect(answered).toBe(upstreamText);
});

test("a PinnedTexts that has not heard the revision calls the reader even when that directory already holds the text", async () => {
  const held = "# Product backlog\nAlready on disk.\n";
  const upstreamText = "# Product backlog\nAsked upstream unheard.\n";
  const directory = temporaryDirectory();
  const signal = new AbortController().signal;
  await pins(directory, readerOf(held).readFile).namedRevisionText(
    source,
    revision,
    backlogPath,
    signal,
  );

  const upstream = readerOf(upstreamText);
  const answered = await pins(directory, upstream.readFile).reader(
    source,
    revision,
    signal,
  )(backlogPath);
  expect(upstream.calls).toEqual([asked]);
  expect(answered).toBe(upstreamText);
});

test("an unheard revision whose reader rejects does not answer the text already on disk", async () => {
  const held = "# Product backlog\nAlready on disk.\n";
  const directory = temporaryDirectory();
  const signal = new AbortController().signal;
  await pins(directory, readerOf(held).readFile).namedRevisionText(
    source,
    revision,
    backlogPath,
    signal,
  );

  const loggedOut = rejectingReader(new Error("gh auth login"));
  await expect(
    pins(directory, loggedOut.readFile).reader(
      source,
      revision,
      signal,
    )(backlogPath),
  ).rejects.toThrow("gh auth login");
  expect(loggedOut.calls).toEqual([asked]);

  const later = readerOf("# Product backlog\nWould replace the pin.\n");
  const heard = pins(directory, later.readFile);
  heard.heardNamed(source, revision);
  const answered = await heard.reader(source, revision, signal)(backlogPath);
  expect(answered).toBe(held);
  expect(later.calls).toEqual([]);
});
