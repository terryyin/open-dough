// The Side panel sets and clears the page's selected story, which Intent's
// lens and CI status read (../../src/pageSidePanel.ts, ../../src/intentCiTarget.ts):
// reading a Taken story's final report from its card selects and highlights
// that story, and Intent names it and judges its story branch; another
// story's final report moves the selection there; closing the panel, or
// showing a session attached to no story, clears it, and CI status judges
// `main` again. A card's toggle selects without changing the panel. The
// stories' saved workspaces are gone, so each card's session offers its final
// report; the ad hoc session is listed by the synthetic `claude`
// (./fixtures/fake-claude). The board is ../intentCiStoryBoard.ts.

import path from "node:path";
import type { LaunchRecord } from "../../src/agentLaunch.ts";
import { expect, test } from "../dashboardTest.ts";
import { parts, storyCardSessions } from "../dashboardPage.ts";
import { chooseCiStatus, ciPanel } from "../intentCiStatusPage.ts";
import { failing, running } from "../intentCiStoryBoard.ts";
import { card, expectNamed, publishStoryCi } from "../intentCiStoryRecords.ts";
import { openUntilRead } from "../pageRequestNotes.ts";
import { sessionsOutsideDoneStories } from "../recentlyDoneColumn.ts";
import { sessionsSidebarParts } from "../sessionsSidebarPage.ts";
import { expectSelected } from "../storyCardSelection.ts";
import { keepLaunchRecords } from "../support/storyLaunchRecord.ts";

// A kept execution record of the board's Taken story `anchor`, its saved
// workspace gone.
function goneWorkspaceRecord(
  home: string,
  { anchor, title, branch }: typeof failing,
): LaunchRecord {
  const identity = `SEED-219#${anchor}`;
  return {
    request: {
      source: "open-dough",
      identity,
      title,
      workflow: "execution",
      host: "claude",
    },
    session: {
      host: "claude",
      sessionId: `${anchor}-session`,
      shortId: anchor,
      name: title,
    },
    start: {
      identity,
      publisherId: "a1b2c3",
      workspace: path.join(home, "gone", anchor),
      branch,
      mode: "story-branch",
      remote: "origin",
      target: "main",
      publishedSha: "b2".repeat(20),
    },
    launchedAt: new Date().toISOString(),
  };
}

test("the Side panel's content selects its story for Intent's lens and CI status, and closing it or an ad hoc session clears it to main", async ({
  page,
  dashboard,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await keepLaunchRecords(dashboard, [
    goneWorkspaceRecord(dashboard.home, failing),
    goneWorkspaceRecord(dashboard.home, running),
    ...sessionsOutsideDoneStories(dashboard, Date.now()).filter(
      (record) => record.request.workflow === "ad-hoc",
    ),
  ]);
  publishStoryCi(page);
  await openUntilRead(page, "/?project=open-dough&perspective=intent");
  const { development, intentChoice, intent } = parts(page);
  await expectNamed(await chooseCiStatus(intent), "main");
  await expect(intent).not.toHaveAttribute("data-selected-story");
  await development.click();
  const report = page.getByRole("region", { name: "Final report" });
  // By keyboard: beside the panel, a lower card's control can sit below the
  // page's fold, where a pointer cannot reach it without scrolling.
  const readReport = async (title: string) => {
    await storyCardSessions(card(page, title))
      .getByRole("button", { name: "Read final report" })
      .focus();
    await page.keyboard.press("Enter");
  };
  // Intent, still on CI status, as the page now selects.
  const onIntent = async () => {
    await intentChoice.click();
    return ciPanel(intent);
  };

  await test.step("reading a story's final report selects and highlights it, and Intent judges its branch", async () => {
    await readReport(failing.title);
    await expect(report).toBeVisible();
    await expectSelected(card(page, failing.title), true);
    const panel = await onIntent();
    await expect(intent).toHaveAttribute(
      "data-selected-story",
      `SEED-219#${failing.anchor}`,
    );
    await expectNamed(panel, failing.branch);
    await expect(panel.locator(".intent-ci-state")).toHaveText(
      "Failed at fa11ed0 (Break the login)",
    );
    await development.click();
  });

  await test.step("another story's final report moves the selection and Intent's branch there", async () => {
    await readReport(running.title);
    await expect(report).toContainText(running.title);
    await expectSelected(card(page, running.title), true);
    await expectSelected(card(page, failing.title), false);
    const panel = await onIntent();
    await expect(intent).toHaveAttribute(
      "data-selected-story",
      `SEED-219#${running.anchor}`,
    );
    await expectNamed(panel, running.branch);
    await development.click();
  });

  await test.step("a card's toggle selects without changing the panel; closing the panel clears the selection, and CI status judges main", async () => {
    await card(page, failing.title).locator("h3").click();
    await expectSelected(card(page, failing.title), true);
    await expectSelected(card(page, running.title), false);
    await expect(report).toContainText(running.title);
    await report.getByRole("button", { name: "Close", exact: true }).click();
    await expect(report).toHaveCount(0);
    await expectSelected(card(page, failing.title), false);
    const panel = await onIntent();
    await expect(intent).not.toHaveAttribute("data-selected-story");
    await expectNamed(panel, "main");
    await development.click();
  });

  await test.step("showing a session attached to no story clears the selection, and CI status judges main", async () => {
    await readReport(failing.title);
    await expectSelected(card(page, failing.title), true);
    const sidebar = sessionsSidebarParts(page);
    await sidebar.button.click();
    await sidebar.entry("Open Dough session").click();
    await expect(page.getByRole("region", { name: "Terminal" })).toBeVisible();
    await expectSelected(card(page, failing.title), false);
    const panel = await onIntent();
    await expect(intent).not.toHaveAttribute("data-selected-story");
    await expectNamed(panel, "main");
  });
});
