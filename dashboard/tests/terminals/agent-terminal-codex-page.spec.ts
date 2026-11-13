// Actual page/xterm renders native startup then shared transport/reconnect lifecycle.
import type { Page } from "@playwright/test";
import { test, expect, stored } from "../support/codexLaunch.ts";
import { launch, refinementRequest } from "../agentLaunchBoundary.ts";
import { chooseProject, storyCardSessions, parts } from "../dashboardPage.ts";
import {
  openTerminalControl,
  closeTerminal,
  expectNoTerminalText,
  expectTerminalIdentity,
  expectTerminalText,
  openTerminalAgain,
  pressTerminalKey,
  reconnectTerminal,
  terminalPanel,
  terminalScreenParts,
  terminalStatus,
  typeLine,
} from "../terminalScreenPage.ts";
import {
  publishStoryColumnsJourney,
  notRefinedStory,
  notRefinedIdentity,
  type StoryColumnsJourney,
} from "../launchJourney.ts";
import { openStoryColumnsJourney } from "../storyColumnsPage.ts";
import {
  codexAttaches,
  codexEnded,
  codexTerminalMode,
} from "../support/codexTerminal.ts";
import {
  sharedDashboardBuild,
  startDashboardServer,
  type DashboardServer,
} from "../support/dashboardServer.ts";
import { changeLaunchStore } from "../support/launchStore.ts";
import { markAsDone } from "../support/markDone.ts";
test.use({ projectFolders: ["open-dough"] });
let journey: StoryColumnsJourney;
test.beforeAll(async () => {
  journey = await publishStoryColumnsJourney();
});
test.afterAll(() => (journey as StoryColumnsJourney | undefined)?.cleanup());

