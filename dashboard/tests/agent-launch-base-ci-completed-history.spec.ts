// Running base CI retains its warning beside completed strict-ancestor
// evidence, or a truthful gap, before a developer confirms the start.

import { keptStarts } from "./agentLaunchBoundary.ts";
import { expect, test } from "./support/preparationPage.ts";
import { actionsForRuns } from "./support/baseCiActions.ts";
import { publishLaterHead } from "./support/publishLaterHead.ts";
const baseCiFailedHeading = "Base CI failed";
const baseCiRunningHeading = "Base CI still running";
const baseCiUnreadHeading = "Base CI could not be read";
import { openUntilRead } from "./pageRequestNotes.ts";
import { parts } from "./dashboardPage.ts";

test.setTimeout(120_000);

for (const conclusion of ["success", "failure"] as const) {
  test(`an in-progress nearest result shows its nearest completed ${conclusion} and starts nothing until Continue`, async ({
    page,
    dashboard,
    origin,
  }) => {
    const completed = await publishLaterHead(
      origin,
      page,
      "last completed base",
    );
    const running = await publishLaterHead(origin, page, "running base");
    // A merged sibling is reachable from the target but not an ancestor of the
    // running revision. Its more recent completed result must not be selected.
    const sibling = (
      await origin.originGit(
        "commit-tree",
        `${completed.head}^{tree}`,
        "-p",
        completed.head,
        "-m",
        "sibling completed base",
      )
    ).trim();
    const merge = (
      await origin.originGit(
        "commit-tree",
        `${running.head}^{tree}`,
        "-p",
        running.head,
        "-p",
        sibling,
        "-m",
        "planning while CI runs",
      )
    ).trim();
    await origin.originGit("update-ref", "refs/heads/main", merge);
    const ancestor = running.head;
    const published = running.published;
    const runUrl = "https://ci.invalid/running-base";
    published.serveActions(
      actionsForRuns([
        {
          headSha: ancestor,
          status: "in_progress",
          url: runUrl,
        },
        {
          headSha: completed.head,
          conclusion: "failure",
          url: "https://ci.invalid/older-attempt",
        },
        {
          headSha: completed.head,
          conclusion,
          url: "https://ci.invalid/completed-base",
        },
        {
          headSha: completed.head,
          status: "queued",
          url: "https://ci.invalid/pending-rerun",
        },
        {
          headSha: completed.ancestor,
          conclusion: "success",
          url: "https://ci.invalid/older-pass",
        },
        {
          headSha: sibling,
          conclusion: "failure",
          url: "https://ci.invalid/unrelated",
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
    await expect(dialog).toContainText(
      `Nearest completed ancestor: ${completed.head.slice(0, 7)} (last completed base) — ${conclusion === "success" ? "passed" : "failed"}.`,
    );
    await expect(
      dialog.getByRole("link", {
        name: "https://ci.invalid/completed-base",
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      dialog.getByRole("link", {
        name: "https://ci.invalid/older-pass",
        exact: true,
      }),
    ).toHaveCount(0);
    await expect(
      dialog.getByRole("link", {
        name: "https://ci.invalid/older-attempt",
        exact: true,
      }),
    ).toHaveCount(0);
    await expect(
      dialog.getByRole("link", {
        name: "https://ci.invalid/pending-rerun",
        exact: true,
      }),
    ).toHaveCount(0);
    await expect(
      dialog.getByRole("link", {
        name: "https://ci.invalid/unrelated",
        exact: true,
      }),
    ).toHaveCount(0);
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
    await dialog
      .getByRole("button", { name: "Continue while CI runs" })
      .click();
    await expect(dialog).toBeHidden();
    await expect.poll(() => dashboard.claudeLaunchCalls()).toHaveLength(1);
    expect(await origin.takenProfiles()).toHaveLength(1);
  });
}

test("a running base with no completed ancestor reports the readable-history gap", async ({
  page,
  dashboard,
  origin,
}) => {
  const { ancestor, published } = await publishLaterHead(
    origin,
    page,
    "unchecked head",
  );
  published.serveActions(
    actionsForRuns([
      {
        headSha: ancestor,
        status: "in_progress",
        url: "https://ci.invalid/running-only",
      },
      {
        headSha: "ff".repeat(20),
        conclusion: "success",
        url: "https://ci.invalid/unrelated-pass",
      },
    ]),
  );
  await openUntilRead(page);
  await parts(page)
    .backlog.getByRole("article", { name: "Story A" })
    .getByRole("button", { name: "Start execution" })
    .click();
  const dialog = page.getByRole("dialog", {
    name: "Start execution in Claude Code",
  });
  await dialog.getByRole("button", { name: "Start", exact: true }).click();
  await expect(
    dialog.getByRole("heading", { name: baseCiRunningHeading }),
  ).toBeFocused();
  await expect(dialog).toContainText(
    "No completed ancestor result of the selected check was found in the readable history.",
  );
  await expect(
    dialog.getByRole("link", {
      name: "https://ci.invalid/unrelated-pass",
      exact: true,
    }),
  ).toHaveCount(0);
  expect(dashboard.claudeLaunchCalls()).toEqual([]);
  expect(await keptStarts(dashboard)).toEqual([]);
  await dialog.getByRole("button", { name: "Back" }).click();
  await expect(
    dialog.getByRole("button", { name: "Start", exact: true }),
  ).toBeFocused();
});
