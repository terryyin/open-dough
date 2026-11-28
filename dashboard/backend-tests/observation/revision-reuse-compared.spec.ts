// Reads at a revision the ref names next share one in-flight comparison and
// its commit read (../../server/pinnedTexts.ts, ../../server/commitsBetween.ts).
// A file that differs between the two revisions is read at the later one
// even when the merge's own record omits it. A path renamed away is missing
// there whether the comparison or a commit between names the rename.

import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, onTestFinished, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { touchedBetweenViaGh } from "../../server/commitsBetween.ts";
import { comparisonViaGh } from "../../server/containmentRead.ts";
import {
  commitViaGh,
  type CommitFile,
  type CommitRecord,
} from "../../server/ghCommit.ts";
import { lastCommitTimeViaGh } from "../../server/ghCommitTime.ts";
import { isNotFound, GhFailure } from "../../server/ghFailure.ts";
import {
  listRepositoryDirectoryViaGh,
  type ListedFile,
} from "../../server/ghContents.ts";
import { listPathCommitsViaGh } from "../../server/ghProfileAddition.ts";
import {
  PinnedTexts,
  type RepositoryFileRead,
} from "../../server/pinnedTexts.ts";
import { RetainedAnswers } from "../../server/retainedAnswers.ts";
import { RevisionMemo } from "../../server/revisionMemo.ts";

const revisionA = "a7e1a4c0d19f4e2a8c6b0d3e5f7a9c1b2d4e6f80";
const revisionB = "b7e1a4c0d19f4e2a8c6b0d3e5f7a9c1b2d4e6f80";
const betweenCommit = "f2".repeat(20);
const mergeCommit = "c0".repeat(20);
const comparisonRename = "0c".repeat(20);
const commitRename = "1c".repeat(20);
const source = makeMe.aPublishedSource.openDough.please();
const paths = makeMe.aProjectRevision.paths;
const repository = source.repository;
const agentsDirectory = paths.profile.slice(0, paths.profile.lastIndexOf("/"));
const doneDirectory = paths.done.slice(0, paths.done.lastIndexOf("/"));

function temporaryDirectory(): string {
  const directory = mkdtempSync(path.join(tmpdir(), "revision-compared-"));
  onTestFinished(() => {
    rmSync(directory, { recursive: true, force: true });
  });
  return directory;
}

