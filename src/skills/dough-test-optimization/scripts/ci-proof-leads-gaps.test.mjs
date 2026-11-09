// A lead reading (./ci-proof-leads.mjs) when GitHub refuses its route, lists
// no usable attempt, or the attempt kept no summary: each is a gap with the
// --summary remedy, and a summary the project retains elsewhere then ranks.
// Newer attempts at revisions local Git lacks stay a gap, also when a failed
// attempt is read. Which retained summaries are refused:
// ./ci-proof-leads-retained.test.mjs; choosing and labelling the attempt:
// ./ci-proof-leads.test.mjs.
import assert from "node:assert/strict";
import { test } from "node:test";
import { makeMe } from "../../../../tests/support/makeMe.mjs";
import { materializeLocalCheckout } from "../../../../tests/support/repository-fixture.mjs";
import { leadsReport } from "./ci-proof-leads.mjs";
import {
  gapsOf,
  gitHubHolding,
  lineOf,
  retainedSummary,
} from "./ci-proof-leads-test-fixtures.mjs";

const repository = "owner/repo";

// A project whose Intent location `tests` holds shell checks.
const project = makeMe.aRepository
  .withRevision("requested", {
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
    },
  })
  .please();

// The summary of RUN, a run attempt at a revision, in REPOSITORY.
const summaryOf = (run, inRepository = repository) =>
  makeMe.aCiProofSummary
    .inRepository(inRepository)
    .ofRun(run)
    .withEntries(
      makeMe.aCiProofEntry
        .at("tests")
        .countingIn("checks")
        .withFile("tests/a.sh", { durationMs: 2500 })
        .please(),
    )
    .please();

test("GitHub refusing the run listing is a gap with the --summary remedy, and the retained summary then ranks as it names its attempt", async (t) => {
  const { integration: checkout, revisions } = await materializeLocalCheckout(
    t,
    project,
  );
  const github = gitHubHolding({ repository, runs: [], refused: () => true });

  const refused = await leadsReport(
    { directory: checkout, repository },
    { gitHub: github.asks },
  );

  assert.equal(refused.ranked, false);
  assert.deepEqual(gapsOf(refused.text), [
    "GitHub Actions workflow ci.yml could not list its attempts: GitHub request repos/owner/repo/actions/workflows/ci.yml failed: HTTP 403; remedy: choose a successful push run of ci.yml at or before the requested revision, then download its ci-proof-summary-attempt-<n> artifact another way, such as from https://github.com/owner/repo/actions/runs/<run-id>, and rerun with --summary <its ci-proof-summary.json>",
  ]);
  assert.equal(
    lineOf(refused.text, "Leads"),
    "Leads          none: no summary could be read; see the gaps",
  );

  const summaryFile = retainedSummary(
    t,
    summaryOf({ runId: 41, runAttempt: 1, revision: revisions.requested }),
  );
  const retained = await leadsReport(
    { directory: checkout, repository, summaryFile },
    { gitHub: github.asks },
  );

  assert.equal(retained.ranked, true);
  assert.equal(
    lineOf(retained.text, "Source"),
    `Source         summary file ${summaryFile}, its attempt as it names it, unconfirmed by CI`,
  );
  assert.equal(
    lineOf(retained.text, "Attempt"),
    `Attempt        run 41 attempt 1 (unconfirmed) at ${revisions.requested}`,
  );
  assert.equal(
    lineOf(retained.text, "Compatibility"),
    "Compatibility  the attempt tested the requested revision",
  );
  assert.match(retained.text, /tests\/a\.sh\n/);
});

test("GitHub refusing an attempt's summary names that run and attempt in the --summary remedy", async (t) => {
  const { integration: checkout, revisions } = await materializeLocalCheckout(
    t,
    project,
  );
  const github = gitHubHolding({
    repository,
    runs: [
      makeMe.aCiRun
        .with({
          id: 41,
          attempt: 2,
          headSha: revisions.requested,
          conclusion: "success",
        })
        .please(),
    ],
    refused: (route) => route.includes("/artifacts"),
  });

  const { text, ranked } = await leadsReport(
    { directory: checkout, repository },
    { gitHub: github.asks },
  );

  assert.equal(ranked, false);
  assert.equal(
    lineOf(text, "Attempt"),
    `Attempt        run 41 attempt 2 (success) at ${revisions.requested}`,
  );
  assert.deepEqual(gapsOf(text), [
    "GitHub Actions workflow ci.yml could not give run 41 attempt 2's summary: GitHub request repos/owner/repo/actions/runs/41/artifacts?name=ci-proof-summary-attempt-2&per_page=100 failed: HTTP 403; remedy: download its ci-proof-summary-attempt-2 artifact another way, such as from https://github.com/owner/repo/actions/runs/41, and rerun with --summary <its ci-proof-summary.json>",
  ]);
});

