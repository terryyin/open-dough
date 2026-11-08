// Cards count local attention independently of published story membership.

import {
  identityA,
  identityB,
} from "../../../src/skills/dough-execute-plan/scripts/workspace-publication-fixtures.mjs";
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
  notRefinedIdentity,
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
  openWithOpenSessions,
  type OpenSession,
} from "../storyCardOpenSessions.ts";
import { markDoneAnyway } from "../support/markDone.ts";
import { expectCursorRunnerStandIn } from "../support/cursorRunnerJourney.ts";

// Cursor operations are outside this journey's proof; the harness
// stand-in skips an unused real runner while keeping the built preview.
test.use({
  projectFolders: ["open-dough", "doughnut"],
  cursorRunner: "stand-in",
});

const one = "1 session needs attention";

// Open Dough's three sessions, each working when the page opens on the
// Backlog: an Execution on the ready and the not-refined story and a
// Refinement on Story A.
const openDoughSessions: readonly OpenSession[] = [
  {
    project: "open-dough",
    identity: identityB,
    title: readyStory,
    workflow: "Execution",
    state: "working",
  },
  {
    project: "open-dough",
    identity: notRefinedIdentity,
    title: notRefinedStory,
    workflow: "Execution",
    state: "working",
  },
  {
    project: "open-dough",
    identity: identityA,
    title: takenStory,
    workflow: "Refinement",
    state: "working",
  },
];

test.describe("a story's card counts the sessions that need attention", () => {
  let columnsJourney: StoryColumnsJourney;
  test.beforeAll(async () => {
    columnsJourney = await publishStoryColumnsJourney();
  });
  test.afterAll(() =>
    (columnsJourney as StoryColumnsJourney | undefined)?.cleanup(),
  );

  test("counts each card's affected sessions in Backlog and Preparing, never an unknown one or while the listing cannot be read", async ({
    page,
    dashboard,
  }) => {
    const {
      passOnePace,
      show,
      board,
      card,
      expectNothingStarted,
      shows,
      becomes,
      queued,
    } = await openWithOpenSessions(
      page,
      dashboard,
      columnsJourney,
      openDoughSessions,
    );
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
      await shows(readyStory, "Execution", "Needs input: input needed", true);
      await shows(notRefinedStory, "Execution", "Ready for review", true);
      await shows(takenStory, "Refinement", "Session unavailable", false);
    });

    await test.step("an affected session stays counted, and none while the listing cannot be read", async () => {
      becomes(readyStory, "Execution", "stopped");
      await passOnePace();
      await expectCounted({ [readyStory]: one, [notRefinedStory]: one });
      await shows(readyStory, "Execution", "Session stopped", true);

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
      ...openDoughSessions,
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
      await expect(
        kept.getByRole("button", { name: "Open terminal" }),
      ).toBeVisible();
    });
    expectNothingStarted();
  });
});
