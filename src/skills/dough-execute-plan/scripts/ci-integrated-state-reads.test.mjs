// The GitHub default's authoritative current-attempt reads for C, through
// the installed observer and completion: a rerun starting while C's jobs are
// read, a listing older than C's current attempt, the per-poll read bound,
// and several runs of one C SHA. Each must leave accepted B unresolved until
// every read run of C is a current success.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { isDeepStrictEqual } from "node:util";
import { completeThroughCli } from "./execution-increment-managed-delivery-cli-test-fixtures.mjs";
import {
  launchComplete,
  parseReceipt,
} from "./ci-mailbox-await-test-fixtures.mjs";
import { awaitWorkerState } from "./watch-ci-test-fixtures.mjs";
import {
  assertStillUnresolved,
  createIntegratedStateJourney,
  unresolved,
} from "./ci-integrated-state-journey-test-fixtures.mjs";

const unavailable = {
  head: "HTTP/2.0 502 Bad Gateway",
  body: "{}",
  code: 1,
  stderr: "gh: Bad Gateway (HTTP 502)",
};
const ok = (body) => ({ head: "HTTP/2.0 200 OK", body: JSON.stringify(body) });
const githubState = (journey) =>
  JSON.parse(
    readFileSync(join(journey.github.env.CI_GH_FIXTURE, "github.json"), "utf8"),
  );
const rawRun = (journey, id) =>
  githubState(journey).runs.find((run) => run.id === id);
const asked = (journey, suffix) =>
  journey.github.asked().some((call) => call.endsWith(suffix));
// B is replaced; each later increment's covered command actually runs.
async function validatedIncrements(journey, files) {
  const b = await journey.publishIncrement();
  journey.recordRun(b, { state: "cancelled" });
  const validated = [];
  for (const file of files) {
    const sha = await journey.publishIncrement(file);
    const run = journey.recordRun(sha, {
      state: "completed",
      executed: await journey.runCovered(sha),
    });
    validated.push({ sha, run });
  }
  return { b, validated };
}

test("a rerun of C starting while its jobs are read contradicts that read, and a listing older than C's current attempt never completes B", async (t) => {
  const journey = await createIntegratedStateJourney(t);
  const {
    b,
    validated: [{ sha: c, run: cRun }],
  } = await validatedIncrements(journey, ["c.txt"]);
  const jobs = `runs/${cRun}/attempts/1/jobs`;
  const job = githubState(journey).attemptJobs[`${cRun}/1`];
  journey.answer(jobs, {
    ...ok({ total_count: job.length, jobs: job }),
    holdLogs: true,
  });
  const directory = await journey.observe(b);
  await awaitWorkerState(
    directory,
    () => asked(journey, `${jobs}?per_page=100&page=1`),
    "C's jobs read in flight",
  );
  const waiting = launchComplete(
    journey.fixture.teardown,
    journey.fixture.env,
    directory,
    b,
    join(journey.fixture.skill, "scripts/ci-mailbox.mjs"),
  );
  await waiting.waitForCancellationReady();
  // The listing stays as first read; C's run starts attempt 2 meanwhile.
  const listing = githubState(journey).runs;
  journey.answer(
    "workflows/7001/runs",
    ok({ total_count: listing.length, workflow_runs: listing }),
  );
  journey.recordRun(c, { id: cRun, attempt: 2, state: "in_progress" });
  journey.github.releaseLogs();
  const contradicted = unresolved([{ sha: c, reason: "attempt_changed" }]);
  await journey.awaitCoverage(
    directory,
    b,
    (revision) => isDeepStrictEqual(revision.integrated, contradicted),
    "C's contradicted read",
  );
  await journey.afterTwoPolls(directory, b);
  await waiting.waitForRechecks(3);
  assert.equal(waiting.output(), "", "completion must still be pending");
  waiting.child.kill("SIGTERM");
  const receipt = parseReceipt((await waiting.completed).stdout);
  assert.equal(receipt.verdict, undefined);
  assert.equal(receipt.unresolvedReason, "wait_cancelled");
  assert.deepEqual(receipt.effectiveEvidence.integrated, contradicted);
  assert.equal(journey.commands.count(b), 0);
});

test("C's runs past the per-poll read bound are not read, and an unavailable newer read never lets an older C complete B", async (t) => {
  const journey = await createIntegratedStateJourney(t);
  const { b, validated } = await validatedIncrements(journey, [
    "c1.txt",
    "c2.txt",
    "c3.txt",
    "c4.txt",
  ]);
  const [c1, ...newer] = validated;
  for (const { run } of newer) journey.answer(`runs/${run}`, unavailable);
  const directory = await journey.observe(b);
  await journey.awaitCoverage(
    directory,
    b,
    (revision) => revision.integrated !== undefined,
    "integrated judgement",
  );
  await assertStillUnresolved(
    journey,
    directory,
    b,
    unresolved([
      ...newer
        .map(({ sha }) => ({ sha, reason: "current_attempt_unavailable" }))
        .reverse(),
      { sha: c1.sha, reason: "verification_bound" },
    ]),
  );
  assert.equal(asked(journey, `actions/runs/${c1.run}`), false);

  const newest = newer.at(-1);
  journey.answer(`runs/${newest.run}`, undefined);
  await journey.awaitCoverage(
    directory,
    b,
    (revision) => revision.integrated?.state === "success",
    "the newest C's validated integrated state",
  );
  const completion = await completeThroughCli(journey.fixture, directory, b);
  assert.equal(completion.verdict, "success");
  assert.deepEqual(
    [
      completion.effectiveEvidence.validated.sha,
      completion.effectiveEvidence.validated.runId,
    ],
    [newest.sha, newest.run],
  );
  assert.equal(completion.shutdown.status, "confirmed");
});

test("every run of one C SHA must be a current success: another run's rerun keeps B unresolved until it is current again", async (t) => {
  const journey = await createIntegratedStateJourney(t);
  const {
    b,
    validated: [{ sha: c, run: first }],
  } = await validatedIncrements(journey, ["c.txt"]);
  const second = journey.recordRun(c, {
    state: "completed",
    executed: await journey.runCovered(c),
  });
  assert.equal(journey.commands.count(c), 2);
  journey.answer(
    `runs/${first}`,
    ok({
      ...rawRun(journey, first),
      run_attempt: 2,
      status: "in_progress",
      conclusion: null,
    }),
  );
  journey.answer(
    `runs/${first}/attempts/2/jobs`,
    ok({ total_count: 0, jobs: [] }),
  );
  const directory = await journey.observe(b);
  await journey.awaitCoverage(
    directory,
    b,
    (revision) => revision.integrated !== undefined,
    "integrated judgement",
  );
  await assertStillUnresolved(
    journey,
    directory,
    b,
    unresolved([{ sha: c, reason: "attempt_changed" }]),
  );
  assert.ok(asked(journey, `actions/runs/${second}`));
  assert.ok(asked(journey, `actions/runs/${first}`));

  journey.answer(`runs/${first}`, undefined);
  await journey.awaitCoverage(
    directory,
    b,
    (revision) => revision.integrated?.state === "success",
    "both runs current",
  );
  for (const run of [first, second])
    assert.ok(
      asked(journey, `runs/${run}/attempts/1/jobs?per_page=100&page=1`),
    );
  const completion = await completeThroughCli(journey.fixture, directory, b);
  assert.equal(completion.verdict, "success");
  assert.deepEqual(
    [
      completion.effectiveEvidence.validated.sha,
      completion.effectiveEvidence.validated.runId,
    ],
    [c, second],
  );
  assert.equal(completion.shutdown.status, "confirmed");
});
