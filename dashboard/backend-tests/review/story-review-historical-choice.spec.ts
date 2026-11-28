// A Done story's historical default opens its published completion on its
// own; a retained capture neither replaces nor rescues that completion.
import path from "node:path";
import { configuredFixtureProject } from "../support/fixtureProject.ts";
import { expect, test } from "vitest";
import { storyReview } from "../../server/storyReview.ts";
import { reviewRunKey } from "../../src/storyReviewLandedRun.ts";
import { ordinaryTrunkModeCompletedHistory } from "../../test-support/support/completedStoryHistory.ts";
import { keepLaunchRecords } from "../../test-support/support/launchStore.ts";
import { shallowPublishedHistory } from "../../test-support/support/reviewRepositoryFixture.ts";
import { queuedIdentity } from "../../test-support/support/startOrigin.ts";
import {
  storyALaunch,
  storyALaunchRecord,
} from "../../test-support/support/storyLaunchRecord.ts";
import { branch, git } from "../../test-support/support/storyReviewWorktree.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";

const subject = { source: "open-dough", identity: queuedIdentity };
const signal = new AbortController().signal;
const open = (choice: { historical?: true; run?: string } = {}) =>
  storyReview({ read: { subject, completed: true, ...choice } }, signal);

test("a Done story opens its published completion while its workspace has local edits", async () => {
  const { repository, home } = await configuredFixtureProject(
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

  expect(await open()).toMatchObject({ kind: "published", completion });
});

test("a missing capture repository leaves the published completion and exact landing readable", async () => {
  const { repository, home } = await configuredFixtureProject(
    ordinaryTrunkModeCompletedHistory(),
  );
  const { completion, interleaving: baseline } = repository.revisions;
  const record = storyALaunchRecord(path.join(repository.fixture, "retired"));
  record.landing = makeMe.aLaunchLanding
    .capturedFrom({
      repository: path.join(repository.fixture, "missing-capture"),
      identity: queuedIdentity,
    })
    .comparing({ base: baseline, revision: completion })
    .please();
  keepLaunchRecords(home, [record]);
  const run = reviewRunKey(record);

  const review = await open();
  expect(review).toMatchObject({ kind: "published", completion });
  expect(review.selectedRun).toBeUndefined();
  expect(review.runs?.map(({ key }) => key)).toEqual([run]);
  expect(await open({ run })).toMatchObject({
    kind: "landed",
    baseline,
    tree: completion,
  });
});

// Each capture keeps a full-history capture repository that could verify
// it; the shallow published history alone decides.
for (const [invalid, explanation] of [
  ["another target", /history|claim|completion/i],
  ["an already completed base", /history|claim|completion/i],
  ["a shallow result", /history|claim|completion/i],
  ["an earlier refinement", /history|claim/],
] as const)
  test(`a historical default over shallow history rejects a capture with ${invalid} and the explicit choice is unverifiable`, async () => {
    const { repository, home } = await configuredFixtureProject(
      ordinaryTrunkModeCompletedHistory(),
    );
    const { completion, interleaving, claim } = repository.revisions;
    const capture = path.join(repository.fixture, "capture");
    git(repository.fixture, "clone", "--quiet", repository.origin, capture);
    if (invalid !== "a shallow result") {
      makeMe
        .theWorkspace(repository.integration)
        .writeAt("after-completion.txt", "later trunk\n")
        .commitAll("later trunk after completion")
        .please();
      git(repository.integration, "push", "--quiet", "origin", "HEAD:main");
    }
    const target = invalid === "another target" ? "other" : undefined;
    const record = storyALaunch()
      .onStoryBranch({
        workspace: path.join(repository.fixture, "retired"),
        branch,
        ...(target === undefined ? {} : { target }),
      })
      .please();
    record.landing = makeMe.aLaunchLanding
      .capturedFrom({
        repository: capture,
        identity: queuedIdentity,
        ...(target === undefined ? {} : { target: `refs/heads/${target}` }),
      })
      .comparing(
        invalid === "an already completed base"
          ? { base: completion, revision: completion }
          : invalid === "an earlier refinement"
            ? { base: claim, revision: interleaving }
            : { base: interleaving, revision: completion },
      )
      .please();
    keepLaunchRecords(home, [record]);
    const run = reviewRunKey(record);
    const origin = {
      machine: repository.fixture,
      project: repository.integration,
    };
    shallowPublishedHistory(origin);
    expect(git(origin.project, "rev-parse", "--is-shallow-repository")).toBe(
      "true",
    );

    const review = await open({ historical: true });
    expect(review).toMatchObject({
      kind: "unavailable",
      explanation: expect.stringMatching(explanation) as unknown,
    });
    expect(review.selectedRun).toBeUndefined();
    expect(await open({ run })).toMatchObject({
      kind: "landing-unavailable",
      selectedRun: run,
    });
  });
