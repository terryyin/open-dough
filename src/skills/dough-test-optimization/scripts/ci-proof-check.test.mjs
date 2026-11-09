// The check a CI proof read or a lead reading makes of a summary
// (./ci-proof-check.mjs): valid by the collector contract, then naming the
// asked repository, attempt and revision. The reads that ask it:
// ./ci-proof-read.test.mjs, ./ci-proof-read-adapter.test.mjs and, for a
// summary retained elsewhere, ./ci-proof-leads-retained.test.mjs.
import assert from "node:assert/strict";
import { test } from "node:test";
import { makeMe } from "../../../../tests/support/makeMe.mjs";
import { checkedRetainedSummary, checkedSummary } from "./ci-proof-check.mjs";

const repository = "owner/repo";
const revision = "a1b2c3d".padEnd(40, "0");
const otherRevision = "b".repeat(40);
const run = { runId: 41, runAttempt: 1, revision };

test("a summary that is not valid by the collector contract is refused with its problems before its identity is compared", () => {
  const summary = makeMe.aCiProofSummary
    .inRepository("someone/else")
    .ofRun(run)
    .please();
  assert.deepEqual(
    checkedSummary({ ...summary, entries: "none" }, { repository, ...run }),
    { why: "invalid", problems: ["entries is not an array"] },
  );
});

test("a valid summary is a run attempt's only when it names its repository in any case, its run, attempt and revision", () => {
  const asked = { repository, ...run };
  const usable = makeMe.aCiProofSummary
    .inRepository("Owner/Repo")
    .ofRun(run)
    .please();
  assert.deepEqual(checkedSummary(usable, asked), { summary: usable });
  for (const [summary, names, value] of [
    [
      makeMe.aCiProofSummary.inRepository("someone/else").ofRun(run).please(),
      "repository",
      "someone/else",
    ],
    [
      makeMe.aCiProofSummary
        .inRepository(repository)
        .ofRun({ ...run, runId: 42 })
        .please(),
      "run",
      42,
    ],
    [
      makeMe.aCiProofSummary
        .inRepository(repository)
        .ofRun({ ...run, runAttempt: 2 })
        .please(),
      "attempt",
      2,
    ],
    [
      makeMe.aCiProofSummary
        .inRepository(repository)
        .ofRun({ ...run, revision: otherRevision })
        .please(),
      "revision",
      otherRevision,
    ],
  ])
    assert.deepEqual(
      checkedSummary(summary, asked),
      { why: "mismatched", names, value },
      names,
    );
});

test("a valid summary is a CI adapter attempt's only when it names its repository, its attemptId and its revision in either case", () => {
  const asked = { repository, attemptId: "2", revision };
  const usable = makeMe.aCiProofSummary
    .inRepository(repository)
    .ofAdapterAttempt({ attemptId: "2", revision: revision.toUpperCase() })
    .please();
  assert.deepEqual(checkedSummary(usable, asked), { summary: usable });
  for (const [summary, names, value] of [
    [
      makeMe.aCiProofSummary
        .inRepository("someone/else")
        .ofAdapterAttempt({ attemptId: "2", revision })
        .please(),
      "repository",
      "someone/else",
    ],
    [
      makeMe.aCiProofSummary.inRepository(repository).ofRun(run).please(),
      "run",
      41,
    ],
    [
      makeMe.aCiProofSummary
        .inRepository(repository)
        .ofAdapterAttempt({ attemptId: "1", revision })
        .please(),
      "attempt",
      "1",
    ],
    [
      makeMe.aCiProofSummary
        .inRepository(repository)
        .ofAdapterAttempt({ attemptId: "2", revision: otherRevision })
        .please(),
      "revision",
      otherRevision,
    ],
  ])
    assert.deepEqual(
      checkedSummary(summary, asked),
      { why: "mismatched", names, value },
      names,
    );
});

test("a summary retained elsewhere, whose attempt CI could not name, is asked by its repository alone, still validated first", () => {
  const usable = makeMe.aCiProofSummary
    .inRepository("Owner/Repo")
    .ofAdapterAttempt({ attemptId: "7", revision: otherRevision })
    .please();
  assert.deepEqual(checkedRetainedSummary(usable, repository), {
    summary: usable,
  });
  assert.deepEqual(
    checkedRetainedSummary(
      makeMe.aCiProofSummary.inRepository("someone/else").ofRun(run).please(),
      repository,
    ),
    { why: "mismatched", names: "repository", value: "someone/else" },
  );
  assert.deepEqual(
    checkedRetainedSummary({ ...usable, entries: "none" }, repository),
    {
      why: "invalid",
      problems: ["entries is not an array"],
    },
  );
});
