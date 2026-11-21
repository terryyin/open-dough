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
import {
  aCheckoutWithWorktree,
  inWorktree,
  keep,
  minutesAgo,
  source,
  work,
} from "../support/doneCaptureCase.ts";

const branch = "topic";

// The topic checkout, its base holding the shared file, and its worktree.
const anIsolatedTopic = () =>
  aCheckoutWithWorktree(branch, {
    "shared.txt": "original\n",
    "session-only.txt": "Original session notes\n",
  });

test("capture separates an isolated branch's committed and working changes from imported trunk", async () => {
  const { checkout, workspace } = await anIsolatedTopic();
  await work(
    inWorktree(checkout, workspace),
    makeMe.aCheckoutWork
      .committing("draft", { at: minutesAgo(50) })
      .mergingTrunkWork("imported", {
        at: minutesAgo(40),
        files: { "import-only.txt": "trunk addition\n" },
      })
      .editing("working", {
        at: minutesAgo(30),
        files: { "draft.txt": "draft work\nworking change\n" },
      }),
  );

  const record = makeMe.aLaunchRecord
    .isolatedIn(checkout, { workspace, branch })
    .please();
  const { result } = await captureBranchResult(record, minutesAgo(10));

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
  const { checkout, workspace } = await anIsolatedTopic();
  const record = makeMe.aLaunchRecord
    .isolatedIn(checkout, { workspace, branch })
    .please();
  keep(record);
  const { branchTip } = await work(
    inWorktree(checkout, workspace),
    makeMe.aCheckoutWork
      .committing("session-only", { at: minutesAgo(50) })
      .mergingTrunkWork("branchTip", {
        at: minutesAgo(45),
        files: { "import-only.txt": "trunk addition\n" },
      }),
  );
  const { integration } = checkout;
  await git(integration, "pull", "--quiet", "--ff-only", "origin", "main");
  const trunkParent = (
    await git(integration, "rev-parse", "HEAD")
  ).stdout.trim();
  const branchBase = (
    await git(integration, "rev-parse", "HEAD^{tree}")
  ).stdout.trim();
  const { merge } = await work(
    checkout,
    makeMe.aCheckoutWork
      .mergingTipByHand("merge", { tip: branchTip, at: minutesAgo(40) })
      .pushingToTrunk("published-merge", { at: minutesAgo(40) })
      .committing("later-trunk", { at: minutesAgo(35) })
      .pushingToTrunk("pushed", { at: minutesAgo(35) }),
  );

  const doneAt = minutesAgo(10);
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
  const { checkout, workspace } = await anIsolatedTopic();
  const { direct } = await work(
    inWorktree(checkout, workspace),
    makeMe.aCheckoutWork.committing("direct", { at: minutesAgo(50) }),
  );
  await git(checkout.integration, "merge", "--quiet", "--ff-only", direct);
  await git(checkout.integration, "push", "--quiet", "origin", "main");
  await work(
    inWorktree(checkout, workspace),
    makeMe.aCheckoutWork.committing("after-direct", { at: minutesAgo(40) }),
  );

  const record = makeMe.aLaunchRecord
    .isolatedIn(checkout, { workspace, branch })
    .please();
  const { result } = await captureBranchResult(record, minutesAgo(10));

  expect(result.attributionGap).toBe(
    "The saved branch changes could not be separated from trunk history.",
  );
});
