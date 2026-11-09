// A lead reading of a project whose CI is a GitHub Actions workflow
// (./ci-proof-leads.mjs): the attempt it chooses for the requested revision,
// how it labels that attempt, the recorded selection and the gaps it
// reports. Refused routes: ./ci-proof-leads-gaps.test.mjs; summaries
// retained elsewhere: ./ci-proof-leads-retained.test.mjs; a CI adapter's:
// ./ci-proof-leads-adapter.test.mjs.
import assert from "node:assert/strict";
import { test } from "node:test";
import { makeMe } from "../../../../tests/support/makeMe.mjs";
import { materializeLocalCheckout } from "../../../../tests/support/repository-fixture.mjs";
import { leadsReport } from "./ci-proof-leads.mjs";
import {
  gapsOf,
  gitHubHolding,
  lineOf,
  rowsOf,
} from "./ci-proof-leads-test-fixtures.mjs";

const repository = "owner/repo";

// A project whose Intent location `tests` holds shell checks: the attempted
// revision, then the requested one, which changes one check and a note.
const project = makeMe.aRepository
  .withRevision("attempted", {
    files: {
      ".planning/open-dough.json": `${JSON.stringify(
        makeMe.intentSettings
          .withLocations(
            makeMe.anIntentLocation
              .at("tests")
              .ofKind("shell", ["*.sh"])
              .please(),
          )
          .please(),
      )}\n`,
      "tests/a.sh": "echo a\n",
      "tests/b.sh": "echo b\n",
    },
  })
  .withRevision("requested", {
    files: { "tests/b.sh": "echo b again\n", "docs/notes.md": "notes\n" },
  })
  .please();

// The summary of RUN, a run attempt at a revision, timing tests/a.sh and
// tests/b.sh, with any MORE entries.
const summaryOf = (run, ...more) =>
  makeMe.aCiProofSummary
    .inRepository(repository)
    .ofRun(run)
    .withEntries(
      makeMe.aCiProofEntry
        .at("tests")
        .countingIn("checks")
        .withFile("tests/a.sh", { durationMs: 3000 })
        .withFile("tests/b.sh", { durationMs: 1000 })
        .please(),
      ...more,
    )
    .please();

test("a complete, successful attempt at the requested revision is read: the table names its repository, run and attempt, revision and selection, and ranks its files", async (t) => {
  const { integration: checkout, revisions } = await materializeLocalCheckout(
    t,
    project,
  );
  const github = gitHubHolding({
    repository,
    runs: [
      makeMe.aCiRun
        .with({ id: 41, headSha: revisions.requested, conclusion: "success" })
        .please(),
      makeMe.aCiRun
        .with({ id: 40, headSha: revisions.attempted, conclusion: "success" })
        .please(),
    ],
    summaries: {
      41: summaryOf(
        { runId: 41, runAttempt: 1, revision: revisions.requested },
        makeMe.aCiProofEntry
          .at("e2e")
          .countingIn("tests")
          .withFile("e2e/x.feature", { durationMs: 9000 })
          .please(),
      ),
    },
  });

  const { text, ranked } = await leadsReport(
    { directory: checkout, repository },
    { gitHub: github.asks },
  );

  assert.equal(ranked, true);
  assert.equal(text.split("\n")[0], "CI proof leads for owner/repo");
  assert.equal(
    lineOf(text, "Attempt"),
    `Attempt        run 41 attempt 1 (success) at ${revisions.requested}`,
  );
  assert.equal(
    lineOf(text, "Compatibility"),
    "Compatibility  the attempt tested the requested revision",
  );
  assert.equal(
    lineOf(text, "Selection"),
    "Selection      test-selection command not recorded in the summary; remedy: read it from .github/workflows/ci.yml",
  );
  assert.match(
    rowsOf(text),
    /\n tests shell \*\.sh checks 1 of 1 parts present\n/,
  );
  assert.equal(lineOf(text, "Gaps"), "Gaps           none");
  assert.match(
    rowsOf(text),
    /\n 1 3\.0 75\.0% 1 checks 3\.00 tests\/a\.sh\n 2 1\.0 25\.0% 1 checks 1\.00 tests\/b\.sh\n/,
  );
  assert.doesNotMatch(text, /e2e/);
  assert.deepEqual(github.asked, [
    "repos/owner/repo/actions/workflows/ci.yml",
    "repos/owner/repo/actions/workflows/7001/runs?event=push&per_page=100&page=1",
    "repos/owner/repo/actions/runs/41/artifacts?name=ci-proof-summary-attempt-1&per_page=100",
    "repos/owner/repo/actions/artifacts/41/zip",
  ]);

  const e2e = await leadsReport(
    { directory: checkout, repository, scope: ["e2e"] },
    { gitHub: github.asks },
  );
  assert.match(
    rowsOf(e2e.text),
    /\n e2e not an Intent location tests 1 of 1 parts present\n/,
  );
  assert.match(
    rowsOf(e2e.text),
    /\n 1 9\.0 100\.0% 1 tests 9\.00 e2e\/x\.feature\n/,
  );
});

