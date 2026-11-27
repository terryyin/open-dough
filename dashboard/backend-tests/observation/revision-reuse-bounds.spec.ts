// What establishes nothing about a revision the ref names next
// (../../server/pinnedTexts.ts, ../../server/commitsBetween.ts): behind or
// diverged, more than ten commits between, a comparison or commit whose
// change list is cut at 300 files, a story-branch head, and a fresh process
// with an empty store. The ten-commit and 300-file bounds are
// `touchedBetweenViaGh`'s, asked through its comparison and commit
// collaborators.

import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, onTestFinished, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { touchedBetweenViaGh } from "../../server/commitsBetween.ts";
import { comparisonViaGh } from "../../server/containmentRead.ts";
import type { CommitRecord } from "../../server/ghCommit.ts";
import { GhFailure } from "../../server/ghFailure.ts";
import { listRepositoryDirectoryViaGh } from "../../server/ghContents.ts";
import { lastCommitTimeViaGh } from "../../server/ghCommitTime.ts";
import {
  PinnedTexts,
  type RepositoryFileRead,
} from "../../server/pinnedTexts.ts";
import { RetainedAnswers } from "../../server/retainedAnswers.ts";
import { RevisionMemo } from "../../server/revisionMemo.ts";

const revisionA = "a7e1a4c0d19f4e2a8c6b0d3e5f7a9c1b2d4e6f80";
const revisionB = "b7e1a4c0d19f4e2a8c6b0d3e5f7a9c1b2d4e6f80";
const movedHead = "e7e1a4c0d19f4e2a8c6b0d3e5f7a9c1b2d4e6f80";
const profileSha = "f7e1a4c0d19f4e2a8c6b0d3e5f7a9c1b2d4e6f80";
const source = makeMe.aPublishedSource.openDough.please();
const paths = makeMe.aProjectRevision.paths;
const repository = source.repository;
const agentsDirectory = paths.profile.slice(0, paths.profile.lastIndexOf("/"));
const doneDirectory = paths.done.slice(0, paths.done.lastIndexOf("/"));

function temporaryDirectory(): string {
  const directory = mkdtempSync(path.join(tmpdir(), "revision-bounds-"));
  onTestFinished(() => {
    rmSync(directory, { recursive: true, force: true });
  });
  return directory;
}

function asked(filePath: string, revision: string): string {
  return `${repository} ${filePath}@${revision}`;
}

function listingAsked(directory: string, revision: string): string {
  return `${repository} listing ${directory}@${revision}`;
}

function commitSha(index: number): string {
  return index.toString(16).padStart(40, "0");
}

// GitHub's comparison as `touchedBetweenViaGh` parses it: status, the commit
// count, each commit, then every filename and the name it came from.
function comparisonAnswer(
  status: string,
  commits: readonly string[],
  files: readonly string[],
): string {
  return [
    status,
    String(commits.length),
    ...commits,
    ...files,
    ...files.map(() => ""),
  ]
    .join("\n")
    .concat("\n");
}

type RevisionFiles = ReadonlyMap<string, Readonly<Record<string, string>>>;

function trackingUpstream(
  byRevision: RevisionFiles,
  commitTimes: ReadonlyMap<string, string> = new Map(),
): {
  readonly calls: string[];
  readonly readFile: RepositoryFileRead;
  readonly listDirectory: typeof listRepositoryDirectoryViaGh;
  readonly commitTime: typeof lastCommitTimeViaGh;
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
    return Promise.resolve([]);
  }) satisfies typeof listRepositoryDirectoryViaGh;
  const commitTime = ((...args: Parameters<typeof lastCommitTimeViaGh>) => {
    const [, filePath, fileRevision] = args;
    calls.push(`${repository} commit-time ${filePath}@${fileRevision}`);
    const at = commitTimes.get(`${fileRevision}\0${filePath}`);
    return at === undefined
      ? Promise.reject(new GhFailure({ kind: "no-commit" }))
      : Promise.resolve(at);
  }) satisfies typeof lastCommitTimeViaGh;
  return { calls, readFile, listDirectory, commitTime };
}

function boundBetween(
  answer: string,
  recordOf?: (commit: string) => Promise<CommitRecord>,
): {
  readonly compared: {
    repository: string;
    base: string;
    head: string;
    perPage: number;
  }[];
  readonly commits: string[];
  readonly established: () => readonly string[] | null | undefined;
  readonly touchedBetween: typeof touchedBetweenViaGh;
} {
  const compared: {
    repository: string;
    base: string;
    head: string;
    perPage: number;
  }[] = [];
  const commits: string[] = [];
  let established: readonly string[] | null | undefined;
  const compare: typeof comparisonViaGh = (
    comparedRepository,
    between,
    query,
  ) => {
    compared.push({
      repository: comparedRepository,
      base: between.base,
      head: between.head,
      perPage: query.perPage,
    });
    return Promise.resolve(answer);
  };
  const touchedBetween = (async (
    ...args: Parameters<typeof touchedBetweenViaGh>
  ) => {
    const [comparedRepository, between, , signal] = args;
    const readCommit = (commit: string) => {
      commits.push(commit);
      return recordOf === undefined
        ? Promise.reject(new Error(`commit ${commit} was read`))
        : recordOf(commit);
    };
    const touched = await touchedBetweenViaGh(
      comparedRepository,
      between,
      readCommit,
      signal,
      compare,
    );
    established = touched;
    return touched;
  }) satisfies typeof touchedBetweenViaGh;
  return {
    compared,
    commits,
    established: () => established,
    touchedBetween,
  };
}

