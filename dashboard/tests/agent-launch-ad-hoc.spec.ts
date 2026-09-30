// Starting an ad hoc session from the project actions row, on the committed
// origin of ./agent-launch-card.spec.ts (./launchJourney.ts): Start session
// is offered for the selected project whatever the published read is doing,
// its dialog sends the optional text to the Open Dough or Pygardon folder, and
// the session then reads in Recent sessions and the Sessions sidebar without
// any card listing it. The page's own dashboard server launches the synthetic
// `claude` (./fixtures/fake-claude); the real one is never reached. How the
// launch boundary names the session is ./agent-launch-ad-hoc-boundary.spec.ts.

import { realpathSync } from "node:fs";
import path from "node:path";
import type { Locator, Page } from "@playwright/test";
import { expect, test } from "./dashboardTest.ts";
import {
  openTakenBacklog,
  startSession,
  startSessionDialog,
} from "./launchCardPage.ts";
import { expectMembership, parts, sessionNamedBy } from "./dashboardPage.ts";
import {
  notRefinedStory,
  publishLaunchJourney,
  readyStory,
  takenStory,
  type LaunchJourney,
} from "./launchJourney.ts";
import {
  noConnection,
  publishMovingOrigin,
  publishOrigin,
} from "./publishedOrigin.ts";
import { sidebarParts } from "./sessionSidebarPage.ts";

let journey: LaunchJourney;
// Publishing runs production backlog commands against a local origin; give
// it its own budget so a busy machine cannot starve it.
test.beforeAll(async () => {
  test.setTimeout(120_000);
  journey = await publishLaunchJourney();
});
// A setup that failed leaves nothing to clean up.
test.afterAll(() => (journey as LaunchJourney | undefined)?.cleanup());

test.use({ projectFolders: ["open-dough", "pygardon"] });

const fieldOf = (dialog: Locator) =>
  dialog.getByRole("textbox", {
    name: "What would you like to talk about? (optional)",
  });

const openJourney = (page: Page) => openTakenBacklog(page, journey);

test("Start session sits at the end opposite Near-future direction beside the help, is named for the selected project, and is hidden with the roster", async ({
  page,
}) => {
  await openJourney(page);
  const { project, directionToggle, preparationHelp } = parts(page);
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

  await project.getByRole("radio", { name: "Pygardon", exact: true }).check();
  await expect(startSession(page, "Pygardon")).toBeVisible();
  await expect(button).toHaveCount(0);

  await page.goto("/?project=pygardon&view=roster");
  await expect(startSession(page, "Pygardon")).toBeHidden();
});

test("Start session is offered while the published read is still reading", async ({
  page,
}) => {
  const origin = await publishMovingOrigin(page);
  origin.hold("main");
  await page.goto("/");

  await expect(parts(page).reading).toBeVisible();
  await expect(startSession(page, "Open Dough")).toBeEnabled();
});

test("Start session is offered after the published read failed", async ({
  page,
}) => {
  await publishOrigin(page, { ref: noConnection });
  await page.goto("/");

  await expect(parts(page).problem).toBeVisible();
  await expect(startSession(page, "Open Dough")).toBeEnabled();
});

test("the dialog names the project and Claude Code, says the session has no story or skill, starts empty with focus in its field, and Escape or Cancel send nothing", async ({
  page,
  dashboard,
}) => {
  await openJourney(page);
  const button = startSession(page, "Open Dough");
  const dialog = startSessionDialog(page, "Open Dough");

  await button.click();
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText(
    "Claude Code starts a background session on this machine, in this project's folder, with no story or skill.",
  );
  await expect(fieldOf(dialog)).toBeFocused();
  await expect(fieldOf(dialog)).toHaveValue("");
  await expect(dialog.getByRole("button", { name: "Start" })).toBeEnabled();
  await fieldOf(dialog).fill("never sent");
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(button).toBeFocused();

  await button.click();
  await expect(fieldOf(dialog)).toHaveValue("");
  await dialog.getByRole("button", { name: "Cancel" }).click();
  await expect(dialog).toBeHidden();
  await expect(button).toBeFocused();
  expect(dashboard.claudeCalls()).toEqual([]);
});

