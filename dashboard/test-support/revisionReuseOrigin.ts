// What GitHub publishes for the specs of the local authenticated read
// boundary's reuse at a revision its configured ref names next
// (../backend-tests/observation/revisionReuseBoundary.ts): the commits a move
// of the ref is made by, and one answerer for the revisions, the comparisons,
// and the commits between (./originAnswers.ts, ./pathHistoryAnswers.ts); that
// answerer is ./revisionReuseAnswers.ts. The records a project shows at one
// revision are makeMe.aProjectRevision.

import { execFileSync } from "node:child_process";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import { commitDeclaredRevision } from "../../Distribution/tests/support/repository-fixture.mjs";
import type { RevisionFacts } from "../../Distribution/tests/support/repositoryTestData.mjs";
import type {
  ChangedFile,
  MadeCommit,
  PathHistories,
} from "./pathHistoryAnswers.ts";
import { publishBranch } from "./committedOriginRepo.ts";
import { aheadBy, type Comparison } from "./comparisonAnswers.ts";
import { defaultRepository } from "./publishedOriginBasics.ts";
import { answerFrom } from "./revisionReuseAnswers.ts";
import type { FakeGitHub, RepositoryAnswerer } from "./support/fakeGitHub.ts";
import { expectServedHomesReach } from "./support/fixtureOriginRoute.ts";
import {
  commitPublishedOrigin,
  type PublishedOrigin,
} from "./support/publishedOrigin.ts";

const paths = makeMe.aProjectRevision.paths;

export const sourceId = paths.sourceId;
export const backlogPath = paths.backlog;
export const seedPath = paths.seed;
export const otherSeedPath = paths.otherSeed;
export const planPath = paths.plan;
export const profilePath = paths.profile;
export const otherProfilePath = paths.otherProfile;
export const settingsPath = paths.settings;

// Revisions and commits are named by one hex pair; each test uses its own,
// since the boundary remembers what it read while the server runs.
export const named = (pair: string) => pair.repeat(20);

export type Files = Readonly<Record<string, string>>;

// The files a labeled project revision publishes, and, given `then`, the
// files after a later revision changes them with those facts.
export function filesFor(label: string, then?: RevisionFacts): Files {
  const revision = makeMe.aProjectRevision.labeled(label);
  return (then === undefined ? revision : revision.with(then)).please().files;
}

// A commit made by a fixture committer changing `files`.
export const madeBy = (
  pair: string,
  files: readonly ChangedFile[],
): MadeCommit => ({
  sha: named(pair),
  committer: "Fixture Committer",
  files,
});

export const modified = (filename: string): ChangedFile => ({
  filename,
  status: "modified",
});

// What GitHub publishes for one test: the files at each revision, which
// revision the configured ref and each branch name, the answer to each
// comparison by `<base>...<head>` given the files that differ between the
// two published revisions (a pair it does not name is diverged), the
// commits made, each answered with every file it changed, and, when given,
// each path's history as of a revision, whose commits answer for their own
// change to it (./pathHistoryAnswers.ts); a path no history names was last
// committed whenever it is asked.
export type Publication = {
  // The revision the configured ref names, moved as the ref moves.
  readonly trunk: { revision: string };
  readonly revisions: Map<string, Files>;
  readonly branches: Map<string, string>;
  readonly compared: Map<string, Comparison>;
  readonly made: Map<string, MadeCommit>;
  readonly histories?: Map<string, PathHistories>;
};

export type ReusePublication = Publication & PublishedOrigin;

export function reusePublication(
  files: Files,
  history: PathHistories = {},
  storyBranch?: { readonly name: string; readonly label: string },
): ReusePublication {
  const origin = commitPublishedOrigin({
    branch: "main",
    backlog: null,
    files,
  });
  const { origin: repository, revision } = origin;
  const revisions = new Map([[revision, files]]);
  const histories = new Map([[revision, history]]);
  const branches = new Map<string, string>();
  if (storyBranch !== undefined) {
    // Publish an independent, real story-branch pin with the same files.
    const head = execFileSync(
      "git",
      [
        "-C",
        repository,
        "-c",
        "user.name=Fixture",
        "-c",
        "user.email=fixture@example.com",
        "commit-tree",
        `${revision}^{tree}`,
        "-p",
        revision,
        "-m",
        storyBranch.label,
      ],
      { encoding: "utf8" },
    ).trim();
    publishBranch(repository, storyBranch.name, head);
    branches.set(storyBranch.name, head);
    revisions.set(head, files);
    histories.set(head, history);
  }
  return {
    ...origin,
    trunk: { revision },
    revisions,
    branches,
    compared: new Map(),
    made: new Map(),
    histories,
  };
}

export function serveReusePublication(
  github: FakeGitHub,
  published: ReusePublication,
  answer: RepositoryAnswerer = (call) =>
    Promise.resolve(answerFrom(published, call)),
): void {
  const { revision } = published.trunk;
  github.serve(
    defaultRepository,
    Object.assign(answer, { origin: published.origin, revision }),
  );
  expectServedHomesReach(github, defaultRepository, revision);
}

export async function advanceReusePublication(
  published: ReusePublication,
  { files, history = {} }: { files: Files; history?: PathHistories },
  by?: readonly MadeCommit[],
): Promise<string> {
  const previous = published.revisions.get(published.trunk.revision) ?? {};
  const remove = Object.keys(previous).filter(
    (path) => !Object.hasOwn(files, path),
  );
  const revision = await commitDeclaredRevision(published.origin, {
    files,
    remove,
  });
  moved(published, revision, files, history, by);
  return revision;
}

export function restoreReusePublication(publication: ReusePublication): void {
  const { origin, revision, trunk } = publication;
  // Restore the index and working tree before moving the checked-out ref.
  execFileSync("git", ["read-tree", "--reset", "-u", revision], {
    cwd: origin,
  });
  execFileSync(
    "git",
    ["update-ref", "refs/heads/main", revision, trunk.revision],
    { cwd: origin },
  );
  trunk.revision = revision;
}

// The ref moves to `revision`, publishing `files` and `history` there, by the
// commits `by` after the revision it named when given.
export function moved(
  published: Publication,
  revision: string,
  files: Files,
  history: PathHistories,
  by?: readonly MadeCommit[],
): void {
  const { trunk } = published;
  published.revisions.set(revision, files);
  published.histories?.set(revision, history);
  if (by !== undefined) {
    const shas = by.map(({ sha }) => sha);
    published.compared.set(`${trunk.revision}...${revision}`, aheadBy(shas));
    for (const made of by) published.made.set(made.sha, made);
  }
  trunk.revision = revision;
}

export { answerFrom };
