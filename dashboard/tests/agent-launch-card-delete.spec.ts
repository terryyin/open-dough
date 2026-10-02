// Delete record on a session its story's card lists, on the committed
// story-stages origin (./launchJourney.ts): while the whole listing cannot be
// read, every entry says "State unknown" and offers "Delete record…", which
// asks in place before it deletes and, once confirmed, takes only the
// session's record: the entry leaves its card, Recent sessions and the
// Sessions sidebar, the other session, the card's stage and its attention
// count stay, no deletion-success message appears, and the keyboard goes to
// the next entry or to the card. A Session unavailable entry offers and does the same; a Working
// or Needs input entry offers none. Origin alone still places the story. The page's own dashboard server
// drives the synthetic `claude` (./fixtures/fake-claude); the real one is
// never reached.

import { readFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "./dashboardTest.ts";
import {
  cardAttentionOf,
  cardSessionOf,
  cardSessions,
  expectMembership,
  parts,
  recentSessionName,
  sessionNamedBy,
  sessionStateOf,
} from "./dashboardPage.ts";
import {
  notRefinedStory,
  publishStoryStagesJourney,
  readyStory,
  takenStory,
  type StoryStagesJourney,
} from "./launchJourney.ts";
import { sidebarParts } from "./sessionSidebarPage.ts";
import { openStoryStagesJourney } from "./storyStagesPage.ts";

test.use({ projectFolders: ["open-dough"] });

const question =
  "Delete this session's dashboard record? The conversation stays in Claude Code; a running session keeps running.";

test.describe("deleting a card's session record", () => {
  let stagesJourney: StoryStagesJourney;
  test.beforeAll(async () => {
    test.setTimeout(120_000);
    stagesJourney = await publishStoryStagesJourney();
  });
  test.afterAll(() =>
    (stagesJourney as StoryStagesJourney | undefined)?.cleanup(),
  );

  test("Delete record… on a State unknown entry asks first, Keep and Escape delete nothing, and confirming removes the entry everywhere and moves the keyboard", async ({
    page,
    dashboard,
  }) => {
    dashboard.claudeScenario("launched");
    const { card, settled, launch } = await openStoryStagesJourney(
      page,
      stagesJourney,
    );
    const { recentSessions: recent } = parts(page);
    const sidebar = sidebarParts(page);
    const queued = {
      taken: [],
      backlog: [takenStory, readyStory, notRefinedStory],
    };
    await expectMembership(page, queued);
    await settled();
    await launch(readyStory, "Execution");
    await launch(readyStory, "Refinement");
    const execution = cardSessionOf(card(readyStory), "Execution");
    const refinement = cardSessionOf(card(readyStory), "Refinement");
    const kept = await sessionNamedBy(execution);
    const deleted = await sessionNamedBy(refinement);
    const recordFile = path.join(
      dashboard.home,
      ".open-dough",
      "dashboard",
      "agent-launches.json",
    );
    const stored = () => readFileSync(recordFile, "utf8");
    const inRecent = (workflow: "Execution" | "Refinement") =>
      recent.getByRole("article", {
        name: recentSessionName(workflow, readyStory),
      });
    const deleteButton = (entry: typeof execution) =>
      entry.getByRole("button", { name: "Delete record…" });

    await test.step("with the listing unreadable, both entries say State unknown and offer Delete record…", async () => {
      dashboard.claudeListingFails(true);
      await page.reload();
      await settled();
      await sidebar.button.click();
      await expect(sidebar.entries).toHaveCount(2);
      for (const entry of [execution, refinement]) {
        await expect(sessionStateOf(entry)).toHaveText(
          "State unknown: Claude Code's session list could not be read",
        );
        await expect(deleteButton(entry)).toBeVisible();
      }
      await expect(cardAttentionOf(card(readyStory))).toHaveCount(0);
    });

    await test.step("pressing it asks in place, keeping the entry's words and Open terminal, with the keyboard on Keep", async () => {
      const cardTop = () =>
        card(readyStory).evaluate(
          (element) => element.getBoundingClientRect().top + window.scrollY,
        );
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
      await expect(deleteButton(refinement)).toBeVisible();
    });

    await test.step("Keep restores the button with the keyboard on it and deletes nothing", async () => {
      await execution.getByRole("button", { name: "Keep" }).click();

      await expect(deleteButton(execution)).toBeFocused();
      await expect(execution.getByText(question)).toHaveCount(0);
      expect(stored()).toContain(kept);
      expect(stored()).toContain(deleted);
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
      expect(stored()).toContain(deleted);
    });

    await test.step("Delete record removes the entry from the card, Recent sessions and the sidebar without a success announcement, and moves the keyboard to the next entry", async () => {
      await deleteButton(refinement).click();
      await refinement
        .getByRole("button", { name: "Delete record", exact: true })
        .click();

      await expect(refinement).toHaveCount(0);
      await expect(inRecent("Refinement")).toHaveCount(0);
      await expect(sidebar.entries).toHaveCount(1);
      await expect(
        page.getByText("Session record deleted", { exact: true }),
      ).toHaveCount(0);
      await expect(execution).toBeFocused();
      await expect(cardSessions(card(readyStory))).toHaveCount(1);
      await expect(inRecent("Execution")).toBeVisible();
      await expect(cardAttentionOf(card(readyStory))).toHaveCount(0);
      await expectMembership(page, queued);
      expect(stored()).toContain(kept);
      expect(stored()).not.toContain(deleted);
      expect(
        dashboard.claudeCalls().filter((call) => call.argv[0] === "stop"),
      ).toEqual([]);
    });

    await test.step("deleting the last entry sends the keyboard to the card", async () => {
      await deleteButton(execution).click();
      await execution
        .getByRole("button", { name: "Delete record", exact: true })
        .click();

      await expect(execution).toHaveCount(0);
      await expect(cardSessions(card(readyStory))).toHaveCount(0);
      await expect(inRecent("Execution")).toHaveCount(0);
      await expect(sidebar.entries).toHaveCount(0);
      await expect(card(readyStory)).toBeFocused();
      await expect(
        page.getByText("Session record deleted", { exact: true }),
      ).toHaveCount(0);
      expect(stored()).not.toContain(kept);
      await expectMembership(page, queued);
    });
  });

  test("a Session unavailable entry offers Delete record…, asks, and confirming removes it from its card, Recent sessions and the sidebar", async ({
    page,
    dashboard,
  }) => {
    dashboard.claudeScenario("launched");
    const { card, settled, launch } = await openStoryStagesJourney(
      page,
      stagesJourney,
    );
    const { recentSessions: recent } = parts(page);
    const sidebar = sidebarParts(page);
    await settled();
    await launch(readyStory, "Execution");
    await launch(readyStory, "Refinement");
    const unavailable = cardSessionOf(card(readyStory), "Execution");
    const kept = cardSessionOf(card(readyStory), "Refinement");
    // A launch is finished once its entry names its session; reloading sooner
    // would lose it.
    await sessionNamedBy(kept);
    dashboard.claudeSessionBecomes(
      await sessionNamedBy(unavailable),
      "forgotten",
    );
    await page.reload();
    await settled();
    await sidebar.button.click();
    await expect(sidebar.entries).toHaveCount(2);
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
        name: recentSessionName("Execution", readyStory),
      }),
    ).toHaveCount(0);
    await expect(sidebar.entries).toHaveCount(1);
    await expect(
      page.getByText("Session record deleted", { exact: true }),
    ).toHaveCount(0);
    await expect(cardSessions(card(readyStory))).toHaveCount(1);
    await expect(kept).toBeVisible();
  });

  test("a Working or Needs input entry offers no Delete record…", async ({
    page,
    dashboard,
  }) => {
    dashboard.claudeScenario("launched");
    const { card, settled, launch } = await openStoryStagesJourney(
      page,
      stagesJourney,
    );
    await settled();
    await launch(readyStory, "Refinement");
    await launch(notRefinedStory, "Execution");
    const blocked = cardSessionOf(card(readyStory), "Refinement");
    const working = cardSessionOf(card(notRefinedStory), "Execution");
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
