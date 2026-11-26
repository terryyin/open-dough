// Two done stories with the same words are two launches; repeating one
// resumes its kept start. The story's facts, its selected sessions and the
// two refusals are agent-launch-follow-up-story-input.spec.ts. An optional
// file anchor on the same source: agent-launch-follow-up-file.spec.ts and
// agent-launch-follow-up-file-admission.spec.ts. The page journey is
// ../../../e2e/stories/recently-done-follow-up.spec.ts.

import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { attempts, launch } from "../../test-support/agentLaunchBoundary.ts";
import {
  doneStoryFiles,
  otherStory,
  recoverStory,
  storyContextOf,
} from "../../test-support/support/followUpStories.ts";
import { expect, test } from "../../test-support/support/preparationPage.ts";
import { publishes } from "../../test-support/support/publishedRepository.ts";
import { originMain } from "../../test-support/support/sessionDialog.ts";
import type { StartOrigin } from "../../test-support/support/startOrigin.ts";
import type { DashboardServer } from "../../test-support/support/dashboardServer.ts";
import { answerOf, request } from "./followUpBoundaryCases.ts";

// No page: the local boundaries alone answer these requests.
test.use({ serverMode: "boundary" });

const completedAt = "2026-11-08T09:05:00.000Z";
const repository = "terryyin/open-dough";

// Publishes the done records of SEED-269 and SEED-267 at the origin's main,
// as the revision the page showed; answers that revision.
async function publishDoneStories(
  dashboard: DashboardServer,
  origin: StartOrigin,
): Promise<string> {
  const revision = await originMain(origin);
  dashboard.github.serve(
    repository,
    publishes({
      revision,
      files: doneStoryFiles([recoverStory, otherStory], completedAt),
    }),
  );
  return revision;
}

test("follow-ups of two stories with the same words and choices are two launches, and repeating one resumes its kept start", async ({
  dashboard,
  origin,
}) => {
  const revision = await publishDoneStories(dashboard, origin);
  const followUpStart = (story: typeof recoverStory) => ({
    ...request,
    instruction: "Continue",
    policy: { workspace: "isolated", landing: "review" },
    followUp: makeMe.aFollowUp.ofStory(story, revision).please(),
  });
  dashboard.claudeScenario("refused");
  const refused = await answerOf(
    launch(dashboard, followUpStart(recoverStory)),
  );
  expect(refused).toMatchObject({ kind: "failed", reason: "refused" });
  const [failed] = await attempts(dashboard);

  dashboard.claudeScenario("launched");
  const other = await answerOf(launch(dashboard, followUpStart(otherStory)));
  const resumed = await answerOf(
    launch(dashboard, followUpStart(recoverStory)),
  );

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
  const calls = dashboard.claudeLaunchCalls();
  expect(calls).toHaveLength(3);
  expect(calls[1]?.argv.at(-1)).toContain(
    storyContextOf(otherStory, completedAt, "no session", "Continue"),
  );
  expect(calls[2]?.argv.at(-1)).toContain(
    storyContextOf(recoverStory, completedAt, "no session", "Continue"),
  );
});
