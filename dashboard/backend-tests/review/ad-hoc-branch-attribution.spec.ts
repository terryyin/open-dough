// Done retains an isolated branch’s committed tip and exact manual delivery.
import { expect, test } from "vitest";
import { git } from "../../../Distribution/src/skills/dough-execute-plan/scripts/publication-git.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { heldLandingPins } from "../../server/launchLandingGit.ts";
import { sessionBranchPins } from "../../server/launchRecordPins.ts";
import {
  keptSession,
  setRecordDoneAt,
} from "../../server/launchRecordStore.ts";
import { retireAdHocBranch } from "../../test-support/support/adHocBranchRefs.ts";
import { source } from "../support/doneCaptureCase.ts";
import { aDoneCaptureCase } from "../support/doneCaptureCaseBuilder.ts";

const branch = "topic";

// The topic checkout, its base holding the shared file, its worktree, and
// the launch whose start established it.
const anIsolatedTopic = () =>
  aDoneCaptureCase()
    .withBaseFiles({
      "shared.txt": "original\n",
      "session-only.txt": "Original session notes\n",
    })
    .withOrigin()
    .withWorkspace(branch)
    .withIsolatedLaunch(branch, { launched: 60 }, branch);

test("Done saves the committed branch and pins the accepted manual delivery for retirement", async () => {
  const {
    checkout,
    worktrees: { [branch]: workspace },
    records: { [branch]: record },
    work: { branchTip },
    performWork,
    at,
  } = await anIsolatedTopic()
    .withWork(
      (at) =>
        makeMe.aCheckoutWork
          .committing("session-only", { at: at(50) })
          .mergingTrunkWork("branchTip", {
            at: at(45),
            files: { "import-only.txt": "trunk addition\n" },
          }),
      { in: branch },
    )
    .kept()
    .please();
  const { integration } = checkout;
  await git(integration, "pull", "--quiet", "--ff-only", "origin", "main");
  const trunkParent = (
    await git(integration, "rev-parse", "HEAD")
  ).stdout.trim();
  const { merge } = await performWork(
    makeMe.aCheckoutWork
      .mergingTipByHand("merge", { tip: branchTip, at: at(40) })
      .pushingToTrunk("published-merge", { at: at(40) })
      .committing("later-trunk", { at: at(35) })
      .pushingToTrunk("pushed", { at: at(35) }),
  );

  const doneAt = at(10);
  await setRecordDoneAt(source, record.session, doneAt);

  const saved = await keptSession(source, record.session);
  expect(saved).toMatchObject({
    doneAt,
    branchResult: { committedTip: branchTip },
    landing: { base: trunkParent, revision: merge },
  });
  if (saved?.landing === undefined)
    throw new Error("Missing the verified landing.");
  const { landing } = saved;
  const branchPins = await sessionBranchPins(integration, record.session);
  const deliveryPins = await heldLandingPins(integration, landing);
  expect(branchPins.map(({ objectId }) => objectId)).toEqual([branchTip]);
  expect(deliveryPins.map(({ objectId }) => objectId)).toEqual([
    trunkParent,
    merge,
  ]);
  retireAdHocBranch(integration, workspace, branch);
  expect(await heldLandingPins(integration, landing)).toEqual(deliveryPins);
});
