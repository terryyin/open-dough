// Command+B toggles the Sessions sidebar page-wide, from the page and from
// inside the terminal, leaving the keyboard where it was, and takes the key
// from the browser; Ctrl+B in the terminal still reaches the session. An open
// dialog, as the launch dialog or the badge legend, keeps Command+B. The
// page's own dashboard server launches and attaches the synthetic `claude`
// (./fixtures/fake-claude), which records each line entered in its terminal;
// the real one is never reached.

import type { Page } from "@playwright/test";
import { expect, test } from "./dashboardTest.ts";
import {
  cardSessionOf,
  expectMembership,
  parts,
  sessionNamedBy,
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
import { watchCommandShortcut } from "./pageShortcutsPage.ts";

test.use({ projectFolders: ["open-dough", "doughnut"] });

const queued = {
  taken: [],
  backlog: [takenStory, readyStory, notRefinedStory],
};

// The element holding the keyboard, marked so a later reading can tell it is
// still the same one.
async function markFocused(page: Page): Promise<string> {
  return page.evaluate(() => {
    const focused = document.activeElement;
    if (!(focused instanceof HTMLElement) || focused === document.body) {
      return "";
    }
    focused.dataset.keyboardWasHere = "yes";
    return focused.tagName;
  });
}

const stillFocused = (page: Page) =>
  page.evaluate(
    () =>
      document.activeElement instanceof HTMLElement &&
      document.activeElement.dataset.keyboardWasHere === "yes",
  );

test.describe("Command+B and the Sessions sidebar", () => {
  let stagesJourney: StoryStagesJourney;
  test.beforeAll(async () => {
    test.setTimeout(120_000);
    stagesJourney = await publishStoryStagesJourney();
  });
  test.afterAll(() =>
    (stagesJourney as StoryStagesJourney | undefined)?.cleanup(),
  );

  test("Command+B toggles from the page and from the terminal without moving the keyboard, and Ctrl+B reaches the session", async ({
    page,
    dashboard,
  }) => {
    const { settled, card, launch } = await openStoryStagesJourney(
      page,
      stagesJourney,
    );
    const { sidebar, button } = sidebarParts(page);
    const panel = page.getByRole("region", { name: "Terminal" });
    await expectMembership(page, queued);
    await settled();

    await test.step("from the page, the keyboard stays where it was and the browser's default is taken", async () => {
      const commandB = await watchCommandShortcut(page, "Meta+b");
      const inspect = card(takenStory).getByRole("button", {
        name: "Inspect story",
      });
      await inspect.focus();
      expect(await markFocused(page)).toBe("BUTTON");
      await page.keyboard.press("Meta+b");
      await expect(sidebar).toBeVisible();
      await expect(button).toHaveAttribute("aria-expanded", "true");
      expect(await stillFocused(page)).toBe(true);
      await page.keyboard.press("Meta+b");
      await expect(sidebar).toBeHidden();
      expect(await stillFocused(page)).toBe(true);
      await expectMembership(page, queued);
      expect(await commandB()).toEqual([true, true]);
    });

    await test.step("from inside the terminal, it toggles and the keyboard stays in the terminal, while Ctrl+B reaches the session", async () => {
      await launch(readyStory, "Execution");
      const entry = cardSessionOf(card(readyStory), "Execution");
      const session = await sessionNamedBy(entry);
      await entry.getByRole("button", { name: "Open terminal" }).click();
      const attach = () =>
        dashboard
          .claudeAttaches()
          .find((attached) => attached.id === session.slice(0, 8));
      await expect.poll(() => attach()?.id).toBeDefined();
      await expect(panel.locator(".xterm-rows")).toContainText(
        `attached ${session.slice(0, 8)}`,
      );
      expect(
        await panel.evaluate((element) =>
          element.contains(document.activeElement),
        ),
      ).toBe(true);
      await markFocused(page);

      await page.keyboard.press("Meta+b");
      await expect(sidebar).toBeVisible();
      expect(await stillFocused(page)).toBe(true);
      await page.keyboard.press("Meta+b");
      await expect(sidebar).toBeHidden();
      expect(await stillFocused(page)).toBe(true);

      await page.keyboard.type("x");
      await page.keyboard.press("Control+b");
      await page.keyboard.type("y");
      await page.keyboard.press("Enter");
      // Command+B sent the session nothing; Ctrl+B reached it untouched.
      await expect.poll(() => attach()?.lines).toEqual(["x\u0002y"]);
    });
  });

  test("an open launch dialog or badge legend keeps Command+B, and the sidebar stays as it was", async ({
    page,
  }) => {
    const { settled, action } = await openStoryStagesJourney(
      page,
      stagesJourney,
    );
    const { sidebar, button } = sidebarParts(page);
    const { preparationHelp } = parts(page);
    await expectMembership(page, queued);
    await settled();
    const commandB = await watchCommandShortcut(page, "Meta+b");

    await test.step("the launch dialog, with the sidebar closed", async () => {
      const dialog = page.getByRole("dialog", {
        name: "Start execution in Claude Code",
      });
      await action(readyStory, "Execution").click();
      await expect(dialog).toBeVisible();
      await page.keyboard.press("Meta+b");
      await expect(dialog).toBeVisible();
      await expect(
        dialog.evaluate((element) => element.contains(document.activeElement)),
      ).resolves.toBe(true);
      await expect(button).toHaveAttribute("aria-expanded", "false");
      await expect(sidebar).toBeHidden();
      await page.keyboard.press("Escape");
      await expect(dialog).toBeHidden();
    });

    await test.step("the badge legend, with the sidebar open", async () => {
      await button.click();
      await expect(sidebar).toBeVisible();
      const legend = page.getByRole("dialog", { name: "Preparation badges" });
      await preparationHelp.click();
      await expect(legend).toBeVisible();
      await page.keyboard.press("Meta+b");
      await expect(legend).toBeVisible();
      await expect(button).toHaveAttribute("aria-expanded", "true");
      await expect(sidebar).toBeVisible();
      await legend.getByRole("button", { name: "Close", exact: true }).click();
      await expect(legend).toBeHidden();
    });

    // Neither dialog's Command+B was taken from it.
    expect(await commandB()).toEqual([false, false]);
    await expectMembership(page, queued);
  });
});
