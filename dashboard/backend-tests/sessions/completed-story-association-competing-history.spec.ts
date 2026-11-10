// Competing claim/completion history for completed-story association: an
// earlier matching claim after a later takeover, and an intermediate capture
// before completion, stay absent. Unique-link and simple-miss cases live in
// ./completed-story-association.spec.ts.
import { randomUUID } from "node:crypto";
import { makeMe } from "../../../tests/support/makeMe.mjs";
import { storyA, storyB } from "../../../tests/support/queued-repository.mjs";
import { expect, test } from "../../tests/support/codexStart.ts";
import {
  associationOf,
  queuedIdentity,
} from "../../tests/support/adHocCompletedAssociation.ts";
import { publishCompletedStory } from "../../tests/support/completedStoryPublication.ts";
import { keepLaunchRecords } from "../../tests/support/launchStore.ts";
import {
  commitAll,
  git,
  lines,
  writeAt,
} from "../../tests/support/storyReviewWorktree.ts";
import { push } from "../../tests/support/storyReviewTrunkCommits.ts";

test.use({ serverMode: "boundary" });

test("an earlier matching claim after a later takeover completion does not associate", async ({
  request,
  dashboard,
  origin,
}) => {
  writeAt(origin.project, "shared.txt", lines("line"));
  commitAll(origin.project, "initial shared file");
  push(origin.project);
  const reference = randomUUID();
  // First claim names this session's publisher, then another publisher
  // completes the story and the session captures that later completion.
  const abandoned = await origin.publishTake({
    agent: "Yui",
    story: storyA,
    queued: [storyB],
    mode: "story-branch",
    publisher: reference,
  });
  const earlierClaim = git(abandoned.workspace, "rev-parse", "HEAD");
  // Land the earlier claim on trunk so the takeover claim is its descendant,
  // then free the fixed story-branch worktree/branch name.
  git(origin.project, "worktree", "remove", "--force", abandoned.workspace);
  git(origin.project, "merge", "--quiet", "--no-edit", abandoned.branch);
  push(origin.project);
  git(origin.project, "branch", "-D", abandoned.branch);
  const takeover = await origin.publishTake({
    agent: "Yui",
    story: storyA,
    queued: [storyB],
    mode: "story-branch",
    publisher: "takeover-publisher",
  });
  writeAt(
    takeover.workspace,
    "shared.txt",
    lines("line").replace("line 0\n", "takeover completion\n"),
  );
  commitAll(takeover.workspace, "takeover implementation");
  git(takeover.workspace, "fetch", "--quiet", "origin", "main");
  git(takeover.workspace, "merge", "--quiet", "--no-edit", "origin/main");
  const completion = publishCompletedStory(origin, {
    workspace: takeover.workspace,
    branch: takeover.branch,
    mode: "story-branch",
    missingAgent: false,
    completionConflict: false,
    retainWorkspace: false,
    skillsDirectory: ".agents/skills",
  });
  expect(earlierClaim).not.toBe(completion);
  const landing = makeMe.aLaunchLanding
    .capturedFrom({
      repository: origin.project,
      remote: "origin",
      target: "refs/heads/main",
    })
    .forLaunch(reference)
    .comparing({ base: earlierClaim, revision: completion })
    .receivedAt(new Date().toISOString())
    .please();
  const record = makeMe.aLaunchRecord
    .adHoc({
      instruction: "Earlier claim after takeover",
      title: "Earlier claim after takeover",
    })
    .reportingThrough({
      origin: dashboard.origin,
      reference,
      command: "report",
    })
    .inIsolatedWorkspace({
      workspace: `${origin.machine}/retired-takeover`,
      branch: "ad-hoc/takeover",
    })
    .withCapturedLanding(landing)
    .completedWith({ message: "Captured a takeover completion." })
    .markedDoneAt(new Date().toISOString())
    .please();
  keepLaunchRecords(dashboard, [record]);
  expect(
    git(
      origin.project,
      "merge-base",
      "--is-ancestor",
      earlierClaim,
      completion,
    ),
  ).toBe("");
  expect(await associationOf(request, dashboard, record.session)).toEqual({
    kind: "absent",
  });
});

test("an intermediate capture before completion does not associate", async ({
  request,
  dashboard,
  origin,
}) => {
  writeAt(origin.project, "shared.txt", lines("line"));
  commitAll(origin.project, "initial shared file");
  push(origin.project);
  const reference = randomUUID();
  const start = await origin.publishTake({
    agent: "Yui",
    story: storyA,
    queued: [storyB],
    mode: "story-branch",
    publisher: reference,
  });
  const claim = git(start.workspace, "rev-parse", "HEAD");
  writeAt(
    start.workspace,
    "shared.txt",
    lines("line").replace("line 0\n", "story first\n"),
  );
  commitAll(start.workspace, "story implementation");
  const intermediate = git(start.workspace, "rev-parse", "HEAD");
  git(start.workspace, "fetch", "--quiet", "origin", "main");
  git(start.workspace, "merge", "--quiet", "--no-edit", "origin/main");
  const completion = publishCompletedStory(origin, {
    workspace: start.workspace,
    branch: start.branch,
    mode: "story-branch",
    missingAgent: false,
    completionConflict: false,
    retainWorkspace: false,
    skillsDirectory: ".agents/skills",
  });
  expect(intermediate).not.toBe(completion);
  const landing = makeMe.aLaunchLanding
    .capturedFrom({
      repository: origin.project,
      remote: "origin",
      target: "refs/heads/main",
    })
    .forLaunch(reference)
    .comparing({ base: claim, revision: intermediate })
    .receivedAt(new Date().toISOString())
    .please();
  const record = makeMe.aLaunchRecord
    .adHoc({
      instruction: "Intermediate capture",
      title: "Intermediate capture",
    })
    .reportingThrough({
      origin: dashboard.origin,
      reference,
      command: "report",
    })
    .inIsolatedWorkspace({
      workspace: `${origin.machine}/retired-intermediate`,
      branch: "ad-hoc/intermediate",
    })
    .withCapturedLanding(landing)
    .completedWith({ message: "Captured before completion." })
    .markedDoneAt(new Date().toISOString())
    .please();
  keepLaunchRecords(dashboard, [record]);
  expect(await associationOf(request, dashboard, record.session)).toEqual({
    kind: "absent",
  });
  expect(queuedIdentity).toBe("SEED-A#a");
});
