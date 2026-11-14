// Shared setup for completion-recovery proofs: a managed Claude coordinator
// whose observer of the target ended in-process by budget, with optional
// first completion start, unread failure, and the installed recovery CLI.
import { execFile, spawn } from "node:child_process";
import { mkdirSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { promisify } from "node:util";
import { hostSessionOwner } from "./ci-host-bridge.mjs";
import {
  createMailbox,
  publishMailboxEvent,
  readMailboxEvents,
  registerPushedRevision,
} from "./ci-mailbox.mjs";
import {
  runMailboxWorkerUntilBudget,
  snapshotMailboxRecords,
} from "./ci-mailbox-budget-test-fixtures.mjs";
import { completeRevision } from "./ci-mailbox-complete.mjs";
import { isLiveMatchingMailbox } from "./ci-mailbox-match.mjs";
import { claimMailbox } from "./ci-observer-owner.mjs";
import { createManagedFixture } from "./execution-increment-managed-delivery-test-fixtures.mjs";
import { revParse } from "./publication-test-fixtures.mjs";

const exec = promisify(execFile);
export const sessionId = "completion-recovery-coordinator";
export const targetRef = "refs/heads/main";
export const repo = "owner/project";

export async function recoveryFixture(t) {
  const fixture = await createManagedFixture({ platforms: [".claude"] });
  t.after(fixture.cleanup);
  const session = { session_id: sessionId };
  const env = {
    ...fixture.env,
    CLAUDE_CODE_SESSION_ID: sessionId,
  };
  const root = fixture.execution;
  const storage = fixture.storage;
  const options = { root, storage };
  const owner = hostSessionOwner({ host: "claude", session, root });
  const sha = await revParse(root, "HEAD");
  const branch = "main";

  // Observe through a config-free root so the in-process end never waits on
  // the fixture's command adapter release (GitHub fake + controlled clock).
  const observeRoot = join(fixture.fixture, "observe-root");
  mkdirSync(observeRoot, { recursive: true });

  async function endObserverByBudget() {
    const directory = createMailbox(
      {
        mode: "execution",
        repo,
        branch,
        maxDurationMs: 5_000,
      },
      options,
    );
    assertClaimed(claimMailbox(directory, owner), directory);
    registerPushedRevision(directory, sha);
    await runMailboxWorkerUntilBudget({
      directory,
      root,
      storage,
      observeRoot,
    });
    return directory;
  }

  function liveObservers() {
    return readdirSync(storage)
      .filter((name) => /^watch-/.test(name))
      .map((name) => join(storage, name))
      .filter((directory) =>
        isLiveMatchingMailbox(directory, { repo, branch, root, storage }),
      );
  }

  async function stopLiveObservers() {
    for (const directory of liveObservers()) {
      await fixture.stopObserver(directory);
    }
  }

  const recoveryScript = join(
    fixture.skill,
    "scripts/execution-completion-recovery.mjs",
  );
  const installedRecovery = () => import(pathToFileURL(recoveryScript).href);

  async function recoverThroughCli(extra = [], spawnOptions = {}) {
    const args = [
      recoveryScript,
      "complete",
      "--workspace",
      root,
      "--accepted-sha",
      sha,
      "--target-ref",
      targetRef,
      "--repo",
      repo,
      "--host",
      "claude",
      "--max-duration-ms",
      "60000",
      ...extra,
    ];
    if (spawnOptions.spawn) {
      return spawn(process.execPath, args, {
        cwd: root,
        env: { ...env, ...spawnOptions.env },
        stdio: ["ignore", "pipe", "pipe"],
      });
    }
    const { stdout, stderr, code } = await exec(process.execPath, args, {
      cwd: root,
      env: { ...env, ...spawnOptions.env },
    }).catch((error) => error);
    const line = stdout?.trim().split("\n").at(-1) ?? "";
    const receipt = line.startsWith("CI_OBSERVER ")
      ? JSON.parse(line.slice("CI_OBSERVER ".length))
      : null;
    if (receipt && receipt.shutdown?.status !== "confirmed") {
      fixture.stopAtTeardown(liveObservers().at(-1));
    }
    return { receipt, stdout, stderr, code: code ?? 0 };
  }

  return {
    fixture,
    env,
    root,
    storage,
    options,
    owner,
    sha,
    session,
    endObserverByBudget,
    snapshot: snapshotMailboxRecords,
    liveObservers,
    stopLiveObservers,
    recoverThroughCli,
    async recoverInstalled(request = {}) {
      const { recoverExecutionCompletion } = await installedRecovery();
      const result = await recoverExecutionCompletion({
        workspace: root,
        acceptedSha: sha,
        targetRef,
        repo,
        host: "claude",
        session,
        env,
        root,
        storage,
        maxDurationMs: 60_000,
        ...request,
      });
      if (
        result.observation?.directory &&
        result.receipt?.shutdown?.status !== "confirmed"
      ) {
        fixture.stopAtTeardown(result.observation.directory);
      }
      return result;
    },
    async startCompletion(directory, now) {
      return completeRevision(directory, sha, {
        ...options,
        now,
        workerLiveness: () => "alive",
      });
    },
    publishUnreadFailure(directory) {
      publishMailboxEvent(directory, {
        type: "CI_FAILURE",
        runId: "run:unread-recovery",
        attempt: 1,
        sha,
      });
      return readMailboxEvents(directory);
    },
  };
}

function assertClaimed(claimed, directory) {
  if (!claimed) throw new Error(`owner claim failed for ${directory}`);
}