test("with only an earlier attempt at an ancestor, its revision is labelled with the commits since and the in-scope paths changed since, and passed-over attempts are gaps", async (t) => {
  const { integration: checkout, revisions } = await materializeLocalCheckout(
    t,
    project,
  );
  const github = gitHubHolding({
    repository,
    runs: [
      makeMe.aCiRun
        .with({ id: 43, headSha: "f".repeat(40), conclusion: "success" })
        .please(),
      makeMe.aCiRun
        .with({ id: 42, headSha: revisions.requested, conclusion: "failure" })
        .please(),
      makeMe.aCiRun
        .with({ id: 40, headSha: revisions.attempted, conclusion: "success" })
        .please(),
    ],
    summaries: {
      40: summaryOf({
        runId: 40,
        runAttempt: 1,
        revision: revisions.attempted,
      }),
    },
  });

  const { text, ranked } = await leadsReport(
    { directory: checkout, repository },
    { gitHub: github.asks },
  );

  assert.equal(ranked, true);
  assert.equal(
    lineOf(text, "Attempt"),
    `Attempt        run 40 attempt 1 (success) at ${revisions.attempted}`,
  );
  assert.equal(
    lineOf(text, "Compatibility"),
    "Compatibility  earlier: the attempt's revision is an ancestor of the requested one, 1 commit before it; 1 in-scope path changed since",
  );
  assert.match(rowsOf(text), /\n M tests\/b\.sh\n/);
  assert.doesNotMatch(text, /docs\/notes\.md/);
  assert.deepEqual(gapsOf(text), [
    "the requested revision's run 42 attempt 1 ended failure; its proof is not read",
    "1 completed attempt that could be read instead names a revision local Git does not have; fetch and rerun to consider it",
  ]);
});

test("with no successful attempt, the newest failed one is read and its failed and missing results are reported as gaps", async (t) => {
  const { integration: checkout, revisions } = await materializeLocalCheckout(
    t,
    project,
  );
  const run = { runId: 42, runAttempt: 2, revision: revisions.requested };
  const github = gitHubHolding({
    repository,
    runs: [
      makeMe.aCiRun
        .with({
          id: 42,
          attempt: 2,
          headSha: revisions.requested,
          conclusion: "failure",
        })
        .please(),
    ],
    summaries: {
      42: makeMe.aCiProofSummary
        .inRepository(repository)
        .ofRun(run)
        .withEntries(
          makeMe.aCiProofEntry
            .at("tests")
            .countingIn("checks")
            .inParts(2, { missing: [2] })
            .withFile("tests/a.sh", { failed: 1, passed: 0, durationMs: 7000 })
            .please(),
        )
        .please(),
    },
  });

  const { text, ranked } = await leadsReport(
    { directory: checkout, repository },
    { gitHub: github.asks },
  );

  assert.equal(ranked, true);
  assert.equal(
    lineOf(text, "Attempt"),
    `Attempt        run 42 attempt 2 (failure) at ${revisions.requested}`,
  );
  assert.deepEqual(gapsOf(text), [
    "the attempt read ended failure: its proof may be partial; its failed, missing and untimed results are listed here",
    "tests: part 2 of 2 missing; their results are not counted",
    "tests: 1 checks failed in this attempt",
  ]);
  assert.match(
    rowsOf(text),
    /\n tests shell \*\.sh checks 1 of 2 parts present, 1 missing\n/,
  );
  assert.ok(
    github.asked.includes(
      "repos/owner/repo/actions/runs/42/artifacts?name=ci-proof-summary-attempt-2&per_page=100",
    ),
  );
});
