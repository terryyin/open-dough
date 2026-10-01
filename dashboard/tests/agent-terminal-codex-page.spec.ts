// Actual page/xterm renders native startup then shared transport/reconnect lifecycle.
import { writeFileSync, readFileSync } from "node:fs";
import path from "node:path";
import { test, expect, stored } from "./support/codexLaunch.ts";
import { launch, refinementRequest } from "./agentLaunchBoundary.ts";
import { cardSessions, parts } from "./dashboardPage.ts";
import {
  publishStoryStagesJourney,
  notRefinedStory,
  notRefinedIdentity,
  type StoryStagesJourney,
} from "./launchJourney.ts";
import { openStoryStagesJourney } from "./storyStagesPage.ts";
import {
  codexAttaches,
  codexEnded,
  codexTerminalMode,
} from "./support/codexTerminal.ts";
import {
  builtDashboardDir,
  startDashboardServer,
  type DashboardServer,
} from "./support/dashboardServer.ts";

test.use({ projectFolders: ["open-dough"] });
let journey: StoryStagesJourney;
test.beforeAll(async () => {
  test.setTimeout(120_000);
  journey = await publishStoryStagesJourney();
});
test.afterAll(() => (journey as StoryStagesJourney | undefined)?.cleanup());

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
  const file = path.join(
    dashboard.home,
    ".open-dough",
    "dashboard",
    "agent-launches.json",
  );
  const state = JSON.parse(readFileSync(file, "utf8")) as Record<
    string,
    unknown[]
  >;
  state["open-dough"] = stored(dashboard.home).map((record) => ({
    ...record,
    doneAt: "2026-10-01T00:00:00Z",
  }));
  writeFileSync(file, JSON.stringify(state));
  const { card } = await openStoryStagesJourney(page, journey);
  const recent = parts(page)
    .recentSessions.getByRole("article")
    .filter({ hasText: native.threadId });
  const panel = page.getByRole("region", { name: "Terminal" });
  const rows = panel.locator(".xterm-rows");
  codexTerminalMode(native, "review");
  await recent.getByRole("button", { name: "Open terminal" }).click();
  await expect(rows).toContainText("Hooks need review");
  expect(stored(dashboard.home)[0]?.doneAt).toBeDefined();
  await expect(panel.getByRole("button", { name: "Mark as done" })).toHaveCount(
    0,
  );
  await panel.locator(".xterm-screen").click();
  await page.keyboard.press("Escape");
  await expect(rows).toContainText("GPT-6.1-Sol default");
  await expect(rows).not.toContainText("context left");
  await expect.poll(() => stored(dashboard.home)[0]?.doneAt).toBeUndefined();
  await expect(cardSessions(card(notRefinedStory))).toHaveCount(1);
  await page.keyboard.type("answer here");
  await page.keyboard.press("Enter");
  await expect(rows).toContainText("echo answer here");
  await page.setViewportSize({ width: 1100, height: 700 });
  await expect(rows).toContainText("resized");
  expect(
    native.calls.filter((call) => call.method === "thread/start"),
  ).toHaveLength(1);
  expect(
    native.calls.filter((call) => call.method === "turn/start"),
  ).toHaveLength(1);
  // A project change preserves the page's one current native attachment.
  await parts(page)
    .project.getByRole("radio", { name: "Doughnut", exact: true })
    .check();
  await expect(panel.getByRole("heading", { level: 2 })).toHaveText(
    notRefinedStory,
  );
  expect(codexAttaches(native)).toHaveLength(1);
  await parts(page)
    .project.getByRole("radio", { name: "Open Dough", exact: true })
    .check();
  await panel.getByRole("button", { name: "Close", exact: true }).click();
  await expect(panel).toHaveCount(0);
  await expect
    .poll(() => codexEnded(native, codexAttaches(native)[0]?.pid ?? 0))
    .toBe("SIGHUP");
  codexTerminalMode(native, "ready");
  await cardSessions(card(notRefinedStory))
    .getByRole("button", { name: "Open terminal" })
    .click();
  await expect(rows).toContainText("original retained history");
  await page.reload();
  await expect(panel).toHaveCount(0);
  await expect
    .poll(() => codexEnded(native, codexAttaches(native)[1]?.pid ?? 0))
    .toBe("SIGHUP");
  await cardSessions(card(notRefinedStory))
    .getByRole("button", { name: "Open terminal" })
    .click();
  await expect(rows).toContainText("original retained history");
  const port = Number(new URL(dashboard.baseURL).port);
  let restarted: DashboardServer | undefined;
  try {
    await dashboard.close();
    await expect(panel.getByRole("status")).toContainText(
      "Disconnected from the session",
    );
    await expect
      .poll(() => codexEnded(native, codexAttaches(native)[2]?.pid ?? 0))
      .toBe("SIGHUP");
    restarted = await startDashboardServer({
      mode: "preview",
      prebuilt: builtDashboardDir,
      github,
      machine,
      port,
      codexProtocol: native,
      projectFolders: ["open-dough"],
    });
    await panel.getByRole("button", { name: "Reconnect" }).click();
    await expect(rows).toContainText("original retained history");
    await expect(panel.getByRole("status")).toBeEmpty();
    await page.keyboard.press("Control+z");
    await expect(panel.getByRole("status")).toContainText("The terminal ended");
    await panel.getByRole("button", { name: "Open again" }).click();
    await expect(rows).toContainText("original retained history");
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
  const file = path.join(
    dashboard.home,
    ".open-dough",
    "dashboard",
    "agent-launches.json",
  );
  const state = JSON.parse(readFileSync(file, "utf8")) as Record<
    string,
    unknown[]
  >;
  state["open-dough"] = stored(dashboard.home).map((record) => ({
    ...record,
    doneAt: "2026-10-01T00:00:00Z",
  }));
  writeFileSync(file, JSON.stringify(state));
  await openStoryStagesJourney(page, journey);
  codexTerminalMode(native, "partial");
  await parts(page)
    .recentSessions.getByRole("article")
    .filter({ hasText: native.threadId })
    .getByRole("button", { name: "Open terminal" })
    .click();
  const panel = page.getByRole("region", { name: "Terminal" });
  await expect(panel.locator(".xterm-rows")).toContainText(
    "retained startup draft",
  );
  await expect(panel.locator(".xterm-rows")).not.toContainText(
    "Ask Codex to do anything",
  );
  await expect(panel.locator(".xterm-rows")).not.toContainText("context left");
  expect(stored(dashboard.home)[0]?.doneAt).toBeDefined();
  await panel.locator(".xterm-screen").click();
  await page.keyboard.press("Escape");
  await expect.poll(() => stored(dashboard.home)[0]?.doneAt).toBeUndefined();
});
