// A quiet report marks a Default main session Done over the launch boundary
// and keeps the commits its review reads.

import {
  adHocReview,
  keptAdHocRecord,
} from "../../test-support/support/adHocReview.ts";
import { expect, test } from "../../test-support/support/preparationPage.ts";
import { DefaultMainSessionWork } from "../../test-support/support/sessionCheckoutWork.ts";
import { git } from "../../test-support/support/storyReviewWorktree.ts";

// No page: the local boundaries alone answer these requests.
test.use({ serverMode: "boundary" });

const committedAt = "2099-01-02T12:05:00Z";

test("a default launch marked done automatically by its quiet report keeps its commit the same way", async ({
  dashboard,
  origin,
  request,
}) => {
  const work = new DefaultMainSessionWork(dashboard, origin);
  const session = await work.launchReporting("Fix the typo");
  const { sessionId } = session;
  const start = git(origin.project, "rev-parse", "HEAD");
  const committed = await work.commit(committedAt, "typo.txt");
  dashboard.claudeSessionBecomes(sessionId, "working-idle");

  await session.report({ message: "" });

  await expect
    .poll(async () => (await adHocReview(request, dashboard, sessionId)).kind)
    .toBe("session-commits");
  const record = await keptAdHocRecord(dashboard, sessionId);
  expect(record?.completion?.receivedAt).toEqual(expect.any(String));
  expect(await adHocReview(request, dashboard, sessionId)).toMatchObject({
    kind: "session-commits",
    session: { doneAt: record?.completion?.receivedAt },
    baseline: start,
    tree: committed,
  });
});
