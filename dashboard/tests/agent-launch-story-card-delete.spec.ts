// On the committed story-columns origin (./launchJourney.ts), an unreadable
// listing says State unknown and offers Delete record… on each card session.
// It asks in place; confirmation removes only that record from its card,
// Recently done and Sessions sidebar. The other session, column and attention
// count stay; no success message appears; focus moves to the next entry/card.
// Session unavailable behaves likewise; Working and Needs input offer none.
// Origin alone places stories. The server drives only synthetic Claude.

import { readFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "./dashboardTest.ts";
import {
  storyCardAttentionOf,
  storyCardSessionOf,
  storyCardSessions,
  expectMembership,
  parts,
  standaloneSessionName,
  sessionNamedBy,
  sessionStateOf,
} from "./dashboardPage.ts";
import {
  notRefinedStory,
  publishStoryColumnsJourney,
  readyStory,
  takenStory,
  type StoryColumnsJourney,
} from "./launchJourney.ts";
import { sessionsSidebarParts } from "./sessionsSidebarPage.ts";
import { openStoryColumnsJourney } from "./storyColumnsPage.ts";

test.use({ projectFolders: ["open-dough"] });

const question =
  "Delete this session's dashboard record? The conversation stays in Claude Code; a running session keeps running.";

test.describe("deleting a card's session record", () => {
  let columnsJourney: StoryColumnsJourney;
  test.beforeAll(async () => {
    test.setTimeout(120_000);
    columnsJourney = await publishStoryColumnsJourney();
  });
  test.afterAll(() =>
    (columnsJourney as StoryColumnsJourney | undefined)?.cleanup(),
  );

  test("Delete record… on a State unknown entry asks first, Keep and Escape delete nothing, and confirming removes the entry everywhere and moves the keyboard", async ({
    page,
    dashboard,
  }) => {
    dashboard.claudeScenario("launched");
    const { card, settled, launch } = await openStoryColumnsJourney(
      page,
      columnsJourney,
    );
    const { recentlyDone: recent } = parts(page);
    const sidebar = sessionsSidebarParts(page);
    const queued = {
      taken: [],
      backlog: [takenStory, readyStory, notRefinedStory],
    };
    await expectMembership(page, queued);
    await settled();
    await launch(readyStory, "Execution");
    const execution = storyCardSessionOf(card(readyStory), "Execution");
    const kept = await sessionNamedBy(execution);
    const recordFile = path.join(
      dashboard.home,
      ".open-dough",
      "dashboard",
      "agent-launches.json",
    );
    const stored = () => readFileSync(recordFile, "utf8");
    const inRecent = (workflow: "Execution" | "Refinement") =>
      recent.getByRole("article", {
        name: standaloneSessionName(workflow, readyStory),
      });
    const deleteButton = (entry: typeof execution) =>
      entry.getByRole("button", { name: "Delete record…" });

    await test.step("with the listing unreadable, the entry says State unknown and offers Delete record…", async () => {
      dashboard.claudeListingFails(true);
      await page.reload();
      await settled();
      await sidebar.button.click();
      await expect(sidebar.entries).toHaveCount(1);
      await expect(sessionStateOf(execution)).toHaveText(
        "State unknown: Claude Code's session list could not be read",
      );
      await expect(deleteButton(execution)).toBeVisible();
      await expect(storyCardAttentionOf(card(readyStory))).toHaveCount(0);
    });

    await test.step("pressing it asks in place, keeping the entry's words and Open terminal, with the keyboard on Keep", async () => {
      const cardTop = () =>
        card(readyStory).evaluate((element) => {
          const region = element.closest(".board-scroll");
          return element.getBoundingClientRect().top + (region?.scrollTop ?? 0);
        });
      const before = await cardTop();

      await deleteButton(execution).click();

      await expect(execution.getByText(question)).toBeVisible();
      await expect(
        execution.getByRole("button", { name: "Delete record", exact: true }),
      ).toBeEnabled();
      await expect(
        execution.getByRole("button", { name: "Keep" }),
      ).toBeFocused();
      await expect(deleteButton(execution)).toHaveCount(0);
      await expect(sessionStateOf(execution)).toContainText("State unknown");
      await expect(
        execution.getByRole("button", { name: "Open terminal" }),
      ).toBeVisible();
      expect(await cardTop()).toBe(before);
    });

    await test.step("Keep restores the button with the keyboard on it and deletes nothing", async () => {
      await execution.getByRole("button", { name: "Keep" }).click();

      await expect(deleteButton(execution)).toBeFocused();
      await expect(execution.getByText(question)).toHaveCount(0);
      expect(stored()).toContain(kept);
    });

    await test.step("Escape does the same", async () => {
      await deleteButton(execution).click();
      await expect(
        execution.getByRole("button", { name: "Keep" }),
      ).toBeFocused();

      await page.keyboard.press("Escape");

      await expect(deleteButton(execution)).toBeFocused();
      await expect(execution.getByText(question)).toHaveCount(0);
      expect(stored()).toContain(kept);
    });

    await test.step("Delete record removes the entry from the card, Recently done and the sidebar without a success announcement, and moves the keyboard to the card", async () => {
      await deleteButton(execution).click();
      await execution
        .getByRole("button", { name: "Delete record", exact: true })
        .click();

      await expect(execution).toHaveCount(0);
      await expect(storyCardSessions(card(readyStory))).toHaveCount(0);
      await expect(inRecent("Execution")).toHaveCount(0);
      await expect(sidebar.entries).toHaveCount(0);
      await expect(card(readyStory)).toBeFocused();
      await expect(
        page.getByText("Session record deleted", { exact: true }),
      ).toHaveCount(0);
      expect(stored()).not.toContain(kept);
      await expectMembership(page, queued);
      expect(dashboard.claudeStopCalls()).toEqual([]);
    });
  });

  test("a Session unavailable entry offers Delete record…, asks, and confirming removes it from its card, Recently done and the sidebar", async ({
    page,
    dashboard,
  }) => {
    dashboard.claudeScenario("launched");
    const { card, settled, launch } = await openStoryColumnsJourney(
      page,
      columnsJourney,
    );
    const { recentlyDone: recent } = parts(page);
    const sidebar = sessionsSidebarParts(page);
    await settled();
    await launch(readyStory, "Execution");
    const unavailable = storyCardSessionOf(card(readyStory), "Execution");
    // A launch is finished once its entry names its session; reloading sooner
    // would lose it.
    dashboard.claudeSessionBecomes(
      await sessionNamedBy(unavailable),
      "forgotten",
    );
    await page.reload();
    await settled();
    await sidebar.button.click();
    await expect(sidebar.entries).toHaveCount(1);
    await expect(sessionStateOf(unavailable)).toHaveText("Session unavailable");

    await unavailable.getByRole("button", { name: "Delete record…" }).click();

    await expect(unavailable.getByText(question)).toBeVisible();
    await expect(
      unavailable.getByRole("button", { name: "Keep" }),
    ).toBeFocused();

    await unavailable
      .getByRole("button", { name: "Delete record", exact: true })
      .click();

    await expect(unavailable).toHaveCount(0);
    await expect(
      recent.getByRole("article", {
        name: standaloneSessionName("Execution", readyStory),
      }),
    ).toHaveCount(0);
    await expect(sidebar.entries).toHaveCount(0);
    await expect(
      page.getByText("Session record deleted", { exact: true }),
    ).toHaveCount(0);
    await expect(storyCardSessions(card(readyStory))).toHaveCount(0);
  });

  test("a Working or Needs input entry offers no Delete record…", async ({
    page,
    dashboard,
  }) => {
    dashboard.claudeScenario("launched");
    const { card, settled, launch } = await openStoryColumnsJourney(
      page,
      columnsJourney,
    );
    await settled();
    await launch(readyStory, "Refinement");
    await launch(notRefinedStory, "Execution");
    const blocked = storyCardSessionOf(card(readyStory), "Refinement");
    const working = storyCardSessionOf(card(notRefinedStory), "Execution");
    // The last launch settles on its own after its click, and its listing
    // write would overwrite a change made meanwhile: every session is named
    // only once each launch has finished.
    const blockedId = await sessionNamedBy(blocked);
    const workingId = await sessionNamedBy(working);
    dashboard.claudeSessionBecomes(blockedId, "blocked");
    dashboard.claudeSessionBecomes(workingId, "working");

    await page.reload();
    await settled();

    for (const [entry, words] of [
      [blocked, "Needs input"],
      [working, "Working"],
    ] as const) {
      await expect(sessionStateOf(entry)).toHaveText(words);
      await expect(
        entry.getByRole("button", { name: /^Delete record/ }),
      ).toHaveCount(0);
    }
  });
});
