// Cards count local attention independently of published story membership:
// a Taken card, only the shown project's sessions, and a story in no list
// keeping its affected session in local Taken. Backlog and Preparing cards
// are ./agent-launch-attention.spec.ts.

import { expect, test } from "../dashboardTest.ts";
import {
  chooseProject,
  expectMembership,
  standaloneSessionName,
} from "../dashboardPage.ts";
import {
  doughnutSharedTitle,
  sharedStoryIdentity,
} from "../doughnutProject.ts";
import {
  notRefinedStory,
  publishStoryColumnsJourney,
  readyStory,
  takenStory,
  type StoryColumnsJourney,
} from "../launchJourney.ts";
import {
  expectNotReloaded,
  expectSessionShown,
  markNotReloaded,
} from "../sessionStatePace.ts";
import { attentionCountsOn, publishedFactsOf } from "../storyCardAttention.ts";
import {
  openDoughWorkingSessions,
  openWithOpenSessions,
  type OpenSession,
} from "../storyCardOpenSessions.ts";
import { markDoneAnyway } from "../support/markDone.ts";
import { openTerminalControl } from "../terminalScreenPage.ts";

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

  test("counts a Taken card's affected sessions and only the shown project's, and a story in no list keeps its affected session in local Taken", async ({
    page,
    dashboard,
  }) => {
    // Doughnut's Execution is open beside Open Dough's three.
    const doughnutSession: OpenSession = {
      project: "doughnut",
      identity: sharedStoryIdentity,
      title: doughnutSharedTitle,
      workflow: "Execution",
      state: "working",
    };
    const {
      passOnePace,
      settled,
      show,
      board,
      taken,
      card,
      entryOf,
      expectOpen,
      expectNothingStarted,
      shows,
      becomes,
    } = await openWithOpenSessions(page, dashboard, columnsJourney, [
      ...openDoughWorkingSessions,
      doughnutSession,
    ]);
    const expectCounted = attentionCountsOn(board, card);
    await expectCounted({});
    // The states the Backlog and Preparing journey leaves: the not-refined
    // story's session is ready for review and the Refinement is unavailable.
    becomes(notRefinedStory, "Execution", "done-live");
    becomes(takenStory, "Refinement", "forgotten");
    const takenColumns = {
      taken: [readyStory],
      backlog: [takenStory, notRefinedStory],
    };
    await markNotReloaded(page);
    await test.step("a Taken card counts the same way, and marking its last affected session done leaves no count", async () => {
      becomes(readyStory, "Execution", "stopped");
      await show(columnsJourney.taken, { pace: passOnePace });
      await expectNotReloaded(page);
      await expectMembership(page, takenColumns);
      const takenFacts = await publishedFactsOf(card(readyStory));
      await expectCounted({ [readyStory]: one, [notRefinedStory]: one });

      await markDoneAnyway(entryOf(readyStory, "Execution"));
      await expect(entryOf(readyStory, "Execution")).toHaveCount(0);
      await expectCounted({ [notRefinedStory]: one });
      await expectMembership(page, takenColumns);
      expect(await publishedFactsOf(card(readyStory))).toBe(takenFacts);
      await expectNotReloaded(page);
    });

    await test.step("another project counts only its own sessions, and a return or reload reads the count afresh", async () => {
      const select = (name: string) => chooseProject(page, name);
      await select("Doughnut");
      await settled();
      await expect(
        board.getByRole("article", { name: doughnutSharedTitle, exact: true }),
      ).toBeVisible();
      // Doughnut's card shows its open session, so its count is Doughnut's.
      await expectOpen(doughnutSession);
      await expectCounted({});
      becomes(doughnutSharedTitle, "Execution", "blocked");
      // Open Dough's session fails while Doughnut is shown.
      becomes(notRefinedStory, "Execution", "failed");
      await passOnePace();
      await expectCounted({ [doughnutSharedTitle]: one });

      await select("Open Dough");
      await expectCounted({ [notRefinedStory]: one });
      await shows(notRefinedStory, "Execution", "Session failed", true);

      becomes(notRefinedStory, "Execution", "working");
      await page.reload();
      await settled();
      await expectCounted({});
    });

    await test.step("a story that leaves every list keeps its affected session, with its reason and Open terminal, in local Taken", async () => {
      await markNotReloaded(page);
      becomes(notRefinedStory, "Execution", "done-live");
      await show(columnsJourney.completed, { pace: passOnePace });
      await expectNotReloaded(page);
      await expectMembership(page, {
        taken: [readyStory],
        backlog: [takenStory],
      });
      await expectCounted({});
      const kept = taken.getByRole("article", {
        name: standaloneSessionName("Execution", notRefinedStory),
      });
      await expectSessionShown(kept, "Ready for review", true);
      await expect(openTerminalControl(kept)).toBeVisible();
    });
    expectNothingStarted();
  });
});
