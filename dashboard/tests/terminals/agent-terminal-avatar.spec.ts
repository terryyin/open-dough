// The terminal's header shows the portrait of the agent the session's
// kept record names (its start's or preparation's `agent`), to the left of
// the title and session rows and proportionate to both, named and titled by the
// agent; with no recorded agent, or no portrait for it, there is none, and
// the rows are as before. No developer identity shows in the panel. The
// Claude session starts through the dashboard without an agent. The portrait
// cases keep it as the session of a story's execution or refinement.
// An Odd-e nerds member's cartoon is answered by the test, since
// the cartoons are never in the repository. The synthetic `claude`
// (./fixtures/fake-claude) is attached; the real one is never reached.

import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import type { Locator } from "@playwright/test";
import { expect, test } from "../dashboardTest.ts";
import { openTakenBacklog } from "../launchStoryCardPage.ts";
import { parts, sessionNamedBy, sessionEntriesIn } from "../dashboardPage.ts";
import { recordsOf } from "../agentLaunchBoundary.ts";
import { expectServed } from "../agentPortrait.ts";
import { avatarPng } from "../avatarAnswers.ts";
import { expectTerminalPreviewFits } from "../terminalPortraitPreview.ts";
import { box } from "../pageLayout.ts";
import { takenIdentity, takenStory } from "../agentRosterRecords.ts";
import {
  openTerminalControl,
  terminalPanel,
  terminalScreenParts,
} from "../terminalScreenPage.ts";
import {
  keepLaunchRecords,
  keptLaunchStore,
  launchStoreFile,
} from "../support/launchStore.ts";
import type { LaunchRecord } from "../../src/agentLaunch.ts";
import { makeMe } from "../../../tests/support/makeMe.mjs";
import { sidePanelNamesOf } from "../sidePanelFrame.ts";

test.use({ projectFolders: ["open-dough"] });

