// Actual page/xterm renders native startup then shared transport/reconnect lifecycle.
import type { Page } from "@playwright/test";
import {
  test,
  expect,
  stored,
} from "../../dashboard/test-support/support/codexLaunch.ts";
import {
  launch,
  refinementRequest,
} from "../../dashboard/test-support/agentLaunchBoundary.ts";
import {
  chooseProject,
  storyCardSessions,
  shownDoneSessionEntriesOf,
} from "../../dashboard/test-support/dashboardPage.ts";
import { openTerminalControl } from "../../dashboard/test-support/terminalScreenPage.ts";
import { terminalScreen } from "../../dashboard/test-support/terminalScreen.ts";
import {
  publishStoryColumnsJourney,
  notRefinedStory,
  notRefinedIdentity,
  type StoryColumnsJourney,
} from "../../dashboard/test-support/launchJourney.ts";
import { openStoryColumnsJourney } from "../../dashboard/test-support/storyColumnsPage.ts";
import {
  codexAttaches,
  codexEnded,
  codexTerminalMode,
} from "../../dashboard/test-support/support/codexTerminal.ts";
import {
  sharedDashboardBuild,
  startDashboardServer,
  type DashboardServer,
} from "../../dashboard/test-support/support/dashboardServer.ts";
import { changeLaunchStore } from "../../dashboard/test-support/support/launchStore.ts";
import { markAsDone } from "../../dashboard/test-support/support/markDone.ts";
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
  const doneEntry = await shownDoneSessionEntriesOf(
    page,
    notRefinedStory,
    native.threadId,
  );
  const terminal = terminalScreen(page);
  codexTerminalMode(native, "review");
  await openTerminalControl(doneEntry).click();
  await terminal.expectText("Hooks need review");
  expect(stored(dashboard.home)[0]?.doneAt).toBeDefined();
  await expect(markAsDone(terminal.panel)).toHaveCount(1);
  await terminal.clickScreen();
  await terminal.pressKey("Escape");
  await terminal.expectText("GPT-6.1-Sol default");
  await terminal.expectNoText("context left");
  await expect.poll(() => stored(dashboard.home)[0]?.doneAt).toBeUndefined();
  await expect(storyCardSessions(card(notRefinedStory))).toHaveCount(1);
  await terminal.typeLine("answer here");
  await terminal.expectText("echo answer here");
  await page.setViewportSize({ width: 1100, height: 700 });
  await terminal.expectText("resized");
  expect(
    native.calls.filter((call) => call.method === "thread/start"),
  ).toHaveLength(1);
  expect(
    native.calls.filter((call) => call.method === "turn/start"),
  ).toHaveLength(1);
  // A project change preserves the page's one current native attachment.
  await chooseProject(page, "Doughnut");
  await terminal.expectIdentity(notRefinedStory);
  expect(codexAttaches(native)).toHaveLength(1);
  await chooseProject(page, "Open Dough");
  await terminal.close();
  await terminal.expectClosed();
  await expect
    .poll(() => codexEnded(native, codexAttaches(native)[0]?.pid ?? 0))
    .toBe("SIGHUP");
  codexTerminalMode(native, "ready");
  await openTerminalControl(storyCardSessions(card(notRefinedStory))).click();
  await terminal.expectText("original retained history");
  await page.reload();
  await terminal.expectClosed();
  await expect
    .poll(() => codexEnded(native, codexAttaches(native)[1]?.pid ?? 0))
    .toBe("SIGHUP");
  await openTerminalControl(storyCardSessions(card(notRefinedStory))).click();
  await terminal.expectText("original retained history");
  const port = Number(new URL(dashboard.baseURL).port);
  let restarted: DashboardServer | undefined;
  try {
    await dashboard.close();
    await terminal.expectStatus("Disconnected from the session");
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
    await terminal.reconnect();
    await terminal.expectText("original retained history");
    await terminal.expectStatusEmpty();
    await terminal.pressKey("Control+z");
    await terminal.expectStatus("The terminal ended");
    await terminal.openAgain();
    await terminal.expectText("original retained history");
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
    await shownDoneSessionEntriesOf(page, notRefinedStory, native.threadId),
  ).click();
  const terminal = terminalScreen(page);
  await terminal.expectText("retained startup draft");
  await terminal.expectNoText("Ask Codex to do anything");
  await terminal.expectNoText("context left");
  expect(stored(dashboard.home)[0]?.doneAt).toBeDefined();
  await terminal.clickScreen();
  await terminal.pressKey("Escape");
  await expect.poll(() => stored(dashboard.home)[0]?.doneAt).toBeUndefined();
});
