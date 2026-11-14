import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { awaitRevision } from "./ci-mailbox-await.mjs";
import {
  createMailbox,
  readMailboxEvents,
  readRevisionCoverage,
  registerPushedRevision,
  requestMailboxStop,
  runMailboxWorker,
} from "./ci-mailbox.mjs";
import { freshPendingRevision } from "./ci-mailbox-revision-records.mjs";
import { watchCiExecution } from "./watch-ci-execution.mjs";
import { run } from "./watch-ci-test-fixtures.mjs";
import {
  deferWorkerStop,
  fixtureTeardown,
} from "./fixture-teardown-test-fixtures.mjs";
import { controllableSleep } from "./ci-observer-poll-sleep-test-fixtures.mjs";
import { makeMe } from "../../../../tests/support/makeMe.mjs";
import { materializeRepository } from "../../../../tests/support/repository-fixture.mjs";
import {
  acceptedWorkflow,
  workflowPath,
} from "./ci-path-applicability-test-fixtures.mjs";
import { crossBranchHistoryGithub } from "./ci-revision-coverage-not-required-cross-branch-test-fixtures.mjs";

test("pending, failed, and cancelled trunk ancestors inherit exactly; cancelled never falls back to an older green main run", async (t) => {
  for (const stage of ["pending", "failed", "cancelled"]) {
    await t.test(stage, async (t) => {
      const storage = mkdtempSync(join(tmpdir(), `ci-cross-branch-${stage}-`));
      const storyBranch = `feature/cross-branch-${stage}`;
      // Older green G and nearest trunk ancestor A on main, then the
      // ignored-only story tip B on the story branch's checkout.
      const {
        execution: repo,
        fixture,
        revisions: { g: shaG, a: shaA, b: shaB },
      } = await materializeRepository(
        makeMe.aRepository
          .withRevision("g", {
            backlog: null,
            files: {
              "src/app.js": "console.log('G');\n",
              [workflowPath]: acceptedWorkflow,
            },
          })
          .withRevision("a", { files: { "src/app.js": "console.log('A');\n" } })
          .withWorkspace(storyBranch, { from: "a" })
          .withUnpublishedRevision("b", {
            files: { ".planning/note.md": "note\n" },
          })
          .please(),
      );
      const teardown = fixtureTeardown(storage, fixture);
      t.after(teardown.cleanup);

      const directory = createMailbox(
        {
          mode: "execution",
          repo: "owner/project",
          branch: storyBranch,
          maxDurationMs: 60_000,
        },
        { root: repo, storage },
      );
      registerPushedRevision(directory, shaB);

      let ancestor = {
        status: stage === "pending" ? "in_progress" : "completed",
        conclusion:
          stage === "pending"
            ? null
            : stage === "failed"
              ? "failure"
              : "cancelled",
      };
      const polls = controllableSleep();
      const github = crossBranchHistoryGithub({
        storyBranch,
        storyBranchHistory: [],
        allBranchHistory: () => [
          run({
            headSha: shaA,
            headBranch: "main",
            databaseId: 501,
            workflowName: "CI",
            event: "push",
            status: ancestor.status,
            conclusion: ancestor.conclusion,
            url: "https://github.com/owner/project/actions/runs/501",
          }),
          run({
            headSha: shaG,
            headBranch: "main",
            databaseId: 500,
            workflowName: "CI",
            event: "push",
            status: "completed",
            conclusion: "success",
            url: "https://github.com/owner/project/actions/runs/500",
          }),
        ],
      });
      const worker = runMailboxWorker(directory, {
        root: repo,
        storage,
        observe: (request) =>
          watchCiExecution({ ...request, gh: github.gh, sleep: polls.sleep }),
      });
      deferWorkerStop(teardown, worker, () =>
        requestMailboxStop(directory, { root: repo, storage }),
      );

      const poll = polls.of(worker, () => readMailboxEvents(directory));
      await poll.reached();
      const coverageOf = (sha) =>
        readRevisionCoverage(directory).find(
          (revision) => revision.sha === sha,
        );

      if (stage === "pending") {
        assert.deepEqual(coverageOf(shaB).basis, {
          sha: shaA,
          state: "pending",
        });
        assert.deepEqual(
          freshPendingRevision(coverageOf(shaB), coverageOf(shaB).observedAt),
          {
            source: "attempt",
            sha: shaB,
            observedAt: coverageOf(shaB).observedAt,
            basis: { sha: shaA, state: "pending" },
          },
        );
        assert.deepEqual(readMailboxEvents(directory), []);
        const waiting = awaitRevision(directory, shaB, {
          root: repo,
          storage,
          workerLiveness: () => "alive",
          deadlineMs: 80,
          recheckMs: 10,
        });
        ancestor = { status: "completed", conclusion: "success" };
        poll.release();
        assert.equal((await waiting).verdict, "success");
      } else if (stage === "failed") {
        assert.deepEqual(coverageOf(shaB).basis, {
          sha: shaA,
          state: "failure",
        });
        const failures = () =>
          readMailboxEvents(directory)
            .map(({ event }) => event)
            .filter(({ type }) => type === "CI_FAILURE");
        assert.equal(failures().length, 1);
        assert.equal(failures()[0].sha, shaA);
        assert.equal(failures()[0].runId, 501);
        await poll.advance();
        assert.equal(failures().length, 1);
        const verdict = await awaitRevision(directory, shaB, {
          root: repo,
          storage,
          workerLiveness: () => "alive",
        });
        assert.equal(verdict.verdict, "failure");
        assert.deepEqual(verdict.effectiveEvidence.basis, {
          sha: shaA,
          state: "failure",
        });
      } else {
        assert.equal(coverageOf(shaB).state, "not_required");
        assert.deepEqual(coverageOf(shaB).basis, {
          sha: shaA,
          state: "incomplete",
        });
        assert.notEqual(coverageOf(shaB).basis.sha, shaG);
        const verdict = await awaitRevision(directory, shaB, {
          root: repo,
          storage,
          workerLiveness: () => "alive",
        });
        assert.equal(verdict.verdict, undefined);
        assert.equal(verdict.unresolvedReason, "incomplete");
        assert.deepEqual(verdict.effectiveEvidence.basis, {
          sha: shaA,
          state: "incomplete",
        });
      }

      requestMailboxStop(directory, { root: repo, storage });
      await worker;
    });
  }
});
