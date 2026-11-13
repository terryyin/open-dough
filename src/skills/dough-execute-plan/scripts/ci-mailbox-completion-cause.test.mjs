import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { githubApi } from "./github-actions-api-test-fixtures.mjs";
import {
  completeRevision,
  createMailbox,
  readMailboxEvents,
  registerPushedRevision,
  runMailboxWorker,
} from "./ci-mailbox.mjs";
import { runMailboxWorkerUntilBudget } from "./ci-mailbox-budget-test-fixtures.mjs";
import { watchCiExecution } from "./watch-ci-execution.mjs";

const sha = "a".repeat(40);

function endedMailbox(t) {
  const storage = mkdtempSync(join(tmpdir(), "ci-completion-cause-"));
  t.after(() => rmSync(storage, { recursive: true, force: true }));
  const options = { root: "/test/example", storage };
  const directory = createMailbox(
    {
      mode: "execution",
      repo: "owner/repo",
      branch: "main",
      maxDurationMs: 5_000,
    },
    options,
  );
  return { directory, options };
}

async function endByBudget(directory, options) {
  await runMailboxWorkerUntilBudget({
    directory,
    root: options.root,
    storage: options.storage,
  });
}

async function endByTransport(directory, options) {
  let polls = 0;
  await runMailboxWorker(directory, {
    ...options,
    observe: (request) =>
      watchCiExecution({
        ...request,
        sleep: async () => undefined,
        gh: githubApi(() => {
          polls += 1;
          throw new Error(`TLS handshake timeout ${polls}`);
        }),
      }),
  });
}

test("complete-revision after budget expiry keeps cause budget_expired on event, terminal, and receipt", async (t) => {
  const { directory, options } = endedMailbox(t);
  registerPushedRevision(directory, sha);
  await endByBudget(directory, options);
  const event = readMailboxEvents(directory).at(-1).event;
  assert.equal(event.type, "CI_MONITOR_UNAVAILABLE");
  assert.equal(event.cause, "budget_expired");
  assert.match(event.reason, /budget expired after 5000 ms/i);
  assert.deepEqual(JSON.parse(readFileSync(join(directory, "result.json"))), {
    status: "finished",
    cause: "budget_expired",
  });
  const receipt = await completeRevision(directory, sha, {
    ...options,
    workerLiveness: () => "alive",
  });
  assert.equal(receipt.unresolvedReason, "observation_unavailable");
  assert.equal(receipt.detail, "monitor_unavailable");
  assert.equal(receipt.cause, "budget_expired");
  assert.equal(receipt.event.cause, "budget_expired");
  assert.match(receipt.event.reason, /budget expired after 5000 ms/i);
});

test("complete-revision after transport loss keeps cause observation_error on event, terminal, and receipt", async (t) => {
  const { directory, options } = endedMailbox(t);
  registerPushedRevision(directory, sha);
  await endByTransport(directory, options);
  const event = readMailboxEvents(directory).at(-1).event;
  assert.equal(event.type, "CI_MONITOR_UNAVAILABLE");
  assert.equal(event.cause, "observation_error");
  assert.match(event.reason, /TLS handshake timeout/);
  assert.deepEqual(JSON.parse(readFileSync(join(directory, "result.json"))), {
    status: "finished",
    cause: "observation_error",
  });
  const receipt = await completeRevision(directory, sha, {
    ...options,
    workerLiveness: () => "alive",
  });
  assert.equal(receipt.unresolvedReason, "observation_unavailable");
  assert.equal(receipt.detail, "monitor_unavailable");
  assert.equal(receipt.cause, "observation_error");
  assert.equal(receipt.event.cause, "observation_error");
  assert.match(receipt.event.reason, /TLS handshake timeout/);
});
