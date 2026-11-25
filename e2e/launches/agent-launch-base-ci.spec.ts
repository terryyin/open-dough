// Installed execution starts judge published target CI before native launch.
// GitHub Actions supplies the result; the dialog confirms failed revisions,
// while a pass or an already kept start proceeds without another question.

import { keptStarts } from "../../dashboard/test-support/agentLaunchBoundary.ts";
import { publishCommittedOrigin } from "../../dashboard/test-support/committedOrigin.ts";
import {
  expect,
  test,
} from "../../dashboard/test-support/support/preparationPage.ts";
import { launchWaitMs } from "../../dashboard/test-support/support/launchWait.ts";
import { publishLaterHead } from "../../dashboard/test-support/support/publishLaterHead.ts";
import { openUntilRead } from "../../dashboard/test-support/pageRequestNotes.ts";
import { parts } from "../../dashboard/test-support/dashboardPage.ts";
import {
  reachKeptStart,
  startAction,
} from "../../dashboard/test-support/keptStartJourney.ts";
import { originMain } from "../../dashboard/test-support/support/sessionDialog.ts";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import { actionsForRuns } from "../../dashboard/test-support/support/baseCiActions.ts";
import { expectServedHomesReach } from "../../dashboard/test-support/support/fixtureOriginRoute.ts";

const baseCiFailedHeading = "Base CI failed";

test("a passing nearest result starts with no question when the head has none", async ({
  page,
  dashboard,
  origin,
}) => {
  const { ancestor, head, published } = await publishLaterHead(
    origin,
    page,
    "planning-only head",
  );
  published.serveActions(
    actionsForRuns([
      makeMe.aCiRun.with({ headSha: ancestor, conclusion: "success" }).please(),
    ]),
  );
  expectServedHomesReach(dashboard.github, published.repository, head);
  await openUntilRead(page);
  const card = parts(page).backlog.getByRole("article", { name: "Story A" });
  await card.getByRole("button", { name: "Start execution" }).click();
  const dialog = page.getByRole("dialog", {
    name: "Start execution in Claude Code",
  });
  dashboard.claudeScenario("launched");
  await dialog.getByRole("button", { name: "Start", exact: true }).click();
  await expect(dialog).toBeHidden();
  await expect(
    page.getByRole("heading", { name: baseCiFailedHeading }),
  ).toHaveCount(0);
  await expect
    .poll(() => dashboard.claudeLaunchCalls(), { timeout: launchWaitMs })
    .toHaveLength(1);
  expect(head).not.toBe(ancestor);
  expect(await origin.takenProfiles()).toHaveLength(1);
  expectServedHomesReach(
    dashboard.github,
    published.repository,
    await originMain(origin),
  );
});

test("a failed base asks; Back starts nothing; Continue starts", async ({
  page,
  dashboard,
  origin,
}) => {
  const before = await originMain(origin);
  const { ancestor, head, published } = await publishLaterHead(
    origin,
    page,
    "planning after failure",
  );
  const runUrl = "https://ci.invalid/failed-base";
  published.serveActions(
    actionsForRuns([
      makeMe.aCiRun
        .with({ headSha: ancestor, conclusion: "failure", url: runUrl })
        .please(),
    ]),
  );
  expectServedHomesReach(dashboard.github, published.repository, head);
  await openUntilRead(page);
  const card = parts(page).backlog.getByRole("article", { name: "Story A" });
  await card.getByRole("button", { name: "Start execution" }).click();
  const dialog = page.getByRole("dialog", {
    name: "Start execution in Claude Code",
  });
  const instruction = dialog.getByRole("textbox", {
    name: "Instruction (optional)",
  });
  await instruction.fill("Fix the base.");
  await dialog.getByRole("button", { name: "Start", exact: true }).click();

  const warning = dialog.getByRole("heading", { name: baseCiFailedHeading });
  await expect(warning).toBeFocused();
  await expect(dialog).toContainText("main");
  await expect(dialog).toContainText(ancestor.slice(0, 7));
  await expect(dialog).toContainText(
    "One later commit has no result of its own.",
  );
  await expect(dialog).toContainText(runUrl);
  expect(dashboard.claudeLaunchCalls()).toEqual([]);
  expect(await keptStarts(dashboard)).toEqual([]);
  expect(await originMain(origin)).toBe(head);
  expect(await origin.takenProfiles()).toEqual([]);

  await dialog.getByRole("button", { name: "Back" }).click();
  await expect(
    dialog.getByRole("button", { name: "Start", exact: true }),
  ).toBeFocused();
  await expect(instruction).toHaveValue("Fix the base.");
  expect(dashboard.claudeLaunchCalls()).toEqual([]);
  expect(await keptStarts(dashboard)).toEqual([]);
  expect(await origin.takenProfiles()).toEqual([]);
  expect(await originMain(origin)).toBe(head);

  dashboard.claudeScenario("launched");
  await dialog.getByRole("button", { name: "Start", exact: true }).click();
  await expect(warning).toBeFocused();
  await dialog
    .getByRole("button", { name: "Continue on failing base" })
    .click();
  await expect(dialog).toBeHidden();
  await expect
    .poll(() => dashboard.claudeLaunchCalls(), { timeout: launchWaitMs })
    .toHaveLength(1);
  expect(await origin.takenProfiles()).toHaveLength(1);
  expect(before).not.toBe(head);
  expectServedHomesReach(
    dashboard.github,
    published.repository,
    await originMain(origin),
  );
});

test("a kept start resumed is not asked even with a failing base", async ({
  page,
  dashboard,
  origin,
}) => {
  const { takenStoryCard } = await reachKeptStart(page, dashboard, origin);
  const published = await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision: (await origin.originGit("rev-parse", "main")).trim(),
    repository: "terryyin/open-dough",
    follows: true,
  });
  published.serveActions(
    actionsForRuns([
      makeMe.aCiRun
        .with({
          headSha: (await origin.originGit("rev-parse", "main")).trim(),
          conclusion: "failure",
          url: "https://ci.invalid/kept-fail",
        })
        .please(),
    ]),
  );
  dashboard.claudeScenario("launched");
  await startAction(takenStoryCard).click();
  const dialog = page.getByRole("dialog", {
    name: "Start execution in Claude Code",
  });
  await expect(dialog).toContainText(
    "This story's Take is already published on origin, so Start publishes no second Take.",
  );
  await dialog.getByRole("button", { name: "Start", exact: true }).click();
  await expect(dialog).toBeHidden();
  await expect(
    page.getByRole("heading", { name: baseCiFailedHeading }),
  ).toHaveCount(0);
  await expect
    .poll(() => dashboard.claudeLaunchCalls().length, {
      timeout: launchWaitMs,
    })
    .toBeGreaterThanOrEqual(2);
});
