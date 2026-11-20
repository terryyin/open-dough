// Done keeps the work a Default main session made, with Git references that
// let the typed review read it after the checkout's branches move away.
import { readFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "vitest";
import { git } from "../../../Distribution/src/skills/dough-execute-plan/scripts/publication-git.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { keptRecords } from "../../server/launchRecordStore.ts";
import {
  aCheckout,
  aDefaultLaunch,
  aKeptSession,
  keep,
  markDone,
  minutesAgo,
  source,
  work,
} from "../support/doneCaptureCase.ts";
import { review } from "../support/doneCaptureReview.ts";

// Leaves `commit` on no branch, with no reflog or loose object reaching it.
async function forgetInCheckout(
  checkout: string,
  base: string,
  commit: string,
) {
  await git(checkout, "reset", "--quiet", "--hard", base);
  await git(checkout, "update-ref", "refs/remotes/origin/main", base);
  expect(
    (await git(checkout, "branch", "-a", "--contains", commit)).stdout,
  ).toBe("");
  await git(checkout, "reflog", "expire", "--expire=now", "--all");
  await git(checkout, "prune", "--expire=now");
}

test("a Default main launch's commit kept at Done remains reviewable after trunk advances and every branch leaves it", async () => {
  const checkout = await aCheckout({ withOrigin: true });
  const record = aDefaultLaunch(checkout).please();
  keep(record);
  const { pulled, typo } = await work(
    checkout,
    makeMe.aCheckoutWork
      .fastForwardingToTrunkWork("pulled", { at: minutesAgo(40) })
      .committing("typo", { at: minutesAgo(30) })
      .pushingToTrunk("pushed", { at: minutesAgo(20) }),
  );

  await markDone(record);

  const kept = {
    kind: "session-commits",
    session: { launchedAt: minutesAgo(60), doneAt: minutesAgo(10) },
    commitRun: 0,
    commitRuns: [
      {
        commits: 1,
        subject: "Add typo.txt",
        committedAt: minutesAgo(30),
        baseline: pulled,
        tree: typo,
      },
    ],
    baseline: pulled,
    tree: typo,
    files: [expect.objectContaining({ path: "typo.txt", kind: "added" })],
  };
  // The first read uses the fixed pair while trunk advances past it.
  const [whileOnTrunk] = await Promise.all([
    review(await keptRecords(source), record),
    work(
      checkout,
      makeMe.aCheckoutWork
        .committing("later", { at: minutesAgo(8) })
        .pushingToTrunk("advanced", { at: minutesAgo(5) }),
    ),
  ]);
  expect(whileOnTrunk).toEqual(kept);
  await forgetInCheckout(checkout.integration, checkout.base, typo);
  const indexPath = path.join(checkout.integration, ".git", "index");
  const index = readFileSync(indexPath);

  expect(await review(await keptRecords(source), record)).toEqual(kept);
  expect(
    (await git(checkout.integration, "rev-parse", "HEAD")).stdout.trim(),
  ).toBe(checkout.base);
  expect(readFileSync(indexPath)).toEqual(index);
});

test("Done stores and pins the commit of an established Default main session and its review answers the kept run", async () => {
  const { checkout, record } = await aKeptSession();
  const { base, integration } = checkout;
  const { typo } = await work(
    checkout,
    makeMe.aCheckoutWork.committing("typo", { at: minutesAgo(30) }),
  );

  await markDone(record);

  expect(await keptRecords(source)).toMatchObject([
    { sessionCommits: { runs: [{ base, revision: typo }] } },
  ]);
  const refs =
    "refs/open-dough/session-commits/claude/established-default-main/0";
  expect(
    (
      await git(
        integration,
        "for-each-ref",
        "--format=%(refname) %(objectname)",
        refs,
      )
    ).stdout,
  ).toBe(`${refs}/base ${base}\n${refs}/revision ${typo}\n`);
  expect(await review(await keptRecords(source), record)).toMatchObject({
    commitRuns: [
      { commits: 1, subject: "Add typo.txt", baseline: base, tree: typo },
    ],
  });
});