test("the header shows the recorded agent's portrait left of its two rows, proportionate to both, named by the agent, and none without an agent or a portrait", async ({
  page,
  dashboard,
  launchJourney,
}) => {
  const where = {
    workspace: path.join(dashboard.home, "agent-workspace"),
    branch: "claude/agent-workspace",
  };
  mkdirSync(where.workspace);
  dashboard.claudeScenario("launched");
  await page.route(
    /\/agent-avatars\/odd-e-nerds\/cartoon\/stanly\.webp$/,
    (route) => route.fulfill(avatarPng(40)),
  );
  await page.route(
    /\/agent-avatars\/odd-e-nerds\/cartoon\/ruuf\.webp$/,
    (route) => route.fulfill({ status: 404 }),
  );
  await openTakenBacklog(page, launchJourney);
  const panel = terminalPanel(page);
  const { rows } = terminalScreenParts(panel);
  const names = sidePanelNamesOf(panel).names;
  const heading = terminalScreenParts(panel).heading;
  const sessionRow = names.locator("p");
  const portrait = panel.locator(".agent-portrait");
  const entry = sessionEntriesIn(parts(page).taken);

  await page
    .getByRole("button", { name: "Start session in Open Dough" })
    .click();
  await page
    .getByRole("dialog", {
      name: "Start a session in Open Dough in Claude Code",
    })
    .getByRole("button", { name: "Start" })
    .click();
  await expect(entry).toHaveCount(1);
  const sessionId = await sessionNamedBy(entry);
  const title =
    (await entry.getByRole("heading", { level: 3 }).textContent()) ?? "";
  await expect.poll(() => existsSync(launchStoreFile(dashboard))).toBe(true);
  const [adHoc] = keptLaunchStore(dashboard)["open-dough"] ?? [];
  if (!adHoc || !("session" in adHoc))
    throw new Error("Expected the kept ad hoc launch");

  const expectRows = async (storyTitle: string, sessionLabel: string) => {
    await expect(heading).toHaveText(storyTitle);
    await expect(sessionRow).toHaveText(sessionLabel);
  };

  // Keep the story launch and reopen its Claude session on the reloaded page.
  const reopen = async (record: LaunchRecord) => {
    keepLaunchRecords(dashboard, [record]);
    await expect
      .poll(() => recordsOf(dashboard, "open-dough"))
      .toEqual([expect.objectContaining(record)]);
    await page.reload();
    await openTerminalControl(entry).click();
    await expect(rows).toContainText(`attached ${sessionId.slice(0, 8)}`);
  };

  // The portrait sits left of the title and session rows, from the top of
  // the title, square and capped to stay proportionate to the two rows.
  const expectBesideBothRows = async (shown: Locator) => {
    const portraitBox = await box(shown);
    const titleBox = await box(heading);
    const rowBox = await box(sessionRow);
    const rowsHeight = rowBox.y + rowBox.height - titleBox.y;
    expect(portraitBox.y).toBeCloseTo(titleBox.y, 0);
    expect(portraitBox.height).toBeCloseTo(Math.min(rowsHeight, 44), 0);
    expect(portraitBox.width).toBeCloseTo(portraitBox.height, 0);
    expect(portraitBox.x + portraitBox.width).toBeLessThanOrEqual(titleBox.x);
    expect(portraitBox.x + portraitBox.width).toBeLessThanOrEqual(rowBox.x);
  };

  await test.step("an ad hoc session with no agent shows no portrait and its two rows", async () => {
    await expect(panel).toHaveCount(1);
    await expect(rows).toContainText(`attached ${sessionId.slice(0, 8)}`);
    await expect(portrait).toHaveCount(0);
    await expect(panel.getByRole("img")).toHaveCount(0);
    await expectRows(title, "Ad hoc session");
  });

  const story = { identity: takenIdentity, title: takenStory };
  const { launchedAt } = adHoc;
  await test.step("a preparation by Yui-chan shows Yui's atlas tile, proportionate to both rows, named and titled Yui-chan", async () => {
    await reopen(
      makeMe.aLaunchRecord
        .refining(story)
        .onStoryBranch({ ...where, agent: "Yui-chan" })
        .inClaudeSession({ sessionId })
        .launchedAt(launchedAt)
        .please(),
    );
    const yui = panel.getByRole("img", { name: "Yui-chan", exact: true });
    await expect(yui).toBeVisible();
    await expect(yui).toHaveAttribute("title", "Yui-chan");
    await expect(yui).toHaveCSS(
      "background-image",
      /\/agent-avatars\/atlas-1\.webp"\)$/,
    );
    await expect(yui).toHaveCSS("background-position", "0% 12.5%");
    const image = await yui.evaluate(
      (element) =>
        /url\("(.*?)"\)/.exec(getComputedStyle(element).backgroundImage)?.[1] ??
        "",
    );
    await expectServed(panel, image, "image/webp");
    await expectBesideBothRows(yui);
    await expectTerminalPreviewFits(yui, panel);
    await expectRows("See who owns Taken work", "Refinement session");
    // The agent is the only identity in the panel: no developer avatar or
    // name beside it.
    await expect(panel.getByRole("img")).toHaveCount(1);
    await expect(panel.locator("img")).toHaveCount(0);
    await expect(panel.locator(".terminal-identity")).toHaveText(
      "See who owns Taken workRefinement session",
    );
  });

  await test.step("a start by an Odd-e nerds member whose cartoon is served shows that cartoon", async () => {
    await reopen(
      makeMe.aLaunchRecord
        .executing(story)
        .onStoryBranch({ ...where, agent: "stanly-chan" })
        .inClaudeSession({ sessionId })
        .launchedAt(launchedAt)
        .please(),
    );
    const stanly = panel.getByRole("img", { name: "stanly-chan", exact: true });
    await expect(stanly).toBeVisible();
    await expect(stanly).toHaveAttribute("title", "stanly-chan");
    await expect(stanly).toHaveCSS("background-image", /\/stanly\.webp"\)$/);
    await expectBesideBothRows(stanly);
    await expectRows("See who owns Taken work", "Execution session");
  });

  await test.step("a start by a member whose cartoon is not served shows no portrait and its two rows", async () => {
    const asked = page.waitForResponse(/\/cartoon\/ruuf\.webp$/);
    await reopen(
      makeMe.aLaunchRecord
        .executing(story)
        .onStoryBranch({ ...where, agent: "ruuf-chan" })
        .inClaudeSession({ sessionId })
        .launchedAt(launchedAt)
        .please(),
    );
    expect((await asked).status()).toBe(404);
    await expectRows("See who owns Taken work", "Execution session");
    await expect(portrait).toHaveCount(0);
    await expect(panel.getByRole("img")).toHaveCount(0);
  });
});
