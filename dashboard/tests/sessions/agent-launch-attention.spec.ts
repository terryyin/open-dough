// Backlog and Preparing cards count the sessions that need attention, apart
// from what origin publishes. Taken cards, other projects and stories in no
// list are ./agent-launch-attention-taken.spec.ts; which states need
// attention is ../../backend-tests/sessions/session-reading-rule.spec.ts.

import { expect, test } from "../dashboardTest.ts";
import { expectMembership } from "../dashboardPage.ts";
import {
  notRefinedStory,
  publishStoryColumnsJourney,
  readyStory,
  takenStory,
  type StoryColumnsJourney,
} from "../launchJourney.ts";
import { expectNotReloaded, markNotReloaded } from "../sessionStatePace.ts";
import { attentionCountsOn, publishedFactsOf } from "../storyCardAttention.ts";
import { openWithOpenSessions } from "../storyCardOpenSessions.ts";
import { expectCursorRunnerStandIn } from "../support/cursorRunnerJourney.ts";

// Cursor operations are outside this journey's proof; the harness
// stand-in skips an unused real runner while keeping the built preview.
test.use({
  projectFolders: ["open-dough", "doughnut"],
  cursorRunner: "stand-in",
});

const one = "1 session needs attention";

test.describe("a story's card counts the sessions that need attention", () => {
  let columnsJourney: StoryColumnsJourney;
  test.beforeAll(async () => {
    columnsJourney = await publishStoryColumnsJourney();
  });
  test.afterAll(() =>
    (columnsJourney as StoryColumnsJourney | undefined)?.cleanup(),
  );

  test("counts each card's sessions needing attention in Backlog and Preparing, and none while the listing cannot be read", async ({
    page,
    dashboard,
  }) => {
    const {
      passOnePace,
      show,
      board,
      card,
      expectNothingStarted,
      becomes,
      queued,
    } = await openWithOpenSessions(page, dashboard, columnsJourney);
    const expectCounted = attentionCountsOn(board, card);
    await expectCounted({});
    expectCursorRunnerStandIn(dashboard.home);
    const facts = await publishedFactsOf(card(readyStory));
    await markNotReloaded(page);

    await test.step("a working session does not hide another's attention, and an unavailable one is not counted", async () => {
      becomes(readyStory, "Execution", "blocked", "input needed");
      becomes(notRefinedStory, "Execution", "done-live");
      becomes(takenStory, "Refinement", "forgotten");
      await passOnePace();
      await expectCounted({ [readyStory]: one, [notRefinedStory]: one });
    });

    await test.step("an affected session stays counted, and none while the listing cannot be read", async () => {
      becomes(readyStory, "Execution", "stopped");
      await passOnePace();
      await expectCounted({ [readyStory]: one, [notRefinedStory]: one });

      dashboard.claudeListingFails(true);
      await passOnePace();
      await expectCounted({});
      dashboard.claudeListingFails(false);
      await passOnePace();
      await expectCounted({ [readyStory]: one, [notRefinedStory]: one });
      await expectNotReloaded(page);
      await expectMembership(page, { taken: [], backlog: queued });
      expect(await publishedFactsOf(card(readyStory))).toBe(facts);
    });

    await test.step("a Preparing card counts the same way, and resumed work lowers its count without changing what origin publishes", async () => {
      await show(columnsJourney.preparing, { pace: passOnePace });
      await expectNotReloaded(page);
      await expectMembership(page, { taken: [], backlog: queued });
      await expect(
        card(readyStory).getByText("Preparing", { exact: true }),
      ).toBeVisible();
      const preparingFacts = await publishedFactsOf(card(readyStory));
      await expectCounted({ [readyStory]: one, [notRefinedStory]: one });

      becomes(readyStory, "Execution", "working");
      await passOnePace();
      await expectCounted({ [notRefinedStory]: one });
      await expectMembership(page, { taken: [], backlog: queued });
      expect(await publishedFactsOf(card(readyStory))).toBe(preparingFacts);
      await expectNotReloaded(page);
    });
    expectNothingStarted();
  });
});
