// Done keeps its worktree snapshot through later edits and forced retirement.
import { reviewedFileText } from "../../server/storyReviewFileResponse.ts";
import { readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { expect, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import * as gitRunner from "../../server/gitRunner.ts";
import { sessionBranchPins } from "../../server/launchRecordPins.ts";
import { keptSession } from "../../server/launchRecordStore.ts";
import { retireAdHocBranch } from "../../test-support/support/adHocBranchRefs.ts";
import { git } from "../../test-support/support/storyReviewWorktree.ts";
import {
  aCheckout,
  historyBeforeTheCase,
  inWorktree,
  keep,
  markDone,
  minutesAgo,
  source,
  work,
} from "../support/doneCaptureCase.ts";

const launchFiles = historyBeforeTheCase({
  files: { "deleted.txt": "delete this\n", ".gitignore": "ignored.txt\n" },
}).withWorkspace("draft", { from: "base" });

test("Done keeps the worktree snapshot through a later edit and forced retirement", async () => {
  const checkout = await aCheckout({ history: launchFiles, withOrigin: true });
  const workspace = checkout.execution;
  if (workspace === undefined) throw new Error("Missing the worktree.");
  const baseline = checkout.base;
  const record = makeMe.aLaunchRecord
    .isolatedIn(checkout, { workspace, branch: "draft" })
    .please();
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

  let reachedAncestry!: () => void;
  let releaseAncestry!: () => void;
  const snapshotTaken = new Promise<void>((resolve) => {
    reachedAncestry = resolve;
  });
  const waitForEdit = new Promise<void>((resolve) => {
    releaseAncestry = resolve;
  });
  const runGit = gitRunner.runGit;
  const ancestry = vi
    .spyOn(gitRunner, "runGit")
    .mockImplementation(async (args, call) => {
      // Capture checks this ancestry immediately after taking its snapshot.
      if (
        call.cwd === workspace &&
        args.join(" ") ===
          `merge-base --is-ancestor ${baseline} ${committedTip}`
      ) {
        reachedAncestry();
        await waitForEdit;
      }
      return runGit(args, call);
    });

  const marking = markDone(record);
  try {
    await Promise.race([
      snapshotTaken,
      marking.then(() => {
        throw new Error("Done settled before the worktree ancestry check.");
      }),
    ]);
    writeFileSync(draftFile, "a later edit\n");
  } finally {
    releaseAncestry();
    ancestry.mockRestore();
    await marking;
  }
  expect(readFileSync(index)).toEqual(originalIndex);
  expect(git(workspace, "rev-parse", "HEAD")).toBe(committedTip);
  expect(readFileSync(draftFile, "utf8")).toBe("a later edit\n");

  retireAdHocBranch(checkout.integration, workspace, "draft", {
    discardWorkingChanges: true,
  });

  const saved = await keptSession(source, record.session);
  if (saved?.branchResult === undefined)
    throw new Error("Missing the retained branch result.");
  expect(saved.branchResult.base).toBe(baseline);
  const tree = saved.branchResult.revision;
  expect(
    git(
      checkout.integration,
      "diff",
      "--name-status",
      "--no-renames",
      baseline,
      tree,
    ).split("\n"),
  ).toEqual([
    "D\tdeleted.txt",
    "A\tdraft.txt",
    "A\tstaged.txt",
    "A\tuntracked.txt",
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
  expect(
    await reviewedFileText(
      { record: saved, read: { baseline, tree, path: "draft.txt" } },
      new AbortController().signal,
    ),
  ).toEqual({
    kind: "text",
    baseline: null,
    tree: "draft left for review\n",
  });
});
