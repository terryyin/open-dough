// The lead reading's command line (./ci-proof-leads.mjs), run from inside a
// project's checkout: its options and exit status. What a reading prints:
// ./ci-proof-leads.test.mjs and ./ci-proof-leads-adapter.test.mjs.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { makeMe } from "../../../../tests/support/makeMe.mjs";
import { materializeLocalCheckout } from "../../../../tests/support/repository-fixture.mjs";
import { adapterAnswering } from "./ci-proof-adapter-test-fixtures.mjs";
import { lineOf, settingsIn } from "./ci-proof-leads-test-fixtures.mjs";

const cli = fileURLToPath(new URL("./ci-proof-leads.mjs", import.meta.url));
const repository = "terryyin/pygardon";
const attemptId = "74a7dd32";

const project = makeMe.aRepository
  .withRevision("requested", {
    files: {
      "tests/data_source/test_a.py": "def test_a(): pass\n",
      "tests/service_runtime/test_b.py": "def test_b(): pass\n",
      "tests/other/test_c.py": "def test_c(): pass\n",
    },
  })
  .please();

const run = (directory, ...args) =>
  spawnSync(process.execPath, [cli, ...args], {
    cwd: directory,
    encoding: "utf8",
  });

test("from inside the checkout it prints the table and exits 0 when a summary ranked, 1 when none could, and 2 on a usage error", async (t) => {
  const { integration: checkout, revisions } = await materializeLocalCheckout(
    t,
    project,
  );
  const revision = revisions.requested;
  const adapter = adapterAnswering(t, {
    discover: JSON.stringify({
      attempts: [
        makeMe.aCiAdapterAttempt
          .passed({
            sha: revision,
            runId: attemptId,
            attemptId,
            branch: "main",
            startedAt: "2026-11-09T02:00:00Z",
            completedAt: "2026-11-09T02:10:00Z",
          })
          .please(),
      ],
    }),
  });
  settingsIn(checkout, {
    ciAdapter: adapter.command,
    ...makeMe.intentSettings
      .withLocations(
        makeMe.anIntentLocation.at("tests").ofKind("python").please(),
      )
      .please(),
  });
  const tests = join(checkout, "tests");
  writeFileSync(
    join(tests, "full-summary.json"),
    JSON.stringify(
      makeMe.aCiProofSummary
        .inRepository(repository)
        .ofAdapterAttempt({ attemptId, revision })
        .withEntries(
          makeMe.aCiProofEntry
            .at("tests")
            .withFile("tests/data_source/test_a.py", { durationMs: 4000 })
            .withFile("tests/service_runtime/test_b.py", { durationMs: 2000 })
            .withFile("tests/other/test_c.py", { durationMs: 9000 })
            .please(),
        )
        .please(),
    ),
  );

  const ranked = run(
    tests,
    "--repository",
    repository,
    "--summary",
    "full-summary.json",
    "--scope",
    "tests/data_source",
    "--scope",
    "./tests/service_runtime/",
  );
  assert.deepEqual([ranked.status, ranked.stderr], [0, ""]);
  assert.equal(
    lineOf(ranked.stdout, "Leads"),
    "Leads          all 2 timed items, ranked by summed CI time",
  );
  assert.doesNotMatch(ranked.stdout, /tests\/other/);

  const unranked = run(checkout, "--repository", repository);
  assert.deepEqual([unranked.status, unranked.stderr], [1, ""]);
  assert.match(lineOf(unranked.stdout, "Leads"), /^Leads {10}none: /);

  for (const [args, stderr] of [
    [
      ["--revision", "no-such-revision", "--repository", repository],
      /^ci-proof-leads: Git cannot name a commit for revision no-such-revision\n$/,
    ],
    [
      [],
      /^ci-proof-leads: the origin remote names no OWNER\/REPO; pass --repository\n$/,
    ],
    [
      ["--bogus"],
      /^ci-proof-leads: Unknown option '--bogus'.*\nUsage: node <this skill>\/scripts\/ci-proof-leads\.mjs /s,
    ],
  ]) {
    const refused = run(checkout, ...args);
    assert.equal(refused.status, 2, args.join(" "));
    assert.equal(refused.stdout, "", args.join(" "));
    assert.match(refused.stderr, stderr, args.join(" "));
  }
});
