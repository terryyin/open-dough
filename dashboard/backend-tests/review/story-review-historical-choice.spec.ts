import path from "node:path";
import { configuredFixtureProject } from "../support/fixtureProject.ts";
import { expect, test } from "vitest";
import { storyReview } from "../../server/storyReview.ts";
import { ordinaryTrunkModeCompletedHistory } from "../../test-support/support/completedStoryHistory.ts";
import { keepLaunchRecords } from "../../test-support/support/launchStore.ts";
import { queuedIdentity } from "../../test-support/support/startOrigin.ts";
import { storyALaunchRecord } from "../../test-support/support/storyLaunchRecord.ts";
import { branch, git } from "../../test-support/support/storyReviewWorktree.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";

test("a Done story opens its published completion while its workspace has local edits", async () => {
  const { repository, home, project } = await configuredFixtureProject(
    ordinaryTrunkModeCompletedHistory(),
  );
  const { completion } = repository.revisions;
  const workspace = path.join(repository.fixture, "retained");
  git(
    repository.integration,
    "worktree",
    "add",
    "--quiet",
    "-b",
    branch,
    workspace,
    completion,
  );
  makeMe
    .theWorkspace(workspace)
    .writeAt("local-only.txt", "after completion\n")
    .please();
  keepLaunchRecords(home, [storyALaunchRecord(workspace)]);

  const review = await storyReview(
    {
      read: {
        subject: { source: project.id, identity: queuedIdentity },
        completed: true,
      },
    },
    new AbortController().signal,
  );

  expect(review).toMatchObject({ kind: "published", completion });
});