function pinsFor(
  byRevision: RevisionFiles,
  touchedBetween: typeof touchedBetweenViaGh,
  commitTimes?: ReadonlyMap<string, string>,
): { readonly pinned: PinnedTexts; readonly calls: string[] } {
  const upstream = trackingUpstream(byRevision, commitTimes);
  const pinned = new PinnedTexts(
    new RevisionMemo(new RetainedAnswers({ directory: temporaryDirectory() })),
    upstream.readFile,
    touchedBetween,
    upstream.listDirectory,
    upstream.commitTime,
  );
  return { pinned, calls: upstream.calls };
}

async function readVisit(pinned: PinnedTexts, revision: string): Promise<void> {
  const signal = new AbortController().signal;
  const read = pinned.reader(source, revision, signal);
  const list = pinned.lister(source, revision, signal);
  await read(paths.backlog);
  await read(paths.seed);
  await read(paths.otherSeed);
  await read(paths.plan);
  await read(paths.settings);
  await list(agentsDirectory);
  await list(doneDirectory);
}

function visitAt(revision: string): string[] {
  return [
    asked(paths.backlog, revision),
    asked(paths.seed, revision),
    asked(paths.otherSeed, revision),
    asked(paths.plan, revision),
    asked(paths.settings, revision),
    listingAsked(agentsDirectory, revision),
    listingAsked(doneDirectory, revision),
  ];
}

const filesAt = (label: string) =>
  makeMe.aProjectRevision.labeled(label).please().files;

for (const status of ["behind", "diverged"] as const) {
  test(`a revision ${status} A reuses nothing from the comparison, asks it once, and still reuses a listed record's blob`, async () => {
    const atA = filesAt(status);
    const seedAtB = makeMe.aProjectRevision.seedText(`${status} at B`);
    const atB = { ...atA, [paths.seed]: seedAtB };
    const bound = boundBetween(comparisonAnswer(status, [], []));
    const { pinned, calls } = pinsFor(
      new Map([
        [revisionA, atA],
        [revisionB, atB],
      ]),
      bound.touchedBetween,
    );
    const signal = new AbortController().signal;
    pinned.answeredBacklog(source, revisionA);
    pinned.heardNamed(source, revisionA);
    await pinned.reader(source, revisionA, signal)(paths.seed);
    const profileAtA = await pinned.blobReader(
      source,
      revisionA,
      signal,
    )({ path: paths.profile, sha: profileSha });
    calls.length = 0;
    pinned.namedByRef(source, revisionB);

    expect(await pinned.reader(source, revisionB, signal)(paths.seed)).toBe(
      seedAtB,
    );
    expect(
      await pinned.blobReader(
        source,
        revisionB,
        signal,
      )({
        path: paths.profile,
        sha: profileSha,
      }),
    ).toBe(profileAtA);
    await pinned.reader(source, revisionB, signal)(paths.plan);
    expect(calls).toEqual([
      asked(paths.seed, revisionB),
      asked(paths.plan, revisionB),
    ]);
    expect(bound.commits).toEqual([]);
    expect(bound.established()).toBeNull();
    expect(bound.compared).toEqual([
      { repository, base: revisionA, head: revisionB, perPage: 10 },
    ]);
  });
}

test("eleven commits between establish nothing: no per-commit read, and B is read as a first visit", async () => {
  const atA = filesAt("eleven");
  const seedAtB = makeMe.aProjectRevision.seedText("eleven at B");
  const atB = { ...atA, [paths.seed]: seedAtB };
  const eleven: string[] = [];
  for (let index = 0; index < 11; index += 1) eleven.push(commitSha(index));
  const bound = boundBetween(comparisonAnswer("ahead", eleven, ["src/app.ts"]));
  const { pinned, calls } = pinsFor(
    new Map([
      [revisionA, atA],
      [revisionB, atB],
    ]),
    bound.touchedBetween,
  );
  pinned.answeredBacklog(source, revisionA);
  pinned.heardNamed(source, revisionA);
  await readVisit(pinned, revisionA);
  calls.length = 0;
  pinned.namedByRef(source, revisionB);

  await readVisit(pinned, revisionB);
  expect(
    await pinned.reader(
      source,
      revisionB,
      new AbortController().signal,
    )(paths.seed),
  ).toBe(seedAtB);
  expect(bound.established()).toBeNull();
  expect(bound.commits).toEqual([]);
  expect(bound.compared).toEqual([
    { repository, base: revisionA, head: revisionB, perPage: 10 },
  ]);
  expect(calls).toEqual(visitAt(revisionB));
});

