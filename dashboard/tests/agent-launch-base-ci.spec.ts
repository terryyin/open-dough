// Before a new execution start runs the installed script, the boundary judges
// the origin target's CI. These cases use GitHub Actions; command-adapter
// projects live in agent-launch-base-ci-adapter.spec.ts. A pass starts as
// today; a failed judgment asks in the dialog; Back starts nothing; Continue
// names the confirmed revision and state; a changed judgment asks again or
// starts on a pass. Kept starts are not asked. Running and unread judgments
// live in agent-launch-base-ci-running-unread.spec.ts. Real installed start
// and bare origin as agent-launch-default-checkout-warning.spec.ts; fake
// GitHub answers the head's commit listing and Actions runs
// (./committedOrigin.ts, ./support/baseCiActions.ts).

import { keptStarts } from "./agentLaunchBoundary.ts";
import { publishCommittedOrigin } from "./committedOrigin.ts";
import { expect, test } from "./support/preparationPage.ts";
import { actionsForRuns } from "./support/baseCiActions.ts";
import { publishLaterHead } from "./support/publishLaterHead.ts";
const baseCiFailedHeading = "Base CI failed";
import { openUntilRead } from "./pageRequestNotes.ts";
import { parts } from "./dashboardPage.ts";
import { reachKeptStart, startAction } from "./keptStartJourney.ts";
import { originMain } from "./support/sessionDialog.ts";

test.setTimeout(120_000);

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
    actionsForRuns([{ headSha: ancestor, conclusion: "success" }]),
  );
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
  await expect.poll(() => dashboard.claudeLaunchCalls()).toHaveLength(1);
  expect(head).not.toBe(ancestor);
  expect(await origin.takenProfiles()).toHaveLength(1);
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
      {
        headSha: ancestor,
        conclusion: "failure",
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
  await expect.poll(() => dashboard.claudeLaunchCalls()).toHaveLength(1);
  expect(await origin.takenProfiles()).toHaveLength(1);
  expect(before).not.toBe(head);
});

test("confirmed failure then pass starts without asking again", async ({
  page,
  dashboard,
  origin,
}) => {
  const { ancestor, published } = await publishLaterHead(
    origin,
    page,
    "planning for recheck",
  );
  let runs = actionsForRuns([
    { headSha: ancestor, conclusion: "failure", url: "https://ci.invalid/x" },
  ]);
  published.serveActions((argv, head) => runs(argv, head));
  await openUntilRead(page);
  const card = parts(page).backlog.getByRole("article", { name: "Story A" });
  await card.getByRole("button", { name: "Start execution" }).click();
  const dialog = page.getByRole("dialog", {
    name: "Start execution in Claude Code",
  });
  await dialog.getByRole("button", { name: "Start", exact: true }).click();
  await expect(
    dialog.getByRole("heading", { name: baseCiFailedHeading }),
  ).toBeFocused();

  runs = actionsForRuns([
    {
      headSha: ancestor,
      conclusion: "success",
      url: "https://ci.invalid/fixed",
    },
  ]);
  dashboard.claudeScenario("launched");
  await dialog
    .getByRole("button", { name: "Continue on failing base" })
    .click();
  await expect(dialog).toBeHidden();
  await expect.poll(() => dashboard.claudeLaunchCalls()).toHaveLength(1);
});

test("confirmed failure then a new failure at another revision asks again", async ({
  page,
  dashboard,
  origin,
}) => {
  const first = await publishLaterHead(origin, page, "first planning head");
  let runs = actionsForRuns([
    {
      headSha: first.ancestor,
      conclusion: "failure",
      url: "https://ci.invalid/x",
    },
  ]);
  first.published.serveActions((argv, head) => runs(argv, head));
  await openUntilRead(page);
  const card = parts(page).backlog.getByRole("article", { name: "Story A" });
  await card.getByRole("button", { name: "Start execution" }).click();
  const dialog = page.getByRole("dialog", {
    name: "Start execution in Claude Code",
  });
  await dialog.getByRole("button", { name: "Start", exact: true }).click();
  await expect(
    dialog.getByRole("heading", { name: baseCiFailedHeading }),
  ).toBeFocused();
  await expect(dialog).toContainText(first.ancestor.slice(0, 7));

  runs = actionsForRuns([
    {
      headSha: first.head,
      conclusion: "failure",
      url: "https://ci.invalid/y",
    },
  ]);
  await dialog
    .getByRole("button", { name: "Continue on failing base" })
    .click();
  await expect(
    dialog.getByRole("heading", { name: baseCiFailedHeading }),
  ).toBeFocused();
  await expect(dialog).toContainText(first.head.slice(0, 7));
  await expect(dialog).toContainText(
    "The base's CI changed after it was shown; review it again.",
  );
  await expect(dialog).toContainText("https://ci.invalid/y");
  expect(dashboard.claudeLaunchCalls()).toEqual([]);
  expect(await keptStarts(dashboard)).toEqual([]);
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
      {
        headSha: (await origin.originGit("rev-parse", "main")).trim(),
        conclusion: "failure",
        url: "https://ci.invalid/kept-fail",
      },
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
    .poll(() => dashboard.claudeLaunchCalls().length)
    .toBeGreaterThanOrEqual(2);
});
