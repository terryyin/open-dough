// Starting execution from a Backlog card, on a committed origin the production
// commands published (./launchJourney.ts): two queued stories, one Ready for
// execution and one not refined, and one Taken. The page's own dashboard
// server launches the synthetic `claude` (./fixtures/fake-claude), which
// records what it was asked; the real one is never reached. How Started lasts
// and settles is ./agent-launch-settlement.spec.ts.

import { realpathSync } from "node:fs";
import path from "node:path";
import type { Page } from "@playwright/test";
import { expect, test } from "./dashboardTest.ts";
import { publishCommittedOrigin } from "./committedOrigin.ts";
import { expectMembership, parts } from "./dashboardPage.ts";
import {
  notRefinedIdentity,
  notRefinedStory,
  publishLaunchJourney,
  readyStory,
  takenStory,
  type LaunchJourney,
} from "./launchJourney.ts";

let journey: LaunchJourney;
// Publishing runs production backlog commands against a local origin; give
// it its own budget so a busy machine cannot starve it.
test.beforeAll(async () => {
  test.setTimeout(120_000);
  journey = await publishLaunchJourney();
});
// A setup that failed leaves nothing to clean up.
test.afterAll(() => (journey as LaunchJourney | undefined)?.cleanup());

test.use({ projectFolders: ["open-dough"] });

const notReadyNote = "Not marked Ready for execution";

async function openTakenBacklog(page: Page) {
  await publishCommittedOrigin(page, {
    repoDir: journey.origin,
    revision: journey.taken,
    repository: "terryyin/open-dough",
  });
  await page.goto("/");
  const { backlog, taken } = parts(page);
  await expectMembership(page, {
    taken: [takenStory],
    backlog: [readyStory, notRefinedStory],
  });
  await expect(page.getByText("Reading preparation…")).toHaveCount(0);
  const card = (title: string) => backlog.getByRole("article", { name: title });
  return {
    card,
    takenCard: taken.getByRole("article", { name: takenStory }),
    start: (title: string) =>
      card(title).getByRole("button", { name: "Start execution" }),
    dialog: page.getByRole("dialog", {
      name: "Start execution in Claude Code",
    }),
  };
}

test("every Backlog card offers Start execution, described as not ready unless Ready for execution, and a Taken card offers none", async ({
  page,
}) => {
  const { card, takenCard, start } = await openTakenBacklog(page);

  await expect(
    card(readyStory).getByText("Ready for execution", { exact: true }),
  ).toBeVisible();
  await expect(start(readyStory)).toBeEnabled();
  await expect(start(readyStory)).toHaveAccessibleDescription("");
  await expect(card(readyStory)).not.toContainText(notReadyNote);

  await expect(start(notRefinedStory)).toBeEnabled();
  await expect(start(notRefinedStory)).toHaveAccessibleDescription(
    notReadyNote,
  );
  await expect(
    card(notRefinedStory).getByText(notReadyNote, { exact: true }),
  ).toBeVisible();

  await expect(takenCard).toBeVisible();
  await expect(takenCard.getByRole("button", { name: /Start/ })).toHaveCount(0);
});

test("the dialog names the story and Claude Code, takes focus to its instruction, and Escape or Cancel sends nothing", async ({
  page,
  dashboard,
}) => {
  const { start, dialog } = await openTakenBacklog(page);
  const instruction = dialog.getByRole("textbox", {
    name: "Instruction (optional)",
  });

  await start(readyStory).click();
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText(readyStory);
  await expect(dialog).toContainText("Claude Code");
  await expect(dialog).toContainText("/dough-execute-plan SEED-B#b");
  await expect(instruction).toBeFocused();
  await instruction.fill("never sent");
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(start(readyStory)).toBeFocused();

  await start(readyStory).click();
  // A dialog opened again starts without the abandoned instruction.
  await expect(instruction).toHaveValue("");
  await dialog.getByRole("button", { name: "Cancel" }).click();
  await expect(dialog).toBeHidden();
  await expect(start(readyStory)).toBeFocused();

  expect(dashboard.claudeCalls()).toEqual([]);
});