test("a commit whose change list is cut at 300 files establishes nothing, and is asked once", async () => {
  const atA = filesAt("three-hundred");
  const atB = {
    ...atA,
    [paths.seed]: makeMe.aProjectRevision.seedText("three-hundred at B"),
  };
  const cutAt = commitSha(9);
  const cutFiles: {
    filename: string;
    status: string;
    previousFilename: null;
  }[] = [];
  for (let index = 0; index < 300; index += 1) {
    cutFiles.push({
      filename: `src/generated/${String(index)}.ts`,
      status: "modified",
      previousFilename: null,
    });
  }
  const bound = boundBetween(
    comparisonAnswer("ahead", [cutAt], ["src/app.ts"]),
    (commit) =>
      Promise.resolve({
        sha: commit,
        committerName: null,
        committedAt: null,
        login: null,
        avatar: null,
        files: cutFiles,
        whole: false,
      }),
  );
  const { pinned, calls } = pinsFor(
    new Map([
      [revisionA, atA],
      [revisionB, atB],
    ]),
    bound.touchedBetween,
  );
  pinned.answeredBacklog(source, revisionA);
  pinned.heardNamed(source, revisionA);
  await readVisit(pinned, revisionA);
  calls.length = 0;
  pinned.namedByRef(source, revisionB);

  await readVisit(pinned, revisionB);
  expect(bound.established()).toBeNull();
  expect(bound.commits).toEqual([cutAt]);
  expect(bound.compared).toEqual([
    { repository, base: revisionA, head: revisionB, perPage: 10 },
  ]);
  expect(calls).toEqual(visitAt(revisionB));
});

test("a comparison naming 300 files establishes nothing: no commit is read, B is read as before, and the comparison is asked once", async () => {
  const atA = filesAt("three-hundred-compared");
  const atB = {
    ...atA,
    [paths.plan]: "# Plan read at B\n",
  };
  const many: string[] = [];
  for (let index = 0; index < 300; index += 1) {
    many.push(`src/generated/${String(index)}.ts`);
  }
  const bound = boundBetween(comparisonAnswer("ahead", [commitSha(1)], many));
  const { pinned, calls } = pinsFor(
    new Map([
      [revisionA, atA],
      [revisionB, atB],
    ]),
    bound.touchedBetween,
  );
  pinned.answeredBacklog(source, revisionA);
  pinned.heardNamed(source, revisionA);
  await readVisit(pinned, revisionA);
  calls.length = 0;
  pinned.namedByRef(source, revisionB);

  await readVisit(pinned, revisionB);
  expect(
    await pinned.reader(
      source,
      revisionB,
      new AbortController().signal,
    )(paths.plan),
  ).toBe("# Plan read at B\n");
  expect(bound.established()).toBeNull();
  expect(bound.commits).toEqual([]);
  expect(bound.compared).toEqual([
    { repository, base: revisionA, head: revisionB, perPage: 10 },
  ]);
  expect(calls).toEqual(visitAt(revisionB));
});

test("a story branch plan read at a moved head asks the plan and its commit time only, never a comparison", async () => {
  const files = filesAt("branch");
  const planText = "# Plan moved\n";
  const committedAt = "2026-11-27T12:00:00Z";
  const bound = boundBetween(comparisonAnswer("ahead", [commitSha(1)], []));
  const { pinned, calls } = pinsFor(
    new Map([
      [revisionA, files],
      [revisionB, files],
      [movedHead, { [paths.plan]: planText }],
    ]),
    bound.touchedBetween,
    new Map([[`${movedHead}\0${paths.plan}`, committedAt]]),
  );
  pinned.answeredBacklog(source, revisionA);
  pinned.heardNamed(source, revisionA);
  await pinned.reader(
    source,
    revisionA,
    new AbortController().signal,
  )(paths.plan);
  pinned.namedByRef(source, revisionB);
  calls.length = 0;
  pinned.heardNamed(source, movedHead);
  const signal = new AbortController().signal;

  expect(await pinned.reader(source, movedHead, signal)(paths.plan)).toBe(
    planText,
  );
  expect(await pinned.committer(source, movedHead, signal)(paths.plan)).toBe(
    committedAt,
  );
  expect(calls).toEqual([
    asked(paths.plan, movedHead),
    `${repository} commit-time ${paths.plan}@${movedHead}`,
  ]);
  expect(bound.compared).toEqual([]);
  expect(bound.commits).toEqual([]);
});

test("a fresh process with an empty store reads B in full and does not compare", async () => {
  const files = filesAt("restart");
  const bound = boundBetween(
    comparisonAnswer("ahead", [commitSha(1)], ["src/app.ts"]),
  );
  const { pinned, calls } = pinsFor(
    new Map([[revisionB, files]]),
    bound.touchedBetween,
  );
  pinned.namedByRef(source, revisionB);

  await readVisit(pinned, revisionB);
  expect(calls).toEqual(visitAt(revisionB));
  expect(bound.compared).toEqual([]);
  expect(bound.commits).toEqual([]);
});
