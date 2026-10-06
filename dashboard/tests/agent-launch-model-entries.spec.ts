// A session entry says which model was requested, on the committed origin of
// ./agent-launch-card.spec.ts (./launchJourney.ts): wherever the page lists a
// session -- its story's card, Taken, the Sessions sidebar -- the
// entry reads "Model: <Name> (requested)" for a chosen model and says nothing
// for Default, and a reload keeps the line, which is read from the launch
// record. How a dialog sends the choice is ./agent-launch-model.spec.ts. The
// page's own dashboard server drives the synthetic `claude`
// (./fixtures/fake-claude); the real one is never reached.

import type { Page } from "@playwright/test";
import { expect, test } from "./dashboardTest.ts";
import { cardSessions, parts } from "./dashboardPage.ts";
import {
  openTakenBacklog,
  startSession,
  startSessionDialog,
} from "./launchCardPage.ts";
import {
  publishLaunchJourney,
  readyStory,
  type LaunchJourney,
} from "./launchJourney.ts";
import {
  expectTooltipLine,
  sidebarParts,
  sidebarTooltipOf,
} from "./sessionSidebarPage.ts";

let journey: LaunchJourney;
test.beforeAll(async () => {
  test.setTimeout(120_000);
  journey = await publishLaunchJourney();
});
test.afterAll(() => (journey as LaunchJourney | undefined)?.cleanup());

test.use({ projectFolders: ["open-dough"] });

const requested = (name: string) => `Model: ${name} (requested)`;

// Starts the session in the open dialog with the model chosen, or Default.
async function startWith(page: Page, model: string | undefined) {
  const dialog = page.getByRole("dialog");
  if (model !== undefined) {
    await dialog.getByRole("combobox", { name: "Model" }).selectOption({
      label: model,
    });
  }
  await dialog.getByRole("button", { name: "Start" }).click();
  await expect(dialog).toBeHidden();
}

// Closes the terminal an ad hoc launch opens at once.
async function closeTerminal(page: Page) {
  const panel = page.getByRole("region", { name: "Terminal" });
  await expect(panel.locator(".xterm-rows")).toContainText("attached");
  await panel.getByRole("button", { name: "Close" }).click();
  await expect(panel).toHaveCount(0);
}

for (const [model, words] of [
  ["Opus", requested("Opus")],
  [undefined, undefined],
] as const) {
  test(`a story session launched on ${model ?? "Default"} ${
    words === undefined ? "shows no model" : "says so"
  } on its card and in the sidebar, through a reload`, async ({
    page,
    dashboard,
  }) => {
    dashboard.claudeScenario("launched");
    const { card, start } = await openTakenBacklog(page, journey);
    const { recentlyDone } = parts(page);
    const { button, sidebar } = sidebarParts(page);

    await start(readyStory).click();
    await startWith(page, model);

    const entry = cardSessions(card(readyStory));
    const expectWords = async () => {
      await expect(recentlyDone.getByRole("article")).toHaveCount(0);
      if ((await button.getAttribute("aria-expanded")) !== "true") {
        await button.click();
      }
      await expect(entry).toHaveCount(1);
      await expect(entry).toContainText("Execution");
      if (words === undefined) {
        await expect(entry).not.toContainText("Model:");
      } else {
        await expect(entry).toContainText(words);
      }
      const row = sidebar.getByRole("listitem");
      await expect(row).toHaveCount(1);
      await expect(sidebarTooltipOf(row)).toHaveAttribute("title", /Execution/);
      if (words === undefined) {
        await expect(sidebarTooltipOf(row)).not.toHaveAttribute(
          "title",
          /Model:/,
        );
      } else {
        await expectTooltipLine(row, words);
      }
    };

    await expectWords();
    await page.reload();
    await expect(cardSessions(card(readyStory))).toHaveCount(1);
    await expectWords();
  });
}

test("an ad hoc session launched on Sonnet says so in Taken and in the sidebar, through a reload", async ({
  page,
  dashboard,
}) => {
  dashboard.claudeScenario("launched");
  await openTakenBacklog(page, journey);
  const { taken, recentlyDone } = parts(page);
  const { button, sidebar } = sidebarParts(page);

  await startSession(page, "Open Dough").click();
  await expect(startSessionDialog(page, "Open Dough")).toBeVisible();
  await startWith(page, "Sonnet");
  await closeTerminal(page);

  const expectWords = async () => {
    if ((await button.getAttribute("aria-expanded")) !== "true") {
      await button.click();
    }
    const entry = taken.locator(".session-entry");
    await expect(entry).toHaveCount(1);
    await expect(recentlyDone.locator(".session-entry")).toHaveCount(0);
    await expect(entry).toContainText("Ad hoc");
    await expect(entry).toContainText(requested("Sonnet"));
    const tooltip = sidebarTooltipOf(sidebar.getByRole("listitem"));
    await expect(tooltip).toHaveCount(1);
    await expect(tooltip).toHaveAttribute("title", /Ad hoc/);
    await expectTooltipLine(sidebar.getByRole("listitem"), requested("Sonnet"));
  };

  await expectWords();
  await page.reload();
  await expect(taken.locator(".session-entry")).toHaveCount(1);
  await expectWords();
});
