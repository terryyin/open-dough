// The Sessions sidebar stays as the developer left it. It starts closed;
// open, it stays open across project switches, the agent roster and back, the
// terminal opening and closing, and reloads, since this browser keeps the
// choice; when browser storage cannot be used it starts closed, without
// error, and still toggles. The page's own dashboard server launches and
// attaches the synthetic `claude` (./fixtures/fake-claude); the real one is
// never reached.

import { expect, test } from "./dashboardTest.ts";
import {
  cardSessionOf,
  expectMembership,
  parts,
  rosterParts,
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
import { watchPageErrors } from "./pageErrors.ts";
import { sidebarParts } from "./sessionSidebarPage.ts";
import { openStoryStagesJourney } from "./storyStagesPage.ts";

test.use({ projectFolders: ["open-dough", "doughnut"] });

const queued = {
  taken: [],
  backlog: [takenStory, readyStory, notRefinedStory],
};

test.describe("the Sessions sidebar as left", () => {
  let stagesJourney: StoryStagesJourney;
  test.beforeAll(async () => {
    test.setTimeout(120_000);
    stagesJourney = await publishStoryStagesJourney();
  });
  test.afterAll(() =>
    (stagesJourney as StoryStagesJourney | undefined)?.cleanup(),
  );

  test("starts closed, and once open stays open across a project switch, the roster and back, the terminal, and reloads", async ({
    page,
  }) => {
    const errors = watchPageErrors(page);
    const { settled, card, launch, show } = await openStoryStagesJourney(
      page,
      stagesJourney,
    );
    const { sidebar, button } = sidebarParts(page);
    const { project, taken } = parts(page);
    const panel = page.getByRole("region", { name: "Terminal" });
    const expectOpen = async () => {
      await expect(sidebar).toBeVisible();
      await expect(button).toHaveAttribute("aria-expanded", "true");
    };
    await expectMembership(page, queued);
    await settled();
    await expect(sidebar).toBeHidden();
    await button.click();
    await expectOpen();

    await test.step("switching project and back", async () => {
      await project
        .getByRole("radio", { name: "Doughnut", exact: true })
        .check();
      await expectMembership(page, {
        taken: [],
        backlog: [doughnutSharedTitle],
      });
      await expectOpen();
      await project
        .getByRole("radio", { name: "Open Dough", exact: true })
        .check();
      await expectMembership(page, queued);
      await expectOpen();
    });

    await test.step("opening and closing the terminal", async () => {
      await settled();
      await launch(readyStory, "Execution");
      const entry = cardSessionOf(card(readyStory), "Execution");
      await sessionNamedBy(entry);
      await entry.getByRole("button", { name: "Open terminal" }).click();
      await expect(panel).toBeVisible();
      await expectOpen();
      await panel.getByRole("button", { name: "Close" }).click();
      await expect(panel).toHaveCount(0);
      await expectOpen();
    });

    await test.step("opening the agent roster and going back to the stories", async () => {
      const { roster, back } = rosterParts(page);
      await show(stagesJourney.taken);
      const takenCard = taken.getByRole("article", { name: readyStory });
      await takenCard.getByRole("button", { name: "Inspect story" }).click();
      await takenCard
        .getByRole("button", { name: /in the agent roster$/ })
        .first()
        .click();
      await expect(roster).toBeVisible();
      await expectOpen();
      await back.click();
      await expect(roster).toBeHidden();
      await expect(takenCard).toBeVisible();
      await expectOpen();
    });

    await test.step("reloading, open or closed as left", async () => {
      await page.reload();
      await expectOpen();
      await button.click();
      await expect(sidebar).toBeHidden();
      await page.reload();
      await expect(button).toHaveAttribute("aria-expanded", "false");
      await expect(sidebar).toBeHidden();
    });
    expect(errors).toEqual([]);
  });

  test("starts closed without error, and still toggles, when browser storage cannot be used", async ({
    page,
  }) => {
    const errors = watchPageErrors(page);
    await page.addInitScript(() => {
      const refused = () => {
        throw new DOMException("Storage is refused.", "SecurityError");
      };
      Object.defineProperty(window, "localStorage", {
        configurable: true,
        get: refused,
      });
    });
    const { settled } = await openStoryStagesJourney(page, stagesJourney);
    const { sidebar, button } = sidebarParts(page);
    await expectMembership(page, queued);
    await settled();
    await expect(
      page.evaluate(() => window.localStorage.getItem("any")),
    ).rejects.toThrow("Storage is refused.");
    await expect(sidebar).toBeHidden();
    await button.click();
    await expect(sidebar).toBeVisible();
    await page.keyboard.press("Meta+b");
    await expect(sidebar).toBeHidden();
    await page.keyboard.press("Meta+b");
    await expect(sidebar).toBeVisible();
    await page.reload();
    await expectMembership(page, queued);
    await expect(button).toHaveAttribute("aria-expanded", "false");
    await expect(sidebar).toBeHidden();
    expect(errors).toEqual([]);
  });
});
