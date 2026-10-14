import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import {
  createMailbox,
  readMailboxEvents,
  readRevisionCoverage,
  registerPushedRevision,
  requestMailboxStop,
  runMailboxWorker,
} from "./ci-mailbox.mjs";
import { watchCiExecution } from "./watch-ci-execution.mjs";
import {
  fixtureTeardown,
  deferWorkerStop,
} from "./fixture-teardown-test-fixtures.mjs";
import { controllableSleep } from "./ci-observer-poll-sleep-test-fixtures.mjs";
import {
  acceptedWorkflow,
  commitAll,
  initRepo,
  writeWorkflow,
} from "./ci-path-applicability-test-fixtures.mjs";

for (const outcome of ["success", "failure", "pending", "incomplete"]) {
  test(`registered historical ${outcome} remains evidence without unrelated old failures`, async (t) => {
    const root = await initRepo();
    const storage = mkdtempSync(join(tmpdir(), "ci-command-history-"));
    const teardown = fixtureTeardown(root, storage);
    t.after(teardown.cleanup);
    writeWorkflow(root, acceptedWorkflow);
    writeFileSync(join(root, "app.js"), "base\n");
    const ancestor = await commitAll(root, "base");
    mkdirSync(join(root, ".planning"), { recursive: true });
    writeFileSync(join(root, ".planning/note.md"), "ignored\n");
    const descendant = await commitAll(root, "ignored only");
    const state = join(storage, "attempts.json");
    const adapter = join(storage, "adapter.mjs");
    writeFileSync(
      adapter,
      `import { readFileSync } from 'node:fs';
let input = ''; for await (const chunk of process.stdin) input += chunk;
const request = JSON.parse(input);
process.stdout.write(request.operation === 'diagnose' ? JSON.stringify({ excerpt: 'historical failure' }) : readFileSync(${JSON.stringify(state)}, 'utf8'));
`,
    );
    writeFileSync(
      join(root, ".planning/open-dough.json"),
      JSON.stringify({ ciAdapter: [process.execPath, adapter] }),
    );
    const attempts = [
      {
        runId: "obsolete",
        attemptId: "opaque/success",
        sha: ancestor,
        outcome: "success",
        time: "2026-09-14T10:00:00Z",
      },
      {
        runId: "history",
        attemptId: "first",
        sha: ancestor,
        outcome,
        time: "2026-09-15T10:00:00Z",
      },
      {
        runId: "unrelated",
        attemptId: "old",
        sha: "d".repeat(40),
        outcome: "failure",
        time: "2026-09-16T10:00:00Z",
      },
      {
        runId: "newest",
        attemptId: "first",
        sha: "e".repeat(40),
        outcome: "success",
        time: "2026-09-17T10:00:00Z",
      },
    ];
    writeFileSync(state, JSON.stringify({ attempts }));
    const directory = createMailbox(
      {
        mode: "execution",
        repo: "owner/project",
        branch: "main",
        maxDurationMs: 60_000,
      },
      { root, storage },
    );
    const polls = controllableSleep();
    const worker = runMailboxWorker(directory, {
      root,
      storage,
      observe: (request) =>
        watchCiExecution({ ...request, sleep: polls.sleep }),
    });
    deferWorkerStop(teardown, worker, () =>
      requestMailboxStop(directory, { root, storage }),
    );
    const poll = polls.of(worker, () => readMailboxEvents(directory));
    await poll.reached();
    assert.deepEqual(readMailboxEvents(directory), []);
    registerPushedRevision(directory, descendant);
    await poll.advance();
    const coverage = (sha) =>
      readRevisionCoverage(directory).find((revision) => revision.sha === sha);
    assert.equal(coverage(ancestor), undefined);
    assert.equal(coverage(descendant).state, "not_required");
    assert.deepEqual(coverage(descendant).basis, {
      sha: ancestor,
      state: outcome,
    });
    registerPushedRevision(directory, ancestor);
    await poll.advance();
    assert.equal(coverage(ancestor).state, outcome);
    assert.deepEqual(coverage(ancestor).checkedBy, {
      runId: "history",
      attemptId: "first",
    });
    assert.equal(coverage(descendant).state, "not_required");
    assert.deepEqual(coverage(descendant).basis, {
      sha: ancestor,
      state: outcome,
    });
    assert.deepEqual(
      readMailboxEvents(directory).map(({ event: { type, runId } }) => ({
        type,
        runId,
      })),
      outcome === "failure"
        ? [{ type: "CI_FAILURE", runId: "history" }]
        : outcome === "incomplete"
          ? [{ type: "CI_INCOMPLETE", runId: "history" }]
          : [],
    );
    if (outcome === "success") {
      for (const retryOutcome of ["failure", "pending"]) {
        attempts.push({
          runId: "history",
          attemptId: `opaque/${retryOutcome}`,
          sha: ancestor,
          outcome: retryOutcome,
          time:
            retryOutcome === "failure"
              ? "2026-09-18T10:00:00Z"
              : "2026-09-19T10:00:00Z",
        });
        writeFileSync(state, JSON.stringify({ attempts }));
        await poll.advance();
        assert.equal(coverage(ancestor).state, retryOutcome);
        assert.deepEqual(coverage(ancestor).checkedBy, {
          runId: "history",
          attemptId: `opaque/${retryOutcome}`,
        });
        assert.deepEqual(coverage(descendant).basis, {
          sha: ancestor,
          state: retryOutcome,
        });
      }
    }
    attempts.push({
      runId: "exact",
      attemptId: "second",
      sha: descendant,
      outcome: "pending",
      time: "2026-09-18T10:00:00Z",
    });
    writeFileSync(state, JSON.stringify({ attempts }));
    await poll.advance();
    assert.equal(coverage(descendant).state, "pending");
    assert.equal(coverage(descendant).basis, undefined);
    assert.deepEqual(coverage(descendant).checkedBy, {
      runId: "exact",
      attemptId: "second",
    });
  });
}
