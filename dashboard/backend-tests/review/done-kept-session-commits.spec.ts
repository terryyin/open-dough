// Done keeps the work a Default main session made, with Git references that
// let the typed review read it after the checkout's branches move away.
import { storyReview } from "../../server/storyReviewSnapshot.ts";
import { readFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "vitest";
import { git } from "../../../Distribution/src/skills/dough-execute-plan/scripts/publication-git.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { keptSession } from "../../server/launchRecordStore.ts";
import { markDone, source } from "../support/doneCaptureCase.ts";
import { aDoneCaptureCase } from "../support/doneCaptureCaseBuilder.ts";

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
  const {
    checkout,
    records: { launch: record },
    timeline: { launch },
    performWork,
    at,
  } = await aDoneCaptureCase()
    .withOrigin()
    .withDefaultMainLaunch("launch", { launched: 60 })
    .kept()
    .please();
  const { pulled, typo } = await performWork(
    makeMe.aCheckoutWork
      .fastForwardingToTrunkWork("pulled", { at: at(40) })
      .committing("typo", { at: at(30) })
      .pushingToTrunk("pushed", { at: at(20) }),
  );

  await markDone(record);

  const kept = {
    kind: "session-commits",
    session: { launchedAt: launch.launchedAt, doneAt: at(10) },
    commitRun: 0,
    commitRuns: [
      {
        commits: 1,
        subject: "Add typo.txt",
        committedAt: at(30),
        baseline: pulled,
        tree: typo,
      },
    ],
    baseline: pulled,
    tree: typo,
    files: [expect.objectContaining({ path: "typo.txt", kind: "added" })],
  };
  const saved = await keptSession(source, record.session);
  if (saved === undefined) throw new Error("Missing the kept launch.");
  // The first read uses the fixed pair while trunk advances past it.
  const [whileOnTrunk] = await Promise.all([
    storyReview({ record: saved, read: {} }, new AbortController().signal),
    performWork(
      makeMe.aCheckoutWork
        .committing("later", { at: at(8) })
        .pushingToTrunk("advanced", { at: at(5) }),
    ),
  ]);
  expect(whileOnTrunk).toEqual(kept);
  await forgetInCheckout(checkout.integration, checkout.base, typo);
  const indexPath = path.join(checkout.integration, ".git", "index");
  const index = readFileSync(indexPath);

  const retained = await keptSession(source, record.session);
  if (retained === undefined) throw new Error("Missing the retained launch.");
  expect(
    await storyReview(
      { record: retained, read: {} },
      new AbortController().signal,
    ),
  ).toEqual(kept);
  expect(
    (await git(checkout.integration, "rev-parse", "HEAD")).stdout.trim(),
  ).toBe(checkout.base);
  expect(readFileSync(indexPath)).toEqual(index);
});

test("Done stores and pins the commit of an established Default main session", async () => {
  const {
    checkout,
    records: { "established-default-main": record },
    performWork,
    at,
  } = await aDoneCaptureCase()
    .withEstablishedSession("established-default-main", { launched: 60 })
    .kept()
    .please();
  const { base, integration } = checkout;
  const { typo } = await performWork(
    makeMe.aCheckoutWork.committing("typo", { at: at(30) }),
  );

  const doneAt = at(10);
  await markDone(record, doneAt);

  expect(await keptSession(source, record.session)).toMatchObject({
    doneAt,
    sessionCommits: { runs: [{ base, revision: typo }] },
  });
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
});
