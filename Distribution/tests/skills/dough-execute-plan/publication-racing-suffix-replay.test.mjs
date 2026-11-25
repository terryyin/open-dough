import assert from "node:assert/strict";
import { test } from "node:test";
import { makeMe } from "../../support/makeMe.mjs";
import { publishExecutionIncrement } from "../../../src/skills/dough-execute-plan/scripts/execution-increment-publication.mjs";
import { rebaseInProgress } from "../../../src/skills/dough-product-backlog/scripts/product-backlog-git-operation-state.mjs";
import { backlogOf } from "../../support/product-backlog-fixture.mjs";
import {
  advanceOriginBacklog,
  assertAffectedCombination,
  createBacklogSuffixFixture,
  itemA,
  itemB,
  itemC,
  itemD,
  ownedD,
  siblingB,
} from "./publication-racing-suffix-fixtures.mjs";
import {
  advanceOriginFromAnotherWriter,
  assertCheckoutUnchanged,
  assertRemoteCandidate,
  captureCheckout,
  git,
} from "./publication-test-fixtures.mjs";

test("a rejection after the suffix was already rewritten replays only that suffix onto the newer trunk", async (t) => {
  const ownedBacklog = backlogOf([], [itemA, itemB, itemC, ownedD]);
  const fixture = await createBacklogSuffixFixture(ownedBacklog);
  const { origin, integration, execution, trunkSha, cleanup } = fixture;
  t.after(cleanup);
  // The owned increment already credits its model and developer co-authors.
  const credit =
    "Co-Authored-By: Claude <noreply@anthropic.com>\n" +
    "Co-authored-by: Dana Developer <dana@example.test>";
  await git(
    execution,
    "commit",
    "--quiet",
    "--amend",
    "-m",
    "verified increment",
    "-m",
    credit,
  );

  const before = await captureCheckout(integration);
  const firstWriter = await advanceOriginBacklog(
    origin,
    backlogOf([], [itemA, siblingB, itemC, itemD]),
    "sibling backlog change",
  );
  let secondWriter;
  const comparisons = [];
  const checked = [];
  const outcome = await publishExecutionIncrement({
    workspace: execution,
    ...makeMe.anIncrementPublication
      .with({
        previouslyPublishedBase: trunkSha,
        branch: "exec/story",
        targetRef: "refs/heads/main",
      })
      .please(),
    validate: async (candidate) => {
      checked.push(candidate);
      await assertAffectedCombination(fixture, candidate);
      assert.equal(
        (
          await git(execution, "log", "-1", "--format=%(trailers)", candidate)
        ).stdout.trim(),
        credit,
      );
      return true;
    },
    beforePush: async ({ attempt, candidate, suffixBase }) => {
      comparisons.push({ candidate, suffixBase });
      if (attempt === 0) {
        secondWriter = await advanceOriginFromAnotherWriter(origin);
      }
    },
  });
  assert.equal(outcome.publication, "accepted");
  assert.equal(outcome.reconciliations, 2);
  const { sha: candidate } = outcome.receipt;
  assert.deepEqual(
    checked,
    comparisons.map(({ candidate }) => candidate),
  );
  assert.equal(comparisons[0].suffixBase, firstWriter);
  assert.equal(
    (
      await git(execution, "rev-parse", `${comparisons[0].candidate}^`)
    ).stdout.trim(),
    firstWriter,
  );
  assert.deepEqual(comparisons[1], { candidate, suffixBase: secondWriter });
  assert.equal(outcome.suffixBase, secondWriter);
  assert.equal(
    (await git(execution, "rev-parse", `${candidate}^`)).stdout.trim(),
    secondWriter,
  );
  assert.equal(
    (
      await git(
        execution,
        "log",
        "--format=%s",
        `${secondWriter}..${candidate}`,
      )
    ).stdout,
    "verified increment\n",
  );
  assert.equal(
    (
      await git(execution, "ls-tree", "-r", "--name-only", candidate)
    ).stdout.includes("other-writer.txt"),
    true,
  );
  await git(execution, "fetch", "origin");
  await assertRemoteCandidate(origin, candidate);
  assertCheckoutUnchanged(before, await captureCheckout(integration));
  assert.equal(rebaseInProgress(execution), undefined);
});