// Opens the journey once its preparation is read and the boundary launch's
// start has reconciled: until then Backlog cards shrink as they settle, which
// moves Recently done under a press and loses its click.
async function settledAfterBoundaryLaunch(page: Page) {
  const opened = await openStoryColumnsJourney(page, journey);
  await opened.settled();
  await expect(page.getByText(/this story's actions/)).toHaveCount(0);
  return opened;
}

test("rendered readiness preserves hook review and done intent, then keyboard/resize/detach/reconnect retain identity", async ({
  page,
  dashboard,
  github,
  machine,
  codexProtocol: native,
}) => {
  if (native === undefined) throw new Error("Missing native fixture");
  await launch(dashboard, {
    ...refinementRequest,
    identity: notRefinedIdentity,
    title: notRefinedStory,
    host: "codex",
  });
  changeLaunchStore(dashboard, (state) => ({
    ...state,
    "open-dough": stored(dashboard.home).map((record) => ({
      ...record,
      doneAt: new Date(Date.now() - 60_000).toISOString(),
    })),
  }));
  const { card } = await settledAfterBoundaryLaunch(page);
  const recent = parts(page)
    .recentlyDone.getByRole("article")
    .filter({ hasText: native.threadId });
  const panel = terminalPanel(page);
  const { screen } = terminalScreenParts(panel);
  codexTerminalMode(native, "review");
  await openTerminalControl(recent).click();
  await expectTerminalText(panel, "Hooks need review");
  expect(stored(dashboard.home)[0]?.doneAt).toBeDefined();
  await expect(markAsDone(panel)).toHaveCount(1);
  await screen.click();
  await pressTerminalKey(page, "Escape");
  await expectTerminalText(panel, "GPT-6.1-Sol default");
  await expectNoTerminalText(panel, "context left");
  await expect.poll(() => stored(dashboard.home)[0]?.doneAt).toBeUndefined();
  await expect(storyCardSessions(card(notRefinedStory))).toHaveCount(1);
  await typeLine(page, "answer here");
  await expectTerminalText(panel, "echo answer here");
  await page.setViewportSize({ width: 1100, height: 700 });
  await expectTerminalText(panel, "resized");
  expect(
    native.calls.filter((call) => call.method === "thread/start"),
  ).toHaveLength(1);
  expect(
    native.calls.filter((call) => call.method === "turn/start"),
  ).toHaveLength(1);
  // A project change preserves the page's one current native attachment.
  await chooseProject(page, "Doughnut");
  await expectTerminalIdentity(panel, notRefinedStory);
  expect(codexAttaches(native)).toHaveLength(1);
  await chooseProject(page, "Open Dough");
  await closeTerminal(panel);
  await expect(panel).toHaveCount(0);
  await expect
    .poll(() => codexEnded(native, codexAttaches(native)[0]?.pid ?? 0))
    .toBe("SIGHUP");
  codexTerminalMode(native, "ready");
  await openTerminalControl(storyCardSessions(card(notRefinedStory))).click();
  await expectTerminalText(panel, "original retained history");
  await page.reload();
  await expect(panel).toHaveCount(0);
  await expect
    .poll(() => codexEnded(native, codexAttaches(native)[1]?.pid ?? 0))
    .toBe("SIGHUP");
  await openTerminalControl(storyCardSessions(card(notRefinedStory))).click();
  await expectTerminalText(panel, "original retained history");
  const port = Number(new URL(dashboard.baseURL).port);
  let restarted: DashboardServer | undefined;
  try {
    await dashboard.close();
    const status = terminalStatus(panel);
    await expect(status).toContainText("Disconnected from the session");
    await expect
      .poll(() => codexEnded(native, codexAttaches(native)[2]?.pid ?? 0))
      .toBe("SIGHUP");
    restarted = await startDashboardServer({
      mode: "preview",
      prebuilt: sharedDashboardBuild,
      github,
      machine,
      port,
      codexProtocol: native,
      projectFolders: ["open-dough"],
    });
    await reconnectTerminal(panel);
    await expectTerminalText(panel, "original retained history");
    await expect(status).toBeEmpty();
    await pressTerminalKey(page, "Control+z");
    await expect(status).toContainText("The terminal ended");
    await openTerminalAgain(panel);
    await expectTerminalText(panel, "original retained history");
    expect(
      codexAttaches(native).every(
        (attach) => attach.args.at(-1) === native.threadId,
      ),
    ).toBe(true);
    expect(
      native.calls.filter((call) => call.method === "turn/start"),
    ).toHaveLength(1);
    expect(
      native.calls.filter((call) => call.method === "thread/start"),
    ).toHaveLength(1);
    expect(
      native.calls.filter((call) => call.method === "turn/interrupt"),
    ).toHaveLength(0);
  } finally {
    await restarted?.close();
  }
});

test("a native startup title/composer and an incomplete repaint cannot clear done", async ({
  page,
  dashboard,
  codexProtocol: native,
}) => {
  if (native === undefined) throw new Error("Missing native fixture");
  await launch(dashboard, {
    ...refinementRequest,
    identity: notRefinedIdentity,
    title: notRefinedStory,
    host: "codex",
  });
  changeLaunchStore(dashboard, (state) => ({
    ...state,
    "open-dough": stored(dashboard.home).map((record) => ({
      ...record,
      doneAt: new Date(Date.now() - 60_000).toISOString(),
    })),
  }));
  await settledAfterBoundaryLaunch(page);
  codexTerminalMode(native, "partial");
  await openTerminalControl(
    parts(page)
      .recentlyDone.getByRole("article")
      .filter({ hasText: native.threadId }),
  ).click();
  const panel = terminalPanel(page);
  await expectTerminalText(panel, "retained startup draft");
  await expectNoTerminalText(panel, "Ask Codex to do anything");
  await expectNoTerminalText(panel, "context left");
  expect(stored(dashboard.home)[0]?.doneAt).toBeDefined();
  await terminalScreenParts(panel).screen.click();
  await pressTerminalKey(page, "Escape");
  await expect.poll(() => stored(dashboard.home)[0]?.doneAt).toBeUndefined();
});
