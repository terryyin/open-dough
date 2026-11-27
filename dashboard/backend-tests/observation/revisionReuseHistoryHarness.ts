// Direct PinnedTexts setup for profile-addition history
// (./revision-reuse-history.spec.ts): a temp retained memo, injected path
// history, commit records, and commit times. Comparison uses those records,
// so a path is touched only when a commit between names it.

import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { onTestFinished } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { touchedBetweenViaGh } from "../../server/commitsBetween.ts";
import { comparisonViaGh } from "../../server/containmentRead.ts";
import {
  commitViaGh,
  type CommitFile,
  type CommitRecord,
} from "../../server/ghCommit.ts";
import { lastCommitTimeViaGh } from "../../server/ghCommitTime.ts";
import { GhFailure } from "../../server/ghFailure.ts";
import { listRepositoryDirectoryViaGh } from "../../server/ghContents.ts";
import { listPathCommitsViaGh } from "../../server/ghProfileAddition.ts";
import {
  PinnedTexts,
  type RepositoryFileRead,
} from "../../server/pinnedTexts.ts";
import { RetainedAnswers } from "../../server/retainedAnswers.ts";
import { RevisionMemo } from "../../server/revisionMemo.ts";

export const revisionA = "a7e1a4c0d19f4e2a8c6b0d3e5f7a9c1b2d4e6f80";
export const revisionB = "b7e1a4c0d19f4e2a8c6b0d3e5f7a9c1b2d4e6f80";
export const source = makeMe.aPublishedSource.openDough.please();
export const paths = makeMe.aProjectRevision.paths;
const repository = source.repository;

export function commitSha(n: number): string {
  return n.toString(16).padStart(2, "0").repeat(20);
}

export function changed(filename: string, status: string): CommitFile {
  return { filename, status, previousFilename: null };
}

export function commitRecord(
  sha: string,
  files: readonly CommitFile[],
  committerName: string,
  committedAt: string,
  login: string | null = null,
): CommitRecord {
  return {
    sha,
    committerName,
    committedAt,
    login,
    avatar: null,
    files,
    whole: true,
  };
}

export type HistoryCalls = {
  pathLists: string[];
  commitTimes: string[];
  commits: string[];
  files: string[];
  compared: { base: string; head: string }[];
};

type RevisionFiles = ReadonlyMap<string, Readonly<Record<string, string>>>;

function temporaryDirectory(): string {
  const directory = mkdtempSync(path.join(tmpdir(), "revision-history-"));
  onTestFinished(() => {
    rmSync(directory, { recursive: true, force: true });
  });
  return directory;
}

function comparisonText(commits: readonly string[]): string {
  return `ahead\n${String(commits.length)}\n${commits.join("\n")}\n`;
}

export function historyPins(input: {
  files: RevisionFiles;
  records: ReadonlyMap<string, CommitRecord>;
  pathCommits: ReadonlyMap<string, readonly string[]>;
  commitTimes: ReadonlyMap<string, string>;
  between: readonly string[];
}): {
  pinned: PinnedTexts;
  signal: AbortSignal;
  calls: HistoryCalls;
  moved: () => void;
  settle: () => void;
} {
  const calls: HistoryCalls = {
    pathLists: [],
    commitTimes: [],
    commits: [],
    files: [],
    compared: [],
  };
  const readFile: RepositoryFileRead = (...args) => {
    const [readRepository, filePath, fileRevision] = args;
    calls.files.push(`${readRepository} ${filePath}@${fileRevision}`);
    const text = input.files.get(fileRevision)?.[filePath];
    return text === undefined
      ? Promise.reject(new GhFailure({ kind: "http", status: 404 }))
      : Promise.resolve(text);
  };
  const listPathCommits = ((
    ...args: Parameters<typeof listPathCommitsViaGh>
  ) => {
    const [, filePath, fileRevision] = args;
    calls.pathLists.push(`${filePath}@${fileRevision}`);
    const listed = input.pathCommits.get(`${fileRevision}\0${filePath}`);
    return listed === undefined
      ? Promise.reject(new GhFailure({ kind: "no-commit" }))
      : Promise.resolve(listed);
  }) satisfies typeof listPathCommitsViaGh;
  const commitTime = ((...args: Parameters<typeof lastCommitTimeViaGh>) => {
    const [, filePath, fileRevision] = args;
    calls.commitTimes.push(`${filePath}@${fileRevision}`);
    const at = input.commitTimes.get(`${fileRevision}\0${filePath}`);
    return at === undefined
      ? Promise.reject(new GhFailure({ kind: "no-commit" }))
      : Promise.resolve(at);
  }) satisfies typeof lastCommitTimeViaGh;
  const readCommit = ((...args: Parameters<typeof commitViaGh>) => {
    const [, commit] = args;
    calls.commits.push(commit);
    const record = input.records.get(commit);
    return record === undefined
      ? Promise.reject(new GhFailure({ kind: "no-commit" }))
      : Promise.resolve(record);
  }) satisfies typeof commitViaGh;
  const compare = ((...args: Parameters<typeof comparisonViaGh>) => {
    const [, between] = args;
    calls.compared.push({ base: between.base, head: between.head });
    return Promise.resolve(comparisonText(input.between));
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
  const listDirectory = ((
    ...args: Parameters<typeof listRepositoryDirectoryViaGh>
  ) => {
    const [, directory, fileRevision] = args;
    calls.files.push(`${repository} listing ${directory}@${fileRevision}`);
    return Promise.resolve([]);
  }) satisfies typeof listRepositoryDirectoryViaGh;
  const pinned = new PinnedTexts(
    new RevisionMemo(new RetainedAnswers({ directory: temporaryDirectory() })),
    readFile,
    touchedBetween,
    listDirectory,
    commitTime,
    listPathCommits,
    readCommit,
  );
  const signal = new AbortController().signal;
  pinned.answeredBacklog(source, revisionA);
  pinned.heardNamed(source, revisionA);
  return {
    pinned,
    signal,
    calls,
    moved: () => {
      pinned.namedByRef(source, revisionB);
    },
    settle: () => {
      calls.pathLists.length = 0;
      calls.commitTimes.length = 0;
      calls.commits.length = 0;
      calls.files.length = 0;
      calls.compared.length = 0;
    },
  };
}