test("starting with text sends it in the Open Dough folder, and the session reads in Recent sessions and the sidebar with no card listing it", async ({
  page,
  dashboard,
}) => {
  dashboard.claudeScenario("launched");
  await openJourney(page);
  const text = "why is the CI slow on main?";
  const dialog = startSessionDialog(page, "Open Dough");
  const { recentSessions } = parts(page);
  const stories = () =>
    expectMembership(page, {
      taken: [takenStory],
      backlog: [readyStory, notRefinedStory],
    });

  const before = Date.now();
  await startSession(page, "Open Dough").click();
  await fieldOf(dialog).fill(`  ${text}  `);
  await dialog.getByRole("button", { name: "Start" }).click();

  const entry = recentSessions.getByRole("article");
  await expect(entry).toHaveCount(1);
  await expect(dialog).toBeHidden();
  await expect(entry).toHaveAccessibleName(`Ad hoc session for ${text}`);
  await expect(entry.getByRole("heading", { level: 3 })).toHaveText(text);
  await expect(entry).toContainText("Ad hoc session started in Claude Code");
  await expect(entry).toContainText(
    "Local: launched from this dashboard on this machine.",
  );
  await expect(entry).toContainText(`Session ${await sessionNamedBy(entry)}`);
  await expect(
    entry.getByRole("button", { name: "Open terminal" }),
  ).toBeVisible();
  await expect(entry.locator(".card-identity")).toHaveCount(0);
  const launchedAt = Date.parse(
    (await entry.locator("time").getAttribute("datetime")) ?? "",
  );
  expect(launchedAt).toBeGreaterThanOrEqual(before - 1_000);
  expect(launchedAt).toBeLessThanOrEqual(Date.now());

  const folder = realpathSync(path.join(dashboard.home, "git", "open-dough"));
  expect(dashboard.claudeLaunchCalls()).toEqual([
    {
      argv: ["--bg", "--name", `Open Dough · Ad hoc · ${text}`, text],
      cwd: folder,
    },
  ]);

  await stories();
  await expect(
    parts(page).stages.getByRole("list", { name: "Sessions" }),
  ).toHaveCount(0);
  for (const start of ["Start execution", "Start refinement"]) {
    await expect(
      parts(page).backlog.getByRole("button", { name: start }),
    ).toHaveCount(2);
  }

  const { button, entries } = sidebarParts(page);
  await button.click();
  await expect(entries).toHaveCount(1);
  await expect(entries.first().getByRole("heading", { level: 3 })).toHaveText(
    text,
  );
  await expect(entries.first()).toContainText("Open Dough · Ad hoc");
});

for (const blank of ["", "   "]) {
  test(`starting with ${blank === "" ? "an empty field" : "only spaces"} sends no instruction`, async ({
    page,
    dashboard,
  }) => {
    dashboard.claudeScenario("launched");
    await openJourney(page);
    const dialog = startSessionDialog(page, "Open Dough");

    await startSession(page, "Open Dough").click();
    await fieldOf(dialog).fill(blank);
    await dialog.getByRole("button", { name: "Start" }).click();

    await expect(parts(page).recentSessions.getByRole("article")).toHaveCount(
      1,
    );
    const [call] = dashboard.claudeLaunchCalls();
    expect(call?.argv).toHaveLength(3);
    expect(call?.argv[2]).toMatch(
      /^Open Dough · Ad hoc · \d{1,2} \w{3}, \d\d:\d\d$/,
    );
  });
}

test("starting on Pygardon uses Pygardon's folder and lists the session in the sidebar under Pygardon, not in Open Dough's Recent sessions", async ({
  page,
  dashboard,
}) => {
  dashboard.claudeScenario("launched");
  await openJourney(page);
  const { project, recentSessions } = parts(page);
  await project.getByRole("radio", { name: "Pygardon", exact: true }).check();
  const dialog = startSessionDialog(page, "Pygardon");

  await startSession(page, "Pygardon").click();
  await fieldOf(dialog).fill("what changed last week?");
  await dialog.getByRole("button", { name: "Start" }).click();

  // Pygardon publishes no work here, so the sidebar is where it is listed.
  const { button, entries } = sidebarParts(page);
  await button.click();
  await expect(entries).toHaveCount(1);
  await expect(entries.first()).toContainText("Pygardon · Ad hoc");
  const folder = realpathSync(path.join(dashboard.home, "git", "pygardon"));
  expect(dashboard.claudeLaunchCalls()).toEqual([
    {
      argv: [
        "--bg",
        "--name",
        "Pygardon · Ad hoc · what changed last week?",
        "what changed last week?",
      ],
      cwd: folder,
    },
  ]);

  await project.getByRole("radio", { name: "Open Dough", exact: true }).check();
  await expect(recentSessions).toContainText(
    "No sessions launched from this dashboard are kept.",
  );
});
