// Real publication of accepted B and its descendant C, observed through the
// installed GitHub default against GitHub-shaped provider facts
// (ci-integrated-state-github-test-fixtures.mjs), or through a custom command
// adapter (ci-integrated-state-custom-test-fixtures.mjs), whose conclusions
// come from actually executed, counted covered commands.
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { publishHistoryPreservingCandidate } from "./history-preserving-publication.mjs";
import { createManagedFixture } from "./execution-increment-managed-delivery-test-fixtures.mjs";
import {
  cloneAsAnotherWriter,
  exec,
  git,
  lsRemoteSha,
  revParse,
} from "./publication-test-fixtures.mjs";
import { ignoreInstalledSkills } from "./ci-reuse-journey-test-fixtures.mjs";
import { createReuseCheckCommands } from "./ci-reuse-check-command-test-fixtures.mjs";
import { githubProvider } from "./ci-integrated-state-github-test-fixtures.mjs";
import { awaitWorkerState } from "./watch-ci-test-fixtures.mjs";
import { readRevisionCoverage } from "./ci-mailbox.mjs";
import {
  launchComplete,
  parseReceipt,
} from "./ci-mailbox-await-test-fixtures.mjs";

const story = "exec/story";
export const policy = { check: "ci.yml", context: "push", jobs: ["covered"] };

// `provider(t, fixture, declared)` configures the project's CI source and
// returns its observer `polls()` so far, any observer `env`, request hold/release around
// registration, its `repo` when not "owner/repo", and provider-specific
// journey `members`.
export async function createIntegratedStateJourney(
  t,
  { declared = policy, provider = githubProvider } = {},
) {
  const fixture = await createManagedFixture();
  t.after(fixture.cleanup);
  await ignoreInstalledSkills(fixture);
  const source = await provider(t, fixture, declared);
  if (source.env) fixture.env = source.env;
  const commands = createReuseCheckCommands(fixture, {
    unit: "covered",
    configuration: "checks-v1",
    context: "inputs-v1",
  });
  const publish = () =>
    publishHistoryPreservingCandidate({
      ownedWorkspace: fixture.execution,
      publishedTip: fixture.candidateSha,
      branch: story,
    });

  // The coordinator commits `file` on its accepted history and publishes it.
  async function publishIncrement(file) {
    if (file) {
      writeFileSync(join(fixture.execution, file), `${file}\n`);
      await git(fixture.execution, "add", file);
      await git(fixture.execution, "commit", "-m", `increment ${file}`);
      fixture.candidateSha = await revParse(fixture.execution, "HEAD");
    }
    await git(fixture.execution, "push", "origin", `HEAD:refs/heads/${story}`);
    const { receipt } = await publish();
    assert.equal(
      await lsRemoteSha(fixture.origin, "refs/heads/main"),
      receipt.sha,
    );
    return receipt.sha;
  }

  // Another writer publishes `file` on top of the remote target; the
  // coordinator's checkout has not fetched it. Its covered command runs in
  // that writer's checkout.
  async function publishFromAnotherWriter(file) {
    const checkout = mkdtempSync(join(tmpdir(), "integrated-writer-"));
    try {
      await cloneAsAnotherWriter(fixture.origin, join(checkout, "clone"));
      const clone = join(checkout, "clone");
      writeFileSync(join(clone, file), `${file}\n`);
      await git(clone, "add", file);
      await git(clone, "commit", "-m", `another writer ${file}`);
      await git(clone, "push", "origin", "main");
      const sha = await revParse(clone, "HEAD");
      const [command, ...args] = commands.coveredCommand(sha);
      const result = await exec(command, args, { cwd: clone }).catch(
        (error) => error,
      );
      return { sha, success: !(result instanceof Error) };
    } finally {
      rmSync(checkout, { recursive: true, force: true });
    }
  }

  const coverage = (directory, sha) =>
    readRevisionCoverage(directory).find((revision) => revision.sha === sha);
  const twoMorePolls = async (directory) => {
    const listed = source.polls();
    await awaitWorkerState(
      directory,
      () => source.polls() >= listed + 2,
      "two more observer polls",
    );
  };

  return {
    ...source.members,
    fixture,
    commands,
    publishIncrement,
    publishFromAnotherWriter,
    // The covered command really runs for `sha` and reports its result.
    runCovered: (sha, failed = false) => commands.runCovered(sha, failed),
    // Starts the installed observer on the authorized target and registers
    // the accepted `sha` before it first asks GitHub anything.
    async observe(sha) {
      source.holdRequests();
      const directory = await fixture.startExecutionMailbox(
        {
          mode: "execution",
          repo: source.repo ?? "owner/repo",
          branch: "main",
          root: fixture.execution,
          maxDurationMs: 60_000,
        },
        { root: fixture.execution, storage: fixture.storage, env: fixture.env },
      );
      await exec(
        process.execPath,
        [
          join(fixture.skill, "scripts/ci-mailbox.mjs"),
          "register-push",
          directory,
          sha,
        ],
        { cwd: fixture.execution, env: fixture.env },
      );
      source.releaseRequests();
      return directory;
    },
    coverage,
    async awaitCoverage(directory, sha, arrived, description) {
      await awaitWorkerState(
        directory,
        () => {
          const revision = coverage(directory, sha);
          return revision !== undefined && arrived(revision);
        },
        description,
      );
    },
    // Waits until the observer has polled twice more, then returns `sha`'s
    // record.
    async afterTwoPolls(directory, sha) {
      await twoMorePolls(directory);
      return coverage(directory, sha);
    },
    // The installed completion command, run until it has rechecked its
    // pending evidence across two more observer polls, then cancelled.
    async completeWhilePending(directory, sha) {
      const waiting = launchComplete(
        fixture.teardown,
        fixture.env,
        directory,
        sha,
        join(fixture.skill, "scripts/ci-mailbox.mjs"),
      );
      await waiting.waitForCancellationReady();
      await twoMorePolls(directory);
      await waiting.waitForRechecks(3);
      assert.equal(waiting.output(), "", "completion must still be pending");
      waiting.child.kill("SIGTERM");
      const completed = await waiting.completed;
      assert.equal(completed.code, 0, completed.stderr);
      return parseReceipt(completed.stdout);
    },
    installedModule: (name) =>
      import(pathToFileURL(join(fixture.skill, "scripts", name)).href),
  };
}

