import {
  closeSidePanel,
  sidePanelNamesOf,
} from "../../dashboard/test-support/sidePanelFrame.ts";
// Installed launches publish the stories the Board follows. A card or
// standalone entry opens one terminal, keeps other sessions running, and
// passes input and shell environment to the synthetic Claude attach.
import { tmpdir } from "node:os";
import path from "node:path";
import type { Locator } from "@playwright/test";
import { expect } from "../../dashboard/test-support/dashboardTest.ts";
import { test } from "../../dashboard/test-support/support/startOriginTest.ts";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import {
  completionRevision,
  queuedRepositoryWithRoughStory,
  roughStoryC,
  storyA,
  storyB,
  storyPlanPath,
} from "../../Distribution/tests/support/queued-repository.mjs";
import {
  expectTerminalIdentity,
  openTerminalControl,
  terminalPanel,
  terminalScreenParts,
} from "../../dashboard/test-support/terminalScreenPage.ts";
import {
  storyCardSessions,
  expectMembership,
  parts,
  standaloneSessionName,
  sessionNamedBy,
} from "../../dashboard/test-support/dashboardPage.ts";
import { showColumn } from "../../dashboard/test-support/boardPage.ts";
import { recordsOf } from "../../dashboard/test-support/agentLaunchBoundary.ts";
import {
  notRefinedStory,
  readyStory,
  takenStory,
} from "../../dashboard/test-support/launchJourney.ts";
import { openInstalledStoryBoard } from "../../dashboard/test-support/installedStoryCardPage.ts";
import {
  deploymentLikeStart,
  expectDeveloperShellEnvironment,
} from "../../dashboard/test-support/support/launchEnvironment.ts";
import { processRunning } from "../../dashboard/test-support/support/processGroup.ts";

// Named per worker at load; created before the page's server starts.
const start = deploymentLikeStart(
  path.join(tmpdir(), `dough-deployment-terminal-${String(process.pid)}`),
);

test.use({
  projectFolders: ["open-dough"],
  pathPrefix: start.pathPrefix,
  extraEnv: start.extraEnv,
  originRepository: queuedRepositoryWithRoughStory(roughStoryC).please(),
});

const shortId = (sessionId: string) => sessionId.slice(0, 8);

// The terminal size the fake last reported, as `<cols>x<rows>`.
async function reportedSize(rows: Locator): Promise<string | undefined> {
  const text = (await rows.textContent()) ?? "";
  return [...text.matchAll(/(?:attached \S+|resized) (\d+x\d+)/g)].at(-1)?.[1];
}

