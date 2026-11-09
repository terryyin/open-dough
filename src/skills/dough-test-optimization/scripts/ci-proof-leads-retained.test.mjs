// A lead reading (./ci-proof-leads.mjs) refuses a summary that is not the
// asked attempt's: a retained one (--summary) that is not the attempt CI
// names, one from CI naming another revision, or one retained elsewhere
// naming another repository when CI named no attempt. Refused routes:
// ./ci-proof-leads-gaps.test.mjs.
import assert from "node:assert/strict";
import { test } from "node:test";
import { makeMe } from "../../../../tests/support/makeMe.mjs";
import { materializeLocalCheckout } from "../../../../tests/support/repository-fixture.mjs";
import { leadsReport } from "./ci-proof-leads.mjs";
import {
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

test("a retained summary is used only as the attempt CI names: another run's summary is refused and nothing ranks", async (t) => {
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
  const another = retainedSummary(
    t,
    summaryOf({ runId: 40, runAttempt: 1, revision: revisions.requested }),
  );

  const { text, ranked } = await leadsReport(
    { directory: checkout, repository, summaryFile: another },
    { gitHub: github.asks },
  );

  assert.equal(ranked, false);
  assert.equal(
    lineOf(text, "Leads"),
    `Leads          none: refused: the summary names run 40, not run 41 attempt 1 at ${revisions.requested}`,
  );
  assert.deepEqual(
    github.asked.filter((route) => route.includes("/artifacts")),
    [],
  );

  const own = retainedSummary(
    t,
    summaryOf({ runId: 41, runAttempt: 1, revision: revisions.requested }),
  );
  const confirmed = await leadsReport(
    { directory: checkout, repository, summaryFile: own },
    { gitHub: github.asks },
  );
  assert.equal(confirmed.ranked, true);
  assert.equal(
    lineOf(confirmed.text, "Source"),
    `Source         summary file ${own}, confirmed as the attempt GitHub Actions workflow ci.yml names`,
  );
});

test("a summary naming another revision or repository than asked is refused, from CI or retained elsewhere", async (t) => {
  const { integration: checkout, revisions } = await materializeLocalCheckout(
    t,
    project,
  );
  const otherRevision = "e".repeat(40);
  const github = gitHubHolding({
    repository,
    runs: [
      makeMe.aCiRun
        .with({ id: 41, headSha: revisions.requested, conclusion: "success" })
        .please(),
    ],
    summaries: {
      41: summaryOf({ runId: 41, runAttempt: 1, revision: otherRevision }),
    },
  });

  const fromCi = await leadsReport(
    { directory: checkout, repository },
    { gitHub: github.asks },
  );
  assert.equal(fromCi.ranked, false);
  assert.equal(
    lineOf(fromCi.text, "Leads"),
    `Leads          none: refused: the summary names revision "${otherRevision}", not run 41 attempt 1 at ${revisions.requested}`,
  );

  const unconfirmed = await leadsReport(
    {
      directory: checkout,
      repository,
      summaryFile: retainedSummary(
        t,
        summaryOf(
          { runId: 41, runAttempt: 1, revision: revisions.requested },
          "someone/else",
        ),
      ),
    },
    {
      gitHub: gitHubHolding({ repository, runs: [], refused: () => true }).asks,
    },
  );
  assert.equal(unconfirmed.ranked, false);
  assert.equal(
    lineOf(unconfirmed.text, "Leads"),
    'Leads          none: refused: the summary names repository "someone/else", not this project\'s',
  );
});
