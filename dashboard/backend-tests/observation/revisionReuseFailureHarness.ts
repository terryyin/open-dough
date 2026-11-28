// Direct PinnedTexts setup for revision-reuse failure cases
// (./revision-reuse-failures.spec.ts), the same shape as
// ./revision-reuse-compared.spec.ts: a temp retained memo, a file reader, an
// injected comparison, and an injected commit reader.

import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { onTestFinished } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { touchedBetweenViaGh } from "../../server/commitsBetween.ts";
import { comparisonViaGh } from "../../server/containmentRead.ts";
import { commitViaGh, type CommitRecord } from "../../server/ghCommit.ts";
import { lastCommitTimeViaGh } from "../../server/ghCommitTime.ts";
import { GhFailure } from "../../server/ghFailure.ts";
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

export const revisionA = "a7e1a4c0d19f4e2a8c6b0d3e5f7a9c1b2d4e6f80";
export const revisionB = "b7e1a4c0d19f4e2a8c6b0d3e5f7a9c1b2d4e6f80";
export const betweenCommit = "f2".repeat(20);
export const source = makeMe.aPublishedSource.openDough.please();
export const paths = makeMe.aProjectRevision.paths;
export const repository = source.repository;
export const agentsDirectory = paths.profile.slice(
  0,
  paths.profile.lastIndexOf("/"),
);
export const doneDirectory = paths.done.slice(0, paths.done.lastIndexOf("/"));
export const answeredFromFile = [
  `${repository} ${paths.backlog}@${revisionB}`,
  `${repository} ${paths.seed}@${revisionB}`,
];

type RevisionFiles = ReadonlyMap<string, Readonly<Record<string, string>>>;

export type ComparisonCall = {
  repository: string;
  base: string;
  head: string;
  perPage: number;
};

export type ComparisonAccount = {
  readonly compared: ComparisonCall[];
  readonly commits: string[];
  readonly touchedBetween: typeof touchedBetweenViaGh;
  readonly readCommit: typeof commitViaGh;
  use(step: () => Promise<string>): void;
};

function temporaryDirectory(): string {
  const directory = mkdtempSync(path.join(tmpdir(), "revision-failures-"));
  onTestFinished(() => {
    rmSync(directory, { recursive: true, force: true });
  });
  return directory;
}

export function comparisonAnswer(commits: readonly string[]): string {
  return `ahead\n${String(commits.length)}\n${commits.join("\n")}\n`;
}

export function commitTouching(sha: string): CommitRecord {
  return {
    sha,
    committerName: "Fixture Committer",
    committedAt: "2026-11-27T12:00:00Z",
    login: null,
    avatar: null,
    files: [
      { filename: "src/app.ts", status: "modified", previousFilename: null },
    ],
    whole: true,
  };
}

export function oneComparison(): ComparisonCall {
  return { repository, base: revisionA, head: revisionB, perPage: 10 };
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
    calls.push(`${repository} listing ${directory}@${fileRevision}`);
    const prefix = `${directory}/`;
    const files = byRevision.get(fileRevision) ?? {};
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

function accountFor(records: Map<string, CommitRecord>): ComparisonAccount {
  const compared: ComparisonCall[] = [];
  const commits: string[] = [];
  let step: () => Promise<string> = () =>
    Promise.reject(new GhFailure({ kind: "failed" }));
  const compare = ((...args: Parameters<typeof comparisonViaGh>) => {
    const [comparedRepository, between, query] = args;
    compared.push({
      repository: comparedRepository,
      base: between.base,
      head: between.head,
      perPage: query.perPage,
    });
    return step();
  }) satisfies typeof comparisonViaGh;
  const readCommit = ((...args: Parameters<typeof commitViaGh>) => {
    const [, commit] = args;
    commits.push(commit);
    const record = records.get(commit);
    return record === undefined
      ? Promise.reject(new GhFailure({ kind: "no-commit" }))
      : Promise.resolve(record);
  }) satisfies typeof commitViaGh;
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
  return {
    compared,
    commits,
    touchedBetween,
    readCommit,
    use(next) {
      step = next;
    },
  };
}

export async function moved(label: string, records: Map<string, CommitRecord>) {
  const files = makeMe.aProjectRevision.labeled(label).please().files;
  const account = accountFor(records);
  const upstream = trackingUpstream(
    new Map([
      [revisionA, files],
      [revisionB, files],
    ]),
  );
  const pinned = new PinnedTexts(
    new RevisionMemo(new RetainedAnswers({ directory: temporaryDirectory() })),
    upstream.readFile,
    account.touchedBetween,
    upstream.listDirectory,
    lastCommitTimeViaGh,
    listPathCommitsViaGh,
    account.readCommit,
  );
  const signal = new AbortController().signal;
  pinned.answeredBacklog(source, revisionA);
  pinned.heardNamed(source, revisionA);
  const readAtA = pinned.reader(source, revisionA, signal);
  const listAtA = pinned.lister(source, revisionA, signal);
  await readAtA(paths.backlog);
  await readAtA(paths.seed);
  await readAtA(paths.otherSeed);
  await readAtA(paths.plan);
  await listAtA(agentsDirectory);
  await listAtA(doneDirectory);
  upstream.calls.length = 0;
  pinned.namedByRef(source, revisionB);
  return {
    files,
    account,
    calls: upstream.calls,
    signal,
    pinned,
    read: pinned.reader(source, revisionB, signal),
    list: pinned.lister(source, revisionB, signal),
  };
}

export function hold(
  account: ComparisonAccount,
  text: string,
): { release(): void } {
  let open = (): void => undefined;
  const released = new Promise<void>((resolve) => {
    open = () => {
      resolve();
    };
  });
  account.use(() => released.then(() => text));
  return {
    release() {
      open();
    },
  };
}
