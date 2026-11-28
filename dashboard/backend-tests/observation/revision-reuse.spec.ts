// Once a process answers the backlog at A and the ref names B, the backlog
// at B is read there, and every other read is answered from A when the
// comparison says the move did not touch it (../../server/pinnedTexts.ts).
// A touched, added, or removed record is read at B. A move past B to C is
// compared from A.

import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, onTestFinished, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { touchedBetweenViaGh } from "../../server/commitsBetween.ts";
import { GhFailure } from "../../server/ghFailure.ts";
import {
  listRepositoryDirectoryViaGh,
  type ListedFile,
} from "../../server/ghContents.ts";
import {
  PinnedTexts,
  type RepositoryFileRead,
} from "../../server/pinnedTexts.ts";
import { RetainedAnswers } from "../../server/retainedAnswers.ts";
import { RevisionMemo } from "../../server/revisionMemo.ts";

const revisionA = "a7e1a4c0d19f4e2a8c6b0d3e5f7a9c1b2d4e6f80";
const revisionB = "b7e1a4c0d19f4e2a8c6b0d3e5f7a9c1b2d4e6f80";
const revisionC = "c7e1a4c0d19f4e2a8c6b0d3e5f7a9c1b2d4e6f80";
const source = makeMe.aPublishedSource.openDough.please();
const paths = makeMe.aProjectRevision.paths;
const repository = source.repository;
const agentsDirectory = paths.profile.slice(0, paths.profile.lastIndexOf("/"));
const doneDirectory = paths.done.slice(0, paths.done.lastIndexOf("/"));

function temporaryDirectory(): string {
  const directory = mkdtempSync(path.join(tmpdir(), "revision-reuse-"));
  onTestFinished(() => {
    rmSync(directory, { recursive: true, force: true });
  });
  return directory;
}

