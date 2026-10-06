// Cards count listed sessions needing attention by each entry's reading.
// Working, unavailable and unknown sessions add none; every affected session
// counts until work resumes or it is marked done. Backlog, Preparing and Taken
// preserve membership and origin's published facts. Counts belong to their
// project and are read afresh from Claude Code's listing on return or reload.
// Stories leaving every list keep affected sessions, reasons and Open terminal
// in local Taken. Only synthetic `claude` (./fixtures/fake-claude) launches;
// the page clock stays still unless this journey advances it.

import type { Locator } from "@playwright/test";
import { expect, pausePageClockAt, test } from "./dashboardTest.ts";
import {
  cardAttentionOf,
  cardSessionOf,
  cardSessions,
  expectMembership,
  parts,
  standaloneSessionName,
  sessionNamedBy,
} from "./dashboardPage.ts";
import { doughnutSharedTitle } from "./doughnutProject.ts";
import {
  notRefinedStory,
  publishStoryStagesJourney,
  readyStory,
  takenStory,
  type StoryStagesJourney,
} from "./launchJourney.ts";
import {
  expectNotReloaded,
  expectSessionShown,
  markNotReloaded,
  watchRecordReads,
} from "./sessionStatePace.ts";
import { openStoryStagesJourney, type Workflow } from "./storyStagesPage.ts";
import type { ClaudeSessionChange } from "./support/fakeClaude.ts";
import { markDoneAnyway } from "./support/markDone.ts";

test.use({ projectFolders: ["open-dough", "doughnut"] });

const one = "1 session needs attention";

// A card's published story facts once ready, excluding sessions and attention.
const publishedFactsOf = async (card: Locator) => {
  let facts: string | null = null;
  await expect
    .poll(async () => {
      facts = await card.evaluate((element) => {
        // Readiness (badges, each credited human) and capture share one
        // turn: a new snapshot may begin reading after an assertion passed.
        if (
          !element.querySelector(".card-preparation .badge-row") ||
          /Reading [^…]*…/.test(element.textContent) ||
          element.querySelector(".owner-line:not(:has([class*=owner-human-]))")
        )
          return null;
        const copy = element.cloneNode(true) as HTMLElement;
        const counted = copy.querySelectorAll(
          ".card-sessions, .card-attention, .card-session-open-reason",
        );
        for (const part of counted) part.remove();
        return copy.textContent;
      });
      return facts;
    })
    .not.toBeNull();
  return facts;
};

test.describe("a story's card counts the sessions that need attention", () => {
  let stagesJourney: StoryStagesJourney;
  test.beforeAll(async () => {
    test.setTimeout(120_000);
    stagesJourney = await publishStoryStagesJourney();
  });
  test.afterAll(() =>
    (stagesJourney as StoryStagesJourney | undefined)?.cleanup(),
  );

  test("counts each card's affected sessions through Backlog, Preparing, and Taken, never another project's or an unknown one, and a story in no list keeps its affected session in local Taken", async ({
    page,
    dashboard,
  }) => {
    await pausePageClockAt(page, new Date());
    const { passOnePace } = watchRecordReads(page);
    dashboard.claudeScenario("launched");
    const { settled, show, launch } = await openStoryStagesJourney(
      page,
      stagesJourney,
    );
    const { stages, project, taken } = parts(page);
    const card = (title: string) =>
      stages.getByRole("article", { name: title, exact: true });
    const entryOf = (title: string, workflow: Workflow) =>
      cardSessionOf(card(title), workflow);
    // The words each card with affected sessions shows; every other card
    // shows none.
    const expectCounted = async (counts: Record<string, string>) => {
      for (const [title, words] of Object.entries(counts)) {
        await expect(cardAttentionOf(card(title))).toHaveText(words);
      }
      await expect(cardAttentionOf(stages)).toHaveCount(
        Object.keys(counts).length,
      );
    };
    const shows = (
      title: string,
      workflow: Workflow,
      words: string,
      needsAttention: boolean,
    ) => expectSessionShown(entryOf(title, workflow), words, needsAttention);
    const queued = [takenStory, readyStory, notRefinedStory];
    await expectMembership(page, { taken: [], backlog: queued });
    await settled();

    const sessionOf = new Map<string, string>();
    for (const [title, workflow] of [
      [readyStory, "Execution"],
      [notRefinedStory, "Execution"],
      [takenStory, "Refinement"],
    ] as const) {
      await launch(title, workflow);
      await shows(title, workflow, "Working", false);
      sessionOf.set(
        `${title} ${workflow}`,
        await sessionNamedBy(entryOf(title, workflow)),
      );
    }
    // Claude Code lists the story's session in this workflow anew.
    const becomes = (
      title: string,
      workflow: Workflow,
      ...change: [ClaudeSessionChange, string?]
    ) => {
      const session = sessionOf.get(`${title} ${workflow}`) ?? "?";
      dashboard.claudeSessionBecomes(session, ...change);
    };
    await expectCounted({});
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
      await show(stagesJourney.preparing);
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
    });

    const takenStages = {
      taken: [readyStory],
      backlog: [takenStory, notRefinedStory],
    };
    await test.step("a Taken card counts the same way, and marking its last affected session done leaves no count", async () => {
      becomes(readyStory, "Execution", "stopped");
      await passOnePace();
      await show(stagesJourney.taken);
      await expectMembership(page, takenStages);
      const takenFacts = await publishedFactsOf(card(readyStory));
      await expectCounted({ [readyStory]: one, [notRefinedStory]: one });

      await markDoneAnyway(entryOf(readyStory, "Execution"));
      await expect(entryOf(readyStory, "Execution")).toHaveCount(0);
      await expectCounted({ [notRefinedStory]: one });
      await expectMembership(page, takenStages);
      expect(await publishedFactsOf(card(readyStory))).toBe(takenFacts);
    });

    await test.step("another project counts only its own sessions, and a return or reload reads the count afresh", async () => {
      const select = (name: string) =>
        project.getByRole("radio", { name, exact: true }).check();
      await select("Doughnut");
      // Launching waits for Doughnut's card, so its count is Doughnut's.
      await launch(doughnutSharedTitle, "Execution");
      await expectCounted({});
      dashboard.claudeSessionBecomes(
        await sessionNamedBy(cardSessions(card(doughnutSharedTitle)).first()),
        "blocked",
      );
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
      becomes(notRefinedStory, "Execution", "done-live");
      await passOnePace();
      await show(stagesJourney.completed);
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
  });
});
