// A story's card says how many of its listed sessions need attention, by the
// reading each entry shows (./agent-launch-recent-session-states.spec.ts):
// a working session does not hide another's, two affected sessions are
// counted, an unavailable or unknown one is not, and the words go once none
// need attention, whether work resumed or a session was marked done. Backlog,
// Preparing, and Taken cards follow the same rule, and the count never moves
// a story or changes what origin publishes of it. Another project's sessions
// never count, and a return or reload reads the count afresh from Claude
// Code's listing. A story that leaves every list keeps its affected session,
// with its reason and Open terminal, in Recent sessions. The page's own
// dashboard server launches the synthetic `claude` (./fixtures/fake-claude);
// the real one is never reached. The page clock stands still unless the
// journey lets it pass.

import type { Locator } from "@playwright/test";
import { expect, pausePageClockAt, test } from "./dashboardTest.ts";
import {
  cardAttentionOf,
  cardSessionOf,
  cardSessions,
  expectMembership,
  parts,
  recentSessionName,
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

test.use({ projectFolders: ["open-dough", "doughnut"] });

const one = "1 session needs attention";
const two = "2 sessions need attention";

// What a card publishes of its story, once every fact is read: everything it
// shows but its sessions and how many of them need attention.
const publishedFactsOf = async (card: Locator) => {
  await expect(card).not.toContainText(/Reading [^…]*…/);
  return card.evaluate((element) => {
    const copy = element.cloneNode(true) as HTMLElement;
    const counted = copy.querySelectorAll(".card-sessions, .card-attention");
    for (const part of counted) part.remove();
    return copy.textContent;
  });
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

  test("counts each card's affected sessions through Backlog, Preparing, and Taken, never another project's or an unknown one, and a story in no list keeps its affected session in Recent sessions", async ({
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
    const { stages, project, recentSessions } = parts(page);
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
      [readyStory, "Refinement"],
      [notRefinedStory, "Execution"],
      [notRefinedStory, "Refinement"],
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
    // A card's facts to compare later, once every preparation is read.
    const readFactsOf = async (title: string) => {
      await expect(page.getByText("Reading preparation…")).toHaveCount(0);
      return publishedFactsOf(card(title));
    };
    await expectCounted({});
    const facts = await readFactsOf(readyStory);
    await markNotReloaded(page);

    await test.step("a working session does not hide another's attention, and an unavailable one is not counted", async () => {
      becomes(readyStory, "Refinement", "blocked", "input needed");
      becomes(notRefinedStory, "Execution", "done-live");
      becomes(notRefinedStory, "Refinement", "forgotten");
      await passOnePace();
      await expectCounted({ [readyStory]: one, [notRefinedStory]: one });
      await shows(readyStory, "Execution", "Working", false);
      await shows(readyStory, "Refinement", "Needs input: input needed", true);
      await shows(notRefinedStory, "Execution", "Ready for review", true);
      await shows(notRefinedStory, "Refinement", "Session unavailable", false);
    });

    await test.step("two affected sessions on one card are counted, and none while the listing cannot be read", async () => {
      becomes(readyStory, "Execution", "stopped");
      await passOnePace();
      await expectCounted({ [readyStory]: two, [notRefinedStory]: one });
      await shows(readyStory, "Execution", "Session stopped", true);

      dashboard.claudeListingFails(true);
      await passOnePace();
      await expectCounted({});
      dashboard.claudeListingFails(false);
      await passOnePace();
      await expectCounted({ [readyStory]: two, [notRefinedStory]: one });
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
      const preparingFacts = await readFactsOf(readyStory);
      await expectCounted({ [readyStory]: two, [notRefinedStory]: one });

      becomes(readyStory, "Refinement", "working");
      await passOnePace();
      await expectCounted({ [readyStory]: one, [notRefinedStory]: one });
      await expectMembership(page, { taken: [], backlog: queued });
      expect(await publishedFactsOf(card(readyStory))).toBe(preparingFacts);
    });

    const takenStages = {
      taken: [readyStory],
      backlog: [takenStory, notRefinedStory],
    };
    await test.step("a Taken card counts the same way, and marking its last affected session done leaves no count", async () => {
      await show(stagesJourney.taken);
      await expectMembership(page, takenStages);
      const takenFacts = await readFactsOf(readyStory);
      await expectCounted({ [readyStory]: one, [notRefinedStory]: one });

      await entryOf(readyStory, "Execution")
        .getByRole("button", { name: "Mark as done" })
        .click();
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
      becomes(readyStory, "Refinement", "failed");
      await passOnePace();
      await expectCounted({ [doughnutSharedTitle]: one });

      await select("Open Dough");
      await expectCounted({ [readyStory]: one, [notRefinedStory]: one });
      await shows(readyStory, "Refinement", "Session failed", true);

      becomes(readyStory, "Refinement", "working");
      await page.reload();
      await settled();
      await expectCounted({ [notRefinedStory]: one });
    });

    await test.step("a story that leaves every list keeps its affected session, with its reason and Open terminal, in Recent sessions", async () => {
      await show(stagesJourney.completed);
      await expectMembership(page, {
        taken: [readyStory],
        backlog: [takenStory],
      });
      await expectCounted({});
      const kept = recentSessions.getByRole("article", {
        name: recentSessionName("Execution", notRefinedStory),
      });
      await expectSessionShown(kept, "Ready for review", true);
      await expect(
        kept.getByRole("button", { name: "Open terminal" }),
      ).toBeVisible();
    });
  });
});
