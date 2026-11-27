// A Story Branch execution landed on trunk (./storyBranchLandedReview.ts),
// then retired with its durable session record published: the landing a
// recorded-landing review reads.
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { sessionRecordPathBeside } from "../../../Distribution/src/skills/dough-execute-plan/scripts/session-record.mjs";
import { sessionRecord } from "../../../Distribution/src/skills/dough-execute-plan/scripts/sealed-session-record.mjs";
import { git, retireLaunchWorkspace } from "./launchLanding.ts";
import { expect } from "./pageTest.ts";
import { queuedIdentity, type StartOrigin } from "./startOrigin.ts";
import { trunkCommitFromAnotherWriter } from "./storyBranchIntegration.ts";
import type { landedStoryBranch } from "./storyBranchLandedReview.ts";

// Wrap-up retires the worktree and both branches once trunk holds the work;
// trunk then advances with the durable session recording the integration pair.
export function retiredWithRecordedSession(
  origin: StartOrigin,
  { story, accepted }: Awaited<ReturnType<typeof landedStoryBranch>>,
) {
  const { reporting, trunkTip, start } = story;
  retireLaunchWorkspace(start, origin, accepted, start.branch);
  expect(git(origin.origin, "for-each-ref", `refs/heads/${start.branch}`)).toBe(
    "",
  );
  const later = trunkCommitFromAnotherWriter(origin, "later.txt", (writer) => {
    makeMe
      .theWorkspace(writer)
      .writeAt(
        sessionRecordPathBeside(
          ".planning/PRODUCT-BACKLOG.md",
          reporting.reference,
        ),
        JSON.stringify(
          sessionRecord({
            sessionId: reporting.reference,
            workflow: "dough-execute-plan",
            story: queuedIdentity,
            closedAt: new Date().toISOString(),
            ranges: [{ base: trunkTip, candidate: accepted }],
          }),
        ),
      )
      .please();
  });
  expect(later).not.toBe(accepted);
  expect(git(origin.project, "rev-parse", "origin/main")).not.toBe(later);
  return later;
}