// Slice 1's observed GitHub shape: B's waiting run was replaced (cancelled,
// no jobs) by C's, which ran; D's waiting run was replaced by E's, still
// running. D is the newest completed run, so C leaves the startup stream.
export async function publishReplacedBAndValidatedC(journey) {
  const b = await journey.publishIncrement();
  journey.recordRun(b, { state: "cancelled" });
  const c = await journey.publishIncrement("c.txt");
  const cRun = journey.recordRun(c, {
    state: "completed",
    executed: await journey.runCovered(c),
  });
  const d = await journey.publishIncrement("d.txt");
  journey.recordRun(d, { state: "cancelled" });
  const e = await journey.publishIncrement("e.txt");
  journey.recordRun(e, { state: "in_progress" });
  return { b, c, cRun, d, e };
}

// The installed completion, cancelled after it kept waiting across polls,
// reports B's own exact state and why no integrated evidence applies.
export async function assertStillUnresolved(journey, directory, b, integrated) {
  const receipt = await journey.completeWhilePending(directory, b);
  assert.equal(receipt.verdict, undefined);
  assert.equal(receipt.unresolvedReason, "wait_cancelled");
  assert.equal(receipt.shutdown.status, "retained");
  assert.equal(receipt.effectiveEvidence.source, "exact");
  assert.equal(receipt.effectiveEvidence.revision.sha, b);
  assert.deepEqual(receipt.effectiveEvidence.integrated, integrated);
  const { recordedVerdict } = await journey.installedModule(
    "ci-mailbox-await.mjs",
  );
  assert.equal(recordedVerdict(directory, b), undefined);
  return receipt;
}

// D (replaced) and E (running) are descendants of B awaiting no success.
export const waitingTips = ({ d, e }) => [
  { sha: e, reason: "not_current_success" },
  { sha: d, reason: "not_current_success" },
];

export const unresolved = (considered, declared = policy) => ({
  state: "unresolved",
  policy: declared,
  reason: "no_eligible_candidate",
  considered,
});