test("starting sends the instruction after the execution command in the Open Dough folder, and the card shows Started with its session and attach command", async ({
  page,
  context,
  dashboard,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  dashboard.claudeScenario("launched");
  const { card, start, dialog } = await openTakenBacklog(page);
  const own = "refine and plan it first, then execute";

  const before = Date.now();
  await start(notRefinedStory).click();
  await dialog
    .getByRole("textbox", { name: "Instruction (optional)" })
    .fill(own);
  await dialog.getByRole("button", { name: "Start" }).click();

  const started = card(notRefinedStory).getByRole("region", {
    name: "Started",
  });
  await expect(started).toBeVisible();
  await expect(dialog).toBeHidden();
  await expect(started).toBeFocused();
  await expect(start(notRefinedStory)).toHaveCount(0);
  await expect(started).toContainText("Started in Claude Code");
  await expect(started).toContainText(
    "Local: launched from this dashboard on this machine, not yet published.",
  );
  const launchedAt = Date.parse(
    (await started.locator("time").getAttribute("datetime")) ?? "",
  );
  expect(launchedAt).toBeGreaterThanOrEqual(before - 1_000);
  expect(launchedAt).toBeLessThanOrEqual(Date.now());

  const attach = await started
    .locator("code")
    .filter({ hasText: /^claude attach / })
    .textContent();
  const shortId = /^claude attach ([0-9a-f]{8})$/.exec(attach ?? "")?.[1];
  expect(shortId).toBeDefined();
  await expect(started).toContainText(`Session ${String(shortId)}-`);
  await started.getByRole("button", { name: "Copy attach command" }).click();
  await expect(started).toContainText("Copied.");
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    `claude attach ${String(shortId)}`,
  );

  const folder = realpathSync(path.join(dashboard.home, "git", "open-dough"));
  expect(dashboard.claudeCalls()).toEqual([
    {
      argv: [
        "--bg",
        "--name",
        `Open Dough · ${notRefinedStory}`,
        `/dough-execute-plan ${notRefinedIdentity}\n\n${own}`,
      ],
      cwd: folder,
    },
    { argv: ["agents", "--json"], cwd: folder },
  ]);
  // Only the launched card changed.
  await expect(start(readyStory)).toBeEnabled();
});

test.describe("without the project's folder", () => {
  test.use({ projectFolders: [] });

  test("the card explains the folder was not found and keeps Start execution", async ({
    page,
    dashboard,
  }) => {
    const { card, start, dialog } = await openTakenBacklog(page);

    await start(readyStory).click();
    await dialog.getByRole("button", { name: "Start" }).click();

    await expect(dialog).toBeHidden();
    await expect(card(readyStory)).toContainText(
      "Launch failed: The project folder ~/git/open-dough was not found on this machine. Nothing was launched.",
    );
    await expect(start(readyStory)).toBeEnabled();
    await expect(start(readyStory)).toBeFocused();
    await expect(start(readyStory)).toHaveAccessibleDescription(
      /The project folder ~\/git\/open-dough was not found/,
    );
    await expect(
      card(readyStory).getByRole("region", { name: "Started" }),
    ).toHaveCount(0);
    expect(dashboard.claudeCalls()).toEqual([]);
  });
});

test.describe("when Claude Code does not answer within the launch wait", () => {
  test.use({ launchTimeoutMs: 3_000 });

  test("Start is disabled while in flight, and the card shows the uncertain answer and keeps Start execution", async ({
    page,
    dashboard,
  }) => {
    dashboard.claudeScenario("hang");
    const { card, start, dialog } = await openTakenBacklog(page);

    await start(readyStory).click();
    await dialog.getByRole("button", { name: "Start" }).click();
    await expect(
      dialog.getByRole("button", { name: "Starting…" }),
    ).toBeDisabled();

    await expect(dialog).toBeHidden();
    await expect(card(readyStory)).toContainText(
      "Launch uncertain: Claude Code did not answer in time, so the session may or may not have started. Check claude agents for it before starting again.",
    );
    await expect(card(readyStory).locator(".launch-problem code")).toHaveText(
      "claude agents",
    );
    await expect(start(readyStory)).toBeEnabled();
    await expect(start(readyStory)).toBeFocused();
    await expect(
      card(readyStory).getByRole("region", { name: "Started" }),
    ).toHaveCount(0);
    expect(dashboard.claudeCalls()).toHaveLength(1);
  });
});
