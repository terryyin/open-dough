// After a confirmed base-CI failure, a later pass skips the question; a new
// failure at another revision asks again.

import { keptStarts } from "../../dashboard/tests/agentLaunchBoundary.ts";
import { expect, test } from "../../dashboard/tests/support/preparationPage.ts";
import { launchWaitMs } from "../../dashboard/tests/support/launchWait.ts";
import { publishLaterHead } from "../../dashboard/tests/support/publishLaterHead.ts";
import { openUntilRead } from "../../dashboard/tests/pageRequestNotes.ts";
import { parts } from "../../dashboard/tests/dashboardPage.ts";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import { actionsForRuns } from "../../dashboard/tests/support/baseCiActions.ts";

const baseCiFailedHeading = "Base CI failed";

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
    makeMe.aCiRun
      .with({
        headSha: ancestor,
        conclusion: "failure",
        url: "https://ci.invalid/x",
      })
      .please(),
  ]);
  published.serveActions((argv) => runs(argv));
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
    makeMe.aCiRun
      .with({
        headSha: ancestor,
        conclusion: "success",
        url: "https://ci.invalid/fixed",
      })
      .please(),
  ]);
  dashboard.claudeScenario("launched");
  await dialog
    .getByRole("button", { name: "Continue on failing base" })
    .click();
  await expect(dialog).toBeHidden();
  await expect
    .poll(() => dashboard.claudeLaunchCalls(), { timeout: launchWaitMs })
    .toHaveLength(1);
});

test("confirmed failure then a new failure at another revision asks again", async ({
  page,
  dashboard,
  origin,
}) => {
  const first = await publishLaterHead(origin, page, "first planning head");
  let runs = actionsForRuns([
    makeMe.aCiRun
      .with({
        headSha: first.ancestor,
        conclusion: "failure",
        url: "https://ci.invalid/x",
      })
      .please(),
  ]);
  first.published.serveActions((argv) => runs(argv));
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
    makeMe.aCiRun
      .with({
        headSha: first.head,
        conclusion: "failure",
        url: "https://ci.invalid/y",
      })
      .please(),
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
