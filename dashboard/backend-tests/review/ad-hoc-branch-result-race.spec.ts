import { markDone } from "../../test-support/agentLaunchBoundary.ts";
import { sessionBranchPinnedObjects } from "../../test-support/support/adHocBranchRefs.ts";
import {
  adHocReview,
  launchIsolatedReview,
} from "../../test-support/support/adHocReview.ts";
import {
  expect,
  test,
} from "../../test-support/support/branchResultValidation.ts";
import { commit } from "../../test-support/support/launchLanding.ts";
import { reportingThrough } from "../../test-support/support/reportedLaunch.ts";

test.use({ serverMode: "boundary" });

test("a newer quiet Done takes precedence over a manual mark still capturing its branch", async ({
  request,
  dashboard,
  origin,
  validation,
}) => {
  const { workspace, baseline, session, sent } = await launchIsolatedReview(
    dashboard,
    "Save the latest update",
  );
  const earlier = commit(workspace, "earlier.txt");
  validation.hold();
  const marking = markDone(dashboard, { source: "open-dough", session });
  let later: string;
  try {
    await expect.poll(validation.held).toBe(true);
    later = commit(workspace, "later.txt");
    await reportingThrough(origin, sent)({ message: "" });
  } finally {
    validation.release();
    await marking;
  }
  expect(await adHocReview(request, dashboard, session)).toMatchObject({
    kind: "branch-result",
    tree: later,
  });
  const pinned = await sessionBranchPinnedObjects(origin.project, {
    host: "claude",
    sessionId: session,
  });
  expect(pinned).toEqual([baseline, later]);
  expect(pinned).not.toContain(earlier);
  expect(dashboard.claudeStopCalls()).toEqual([]);
});