function blobSha(filePath: string): string {
  let hash = 2166136261;
  for (let index = 0; index < filePath.length; index++) {
    hash ^= filePath.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  const hex = (hash >>> 0).toString(16).padStart(8, "0");
  return (hex + hex + hex + hex + hex).slice(0, 40);
}

function asked(filePath: string, revision: string): string {
  return `${repository} ${filePath}@${revision}`;
}

function listingAsked(directory: string, revision: string): string {
  return `${repository} listing ${directory}@${revision}`;
}

type RevisionFiles = ReadonlyMap<string, Readonly<Record<string, string>>>;

function trackingUpstream(byRevision: RevisionFiles): {
  readonly calls: string[];
  readonly readFile: RepositoryFileRead;
  readonly listDirectory: typeof listRepositoryDirectoryViaGh;
} {
  const calls: string[] = [];
  const readFile: RepositoryFileRead = (
    readRepository,
    filePath,
    fileRevision,
  ) => {
    calls.push(`${readRepository} ${filePath}@${fileRevision}`);
    const text = byRevision.get(fileRevision)?.[filePath];
    return text === undefined
      ? Promise.reject(new GhFailure({ kind: "http", status: 404 }))
      : Promise.resolve(text);
  };
  const listDirectory = ((
    ...args: Parameters<typeof listRepositoryDirectoryViaGh>
  ) => {
    const [, directory, fileRevision] = args;
    calls.push(listingAsked(directory, fileRevision));
    const files = byRevision.get(fileRevision) ?? {};
    const prefix = `${directory}/`;
    const listed: ListedFile[] = Object.keys(files)
      .filter(
        (filePath) =>
          filePath.startsWith(prefix) &&
          !filePath.slice(prefix.length).includes("/"),
      )
      .sort()
      .map((filePath) => ({
        name: filePath.slice(prefix.length),
        sha: blobSha(filePath),
      }));
    return Promise.resolve(listed);
  }) satisfies typeof listRepositoryDirectoryViaGh;
  return { calls, readFile, listDirectory };
}

function comparisonReturning(touched: readonly string[] | null): {
  readonly calls: { repository: string; base: string; head: string }[];
  readonly touchedBetween: typeof touchedBetweenViaGh;
} {
  const calls: { repository: string; base: string; head: string }[] = [];
  const touchedBetween: typeof touchedBetweenViaGh = (
    comparedRepository,
    between,
  ) => {
    calls.push({
      repository: comparedRepository,
      base: between.base,
      head: between.head,
    });
    return Promise.resolve(touched);
  };
  return { calls, touchedBetween };
}

function pinsFor(
  byRevision: RevisionFiles,
  touched: readonly string[] | null,
): {
  readonly pinned: PinnedTexts;
  readonly calls: string[];
  readonly compared: { repository: string; base: string; head: string }[];
} {
  const upstream = trackingUpstream(byRevision);
  const comparison = comparisonReturning(touched);
  const pinned = new PinnedTexts(
    new RevisionMemo(new RetainedAnswers({ directory: temporaryDirectory() })),
    upstream.readFile,
    comparison.touchedBetween,
    upstream.listDirectory,
  );
  return { pinned, calls: upstream.calls, compared: comparison.calls };
}

async function retainAtA(pinned: PinnedTexts): Promise<void> {
  const signal = new AbortController().signal;
  pinned.answeredBacklog(source, revisionA);
  pinned.heardNamed(source, revisionA);
  const read = pinned.reader(source, revisionA, signal);
  const list = pinned.lister(source, revisionA, signal);
  await read(paths.backlog);
  await read(paths.seed);
  await read(paths.otherSeed);
  await read(paths.plan);
  await read(paths.settings);
  const profiles = await list(agentsDirectory);
  const readBlob = pinned.blobReader(source, revisionA, signal);
  for (const file of profiles) {
    await readBlob({ path: `${agentsDirectory}/${file.name}`, sha: file.sha });
  }
  await list(doneDirectory);
}

test("an unrelated commit: the backlog is read at B, and every other read there is answered from A after one comparison", async () => {
  const files = makeMe.aProjectRevision.labeled("unrelated").please().files;
  const { pinned, calls, compared } = pinsFor(
    new Map([
      [revisionA, files],
      [revisionB, files],
    ]),
    ["src/app.ts"],
  );
  await retainAtA(pinned);
  calls.length = 0;
  pinned.namedByRef(source, revisionB);
  const signal = new AbortController().signal;
  const read = pinned.reader(source, revisionB, signal);
  const list = pinned.lister(source, revisionB, signal);

  expect(await read(paths.backlog)).toBe(files[paths.backlog]);
  expect(calls).toEqual([asked(paths.backlog, revisionB)]);
  expect(compared).toEqual([]);

  expect(await read(paths.seed)).toBe(files[paths.seed]);
  expect(await read(paths.otherSeed)).toBe(files[paths.otherSeed]);
  expect(await read(paths.plan)).toBe(files[paths.plan]);
  expect(await read(paths.settings)).toBe(files[paths.settings]);
  expect(await list(agentsDirectory)).toEqual(
    await pinned.lister(source, revisionA, signal)(agentsDirectory),
  );
  expect(await list(doneDirectory)).toEqual(
    await pinned.lister(source, revisionA, signal)(doneDirectory),
  );
  expect(calls).toEqual([asked(paths.backlog, revisionB)]);
  expect(compared).toEqual([{ repository, base: revisionA, head: revisionB }]);
});

test("a changed seed alone is read at B, and its new text is answered there", async () => {
  const project = makeMe.aProjectRevision.labeled("changed-seed");
  const atA = project.please().files;
  const changedText = project.seedText("changed-seed at B");
  const atB = { ...atA, [paths.seed]: changedText };
  const { pinned, calls, compared } = pinsFor(
    new Map([
      [revisionA, atA],
      [revisionB, atB],
    ]),
    [paths.seed],
  );
  await retainAtA(pinned);
  calls.length = 0;
  pinned.namedByRef(source, revisionB);
  const signal = new AbortController().signal;
  const read = pinned.reader(source, revisionB, signal);

  await read(paths.backlog);
  expect(await read(paths.seed)).toBe(changedText);
  expect(await read(paths.otherSeed)).toBe(atA[paths.otherSeed]);
  expect(await read(paths.plan)).toBe(atA[paths.plan]);
  expect(calls).toEqual([
    asked(paths.backlog, revisionB),
    asked(paths.seed, revisionB),
  ]);
  expect(compared).toEqual([{ repository, base: revisionA, head: revisionB }]);
});

test("a changed backlog naming a new seed, an added done record, and a changed plan are read at B; nothing else is", async () => {
  const project = makeMe.aProjectRevision.labeled("changed");
  const atA = project.please().files;
  const planText = "# Plan changed, a slice done\n";
  const atB = project
    .with({
      backlog: project.backlogNaming(project.newSeedEntry),
      files: {
        [paths.newSeed]: project.newSeedText,
        [paths.plan]: planText,
      },
      doneRecords: [project.doneRecord("SEED-304#added", "added")],
    })
    .please().files;
  const { pinned, calls, compared } = pinsFor(
    new Map([
      [revisionA, atA],
      [revisionB, atB],
    ]),
    [
      paths.backlog,
      paths.newSeed,
      paths.addedDone,
      paths.doneCatalog,
      paths.plan,
    ],
  );
  await retainAtA(pinned);
  calls.length = 0;
  pinned.namedByRef(source, revisionB);
  const signal = new AbortController().signal;
  const read = pinned.reader(source, revisionB, signal);
  const done = await pinned.lister(source, revisionB, signal)(doneDirectory);

  expect(await read(paths.backlog)).toBe(atB[paths.backlog]);
  expect(await read(paths.newSeed)).toBe(project.newSeedText);
  expect(await read(paths.addedDone)).toBe(atB[paths.addedDone]);
  expect(await read(paths.plan)).toBe(planText);
  expect(await read(paths.doneCatalog)).toBe(atB[paths.doneCatalog]);
  expect(done.map(({ name }) => name)).toContain(
    paths.addedDone.slice(paths.addedDone.lastIndexOf("/") + 1),
  );
  expect(calls).toEqual([
    listingAsked(doneDirectory, revisionB),
    asked(paths.backlog, revisionB),
    asked(paths.newSeed, revisionB),
    asked(paths.addedDone, revisionB),
    asked(paths.plan, revisionB),
    asked(paths.doneCatalog, revisionB),
  ]);

  expect(await read(paths.seed)).toBe(atA[paths.seed]);
  expect(await read(paths.otherSeed)).toBe(atA[paths.otherSeed]);
  expect(await read(paths.settings)).toBe(atA[paths.settings]);
  expect(
    await pinned.lister(source, revisionB, signal)(agentsDirectory),
  ).toEqual(await pinned.lister(source, revisionA, signal)(agentsDirectory));
  expect(calls).toEqual([
    listingAsked(doneDirectory, revisionB),
    asked(paths.backlog, revisionB),
    asked(paths.newSeed, revisionB),
    asked(paths.addedDone, revisionB),
    asked(paths.plan, revisionB),
    asked(paths.doneCatalog, revisionB),
  ]);
  expect(compared).toEqual([{ repository, base: revisionA, head: revisionB }]);
});

test("a profile a commit between removed is not listed at B, and its text at A is not served", async () => {
  const files = makeMe.aProjectRevision.labeled("removed").please().files;
  const removed = files[paths.otherProfile] ?? "";
  const atB = Object.fromEntries(
    Object.entries(files).filter(
      ([filePath]) => filePath !== paths.otherProfile,
    ),
  );
  const { pinned, calls, compared } = pinsFor(
    new Map([
      [revisionA, files],
      [revisionB, atB],
    ]),
    [paths.otherProfile],
  );
  await retainAtA(pinned);
  calls.length = 0;
  pinned.namedByRef(source, revisionB);
  const signal = new AbortController().signal;
  const listing = await pinned.lister(
    source,
    revisionB,
    signal,
  )(agentsDirectory);
  const readBlob = pinned.blobReader(source, revisionB, signal);
  const served: string[] = [];
  for (const file of listing) {
    served.push(
      await readBlob({
        path: `${agentsDirectory}/${file.name}`,
        sha: file.sha,
      }),
    );
  }

  const removedName = paths.otherProfile.slice(
    paths.otherProfile.lastIndexOf("/") + 1,
  );
  expect(listing.map(({ name }) => name)).not.toContain(removedName);
  expect(served).not.toContain(removed);
  expect(served).toContain(files[paths.profile]);
  expect(calls).toEqual([listingAsked(agentsDirectory, revisionB)]);
  expect(compared).toEqual([{ repository, base: revisionA, head: revisionB }]);
});

test("a record the backlog still names that a commit between removed is missing at B, not filled from A", async () => {
  const files = makeMe.aProjectRevision.labeled("missing").please().files;
  const removed = files[paths.otherSeed] ?? "";
  const atB = Object.fromEntries(
    Object.entries(files).filter(([filePath]) => filePath !== paths.otherSeed),
  );
  const { pinned, calls, compared } = pinsFor(
    new Map([
      [revisionA, files],
      [revisionB, atB],
    ]),
    [paths.otherSeed],
  );
  await retainAtA(pinned);
  calls.length = 0;
  pinned.namedByRef(source, revisionB);
  const signal = new AbortController().signal;

  const missing = pinned.reader(source, revisionB, signal)(paths.otherSeed);
  await expect(missing).rejects.toBeInstanceOf(GhFailure);
  await expect(missing).rejects.not.toBe(removed);
  expect(calls).toEqual([asked(paths.otherSeed, revisionB)]);
  expect(compared).toEqual([{ repository, base: revisionA, head: revisionB }]);
});

test("a move from A past B to C is compared from A, not from B", async () => {
  const files = makeMe.aProjectRevision.labeled("past").please().files;
  const { pinned, calls, compared } = pinsFor(
    new Map([
      [revisionA, files],
      [revisionB, files],
      [revisionC, files],
    ]),
    ["src/app.ts", "README.md"],
  );
  await retainAtA(pinned);
  calls.length = 0;
  pinned.namedByRef(source, revisionB);
  pinned.namedByRef(source, revisionC);
  const signal = new AbortController().signal;

  expect(await pinned.reader(source, revisionC, signal)(paths.seed)).toBe(
    files[paths.seed],
  );
  expect(calls).toEqual([]);
  expect(compared).toEqual([{ repository, base: revisionA, head: revisionC }]);
});