test("CI listing no completed attempt at the requested revision or an ancestor is a gap naming how many it listed, with the --summary remedy, and nothing ranks", async (t) => {
  const { integration: checkout } = await materializeLocalCheckout(t, project);
  const github = gitHubHolding({
    repository,
    runs: [
      makeMe.aCiRun
        .with({ id: 41, headSha: "f".repeat(40), conclusion: "success" })
        .please(),
    ],
  });

  const { text, ranked } = await leadsReport(
    { directory: checkout, repository },
    { gitHub: github.asks },
  );

  assert.equal(ranked, false);
  assert.deepEqual(gapsOf(text), [
    "1 completed attempt that could be read instead names a revision local Git does not have; fetch and rerun to consider it",
    "GitHub Actions workflow ci.yml lists no completed attempt at the requested revision or an ancestor among its 1 newest; remedy: choose a successful push run of ci.yml at or before the requested revision, then download its ci-proof-summary-attempt-<n> artifact another way, such as from https://github.com/owner/repo/actions/runs/<run-id>, and rerun with --summary <its ci-proof-summary.json>",
  ]);
});

test("a failed attempt read as the fallback counts successful attempts of any age at revisions local Git lacks, not failed ones, as attempts that could be read instead", async (t) => {
  const { integration: checkout, revisions } = await materializeLocalCheckout(
    t,
    project,
  );
  const failed = makeMe.aCiRun
    .with({ id: 42, headSha: revisions.requested, conclusion: "failure" })
    .please();
  const summaries = {
    42: summaryOf({ runId: 42, runAttempt: 1, revision: revisions.requested }),
  };
  const readWith = (...runs) =>
    leadsReport(
      { directory: checkout, repository },
      { gitHub: gitHubHolding({ repository, runs, summaries }).asks },
    );
  const ended =
    "the attempt read ended failure: its proof may be partial; its failed, missing and untimed results are listed here";

  const { text, ranked } = await readWith(
    makeMe.aCiRun
      .with({ id: 43, headSha: "f".repeat(40), conclusion: "success" })
      .please(),
    failed,
    makeMe.aCiRun
      .with({ id: 41, headSha: "d".repeat(40), conclusion: "success" })
      .please(),
  );

  assert.equal(ranked, true);
  assert.equal(
    lineOf(text, "Attempt"),
    `Attempt        run 42 attempt 1 (failure) at ${revisions.requested}`,
  );
  assert.deepEqual(gapsOf(text), [
    ended,
    "2 completed attempts that could be read instead name revisions local Git does not have; fetch and rerun to consider them",
  ]);
  const failedElsewhere = await readWith(
    makeMe.aCiRun
      .with({ id: 44, headSha: "e".repeat(40), conclusion: "failure" })
      .please(),
    failed,
  );
  assert.deepEqual(gapsOf(failedElsewhere.text), [ended]);
});

test("an attempt that kept no summary artifact is a gap with the --summary remedy, and nothing ranks", async (t) => {
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
    ],
  });

  const { text, ranked } = await leadsReport(
    { directory: checkout, repository },
    { gitHub: github.asks },
  );

  assert.equal(ranked, false);
  assert.equal(
    lineOf(text, "Leads"),
    "Leads          none: the run kept no summary artifact for this attempt",
  );
  assert.deepEqual(gapsOf(text), [
    "GitHub Actions workflow ci.yml gave no usable summary for run 41 attempt 1; remedy: download its ci-proof-summary-attempt-1 artifact another way, such as from https://github.com/owner/repo/actions/runs/41, and rerun with --summary <its ci-proof-summary.json>",
  ]);
});
