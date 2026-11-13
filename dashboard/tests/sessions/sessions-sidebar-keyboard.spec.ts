// Command+B toggles the Sessions sidebar page-wide, from the page and from
// inside the terminal, leaving the keyboard where it was, and takes the key
// from the browser; Ctrl+B in the terminal still reaches the session. An open
// dialog, as the launch dialog or the badge legend, keeps Command+B. The
// page's own dashboard server launches and attaches the synthetic `claude`
// (./fixtures/fake-claude), which records each line entered in its terminal;
// the real one is never reached.

import { expect, test } from "../dashboardTest.ts";
import {
  openTerminalControl,
  terminalPanel,
  terminalScreenParts,
} from "../terminalScreenPage.ts";
import {
  storyCardSessionOf,
  expectMembership,
  parts,
  sessionNamedBy,
} from "../dashboardPage.ts";
import {
  notRefinedStory,
  publishStoryColumnsJourney,
  readyStory,
  takenStory,
  type StoryColumnsJourney,
} from "../launchJourney.ts";
import {
  expectSessionsSidebar,
  sessionsSidebarParts,
} from "../sessionsSidebarPage.ts";
import { openStoryColumnsJourney } from "../storyColumnsPage.ts";
import {
  expectKeyboardAtMark,
  keyboardWithin,
  markKeyboardPlace,
  watchCommandShortcut,
} from "../pageShortcutsPage.ts";

test.use({ projectFolders: ["open-dough", "doughnut"] });

const queued = {
  taken: [],
  backlog: [takenStory, readyStory, notRefinedStory],
};

test.describe("Command+B and the Sessions sidebar", () => {
  let columnsJourney: StoryColumnsJourney;
  test.beforeAll(async () => {
    columnsJourney = await publishStoryColumnsJourney();
  });
  test.afterAll(() =>
    (columnsJourney as StoryColumnsJourney | undefined)?.cleanup(),
  );

  test("Command+B toggles from the page and from the terminal without moving the keyboard, and Ctrl+B reaches the session", async ({
    page,
    dashboard,
  }) => {
    const { settled, card, launch } = await openStoryColumnsJourney(
      page,
      columnsJourney,
    );
    const panel = terminalPanel(page);
    await expectMembership(page, queued);
    await settled();

    await test.step("from the page, the keyboard stays where it was and the browser's default is taken", async () => {
      const commandB = await watchCommandShortcut(page, "Meta+b");
      const inspect = card(takenStory).getByRole("button", {
        name: "Inspect story",
      });
      await inspect.focus();
      expect(await markKeyboardPlace(page)).toBe("BUTTON");
      await page.keyboard.press("Meta+b");
      await expectSessionsSidebar(page, "open");
      await expectKeyboardAtMark(page);
      await page.keyboard.press("Meta+b");
      await expectSessionsSidebar(page, "closed");
      await expectKeyboardAtMark(page);
      await expectMembership(page, queued);
      expect(await commandB()).toEqual([true, true]);
    });

    await test.step("from inside the terminal, it toggles and the keyboard stays in the terminal, while Ctrl+B reaches the session", async () => {
      await launch(readyStory, "Execution");
      const entry = storyCardSessionOf(card(readyStory), "Execution");
      const session = await sessionNamedBy(entry);
      await openTerminalControl(entry).click();
      const attach = () =>
        dashboard
          .claudeAttaches()
          .find((attached) => attached.id === session.slice(0, 8));
      await expect.poll(() => attach()?.id).toBeDefined();
      await expect(terminalScreenParts(panel).rows).toContainText(
        `attached ${session.slice(0, 8)}`,
      );
      expect(await keyboardWithin(panel)).toBe(true);
      await markKeyboardPlace(page);

      await page.keyboard.press("Meta+b");
      await expectSessionsSidebar(page, "open");
      await expectKeyboardAtMark(page);
      await page.keyboard.press("Meta+b");
      await expectSessionsSidebar(page, "closed");
      await expectKeyboardAtMark(page);

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
    const { settled, action } = await openStoryColumnsJourney(
      page,
      columnsJourney,
    );
    const { button } = sessionsSidebarParts(page);
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
      expect(await keyboardWithin(dialog)).toBe(true);
      await expectSessionsSidebar(page, "closed");
      await page.keyboard.press("Escape");
      await expect(dialog).toBeHidden();
    });

    await test.step("the badge legend, with the sidebar open", async () => {
      await button.click();
      await expectSessionsSidebar(page, "open");
      const legend = page.getByRole("dialog", { name: "Preparation badges" });
      await preparationHelp.click();
      await expect(legend).toBeVisible();
      await page.keyboard.press("Meta+b");
      await expect(legend).toBeVisible();
      await expectSessionsSidebar(page, "open");
      await legend.getByRole("button", { name: "Close", exact: true }).click();
      await expect(legend).toBeHidden();
    });

    // Neither dialog's Command+B was taken from it.
    expect(await commandB()).toEqual([false, false]);
    await expectMembership(page, queued);
  });
});
