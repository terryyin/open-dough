// A lead reading (./ci-proof-leads.mjs) of a project whose CI is read
// through a CI adapter: an adapter's proof answer without a file breakdown
// is a gap whose remedy, the project's retained full summary through
// --summary, then ranks its files; an adapter that fails to answer is a gap
// with that remedy. GitHub Actions projects: ./ci-proof-leads.test.mjs.
import assert from "node:assert/strict";
import { test } from "node:test";
import { makeMe } from "../../../../tests/support/makeMe.mjs";
import { materializeLocalCheckout } from "../../../../tests/support/repository-fixture.mjs";
import { adapterAnswering } from "./ci-proof-adapter-test-fixtures.mjs";
import { leadsReport } from "./ci-proof-leads.mjs";
import {
  gapsOf,
  lineOf,
  retainedSummary,
  rowsOf,
  settingsIn,
} from "./ci-proof-leads-test-fixtures.mjs";

const repository = "terryyin/pygardon";
const attemptId = "993fe414-14da-41fc-b490-ac32bedf7d27";

const project = makeMe.aRepository
  .withRevision("requested", {
    files: { "tests/data_source/test_sharadar.py": "def test_a(): pass\n" },
  })
  .please();

// CHECKOUT's settings: its CI read through ADAPTER, and its pytest
// location.
function readThrough(checkout, adapter) {
  settingsIn(checkout, {
    ciAdapter: adapter.command,
    ...makeMe.intentSettings
      .withLocations(
        makeMe.anIntentLocation
          .at("tests")
          .ofKind("python", ["**/test_*.py"])
          .please(),
      )
      .please(),
  });
}

// The discover answer listing one successful attempt at REVISION, which the
// adapter names in upper case.
const discovered = (revision) =>
  JSON.stringify({
    attempts: [
      makeMe.aCiAdapterAttempt
        .passed({
          sha: revision.toUpperCase(),
          runId: attemptId,
          attemptId,
          branch: "main",
          startedAt: "2026-11-09T02:00:00Z",
          completedAt: "2026-11-09T02:10:00Z",
        })
        .please(),
    ],
  });

test("an adapter's proof answer with totals only states the absent breakdown as a gap with the --summary remedy, and the retained full summary then ranks its files", async (t) => {
  const { integration: checkout, revisions } = await materializeLocalCheckout(
    t,
    project,
  );
  const revision = revisions.requested;
  const adapter = adapterAnswering(t, {
    discover: discovered(revision),
    proof: `{"summary":{"schemaVersion":1,"repository":"terryyin/pygardon","revision":"${revision}","attemptId":"${attemptId}","entries":[{"path":"tests","unit":"tests","passed":6412,"failed":0,"other":0,"durationMs":1830000,"parts":[{"part":1,"status":"present","passed":6412,"failed":0,"other":0,"durationMs":1830000}]}]}}`,
  });
  readThrough(checkout, adapter);

  const totals = await leadsReport({ directory: checkout, repository });

  assert.equal(totals.ranked, true);
  assert.equal(
    lineOf(totals.text, "Source"),
    `Source         the CI adapter (${adapter.command.join(" ")})`,
  );
  assert.equal(
    lineOf(totals.text, "Attempt"),
    `Attempt        attemptId ${attemptId} (success) at ${revision}`,
  );
  assert.deepEqual(gapsOf(totals.text), [
    `the CI adapter's proof answer carries no file breakdown for tests; remedy: save this project's retained full summary for attemptId ${attemptId} to a file and rerun with --summary <file>, as the full summary may carry one`,
    "tests: no file breakdown; its results rank as one entry total",
  ]);
  assert.match(
    rowsOf(totals.text),
    /\n 1 1,830\.0 100\.0% 6,412 0\.29 tests \(entry total, no file breakdown\)\n/,
  );
  // A version 1 answer's results are legacy test results, never test cases.
  assert.equal(
    lineOf(totals.text, "Leads"),
    "Leads          legacy (tests): all 1 timed items, ranked by summed CI time",
  );
  assert.match(
    rowsOf(totals.text),
    /\n tests python \*\*\/test_\*\.py legacy \(tests\) 1 of 1 parts present\n/,
  );
  assert.deepEqual(
    adapter
      .requests()
      .map(({ operation, check, attempt }) => ({ operation, check, attempt })),
    [
      {
        operation: "discover",
        check: { repo: repository, branch: "main" },
        attempt: undefined,
      },
      {
        operation: "proof",
        check: { repo: repository, branch: "main" },
        attempt: { runId: attemptId, attemptId, sha: revision },
      },
    ],
  );

  const summaryFile = retainedSummary(
    t,
    makeMe.aCiProofSummary
      .inRepository(repository)
      .ofAdapterAttempt({ attemptId, revision })
      .withEntries(
        makeMe.aCiProofEntry
          .at("tests")
          .withFile("tests/data_source/test_jobs_live_commands_sharadar.py", {
            passed: 2,
            durationMs: 60_500,
          })
          .withFile("tests/service_runtime/test_cors.py", {
            passed: 2,
            durationMs: 1200,
          })
          .please(),
      )
      .please(),
  );
  const full = await leadsReport({
    directory: checkout,
    repository,
    summaryFile,
  });

  assert.equal(full.ranked, true);
  assert.equal(lineOf(full.text, "Gaps"), "Gaps           none");
  assert.match(
    rowsOf(full.text),
    /\n 1 60\.5 98\.1% 2 30\.25 tests\/data_source\/test_jobs_live_commands_sharadar\.py\n/,
  );
  assert.equal(
    lineOf(full.text, "Selection"),
    "Selection      test-selection command not recorded in the summary; remedy: read it from the CI configuration behind this project's ciAdapter",
  );
  assert.deepEqual(
    adapter
      .requests()
      .slice(2)
      .map(({ operation }) => operation),
    ["discover"],
  );
});

test("an adapter that fails to list or to answer proof is a gap with the --summary remedy, and nothing ranks", async (t) => {
  const { integration: checkout, revisions } = await materializeLocalCheckout(
    t,
    project,
  );
  readThrough(
    checkout,
    adapterAnswering(t, {}, "Pygardon CI service is unreachable"),
  );

  const unlisted = await leadsReport({ directory: checkout, repository });

  assert.equal(unlisted.ranked, false);
  assert.deepEqual(gapsOf(unlisted.text), [
    "the CI adapter could not list its attempts: it exited with status 3 (Pygardon CI service is unreachable); remedy: save this project's retained full summary of an attempt at or before the requested revision to a file and rerun with --summary <file>",
  ]);

  readThrough(
    checkout,
    adapterAnswering(t, {
      discover: discovered(revisions.requested),
      proof: "{",
    }),
  );

  const unanswered = await leadsReport({ directory: checkout, repository });

  assert.equal(unanswered.ranked, false);
  const [gap] = gapsOf(unanswered.text);
  assert.match(
    gap,
    new RegExp(
      `^the CI adapter could not give attemptId ${attemptId}'s summary: CI adapter returned invalid JSON: .*; remedy: save this project's retained full summary for attemptId ${attemptId} to a file and rerun with --summary <file>$`,
    ),
  );
});
