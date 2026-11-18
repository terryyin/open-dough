// What GitHub publishes for the specs of the local authenticated read
// boundary's reuse at a revision its configured ref names next
// (../backend-tests/observation/revisionReuseBoundary.ts): the commits a move
// of the ref is made by, and one answerer for the revisions, the comparisons,
// and the commits between (./originAnswers.ts, ./pathHistoryAnswers.ts); that
// answerer is ./revisionReuseAnswers.ts. The records a project shows at one
// revision are makeMe.aProjectRevision.

import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import type { RevisionFacts } from "../../Distribution/tests/support/repositoryTestData.mjs";
import type {
  ChangedFile,
  MadeCommit,
  PathHistories,
} from "./pathHistoryAnswers.ts";
import { aheadBy, type Comparison } from "./comparisonAnswers.ts";

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

export { answerFrom } from "./revisionReuseAnswers.ts";