test.describe("the terminal beside the page", () => {
  test.beforeAll(() => {
    start.create();
  });
  test.afterAll(() => {
    start.remove();
  });

  test("a card or standalone Taken entry opens its session in the right-hand terminal, one at a time, and Close leaves it running", async ({
    page,
    dashboard,
    origin,
  }) => {
    dashboard.claudeScenario("launched");
    const board = await openInstalledStoryBoard(page, origin);
    const { card, settled } = board;
    const { taken, backlog } = parts(page);
    const panel = terminalPanel(page);
    const { rows } = terminalScreenParts(panel);
    const cardEntries = (title: string) => storyCardSessions(card(title));
    const entry = (title: string) =>
      taken.getByRole("article", {
        name: standaloneSessionName("Execution", title),
      });
    const attachesEnded = (sessionId: string) =>
      dashboard
        .claudeAttaches()
        .filter((attach) => attach.id === shortId(sessionId))
        .every(
          (attach) =>
            attach.endedBy !== undefined && !processRunning(attach.pid),
        );
    const stillListed = async (sessionId: string) => {
      expect(await recordsOf(dashboard, "open-dough")).toContainEqual(
        expect.objectContaining({
          session: expect.objectContaining({ sessionId }),
          sessionState: expect.objectContaining({ kind: "available" }),
        }),
      );
    };
    const queued = {
      taken: [],
      backlog: [takenStory, readyStory, notRefinedStory],
    };
    await expectMembership(page, queued);
    await settled();

    await (await board.open(takenStory, "Execution")).submit();
    await expect(storyCardSessions(card(takenStory))).toHaveCount(1);
    await (await board.open(readyStory, "Execution")).submit();
    await expect(storyCardSessions(card(readyStory))).toHaveCount(1);
    const launched = {
      taken: [takenStory, readyStory],
      backlog: [notRefinedStory],
    };
    await expectMembership(page, launched);
    const first = await sessionNamedBy(cardEntries(takenStory));
    const second = await sessionNamedBy(cardEntries(readyStory));
    await expect(openTerminalControl(cardEntries(takenStory))).toBeVisible();
    await expect(entry(takenStory)).toHaveCount(0);
    await expect(panel).toHaveCount(0);
    await expect(page.locator("body")).not.toContainText("claude attach");
    await expect(page.getByRole("button", { name: /copy/i })).toHaveCount(0);

    await test.step("a card's session entry opens its session to the right of the page, and an answer typed there reaches it", async () => {
      await openTerminalControl(cardEntries(takenStory)).click();
      await expectTerminalIdentity(panel, takenStory);
      await expect(sidePanelNamesOf(panel).sessionName).toHaveText(
        "Execution session",
      );
      await expect(sidePanelNamesOf(panel).shownSessionId).toHaveCount(0);
      await expect(panel.getByRole("button", { name: "Close" })).toBeVisible();
      await expect(rows).toContainText(`attached ${shortId(first)}`);
      const left = await backlog.boundingBox();
      const right = await panel.boundingBox();
      expect(right?.x).toBeGreaterThanOrEqual(
        (left?.x ?? 0) + (left?.width ?? 0),
      );

      await page.keyboard.type("yes, go on");
      await page.keyboard.press("Enter");
      await expect(rows).toContainText("echo yes, go on");
      await expectMembership(page, launched);
    });

    await test.step("the terminal's size follows the panel", async () => {
      const rendered = rows.locator(":scope > div");
      const size = async () => {
        const reported = await reportedSize(rows);
        return reported?.split("x")[1] === String(await rendered.count())
          ? reported
          : undefined;
      };
      await expect.poll(size).toMatch(/^\d+x\d+$/);
      const before = await size();
      await page.setViewportSize({ width: 1000, height: 560 });
      await expect
        .poll(async () => {
          const after = await size();
          return after !== undefined && after !== before;
        })
        .toBe(true);
      await expect(rows).toContainText(`resized ${String(await size())}`);
    });

    await test.step("opening another active card's session detaches the first, which keeps running, and shows the second in its place", async () => {
      await showColumn(page, "Taken");
      await openTerminalControl(cardEntries(readyStory)).click();
      await expect(panel).toHaveCount(1);
      await expectTerminalIdentity(panel, readyStory);
      await expect(sidePanelNamesOf(panel).sessionName).toHaveText(
        "Execution session",
      );
      await expect(sidePanelNamesOf(panel).shownSessionId).toHaveCount(0);
      await expect(rows).toContainText(`attached ${shortId(second)}`);
      await expect(rows).not.toContainText("echo yes, go on");
      await expect.poll(() => attachesEnded(first)).toBe(true);
      await stillListed(first);
      await expect(openTerminalControl(cardEntries(takenStory))).toBeVisible();
    });

    await test.step("Close ends the panel and detaches only, and the keyboard returns to the card entry that opened it", async () => {
      await showColumn(page, "Taken");
      await openTerminalControl(cardEntries(takenStory)).click();
      await expect(rows).toContainText(`attached ${shortId(first)}`);
      await closeSidePanel(panel, { using: "mouse" });
      await expect(panel).toHaveCount(0);
      await expect(openTerminalControl(cardEntries(takenStory))).toBeFocused();
      await expect.poll(() => attachesEnded(first)).toBe(true);
      await stillListed(first);
      await expect(openTerminalControl(cardEntries(readyStory))).toBeVisible();
      await expectMembership(page, launched);
    });

    await test.step("an entry whose story is in no list still opens its session", async () => {
      const completion = completionRevision({
        story: storyA,
        queued: [roughStoryC],
        developer: "Another Developer",
        completedAt: new Date().toISOString(),
        agentless: true,
      });
      const remaining = makeMe.aBacklogEntry
        .with({
          ...storyB,
          plan: { label: "plan", target: storyPlanPath(storyB) },
        })
        .please();
      await origin.publishRevision({
        ...completion,
        backlog: { ...completion.backlog, taken: [remaining] },
      });
      await page.reload();
      await expectMembership(page, {
        taken: [readyStory],
        backlog: [notRefinedStory],
      });
      await showColumn(page, "Taken");
      await openTerminalControl(entry(takenStory)).click();
      await expectTerminalIdentity(panel, takenStory);
      await expect(rows).toContainText(`attached ${shortId(first)}`);
      await page.keyboard.type("carry on");
      await page.keyboard.press("Enter");
      await expect(rows).toContainText("echo carry on");
      await expect(page.locator("body")).not.toContainText("claude attach");
      await expectMembership(page, {
        taken: [readyStory],
        backlog: [notRefinedStory],
      });
    });

    expect(
      new Set(dashboard.claudeAttaches().map((attach) => attach.id)),
    ).toEqual(new Set([shortId(first), shortId(second)]));
    const attachEnvironments = dashboard.claudeAttachEnvironments();
    expect(attachEnvironments.length).toBeGreaterThan(0);
    for (const env of attachEnvironments) expectDeveloperShellEnvironment(env);
  });
});
