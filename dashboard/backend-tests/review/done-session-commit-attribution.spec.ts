// Default main commit attribution places a checkout's `HEAD` log entries and
// groups the session's commits into runs, from the log's typed entries alone.
import { expect, test } from "vitest";
import {
  type LogEntry,
  type MadeCommit,
  madeSince,
  runsOf,
} from "../../server/sessionCommitAttribution.ts";

const since = 1_000;

// The log's entries in the order they were written; the log reads newest first.
const logOf = (...written: LogEntry[]): LogEntry[] =>
  written.map((entry, index) => ({ ...entry, at: since + 10 * (index + 1) }));

const entry = (
  commit: string,
  parents: readonly string[],
  action: string,
  authoredAt = since + 1,
  subject = `Add ${commit}.txt`,
): LogEntry => ({ commit, parents, at: 0, action, authoredAt, subject });

const commit = (name: string, parent: string, authoredAt?: number) =>
  entry(name, [parent], `commit: Add ${name}.txt`, authoredAt);
const pick = (name: string, parent: string, from: LogEntry) =>
  entry(
    name,
    [parent],
    `rebase (pick): ${from.subject}`,
    from.authoredAt,
    from.subject,
  );
const rebaseStart = (onto: string) =>
  entry(onto, ["trunk"], "rebase (start): checkout origin/main");
const rebaseFinish = (tip: string) =>
  entry(tip, ["x"], "rebase (finish): returning to refs/heads/main");

// The log is newest first, as Git reads it.
const decided = (written: readonly LogEntry[]) =>
  madeSince(logOf(...written).reverse(), since);
// The commits still in the checkout's tip, as the capture's ancestry check keeps.
const reachable = (made: readonly MadeCommit[], ...tip: string[]) =>
  made.filter(({ commit }) => tip.includes(commit));

test("commits either side of a pull are two runs, the second based on the pulled commit", () => {
  const made = decided([
    commit("first", "base"),
    entry("pulled", ["first"], "pull: Fast-forward"),
    commit("second", "pulled"),
  ]);

  expect(runsOf(made)).toEqual([
    { base: "base", revision: "first" },
    { base: "pulled", revision: "second" },
  ]);
});

test("commits either side of a merge are two runs without the merge", () => {
  const made = decided([
    commit("first", "base"),
    entry(
      "merge",
      ["first", "trunk"],
      "merge origin/main: Merge made by the 'ort' strategy.",
    ),
    commit("second", "merge"),
  ]);

  expect(runsOf(made)).toEqual([
    { base: "base", revision: "first" },
    { base: "merge", revision: "second" },
  ]);
});

test("commits either side of an amended merge are two runs without either merge", () => {
  const merge = (name: string, action: string) =>
    entry(name, ["first", "trunk"], action, since + 1, "Merge origin/main");
  const made = decided([
    commit("first", "base"),
    merge("merge", "merge origin/main: Merge made by the 'ort' strategy."),
    merge("amended", "commit (amend): Merge origin/main"),
    commit("second", "amended"),
  ]);

  expect(runsOf(made)).toEqual([
    { base: "base", revision: "first" },
    { base: "amended", revision: "second" },
  ]);
});

test("two commits, the second amended, rebased onto pulled trunk are one run of the two as rebased", () => {
  const first = commit("first", "base", since + 1);
  const second = commit("second", "first", since + 2);
  const amended = entry(
    "amended",
    ["first"],
    "commit (amend): Add second.txt",
    second.authoredAt,
    second.subject,
  );
  const made = decided([
    first,
    second,
    amended,
    rebaseStart("pulled"),
    pick("first2", "pulled", first),
    pick("pushed", "first2", amended),
    rebaseFinish("pushed"),
  ]);

  expect(runsOf(reachable(made, "first2", "pushed"))).toEqual([
    { base: "pulled", revision: "pushed" },
  ]);
});

test("a commit rebased onto fetched trunk is kept as its rebased commit", () => {
  const made = commit("made", "base");
  const decision = decided([
    made,
    rebaseStart("fetched"),
    pick("pushed", "fetched", made),
    rebaseFinish("pushed"),
  ]);

  expect(runsOf(reachable(decision, "pushed"))).toEqual([
    { base: "fetched", revision: "pushed" },
  ]);
});

test("a continued cherry-pick is the session's commit on its parent", () => {
  const made = decided([
    entry(
      "tree",
      ["baseline"],
      "commit (cherry-pick): Add incoming notes",
      since - 500,
    ),
  ]);

  expect(runsOf(made)).toEqual([{ base: "baseline", revision: "tree" }]);
});

// An autosquash, as Git logs `rebase --interactive --autosquash` of the
// marked commit onto its target's parent.
for (const mode of ["fixup", "squash"] as const) {
  test(`an autosquashed ${mode} is one commit of the target on its parent`, () => {
    const target = commit("target", "base");
    const made = decided([
      target,
      entry(
        "marked",
        ["target"],
        `commit: ${mode}! Add target.txt`,
        since + 2,
        `${mode}! Add target.txt`,
      ),
      entry("target", ["base"], "rebase (start): checkout target^"),
      entry(
        "tree",
        ["base"],
        `rebase (${mode}): Add target.txt`,
        target.authoredAt,
        target.subject,
      ),
      entry(
        "tree",
        ["base"],
        "rebase (finish): returning to refs/heads/main",
        target.authoredAt,
        target.subject,
      ),
    ]);

    expect(runsOf(reachable(made, "tree"))).toEqual([
      { base: "base", revision: "tree" },
    ]);
  });
}

test("a commit made before the session and rebased during it is not the session's", () => {
  const earlier = commit("earlier", "base", since - 500);

  expect(
    decided([
      rebaseStart("pulled"),
      pick("rebased", "pulled", earlier),
      rebaseFinish("rebased"),
    ]),
  ).toEqual([]);
});

test("a replayed commit authored in the session but not made here cannot be placed", () => {
  const elsewhere = commit("elsewhere", "base");

  expect(() =>
    decided([rebaseStart("pulled"), pick("replayed", "pulled", elsewhere)]),
  ).toThrow("The checkout's log has a commit that cannot be placed.");
});

test("an empty log decides no commits and no runs", () => {
  expect(runsOf(madeSince([], since))).toEqual([]);
});
