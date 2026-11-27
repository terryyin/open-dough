// File follow-ups of a Done story's Published completion over raw HTTP, with
// a real bare origin (../../test-support/support/startOrigin.ts) and the
// synthetic `claude`: different line anchors are separate launches; the same
// anchor and text resume the kept start. First-input content:
// agent-launch-follow-up-file.spec.ts.

import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { attempts, launch } from "../../test-support/agentLaunchBoundary.ts";
import {
  fileFactsOf,
  publishedReviewOf,
  renamedNewPath,
  serveDoneAtTrunk,
} from "../../test-support/support/followUpCompletedFile.ts";
import { renamedFileCompletedHistory } from "../../test-support/support/completedFollowUpHistory.ts";
import { expect, test } from "../../test-support/support/preparationPage.ts";
import { queuedIdentity } from "../../test-support/support/startOrigin.ts";
import { answerOf, request } from "./followUpBoundaryCases.ts";

test.use({ serverMode: "boundary" });

test.describe("renamed file", () => {
  test.use({ originRepository: renamedFileCompletedHistory() });

  test("follow-ups of two lines are two launches, and repeating one resumes its kept start", async ({
    dashboard,
    origin,
  }) => {
    const completion = origin.revision("completion");
    const { revision } = await serveDoneAtTrunk(dashboard, origin);
    const review = await publishedReviewOf(dashboard, completion);
    const renamed = review.files.find((file) => file.path === renamedNewPath);
    if (renamed?.kind !== "renamed") throw new Error("expected rename");
    const lineOf = (line: number) =>
      makeMe.aFollowUp
        .ofStory(queuedIdentity, revision)
        .anchoredAt(fileFactsOf(review, renamed, { line, side: "new" }))
        .please();
    const start = (line: number) => ({
      ...request,
      instruction: "  ",
      policy: { workspace: "isolated", landing: "review" },
      followUp: lineOf(line),
    });
    dashboard.claudeScenario("refused");
    const refused = await answerOf(launch(dashboard, start(11)));
    expect(refused).toMatchObject({ kind: "failed", reason: "refused" });
    const [failed] = await attempts(dashboard);

    dashboard.claudeScenario("launched");
    const other = await answerOf(launch(dashboard, start(12)));
    const resumed = await answerOf(launch(dashboard, start(11)));

    expect(other.kind, JSON.stringify(other)).toBe("launched");
    expect(resumed.kind, JSON.stringify(resumed)).toBe("launched");
    const kept = await attempts(dashboard);
    expect(kept).toHaveLength(2);
    expect(kept).toContainEqual(
      expect.objectContaining({
        id: failed?.id,
        acceptedAt: failed?.acceptedAt,
      }),
    );
    expect(dashboard.claudeLaunchCalls()).toHaveLength(3);
  });
});