function blobSha(filePath: string): string {
  let hash = 2166136261;
  for (let index = 0; index < filePath.length; index += 1) {
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

// GitHub's comparison as `touchedBetweenViaGh` parses it: status, the commit
// count, each commit, then every filename and the name it came from.
function comparisonAnswer(
  commits: readonly string[],
  filenames: readonly string[],
  previousFilenames: readonly string[],
): string {
  return [
    "ahead",
    String(commits.length),
    ...commits,
    ...filenames,
    ...previousFilenames,
  ]
    .join("\n")
    .concat("\n");
}

function modified(filename: string): CommitFile {
  return { filename, status: "modified", previousFilename: null };
}

function renamed(filename: string, previousFilename: string): CommitFile {
  return { filename, status: "renamed", previousFilename };
}

function commitTouching(
  sha: string,
  files: readonly CommitFile[],
): CommitRecord {
  return {
    sha,
    committerName: "Fixture Committer",
    committedAt: "2026-11-27T12:00:00Z",
    login: null,
    avatar: null,
    files,
    whole: true,
  };
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

function comparedWith(answer: string): {
  readonly compared: {
    repository: string;
    base: string;
    head: string;
    perPage: number;
  }[];
  readonly touchedBetween: typeof touchedBetweenViaGh;
} {
  const compared: {
    repository: string;
    base: string;
    head: string;
    perPage: number;
  }[] = [];
  const compare = ((...args: Parameters<typeof comparisonViaGh>) => {
    const [comparedRepository, between, query] = args;
    compared.push({
      repository: comparedRepository,
      base: between.base,
      head: between.head,
      perPage: query.perPage,
    });
    return Promise.resolve(answer);
  }) satisfies typeof comparisonViaGh;
  const touchedBetween = ((...args: Parameters<typeof touchedBetweenViaGh>) => {
    const [comparedRepository, between, recordOf, signal] = args;
    return touchedBetweenViaGh(
      comparedRepository,
      between,
      recordOf,
      signal,
      compare,
    );
  }) satisfies typeof touchedBetweenViaGh;
  return { compared, touchedBetween };
}

function readingCommits(
  records: ReadonlyMap<string, CommitRecord>,
  commits: string[],
): typeof commitViaGh {
  return (...args) => {
    const [, commit] = args;
    commits.push(commit);
    const record = records.get(commit);
    return record === undefined
      ? Promise.reject(new GhFailure({ kind: "no-commit" }))
      : Promise.resolve(record);
  };
}

function heldCommit(
  record: CommitRecord,
  commits: string[],
): {
  readonly arrived: Promise<void>;
  readonly release: () => void;
  readonly read: typeof commitViaGh;
} {
  let noteArrival: () => void = () => undefined;
  const arrived = new Promise<void>((resolve) => {
    noteArrival = resolve;
  });
  let noteRelease: () => void = () => undefined;
  const released = new Promise<void>((resolve) => {
    noteRelease = resolve;
  });
  const read: typeof commitViaGh = (...args) => {
    const [, commit] = args;
    commits.push(commit);
    noteArrival();
    return released.then(() => ({ ...record, sha: commit }));
  };
  return {
    arrived,
    release: () => {
      noteRelease();
    },
    read,
  };
}

function pinsFor(
  byRevision: RevisionFiles,
  answer: string,
  readCommit: typeof commitViaGh,
): {
  readonly pinned: PinnedTexts;
  readonly calls: string[];
  readonly compared: {
    repository: string;
    base: string;
    head: string;
    perPage: number;
  }[];
} {
  const upstream = trackingUpstream(byRevision);
  const account = comparedWith(answer);
  const pinned = new PinnedTexts(
    new RevisionMemo(new RetainedAnswers({ directory: temporaryDirectory() })),
    upstream.readFile,
    account.touchedBetween,
    upstream.listDirectory,
    lastCommitTimeViaGh,
    listPathCommitsViaGh,
    readCommit,
  );
  return { pinned, calls: upstream.calls, compared: account.compared };
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

function oneComparison(): {
  repository: string;
  base: string;
  head: string;
  perPage: number;
} {
  return { repository, base: revisionA, head: revisionB, perPage: 10 };
}

test("a read at B that arrives while another awaits the commit between waits on the same comparison", async () => {
  const files = makeMe.aProjectRevision.labeled("coinciding").please().files;
  const commits: string[] = [];
  const held = heldCommit(
    commitTouching(betweenCommit, [modified("src/app.ts")]),
    commits,
  );
  const { pinned, calls, compared } = pinsFor(
    new Map([
      [revisionA, files],
      [revisionB, files],
    ]),
    comparisonAnswer([betweenCommit], [], []),
    held.read,
  );
  await retainAtA(pinned);
  calls.length = 0;
  pinned.namedByRef(source, revisionB);
  const signal = new AbortController().signal;
  const read = pinned.reader(source, revisionB, signal);

  expect(await read(paths.backlog)).toBe(files[paths.backlog]);
  expect(compared).toEqual([]);

  let seedSettled = false;
  const seed = read(paths.seed).finally(() => {
    seedSettled = true;
  });
  await held.arrived;
  const profiles = pinned.lister(source, revisionB, signal)(agentsDirectory);
  await Promise.resolve();

  expect(seedSettled).toBe(false);
  expect(compared).toEqual([oneComparison()]);
  expect(commits).toEqual([betweenCommit]);

  held.release();
  expect(await seed).toBe(files[paths.seed]);
  expect(await profiles).toEqual(
    await pinned.lister(source, revisionA, signal)(agentsDirectory),
  );
  expect(compared).toEqual([oneComparison()]);
  expect(commits).toEqual([betweenCommit]);
  expect(calls).toEqual([asked(paths.backlog, revisionB)]);
});

test("a seed that differs between A and B is read at B though the merge between does not name it", async () => {
  const project = makeMe.aProjectRevision.labeled("merged");
  const atA = project.please().files;
  const mergedText = project.seedText("merged at B");
  const atB = { ...atA, [paths.seed]: mergedText };
  const commits: string[] = [];
  const { pinned, calls, compared } = pinsFor(
    new Map([
      [revisionA, atA],
      [revisionB, atB],
    ]),
    comparisonAnswer([mergeCommit], [paths.seed], [""]),
    readingCommits(
      new Map([
        [mergeCommit, commitTouching(mergeCommit, [modified("src/app.ts")])],
      ]),
      commits,
    ),
  );
  await retainAtA(pinned);
  calls.length = 0;
  pinned.namedByRef(source, revisionB);
  const signal = new AbortController().signal;
  const read = pinned.reader(source, revisionB, signal);

  expect(await read(paths.backlog)).toBe(atA[paths.backlog]);
  expect(await read(paths.seed)).toBe(mergedText);
  expect(await read(paths.otherSeed)).toBe(atA[paths.otherSeed]);
  expect(await read(paths.plan)).toBe(atA[paths.plan]);
  expect(await read(paths.settings)).toBe(atA[paths.settings]);
  expect(calls).toEqual([
    asked(paths.backlog, revisionB),
    asked(paths.seed, revisionB),
  ]);
  expect(compared).toEqual([oneComparison()]);
  expect(commits).toEqual([mergeCommit]);
});

test("a seed the comparison names as renamed away, though no commit between does, is missing at B", async () => {
  const atA = makeMe.aProjectRevision.labeled("renamed").please().files;
  const renamedText = atA[paths.otherSeed] ?? "";
  const atB = {
    ...Object.fromEntries(
      Object.entries(atA).filter(([filePath]) => filePath !== paths.otherSeed),
    ),
    [paths.newSeed]: renamedText,
  };
  const commits: string[] = [];
  const { pinned, calls, compared } = pinsFor(
    new Map([
      [revisionA, atA],
      [revisionB, atB],
    ]),
    comparisonAnswer([comparisonRename], [paths.newSeed], [paths.otherSeed]),
    readingCommits(
      new Map([
        [
          comparisonRename,
          commitTouching(comparisonRename, [modified("src/app.ts")]),
        ],
      ]),
      commits,
    ),
  );
  await retainAtA(pinned);
  calls.length = 0;
  pinned.namedByRef(source, revisionB);
  const signal = new AbortController().signal;
  const read = pinned.reader(source, revisionB, signal);

  await read(paths.backlog);
  const missing = read(paths.otherSeed);
  await expect(missing.then(() => false, isNotFound)).resolves.toBe(true);
  expect(calls).toEqual([
    asked(paths.backlog, revisionB),
    asked(paths.otherSeed, revisionB),
  ]);
  expect(compared).toEqual([oneComparison()]);
  expect(commits).toEqual([comparisonRename]);
});

test("a seed a commit between renames away, though the comparison does not name it, is missing at B and its new path is read", async () => {
  const project = makeMe.aProjectRevision.labeled("renamed by a commit");
  const atA = project.please().files;
  const atB = project
    .with({
      backlog: project.backlogNaming(project.newSeedEntry),
      files: { [paths.newSeed]: project.newSeedText },
      remove: [paths.otherSeed],
    })
    .please().files;
  const commits: string[] = [];
  const { pinned, calls, compared } = pinsFor(
    new Map([
      [revisionA, atA],
      [revisionB, atB],
    ]),
    comparisonAnswer([commitRename], [], []),
    readingCommits(
      new Map([
        [
          commitRename,
          commitTouching(commitRename, [
            modified(paths.backlog),
            renamed(paths.newSeed, paths.otherSeed),
          ]),
        ],
      ]),
      commits,
    ),
  );
  await retainAtA(pinned);
  calls.length = 0;
  pinned.namedByRef(source, revisionB);
  const signal = new AbortController().signal;
  const read = pinned.reader(source, revisionB, signal);

  await read(paths.backlog);
  const missing = read(paths.otherSeed);
  await expect(missing.then(() => false, isNotFound)).resolves.toBe(true);
  expect(await read(paths.newSeed)).toBe(project.newSeedText);
  expect(calls).toEqual([
    asked(paths.backlog, revisionB),
    asked(paths.otherSeed, revisionB),
    asked(paths.newSeed, revisionB),
  ]);
  expect(compared).toEqual([oneComparison()]);
  expect(commits).toEqual([commitRename]);
});
