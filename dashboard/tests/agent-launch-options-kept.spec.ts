// A refused launch's selection in the refinement dialog, on the committed
// origin of ./agent-launch-card.spec.ts (./launchJourney.ts): the launch says
// "Launch failed:" naming the option and keeps the selection for the next
// opening, naming in one quiet line the kept flags the project no longer
// offers, which are not sent; Cancel drops it. The synthetic `claude`
// (./fixtures/fake-claude) stands in for the real one; the boundary's own
// rules are ./agent-launch-options-boundary.spec.ts.

import { rmSync, writeFileSync } from "node:fs";
import type { Locator, Page } from "@playwright/test";
import { checkIntervalMs } from "../src/revisionCheckSchedule.ts";
import { expect, pausePageClockAt, test } from "./dashboardTest.ts";
import {
  untilPageRequestsAnswered,
  whileNotingChecks,
} from "./pageRequestNotes.ts";
import {
  groupedOptions,
  installRefinementSkill,
  openTakenBacklog,
} from "./launchCardPage.ts";
import {
  notRefinedIdentity,
  notRefinedStory,
  publishLaunchJourney,
  type LaunchJourney,
} from "./launchJourney.ts";

let journey: LaunchJourney;
test.beforeAll(async () => {
  test.setTimeout(120_000);
  journey = await publishLaunchJourney();
});
test.afterAll(() => (journey as LaunchJourney | undefined)?.cleanup());

test.use({ projectFolders: ["open-dough"] });

const sent = `/dough-story-refinement ${notRefinedIdentity}`;

// Selects A and C, then the project's definition drops --c after the dialog
// offered it, so Start is refused and the dialog closes.
async function refuseAWithC(
  page: Page,
  file: string,
  refinementDialog: Locator,
) {
  await refinementDialog.getByRole("radio", { name: "A", exact: true }).check();
  await refinementDialog
    .getByRole("checkbox", { name: "C", exact: true })
    .check();
  writeFileSync(
    file,
    JSON.stringify({
      ...groupedOptions,
      options: groupedOptions.options.slice(0, 2),
    }),
  );
  // A refusal immediately rereads the machine's offers. Settle that read
  // before a caller changes the definition or advances the paused clock:
  // the next periodic read is scheduled from this answer, not the refusal.
  await whileNotingChecks(page, async () => {
    await refinementDialog.getByRole("button", { name: "Start" }).click();
    await expect(refinementDialog).toBeHidden();
    await untilPageRequestsAnswered(page);
  });
}

test("a launch the boundary refuses says Launch failed naming the option, and the next opening keeps the selection", async ({
  page,
  dashboard,
}) => {
  const file = installRefinementSkill(dashboard.home);
  writeFileSync(file, JSON.stringify(groupedOptions));
  await pausePageClockAt(page, new Date());
  const { card, refine, refinementDialog } = await openTakenBacklog(
    page,
    journey,
  );

  await refine(notRefinedStory).click();
  await refuseAWithC(page, file, refinementDialog);
  await expect(card(notRefinedStory).locator(".launch-problem")).toContainText(
    "Launch failed: Option --c is not one the installed dough-story-refinement skill",
  );
  expect(dashboard.claudeLaunchCalls()).toEqual([]);

  // The page's next read of the sessions sees the definition without --c.
  await page.clock.runFor(checkIntervalMs);
  dashboard.claudeScenario("launched");
  await refine(notRefinedStory).click();
  await expect(
    refinementDialog.getByRole("radio", { name: "A", exact: true }),
  ).toBeChecked();
  await expect(
    refinementDialog.getByText("Not offered any more, so not sent: --c.", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(refinementDialog).toContainText(`Sent after ${sent} --a.`);
  await refinementDialog.getByRole("button", { name: "Start" }).click();

  await expect(refinementDialog).toBeHidden();
  await expect.poll(() => dashboard.claudeLaunchCalls()).toHaveLength(1);
  expect(dashboard.claudeLaunchCalls()[0]?.argv[3]).toBe(`${sent} --a`);
});

test("a kept selection the project no longer offers at all is named, and Start launches default refinement", async ({
  page,
  dashboard,
}) => {
  const file = installRefinementSkill(dashboard.home);
  writeFileSync(file, JSON.stringify(groupedOptions));
  await pausePageClockAt(page, new Date());
  const { refine, refinementDialog } = await openTakenBacklog(page, journey);

  await refine(notRefinedStory).click();
  await refuseAWithC(page, file, refinementDialog);
  // The definition then goes away, and the page's next read of the sessions
  // says so.
  rmSync(file);
  await page.clock.runFor(checkIntervalMs);

  dashboard.claudeScenario("launched");
  await refine(notRefinedStory).click();
  await expect(
    refinementDialog.getByText("Not offered any more, so not sent: --a, --c.", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(refinementDialog).toContainText(`Sent after ${sent}.`);
  await refinementDialog.getByRole("button", { name: "Start" }).click();

  await expect(refinementDialog).toBeHidden();
  await expect.poll(() => dashboard.claudeLaunchCalls()).toHaveLength(1);
  expect(dashboard.claudeLaunchCalls()[0]?.argv[3]).toBe(sent);
});

test("after a refusal, Cancel drops the kept selection", async ({
  page,
  dashboard,
}) => {
  const file = installRefinementSkill(dashboard.home);
  writeFileSync(file, JSON.stringify(groupedOptions));
  const { refine, refinementDialog } = await openTakenBacklog(page, journey);

  await refine(notRefinedStory).click();
  await refuseAWithC(page, file, refinementDialog);

  await refine(notRefinedStory).click();
  await expect(
    refinementDialog.getByRole("radio", { name: "A", exact: true }),
  ).toBeChecked();
  await refinementDialog.getByRole("button", { name: "Cancel" }).click();
  await refine(notRefinedStory).click();
  await expect(
    refinementDialog.getByRole("radio", { name: "A", exact: true }),
  ).not.toBeChecked();
});
