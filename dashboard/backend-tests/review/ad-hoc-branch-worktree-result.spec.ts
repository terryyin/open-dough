import { readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { queuedReadyRepository } from "../../../Distribution/tests/support/queued-repository.mjs";
import {
  adHocReview,
  adHocSessionFileDiff,
  adHocSessionFileText,
  keptAdHocRecord,
  launchIsolatedReview,
  sessionBranchPins,
} from "../../test-support/support/adHocReview.ts";
import {
  expect,
  test,
} from "../../test-support/support/branchResultValidation.ts";
import { commit } from "../../test-support/support/launchLanding.ts";
import { reportingThrough } from "../../test-support/support/reportedLaunch.ts";
import { git } from "../../test-support/support/storyReviewWorktree.ts";

test.use({
  serverMode: "boundary",
  originRepository: queuedReadyRepository()
    .withRevision("files-at-launch", {
      files: { "deleted.txt": "delete this\n", ".gitignore": "ignored.txt\n" },
    })
    .please(),
  extraEnv: { DOUGH_DONE_RENAME_WAIT_MS: "30000" },
});

test("retains the working tree of the reported Done before delayed validation and native rename", async ({
  request,
  dashboard,
  origin,
  validation,
}) => {
  const { workspace, baseline, branch, session, sent } =
    await launchIsolatedReview(dashboard, "Keep the working draft");
  const committedTip = commit(workspace, "draft.txt");
  const write = (file: string, content: string) => {
    writeFileSync(path.join(workspace, file), content);
  };
  write("draft.txt", "staged draft\n");
  write("staged.txt", "staged addition\n");
  git(workspace, "add", "draft.txt", "staged.txt");
  write("draft.txt", "draft left for review\n");
  write("untracked.txt", "keep this\n");
  write("ignored.txt", "leave this out\n");
  rmSync(path.join(workspace, "deleted.txt"));
  const index = git(
    workspace,
    "rev-parse",
    "--path-format=absolute",
    "--git-path",
    "index",
  );
  const originalIndex = readFileSync(index);

  dashboard.claudeSessionBecomes(session, "done-live");
  dashboard.claudeAttachesSilent(true);
  validation.hold();
  const marking = reportingThrough(origin, sent)({ message: "" });
  try {
    await expect.poll(validation.held).toBe(true);
    expect(readFileSync(index)).toEqual(originalIndex);
    expect(git(workspace, "rev-parse", "HEAD")).toBe(committedTip);
    expect(readFileSync(path.join(workspace, "draft.txt"), "utf8")).toBe(
      "draft left for review\n",
    );
    write("draft.txt", "a later edit\n");
  } finally {
    validation.release();
    await marking;
  }
  expect((await keptAdHocRecord(dashboard, session))?.doneProblem).toBe(
    "Local done mark retained. Native done mark is pending.",
  );

  git(origin.project, "worktree", "remove", "--force", workspace);
  git(origin.project, "branch", "-D", branch);
  git(origin.project, "reflog", "expire", "--expire=now", "--all");
  git(origin.project, "gc", "--quiet", "--prune=now");

  const review = await adHocReview(request, dashboard, session);
  expect(review).toMatchObject({ kind: "branch-result", baseline });
  if (review.kind !== "branch-result")
    throw new Error("Missing the retained branch result.");
  const { tree } = review;
  expect(review.files.map(({ path, kind }) => [path, kind])).toEqual([
    ["deleted.txt", "deleted"],
    ["draft.txt", "added"],
    ["staged.txt", "added"],
    ["untracked.txt", "added"],
  ]);
  expect(git(origin.project, "cat-file", "-t", tree)).toBe("tree");
  expect(git(origin.project, "cat-file", "-t", committedTip)).toBe("commit");
  expect(git(origin.project, "show", `${committedTip}:draft.txt`)).toBe(
    "draft.txt",
  );
  expect(sessionBranchPins(origin.project, session)).toEqual([
    baseline,
    tree,
    committedTip,
  ]);
  const draft = { baseline, tree, path: "draft.txt" };
  const diff = await adHocSessionFileDiff(request, dashboard, session, draft);
  expect(await diff.json()).toMatchObject({
    kind: "diff",
    printed: expect.stringContaining("+draft left for review"),
  });
  const readText = async (path: string): Promise<unknown> =>
    (
      await adHocSessionFileText(request, dashboard, session, {
        baseline,
        tree,
        path,
      })
    ).json();
  expect(await readText("draft.txt")).toEqual({
    kind: "text",
    baseline: null,
    tree: "draft left for review\n",
  });
  expect(await readText("deleted.txt")).toEqual({
    kind: "text",
    baseline: "delete this\n",
    tree: null,
  });
});
