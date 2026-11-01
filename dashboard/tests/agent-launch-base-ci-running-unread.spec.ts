// Running or unreadable base-CI judgments ask before a new execution start:
// in-progress asks while CI runs; rate-limited or empty Actions answers ask
// without a CI result. None starts without confirmation. Same installed-start
// and fake-GitHub harness as agent-launch-base-ci.spec.ts.

import { keptStarts } from "./agentLaunchBoundary.ts";
import { expect, test } from "./support/preparationPage.ts";
import {
  actionsForRuns,
  actionsWorkflowAnswer,
} from "./support/baseCiActions.ts";
import { publishLaterHead } from "./support/publishLaterHead.ts";
const baseCiFailedHeading = "Base CI failed";
const baseCiRunningHeading = "Base CI still running";
const baseCiUnreadHeading = "Base CI could not be read";
import { openUntilRead } from "./pageRequestNotes.ts";
import { parts } from "./dashboardPage.ts";
import { rateLimitedAnswer } from "./originAnswers.ts";

test.setTimeout(120_000);

test("an in-progress nearest result asks while CI runs and starts nothing until Continue", async ({
  page,
  dashboard,
  origin,
}) => {
  const { ancestor, published } = await publishLaterHead(
    origin,
    page,
    "planning while CI runs",
  );
  const runUrl = "https://ci.invalid/running-base";
  published.serveActions(
    actionsForRuns([
      {
        headSha: ancestor,
        status: "in_progress",
        url: runUrl,
      },
    ]),
  );
  await openUntilRead(page);
  const card = parts(page).backlog.getByRole("article", { name: "Story A" });
  await card.getByRole("button", { name: "Start execution" }).click();
  const dialog = page.getByRole("dialog", {
    name: "Start execution in Claude Code",
  });
  await dialog.getByRole("button", { name: "Start", exact: true }).click();

  const warning = dialog.getByRole("heading", { name: baseCiRunningHeading });
  await expect(warning).toBeFocused();
  await expect(dialog).toContainText("main");
  await expect(dialog).toContainText(ancestor.slice(0, 7));
  await expect(dialog).toContainText(
    "has a nearest CI check that is still running.",
  );
  await expect(dialog).toContainText(
    "One later commit has no result of its own.",
  );
  await expect(dialog).toContainText(runUrl);
  await expect(
    dialog.getByRole("button", { name: "Continue while CI runs" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: baseCiFailedHeading }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: baseCiUnreadHeading }),
  ).toHaveCount(0);
  expect(dashboard.claudeLaunchCalls()).toEqual([]);
  expect(await keptStarts(dashboard)).toEqual([]);
  expect(await origin.takenProfiles()).toEqual([]);

  dashboard.claudeScenario("launched");
  await dialog.getByRole("button", { name: "Continue while CI runs" }).click();
  await expect(dialog).toBeHidden();
  await expect.poll(() => dashboard.claudeLaunchCalls()).toHaveLength(1);
  expect(await origin.takenProfiles()).toHaveLength(1);
});

test("a rate-limited Actions answer asks without CI result and never shows a pass", async ({
  page,
  dashboard,
  origin,
}) => {
  const { published } = await publishLaterHead(
    origin,
    page,
    "planning under rate limit",
  );
  published.serveActions((argv) => {
    const route = argv.find((argument) => argument.startsWith("repos/")) ?? "";
    if (/\/actions\/workflows\/[^/?]+$/.test(route)) {
      return actionsWorkflowAnswer();
    }
    if (/\/actions\/workflows\/[^/]+\/runs(?:\?|$)/.test(route)) {
      return rateLimitedAnswer(403, { "Retry-After": "1" });
    }
    return undefined;
  });
  await openUntilRead(page);
  const card = parts(page).backlog.getByRole("article", { name: "Story A" });
  await card.getByRole("button", { name: "Start execution" }).click();
  const dialog = page.getByRole("dialog", {
    name: "Start execution in Claude Code",
  });
  await dialog.getByRole("button", { name: "Start", exact: true }).click();

  const warning = dialog.getByRole("heading", { name: baseCiUnreadHeading });
  await expect(warning).toBeFocused();
  await expect(dialog).toContainText("main");
  await expect(dialog).toContainText("could not have its CI read.");
  await expect(dialog).toContainText(
    "GitHub directed a wait of 1 s before the next request",
  );
  await expect(
    dialog.getByRole("button", { name: "Continue without CI result" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: baseCiFailedHeading }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: baseCiRunningHeading }),
  ).toHaveCount(0);
  expect(dashboard.claudeLaunchCalls()).toEqual([]);
  expect(await keptStarts(dashboard)).toEqual([]);
  expect(await origin.takenProfiles()).toEqual([]);

  await dialog.getByRole("button", { name: "Back" }).click();
  await expect(
    dialog.getByRole("button", { name: "Start", exact: true }),
  ).toBeFocused();
  expect(dashboard.claudeLaunchCalls()).toEqual([]);
  expect(await origin.takenProfiles()).toEqual([]);
});

test("an empty Actions listing asks without CI result for no readable check", async ({
  page,
  dashboard,
  origin,
}) => {
  const { published } = await publishLaterHead(
    origin,
    page,
    "planning with no CI result",
  );
  published.serveActions(actionsForRuns([]));
  await openUntilRead(page);
  const card = parts(page).backlog.getByRole("article", { name: "Story A" });
  await card.getByRole("button", { name: "Start execution" }).click();
  const dialog = page.getByRole("dialog", {
    name: "Start execution in Claude Code",
  });
  await dialog.getByRole("button", { name: "Start", exact: true }).click();

  const warning = dialog.getByRole("heading", { name: baseCiUnreadHeading });
  await expect(warning).toBeFocused();
  await expect(dialog).toContainText("main");
  await expect(dialog).toContainText("could not have its CI read.");
  await expect(dialog).toContainText(
    "No result of the selected check was found in the readable history",
  );
  await expect(
    dialog.getByRole("button", { name: "Continue without CI result" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: baseCiFailedHeading }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: baseCiRunningHeading }),
  ).toHaveCount(0);
  expect(dashboard.claudeLaunchCalls()).toEqual([]);
  expect(await keptStarts(dashboard)).toEqual([]);
  expect(await origin.takenProfiles()).toEqual([]);

  dashboard.claudeScenario("launched");
  await dialog
    .getByRole("button", { name: "Continue without CI result" })
    .click();
  await expect(dialog).toBeHidden();
  await expect.poll(() => dashboard.claudeLaunchCalls()).toHaveLength(1);
  expect(await origin.takenProfiles()).toHaveLength(1);
});
