import {
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { makeMe } from "../../../../tests/support/makeMe.mjs";
import {
  fixtureTeardown,
  sharedCommandDirectory,
} from "./fixture-teardown-test-fixtures.mjs";
import { requestOwnerEnvironment } from "./github-request-owner-test-fixtures.mjs";

export const checkedSha = "c".repeat(40);

const opaqueRunUrl = "https://ci.example/run";
/**
 * Stated discovery facts through MakeMe, preserving omitted optionals.
 * @param {Parameters<typeof makeMe.aCiAdapterAttempt.with>[0]} facts
 */
export const discoverAttempt = (facts) =>
  makeMe.aCiAdapterAttempt.with(facts).please();
// Successive discover answers for `checkedSha`: pending, success, failure,
// then incomplete. Built here so the generated adapter encodes the facts.
const controlledDiscoverAttempts = [
  discoverAttempt({
    runId: "run:opaque",
    attemptId: "attempt/first",
    sha: checkedSha,
    outcome: "pending",
    url: opaqueRunUrl,
    time: "2026-09-15T10:00:00Z",
  }),
  discoverAttempt({
    runId: "run:opaque",
    attemptId: "attempt/retry",
    sha: checkedSha,
    outcome: "success",
    url: opaqueRunUrl,
    time: "2026-09-15T10:01:00Z",
  }),
  discoverAttempt({
    runId: "run:opaque",
    attemptId: "attempt:failed",
    sha: checkedSha,
    outcome: "failure",
  }),
  discoverAttempt({
    runId: "run:opaque",
    attemptId: "attempt:incomplete",
    sha: checkedSha,
    outcome: "incomplete",
  }),
];

// Newest-first unit-check answers used by acquisition retention proof.
export const answeredUnitAttempts = [
  discoverAttempt({
    runId: "r2",
    attemptId: "1",
    sha: checkedSha,
    outcome: "success",
    check: "unit",
    time: "2026-09-15T10:01:00Z",
  }),
  discoverAttempt({
    runId: "r1",
    attemptId: "1",
    sha: checkedSha,
    outcome: "success",
    check: "unit",
    time: "2026-09-15T10:00:00Z",
  }),
];

// Older completed attempts listed before a later failure on a new SHA.
export function historyDiscoverAttempts({
  oldFailure,
  oldIncomplete,
  newestSuccess,
  newFailure,
}) {
  return {
    startup: [
      discoverAttempt({
        runId: "r1",
        attemptId: "1",
        sha: oldFailure,
        outcome: "failure",
        time: "2026-09-15T10:00:00Z",
      }),
      discoverAttempt({
        runId: "r2",
        attemptId: "1",
        sha: oldIncomplete,
        outcome: "incomplete",
        time: "2026-09-16T10:00:00Z",
      }),
      discoverAttempt({
        runId: "r3",
        attemptId: "1",
        sha: newestSuccess,
        outcome: "success",
        time: "2026-09-17T10:00:00Z",
      }),
    ],
    laterFailure: discoverAttempt({
      runId: "r4",
      attemptId: "1",
      sha: newFailure,
      outcome: "failure",
      time: "2026-09-18T10:00:00Z",
    }),
  };
}

// A `gh` that counts its calls in CI_TEST_GH_CALLS and lists no runs.
const countingGithubCommand = `#!${process.execPath}
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
if (process.argv[2] === 'auth') process.exit(1);
const path = process.env.CI_TEST_GH_CALLS;
const count = existsSync(path) ? Number(readFileSync(path, 'utf8')) + 1 : 1;
writeFileSync(path, String(count));
process.stdout.write('[]');
`;

// A project whose controlled adapter answers pending, success, failure, then
// incomplete for `checkedSha`, counting its calls, and an `env` whose `gh`
// counts its calls in `ghCalls`.
export function projectFixture(t, configuration) {
  const root = mkdtempSync(join(tmpdir(), "ci-command-adapter-test-"));
  const planning = join(root, ".planning");
  const requests = join(root, "adapter-requests.jsonl");
  const calls = join(root, "adapter-calls");
  const ghCalls = join(root, "gh-calls");
  mkdirSync(planning);
  const adapter = join(root, "controlled-adapter.mjs");
  writeFileSync(
    adapter,
    `#!${process.execPath}
import { appendFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
let input = '';
for await (const chunk of process.stdin) input += chunk;
const request = JSON.parse(input);
appendFileSync(${JSON.stringify(requests)}, JSON.stringify(request) + '\\n');
const path = ${JSON.stringify(calls)};
const call = existsSync(path) ? Number(readFileSync(path, 'utf8')) + 1 : 1;
writeFileSync(path, String(call));
if (call === 1) writeFileSync('.planning/open-dough.json', JSON.stringify({ ciAdapter: [] }));
const attempts = ${JSON.stringify(controlledDiscoverAttempts)};
const attempt = attempts[Math.min(call, attempts.length) - 1];
process.stdout.write(JSON.stringify({ attempts: [attempt] }));
`,
  );
  chmodSync(adapter, 0o700);
  if (configuration !== null)
    writeFileSync(
      join(planning, "open-dough.json"),
      JSON.stringify(configuration(adapter)),
    );
  const teardown = fixtureTeardown(root);
  t.after(teardown.cleanup);
  const env = {
    ...process.env,
    ...requestOwnerEnvironment(teardown),
    CI_TEST_GH_CALLS: ghCalls,
    PATH: `${sharedCommandDirectory("gh", countingGithubCommand)}:${process.env.PATH}`,
  };
  return { root, adapter, requests, calls, ghCalls, env };
}

export function callsReached(path, count) {
  return existsSync(path) && Number(readFileSync(path, "utf8")) >= count;
}
