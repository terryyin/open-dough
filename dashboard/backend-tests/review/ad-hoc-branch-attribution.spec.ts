// Capture separates isolated branch work from imported trunk, and Done
// keeps the branch result alongside independently verified delivery.
import path from "node:path";
import { expect, test } from "vitest";
import { git } from "../../../Distribution/src/skills/dough-execute-plan/scripts/publication-git.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { heldLandingPins } from "../../server/launchLandingGit.ts";
import { sessionBranchPins } from "../../server/launchRecordPins.ts";
import {
  keptSession,
  setRecordDoneAt,
} from "../../server/launchRecordStore.ts";
import { captureBranchResult } from "../../server/sessionBranchCapture.ts";
import { reviewedFileText } from "../../server/storyReviewFileResponse.ts";
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

test("capture separates an isolated branch's committed and working changes from imported trunk", async () => {
  const {
    checkout,
    records: { [branch]: record },
    at,
  } = await anIsolatedTopic()
    .withWork(
      (at) =>
        makeMe.aCheckoutWork
          .committing("draft", { at: at(50) })
          .mergingTrunkWork("imported", {
            at: at(40),
            files: { "import-only.txt": "trunk addition\n" },
          })
          .editing("working", {
            at: at(30),
            files: { "draft.txt": "draft work\nworking change\n" },
          }),
      { in: branch },
    )
    .please();

  const { result } = await captureBranchResult(record, at(10));

  expect(result.attributionGap).toBeUndefined();
  const { integration } = checkout;
  expect(
    (
      await git(
        integration,
        "diff",
        "--name-only",
        result.base,
        result.revision,
      )
    ).stdout,
  ).toBe("draft.txt\n");
  expect(
    (await git(integration, "show", `${result.revision}:draft.txt`)).stdout,
  ).toBe("draft work\nworking change\n");
});

test("Done saves and pins the branch and manual delivery pairs for offline review", async () => {
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
  const branchBase = (
    await git(integration, "rev-parse", "HEAD^{tree}")
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
    branchResult: { base: branchBase, revision: branchTip },
    landing: { base: trunkParent, revision: merge },
  });
  if (saved?.landing === undefined)
    throw new Error("Missing the verified landing.");
  const { landing } = saved;
  const branchPins = await sessionBranchPins(integration, record.session);
  const deliveryPins = await heldLandingPins(integration, landing);
  expect(branchPins.map(({ objectId }) => objectId)).toEqual([
    branchBase,
    branchTip,
  ]);
  expect(deliveryPins.map(({ objectId }) => objectId)).toEqual([
    trunkParent,
    merge,
  ]);
  expect(
    (await git(integration, "diff", "--name-only", branchBase, branchTip))
      .stdout,
  ).toBe("session-only.txt\n");

  retireAdHocBranch(integration, workspace, branch);
  await git(
    integration,
    "remote",
    "set-url",
    "origin",
    path.join(path.dirname(integration), "offline"),
  );
  expect(
    await reviewedFileText(
      {
        record: saved,
        read: {
          reference: landing.reference,
          baseline: trunkParent,
          tree: merge,
          path: "session-only.txt",
        },
      },
      new AbortController().signal,
    ),
  ).toEqual({
    kind: "text",
    baseline: "Original session notes\n",
    tree: "session-only work\n",
  });
});

test("new shared first-parent history can leave branch attribution ambiguous", async () => {
  const {
    checkout,
    records: { [branch]: record },
    work: { direct },
    performWork,
    at,
  } = await anIsolatedTopic()
    .withWork(
      (at) => makeMe.aCheckoutWork.committing("direct", { at: at(50) }),
      { in: branch },
    )
    .please();
  await git(checkout.integration, "merge", "--quiet", "--ff-only", direct);
  await git(checkout.integration, "push", "--quiet", "origin", "main");
  await performWork(
    makeMe.aCheckoutWork.committing("after-direct", { at: at(40) }),
    { in: branch },
  );

  const { result } = await captureBranchResult(record, at(10));

  expect(result.attributionGap).toBe(
    "The saved branch changes could not be separated from trunk history.",
  );
});
