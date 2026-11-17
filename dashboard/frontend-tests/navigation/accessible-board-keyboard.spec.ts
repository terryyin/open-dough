import { type Locator } from "@playwright/test";
import { expect, test } from "../../tests/support/frontendApp.ts";
import { putFrontendBacklog } from "../../tests/support/frontendServiceState.ts";
import {
  expectFocusedAndIndicated,
  expectTabOrder,
  tabTo,
} from "../../tests/accessibleReading.ts";
import { parts, expectMembership } from "../../tests/dashboardPage.ts";
import {
  canonicalRecord,
  enabledStoryCardLaunchActions,
  storyNotesControl,
} from "../../tests/storyCardControls.ts";
import { storyDetail } from "../../tests/storyCardSelection.ts";
import { backlogB, revisionB, titlesOfB } from "../../tests/refreshJourney.ts";

test("accessible Board is read by keyboard in reading order, with visible focus, and Enter follows a link", async ({
  page,
  frontendServices,
}) => {
  putFrontendBacklog(frontendServices, {
    revision: revisionB,
    backlog: backlogB,
  });
  // A record link leaves for the hosting provider, which answers nothing here.
  await page
    .context()
    .route("https://github.com/**", (route) => route.fulfill({ body: "" }));
  await page.goto("/");
  await expectMembership(page, titlesOfB);
  const { project, development, directionToggle, backlog, taken } = parts(page);

  // Reading order is the order of the page's source: Sessions, the
  // perspective, the project selector, System settings, then direction, Start session and the badge
  // legend, then each card's controls by column (Backlog, then Taken): a
  // Backlog card's enabled launch actions, then Inspect story and Notes. A card's recorded
  // links are in its detail, not its scan view. In a wide window Taken stands
  // beside Backlog's first card, so position on screen would order them
  // differently.
  const stopsFor = async (column: Locator) => {
    const stops: Locator[] = [];
    for (const card of await column.getByRole("article").all()) {
      if (column === backlog) {
        // This Board fixture publishes backlog bytes only: execution stays gated
        // while canonical dependency facts are unavailable; refinement is a stop.
        await expect(
          card.getByRole("button", { name: "Start execution" }),
        ).toBeDisabled();
        await expect(
          card.getByRole("button", { name: "Start execution" }),
        ).toHaveAccessibleDescription(/dependency facts could not be read/);
        await expect(
          card.getByRole("button", { name: "Start refinement" }),
        ).toBeEnabled();
        stops.push(...(await enabledStoryCardLaunchActions(card)));
      }
      stops.push(card.getByRole("button", { name: "Inspect story" }));
      stops.push(storyNotesControl(card));
      await expect(card.getByRole("link")).toHaveCount(0);
    }
    return stops;
  };
  const selectedProject = project.getByRole("radio", { checked: true });
  const stops = [
    page.getByRole("button", { name: "Sessions", exact: true }),
    development,
    selectedProject,
    page.getByRole("button", { name: "System settings", exact: true }),
    directionToggle,
    page.getByRole("button", { name: "Start session in Open Dough" }),
    parts(page).preparationHelp,
    ...(await stopsFor(backlog)),
    ...(await stopsFor(taken)),
  ];
  // Sessions + selected perspective radio + selected project radio + System
  // settings + Direction + Start session + Legend + two Backlog cards' enabled
  // launch actions + four pairs of Inspect story and Notes.
  expect(stops).toHaveLength(7 + 2 + 4 * 2);

  await test.step("Tab stops at Sessions, the banner's controls, and each card's controls, and nowhere else", async () => {
    await expectTabOrder(page, stops);
    // The column container, cards, and all three columns take focus only when it is
    // returned to them.
    await expect(page.locator("[tabindex='-1']")).toHaveCount(1 + 4 + 3);
    await expect(page.locator("[tabindex='0']:visible")).toHaveCount(0);
  });

  await test.step("the keyboard is not held: Tab leaves the page and Shift+Tab walks back", async () => {
    await page.keyboard.press("Tab");
    for (const stop of stops) {
      await expect(stop).not.toBeFocused();
    }
    await expectTabOrder(page, [...stops].reverse(), "Shift+Tab");
  });

  await test.step("Enter on Inspect story reveals the card's recorded links next in reading order, and Enter on one leaves for its record at the inspected revision", async () => {
    // Sessions holds focus after the reverse walk;
    // Tab walks on in reading order to the first card's Inspect story.
    const first = backlog.getByRole("article").first();
    const inspect = first.getByRole("button", { name: "Inspect story" });
    await tabTo(page, inspect);
    await expect(inspect).toBeFocused();
    await page.keyboard.press("Enter");
    const hide = first.getByRole("button", { name: "Hide detail" });
    await expect(hide).toBeFocused();
    const canonical = canonicalRecord(storyDetail(first));
    const notes = storyNotesControl(first);
    await expectTabOrder(page, [notes, canonical]);
    const [popup, leaving] = await Promise.all([
      page.waitForEvent("popup"),
      page
        .context()
        .waitForEvent("request", (request) => request.isNavigationRequest()),
      page.keyboard.press("Enter"),
    ]);
    expect(new URL(leaving.url()).pathname).toBe(
      `/terryyin/open-dough/blob/${revisionB}/.planning/seeds/SEED-008-sync.md`,
    );
    await popup.close();
    // Hide detail returns the keyboard to the same story's card.
    await expectTabOrder(page, [notes, hide], "Shift+Tab");
    await page.keyboard.press("Enter");
    await expectFocusedAndIndicated(page, first);
    await expect(first.getByRole("link")).toHaveCount(0);
  });
});
