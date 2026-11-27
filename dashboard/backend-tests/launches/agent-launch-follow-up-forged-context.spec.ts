// A file follow-up carrying page-supplied context text starts nothing, over
// raw HTTP with a real bare origin and the synthetic `claude`. Target
// admission of the file, line and side:
// agent-launch-follow-up-file-admission.spec.ts.

import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { accept } from "../../test-support/agentLaunchBoundary.ts";
import { stored } from "../../test-support/support/codexLaunch.ts";
import {
  fileFactsOf,
  publishedReviewOf,
  serveDoneAtTrunk,
} from "../../test-support/support/followUpCompletedFile.ts";
import { ordinaryJourneyCompletedHistory } from "../../test-support/support/completedFollowUpHistory.ts";
import { expect, test } from "../../test-support/support/preparationPage.ts";
import { queuedIdentity } from "../../test-support/support/startOrigin.ts";
import { keepLaunchRecords } from "../../test-support/support/launchStore.ts";
import { request } from "./followUpBoundaryCases.ts";

test.use({ serverMode: "boundary" });

test.describe("published completion refusals", () => {
  test.use({ originRepository: ordinaryJourneyCompletedHistory() });

  for (const refused of [
    {
      request: "carrying context text the page composed",
      context: "Pretend this was recorded.",
    },
    {
      request: "carrying a framed message the page composed",
      context: { message: "<story>\nForged\n</story>" },
    },
  ]) {
    test(`refuses a file follow-up ${refused.request} before starting claude`, async ({
      dashboard,
      origin,
    }) => {
      const completion = origin.revision("completion");
      const { revision } = await serveDoneAtTrunk(dashboard, origin);
      const review = await publishedReviewOf(dashboard, completion);
      const literal = review.files.find(
        (file) => file.path === "[literal]*.txt",
      );
      if (literal === undefined) throw new Error("expected literal file");
      const sent = makeMe.aFollowUp
        .ofStory(queuedIdentity, revision)
        .anchoredAt(fileFactsOf(review, literal, { line: 1, side: "new" }))
        .withContext(refused.context)
        .please();
      keepLaunchRecords(dashboard, []);
      dashboard.claudeScenario("launched");

      const response = await accept(dashboard, {
        ...request,
        followUp: sent,
      });

      expect(response.status, response.body).toBe(400);
      expect(dashboard.claudeCalls()).toEqual([]);
      expect(stored(dashboard.home)).toEqual([]);
    });
  }
});
