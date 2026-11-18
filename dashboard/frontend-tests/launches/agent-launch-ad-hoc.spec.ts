// Start session sits at the end of the project actions, named for the
// selected project and hidden with the roster; it stays offered while the
// published read is still reading or after it failed; its dialog names the
// project and host, opens empty with focus in its field, and Escape or Cancel
// ask for nothing and return the keyboard. Built frontend against controlled
// answers; a started session in the selected project's folder is
// ../../../e2e/launches/agent-launch-ad-hoc.spec.ts.

import {
  expect,
  openFrontendTakenBacklog,
  test,
} from "../../test-support/support/frontendApp.ts";
import { installFrontendLaunchBoundary } from "../../test-support/support/frontendLaunchSubstitutes.ts";
import {
  openDoughSource,
  pygardonSource,
} from "../../test-support/support/frontendServiceState.ts";
import {
  authenticatedReadRoute,
  holdAuthenticatedReadsWhere,
} from "../../test-support/holdAuthenticatedReads.ts";
import {
  startSession,
  startSessionDialog,
  startSessionField,
} from "../../test-support/launchStoryCardPage.ts";
import { chooseProject, parts } from "../../test-support/dashboardPage.ts";

const releases: (() => void)[] = [];
test.afterEach(() => {
  for (const release of releases.splice(0)) release();
});

test("Start session sits at the end opposite Near-future direction beside the help, is named for the selected project, and is hidden with the roster", async ({
  page,
  frontendServices,
}) => {
  frontendServices.projects.push(pygardonSource);
  await openFrontendTakenBacklog(page);
  const { directionToggle, preparationHelp } = parts(page);
  const button = startSession(page, "Open Dough");

  await expect(button).toHaveText("Start session");
  await expect(button).toBeEnabled();
  const [direction, start, help] = await Promise.all([
    directionToggle.boundingBox(),
    button.boundingBox(),
    preparationHelp.boundingBox(),
  ]);
  if (!direction || !start || !help) throw new Error("not laid out");
  expect(start.x).toBeGreaterThan(direction.x + direction.width);
  expect(start.x + start.width).toBeLessThanOrEqual(help.x + 1);
  expect(
    Math.abs(start.y + start.height / 2 - (help.y + help.height / 2)),
  ).toBeLessThan(start.height);

  await chooseProject(page, "Pygardon");
  await expect(startSession(page, "Pygardon")).toBeVisible();
  await expect(button).toHaveCount(0);

  await page.goto("/?project=pygardon&view=roster");
  await expect(startSession(page, "Pygardon")).toBeHidden();
});

test("Start session is offered while the published read is still reading", async ({
  page,
}) => {
  await holdAuthenticatedReadsWhere(page, () => true, releases);
  await page.goto("/");

  await expect(parts(page).reading).toBeVisible();
  await expect(startSession(page, "Open Dough")).toBeEnabled();
});

test("Start session is offered after the published read failed", async ({
  page,
}) => {
  await page.route(authenticatedReadRoute, (route) =>
    route.fulfill({
      status: 502,
      contentType: "application/json",
      body: JSON.stringify({
        error: `GitHub could not be reached for ${openDoughSource.repository}.`,
        recovery: "transient",
      }),
    }),
  );
  await page.goto("/");
  await expect(parts(page).problem).toBeVisible();
  await expect(startSession(page, "Open Dough")).toBeEnabled();
});

test("the dialog names the project and Claude Code, says the session has no story or skill, starts empty with focus in its field, and Escape or Cancel send nothing", async ({
  page,
}) => {
  const boundary = await installFrontendLaunchBoundary(page);
  await openFrontendTakenBacklog(page);
  const button = startSession(page, "Open Dough");
  const dialog = startSessionDialog(page, "Open Dough");

  await button.click();
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText(
    "Claude Code starts a background session on this machine, in this project's folder, with no story or skill.",
  );
  await expect(startSessionField(dialog)).toBeFocused();
  await expect(startSessionField(dialog)).toHaveValue("");
  await expect(dialog.getByRole("button", { name: "Start" })).toBeEnabled();
  await startSessionField(dialog).fill("never sent");
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(button).toBeFocused();

  await button.click();
  await expect(startSessionField(dialog)).toHaveValue("");
  await dialog.getByRole("button", { name: "Cancel" }).click();
  await expect(dialog).toBeHidden();
  await expect(button).toBeFocused();
  expect(boundary.acceptances).toEqual([]);
});
