// Verify the launch boundary keeps no start when Git cannot read the checkout.
import path from "node:path";
import { renameSync } from "node:fs";
import { expect, test } from "../../test-support/support/codexStart.ts";
import { adHocReview } from "../../test-support/support/adHocReview.ts";
import { DefaultMainSessionWork } from "../../test-support/support/sessionCheckoutWork.ts";

test.use({ serverMode: "boundary" });

const notCaptured = {
  kind: "landing-unavailable",
  comparison: "session-commits",
  explanation: "This session's changes were not captured.",
};

test("a default launch in a checkout Git cannot read keeps no start, is done, and says its changes were not captured", async ({
  request,
  dashboard,
  origin,
}) => {
  const work = new DefaultMainSessionWork(dashboard, origin);
  renameSync(
    path.join(origin.project, ".git"),
    path.join(origin.project, ".git-away"),
  );
  const record = await work.launch();
  expect(record.defaultStart).toBeUndefined();
  const { sessionId } = record.session;
  dashboard.claudeSessionBecomes(sessionId, "working-idle");

  expect(await work.markDone(sessionId)).toEqual(expect.any(String));

  expect(await adHocReview(request, dashboard, sessionId)).toEqual(notCaptured);
});
