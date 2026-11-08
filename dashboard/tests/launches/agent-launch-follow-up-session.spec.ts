// Follow up on a standalone Done session in Recently done whose earlier
// conversation can no longer be continued: Read final report stays beside
// Follow up, which opens the project's Start session dialog naming the
// session and listing the context it supplies; Start sends that context with
// the request to the synthetic `claude` (./fixtures/fake-claude), the new
// session reads in Taken labelled by its request, and the source stays Done
// and unchanged. A Done session that still offers Open terminal offers no
// Follow up until its conversation is confirmed unavailable. The first
// input's order with reporting and an established workspace:
// ../../backend-tests/launches/agent-launch-follow-up-boundary.spec.ts;
// identity and retries: agent-launch-follow-up-identity.spec.ts there.

import type { Locator, Page } from "@playwright/test";
import { expect, test } from "../dashboardTest.ts";
import {
  parts,
  sessionStateOf,
  standaloneSessionName,
} from "../dashboardPage.ts";
import {
  openTakenBacklog,
  startSessionDialog,
  startSessionField,
} from "../launchStoryCardPage.ts";
import { listed } from "../recentlyDoneColumn.ts";
import { stored } from "../support/codexLaunch.ts";
import {
  followUpContextOf,
  quietSession,
  quietTitle,
  retiredSession,
  retiredTitle,
} from "../support/followUpSources.ts";
import { radio } from "../support/sessionDialog.ts";
import { keepLaunchRecords } from "../support/storyLaunchRecord.ts";

test.use({ projectFolders: ["open-dough"] });

const report = "The cache key changed; I restored it.";
const landed = "ab".repeat(20);

// A Done session whose isolated workspace was retired, with its final report
// and the revision its work landed at.
const reported = (home: string) =>
  retiredSession(home, {
    report,
    landed,
    doneAt: new Date(Date.now() - 60_000),
  });

const entryOf = (page: Page, title: string) =>
  parts(page).recentlyDone.getByRole("article", {
    name: standaloneSessionName("Ad hoc", title),
  });

const followUp = (entry: Locator, title: string) =>
  entry.getByRole("button", { name: `Follow up ${title}` });

const contextList = (dialog: Locator) =>
  dialog.getByRole("list", { name: "Follow-up context" }).getByRole("listitem");

test("a Done session whose workspace is gone offers Read final report and Follow up; Start sends the context with the request and leaves the source as it was", async ({
  page,
  dashboard,
  launchJourney,
}) => {
  const source = reported(dashboard.home);
  await keepLaunchRecords(dashboard, [source]);
  dashboard.claudeScenario("launched");
  await openTakenBacklog(page, launchJourney);
  const entry = entryOf(page, retiredTitle);
  const dialog = startSessionDialog(page, "Open Dough");

  await expect(sessionStateOf(entry)).toHaveText("Done");
  await expect(
    entry.getByRole("button", { name: "Read final report" }),
  ).toBeVisible();
  await followUp(entry, retiredTitle).click();

  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText(`Follows up ${retiredTitle}`);
  await expect(contextList(dialog)).toHaveText([
    "Workflow: Ad hoc",
    `Original request: ${retiredTitle}`,
    `Final report (Completed with attention): ${report}`,
    `Landed at revision: ${landed}`,
  ]);
  await expect(startSessionField(dialog)).toBeFocused();
  await expect(startSessionField(dialog)).toHaveValue("");
  for (const [group, name] of [
    ["Workspace", "Default main"],
    ["After checks", "Wait for review"],
  ] as const)
    await expect(radio(dialog, group, name)).toBeChecked();

  const text = "Is it still slow?";
  await startSessionField(dialog).fill(text);
  await dialog.getByRole("button", { name: "Start", exact: true }).click();

  const started = parts(page).taken.getByRole("article", {
    name: standaloneSessionName("Ad hoc", text),
  });
  await expect(started).toBeVisible();
  await expect(dialog).toBeHidden();
  await expect(started).not.toContainText(retiredTitle);
  expect(dashboard.claudeLaunchCalls()).toEqual([
    {
      argv: [
        "--bg",
        "--name",
        `Open Dough · Ad hoc · ${text}`,
        [
          followUpContextOf(retiredTitle, [
            "- Workflow: Ad hoc",
            `- Original request: ${retiredTitle}`,
            `- Final report (Completed with attention): ${report}`,
            `- Landed at revision: ${landed}`,
          ]),
          text,
        ].join("\n\n"),
      ],
      cwd: expect.any(String),
    },
  ]);

  // The source stays Done in Recently done with its actions, its record as kept.
  await expect(sessionStateOf(entry)).toHaveText("Done");
  await expect(
    entry.getByRole("button", { name: "Read final report" }),
  ).toBeVisible();
  await expect(followUp(entry, retiredTitle)).toBeVisible();
  expect(
    stored(dashboard.home).find(
      (record) => record.session.sessionId === "reported-source",
    ),
  ).toEqual(source);
});

test("a Done session that still opens its terminal offers no Follow up until its conversation is confirmed unavailable, then a blank follow-up sends the context alone", async ({
  page,
  dashboard,
  launchJourney,
}) => {
  const sessionId = listed(dashboard, Date.now(), quietTitle, 10 * 60_000);
  await keepLaunchRecords(dashboard, [
    quietSession(sessionId, new Date(Date.now() - 120_000)),
  ]);
  await openTakenBacklog(page, launchJourney);
  const entry = entryOf(page, quietTitle);

  await expect(
    entry.getByRole("button", { name: "Open terminal" }),
  ).toBeVisible();
  await expect(followUp(entry, quietTitle)).toHaveCount(0);

  dashboard.claudeSessionBecomes(sessionId, "forgotten");
  await page.reload();
  await expect(followUp(entry, quietTitle)).toBeVisible();
  await expect(
    entry.getByRole("button", { name: "Open terminal" }),
  ).toHaveCount(0);
  await followUp(entry, quietTitle).click();
  const dialog = startSessionDialog(page, "Open Dough");
  await expect(dialog).toContainText(`Follows up ${quietTitle}`);
  await expect(contextList(dialog)).toHaveText([
    "Workflow: Ad hoc",
    `Original request: ${quietTitle}`,
    "Final report: No final report was submitted.",
  ]);

  dashboard.claudeScenario("launched");
  await dialog.getByRole("button", { name: "Start", exact: true }).click();

  await expect(parts(page).taken.locator(".session-entry")).toHaveCount(1);
  const [call] = dashboard.claudeLaunchCalls();
  expect(call?.argv.at(2)).toMatch(
    /^Open Dough · Ad hoc · \d{1,2} \w{3}, \d\d:\d\d$/,
  );
  expect(call?.argv.at(3)).toBe(
    followUpContextOf(quietTitle, [
      "- Workflow: Ad hoc",
      `- Original request: ${quietTitle}`,
      "- Final report: No final report was submitted.",
    ]),
  );
  await expect(sessionStateOf(entry)).toHaveText("Done");
});
