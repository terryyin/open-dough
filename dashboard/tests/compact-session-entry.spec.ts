// The accepted Compact card hierarchy, through the real synthetic-host launch:
// status and main access stay visible, routine facts and lifecycle controls
// disclose independently, and keyboard/narrow reading keeps both reachable.
import { expect, test } from "./dashboardTest.ts";
import {
  parts,
  sessionNamedBy,
  sessionStateOf,
  storyCardSessions,
} from "./dashboardPage.ts";
import { openTakenBacklog } from "./launchStoryCardPage.ts";
import { readyStory } from "./launchJourney.ts";
import { reloadUntilRead } from "./pageRequestNotes.ts";
import { workingCursorTest } from "./support/cursorStart.ts";
import { openTakenCursorSession } from "./support/cursorSessionReading.ts";

test.use({ projectFolders: ["open-dough"] });

test("a compact session discloses technical details and secondary actions without hiding attention or terminal access", async ({
  page,
  dashboard,
  launchJourney,
}) => {
  dashboard.claudeScenario("launched");
  const { card, start, dialog } = await openTakenBacklog(page, launchJourney);
  await expect(
    card(readyStory).getByText("Ready for execution", { exact: true }),
  ).toBeVisible();
  await start(readyStory).click();
  await dialog
    .getByRole("combobox", { name: "Model" })
    .selectOption({ label: "Sonnet" });
  await dialog.getByRole("button", { name: "Start", exact: true }).click();
  await expect(dialog).toBeHidden();
  const entry = storyCardSessions(card(readyStory));
  await expect(sessionStateOf(entry)).toHaveText("Working");
  const id = await sessionNamedBy(entry);
  const details = entry.getByRole("button", {
    name: "Session details",
    exact: true,
  });
  await expect(details).toHaveAttribute("aria-expanded", "false");
  await expect(entry.getByText(`Session ${id}`, { exact: true })).toBeHidden();
  await expect(
    entry.getByText("Model: Sonnet (requested)", { exact: true }),
  ).toBeVisible();
  await expect(entry.getByText("Claude Code", { exact: true })).toBeVisible();
  await expect(
    card(readyStory).getByText("Ready for execution", { exact: true }),
  ).toBeHidden();
  await card(readyStory)
    .getByRole("button", { name: "Inspect story", exact: true })
    .click();
  await expect(card(readyStory).getByText(/^Assessment: Ready/)).toBeVisible();
  await card(readyStory)
    .getByRole("button", { name: "Hide detail", exact: true })
    .click();
  await expect(
    entry.getByRole("button", { name: "Open terminal", exact: true }),
  ).toBeVisible();
  await expect(
    entry.getByRole("button", { name: "Mark as done", exact: true }),
  ).toBeHidden();

  await details.focus();
  await page.keyboard.press("Enter");
  await expect(details).toHaveAttribute("aria-expanded", "true");
  await expect(entry.getByText(`Session ${id}`, { exact: true })).toBeVisible();
  await page.keyboard.press("Space");
  await expect(details).toHaveAttribute("aria-expanded", "false");
  await expect(details).toBeFocused();

  const open = entry.getByRole("button", {
    name: "Open terminal",
    exact: true,
  });
  await open.click();
  const terminal = page.getByRole("region", { name: "Terminal", exact: true });
  await expect(terminal.locator(".xterm-rows")).toContainText("attached");
  await terminal.getByRole("button", { name: "Close", exact: true }).click();
  await expect(open).toBeFocused();

  const actions = entry.getByRole("button", {
    name: "More session actions",
    exact: true,
  });
  await actions.focus();
  await page.keyboard.press("Enter");
  await expect(actions).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Escape");
  await expect(actions).toHaveAttribute("aria-expanded", "false");
  await expect(actions).toBeFocused();
  await page.keyboard.press("Space");
  await entry
    .getByRole("button", { name: "Mark as done", exact: true })
    .click();
  const keep = entry.getByRole("button", { name: "Keep open", exact: true });
  await expect(keep).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(
    entry.getByRole("button", { name: "Mark as done", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(actions).toHaveAttribute("aria-expanded", "false");
  await expect(actions).toBeFocused();

  dashboard.claudeSessionBecomes(
    id,
    "blocked",
    "Review the migration before continuing.",
  );
  await reloadUntilRead(page);
  await expect(sessionStateOf(entry)).toHaveText(
    "Needs input: Review the migration before continuing.",
  );
  await expect(details).toHaveAttribute("aria-expanded", "false");
  await expect(open).toBeVisible();
  await page.setViewportSize({ width: 360, height: 800 });
  await details.click();
  await expect(entry.getByText(`Session ${id}`, { exact: true })).toBeVisible();
  const bounds = await entry.boundingBox();
  if (bounds === null) throw new Error("The session entry is not laid out.");
  expect(bounds.width).toBeLessThanOrEqual(360);
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(360);
  await expect(parts(page).recentlyDone.locator(".session-entry")).toHaveCount(
    0,
  );
});

workingCursorTest(
  "a working Cursor entry keeps its resume command selectable and reports copied, refused and unavailable clipboard access truthfully",
  async ({ page, origin }) => {
    workingCursorTest.setTimeout(120_000);
    const entry = await openTakenCursorSession(page, origin, "auto");
    await page
      .getByRole("region", { name: "Terminal" })
      .getByRole("button", { name: "Close", exact: true })
      .click();
    await expect(sessionStateOf(entry)).toHaveText("Working");
    await expect(entry.getByText("Cursor", { exact: true })).toBeVisible();
    await expect(
      entry.getByText("Model: auto (requested)", { exact: true }),
    ).toBeVisible();
    const details = entry.getByRole("button", {
      name: "Session details",
      exact: true,
    });
    await expect(details).toHaveAttribute("aria-expanded", "false");
    await expect(
      entry.locator("p", { hasText: /^Continue in Cursor:/ }),
    ).toBeHidden();
    await details.click();
    const commandLine = entry.locator("p", { hasText: /^Continue in Cursor:/ });
    const command = await commandLine.locator("code").textContent();
    await expect(commandLine).toBeVisible();
    await expect(entry.locator("p", { hasText: /^Workspace / })).toHaveCount(1);
    await page.evaluate(() =>
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: {
          writeText: (text: string) => {
            document.documentElement.dataset["copiedCommand"] = text;
            return Promise.resolve();
          },
        },
      }),
    );
    const copy = entry.getByRole("button", {
      name: "Copy resume command",
      exact: true,
    });
    await copy.click();
    await expect(entry.getByRole("status")).toHaveText(
      "Resume command copied.",
    );
    expect(
      await page.evaluate(
        () => document.documentElement.dataset["copiedCommand"],
      ),
    ).toBe(command);
    const refusal =
      "The resume command could not be copied. Select it in Session details.";
    await page.evaluate(() =>
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: {
          writeText: () => Promise.reject(new Error("Clipboard access denied")),
        },
      }),
    );
    await copy.click();
    await expect(entry.getByRole("status")).toHaveText(refusal);
    await page.evaluate(() =>
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: undefined,
      }),
    );
    await copy.click();
    await expect(entry.getByRole("status")).toHaveText(refusal);
    await expect(commandLine.locator("code")).toHaveText(command ?? "");
    await details.click();
    await expect(entry.getByRole("status")).toBeVisible();
    await expect(
      entry.getByRole("button", { name: "Open terminal", exact: true }),
    ).toBeVisible();
  },
);
