// Done keeps the isolated worktree it read: staged, untracked and deleted
// files but not ignored ones, without touching the index, HEAD or files, and
// without an edit made while the capture is held. The result outlives a
// forced retirement of the branch.
import { readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { sessionBranchPins } from "../../server/launchRecordPins.ts";
import { retireAdHocBranch } from "../../test-support/support/adHocBranchRefs.ts";
import { git } from "../../test-support/support/storyReviewWorktree.ts";
import {
  aCheckout,
  aHeldDone,
  anIsolatedLaunch,
  historyBeforeTheCase,
  inWorktree,
  keep,
  minutesAgo,
  work,
} from "../support/doneCaptureCase.ts";
import { fileDiff, fileText, review } from "../support/doneCaptureReview.ts";

const launchFiles = historyBeforeTheCase({
  files: { "deleted.txt": "delete this\n", ".gitignore": "ignored.txt\n" },
}).withWorkspace("draft", { from: "base" });

test("Done keeps the working tree it read and outlives a forced retirement", async () => {
  const checkout = await aCheckout({ history: launchFiles, withOrigin: true });
  const workspace = checkout.execution;
  if (workspace === undefined) throw new Error("Missing the worktree.");
  const baseline = checkout.base;
  const record = anIsolatedLaunch(checkout, {
    workspace,
    branch: "draft",
  }).please();
  keep(record);
  const { committedTip } = await work(
    inWorktree(checkout, workspace),
    makeMe.aCheckoutWork
      .committing("committedTip", {
        at: minutesAgo(30),
        files: { "draft.txt": "committed draft\n" },
      })
      .editing("staged", {
        at: minutesAgo(25),
        files: { "draft.txt": "staged draft\n", "staged.txt": "staged\n" },
      }),
  );
  git(workspace, "add", "draft.txt", "staged.txt");
  await work(
    inWorktree(checkout, workspace),
    makeMe.aCheckoutWork.editing("unstaged", {
      at: minutesAgo(20),
      files: {
        "draft.txt": "draft left for review\n",
        "untracked.txt": "keep this\n",
        "ignored.txt": "leave this out\n",
      },
    }),
  );
  rmSync(path.join(workspace, "deleted.txt"));
  const draftFile = path.join(workspace, "draft.txt");
  const index = git(
    workspace,
    "rev-parse",
    "--path-format=absolute",
    "--git-path",
    "index",
  );
  const originalIndex = readFileSync(index);

  const done = aHeldDone(record);
  try {
    await done.reading;
    expect(readFileSync(draftFile, "utf8")).toBe("draft left for review\n");
    writeFileSync(draftFile, "a later edit\n");
  } finally {
    done.release();
    await done.marking;
  }
  expect(readFileSync(index)).toEqual(originalIndex);
  expect(git(workspace, "rev-parse", "HEAD")).toBe(committedTip);
  expect(readFileSync(draftFile, "utf8")).toBe("a later edit\n");

  retireAdHocBranch(checkout.integration, workspace, "draft", {
    discardWorkingChanges: true,
  });

  const result = await review(record);
  expect(result).toMatchObject({ kind: "branch-result", baseline });
  if (result.kind !== "branch-result")
    throw new Error("Missing the retained branch result.");
  const { tree } = result;
  expect(result.files.map(({ path, kind }) => [path, kind])).toEqual([
    ["deleted.txt", "deleted"],
    ["draft.txt", "added"],
    ["staged.txt", "added"],
    ["untracked.txt", "added"],
  ]);
  expect(git(checkout.integration, "cat-file", "-t", committedTip)).toBe(
    "commit",
  );
  expect(
    await sessionBranchPins(checkout.integration, record.session),
  ).toMatchObject([
    { objectId: baseline },
    { objectId: tree },
    { objectId: committedTip },
  ]);
  const draft = { baseline, tree, path: "draft.txt" };
  expect(await fileDiff(record, draft)).toMatchObject({
    kind: "diff",
    printed: expect.stringContaining("+draft left for review") as string,
  });
  expect(await fileText(record, draft)).toEqual({
    kind: "text",
    baseline: null,
    tree: "draft left for review\n",
  });
  const deleted = { ...draft, path: "deleted.txt" };
  expect(await fileText(record, deleted)).toEqual({
    kind: "text",
    baseline: "delete this\n",
    tree: null,
  });
});
