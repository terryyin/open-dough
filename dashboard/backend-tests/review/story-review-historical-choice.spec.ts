import path from "node:path";
import { expect, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { materializeRepository } from "../../../Distribution/tests/support/repository-fixture.mjs";
import {
  appendConfiguredProject,
  mountProjectConfiguration,
} from "../../server/projectConfiguration.ts";
import { storyReview } from "../../server/storyReviewSnapshot.ts";
import { ordinaryTrunkModeCompletedHistory } from "../../test-support/support/completedStoryHistory.ts";
import { keepLaunchRecords } from "../../test-support/support/launchStore.ts";
import { queuedIdentity } from "../../test-support/support/startOrigin.ts";
import { storyALaunchRecord } from "../../test-support/support/storyLaunchRecord.ts";
import {
  branch,
  git,
  writeAt,
} from "../../test-support/support/storyReviewWorktree.ts";

test("a Done story opens its published completion while its workspace has local edits", async ({
  onTestFinished,
}) => {
  const repository = await materializeRepository(
    ordinaryTrunkModeCompletedHistory(),
  );
  const { completion } = repository.revisions;
  vi.stubEnv("HOME", repository.fixture);
  const unmount = mountProjectConfiguration("development");
  onTestFinished(async () => {
    unmount();
    vi.unstubAllEnvs();
    await repository.cleanup();
  });
  const project = makeMe.aConfiguredProject
    .with({
      id: "open-dough",
      label: "Open Dough",
      repository: "terryyin/open-dough",
      localPath: repository.integration,
    })
    .please();
  appendConfiguredProject(project);
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
  writeAt(workspace, "local-only.txt", "after completion\n");
  keepLaunchRecords(repository.fixture, [storyALaunchRecord(workspace)]);

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
