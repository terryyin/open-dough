// The real shared host choice, native input, mixed history and continuation journey.
import path from "node:path";
import {
  startDashboardServer,
  builtDashboardDir,
} from "./support/dashboardServer.ts";
import {
  openTakenBacklog,
  installRefinementSkill,
  showOptions,
} from "./launchCardPage.ts";
import {
  publishLaunchJourney,
  notRefinedStory,
  notRefinedIdentity,
  type LaunchJourney,
} from "./launchJourney.ts";
import { cardSessions } from "./dashboardPage.ts";
import { parts } from "./dashboardPage.ts";
import { sidebarParts } from "./sessionSidebarPage.ts";
import { markDone } from "./agentLaunchBoundary.ts";
import { test, expect, stored, codexSkill } from "./support/codexLaunch.ts";
import { machineSessions, deleteRecord } from "./agentLaunchBoundary.ts";
import { passive } from "./support/codexObservation.ts";
import { expectMixedContinuation } from "./continuationPage.ts";
import {
  expectSavedContinuation,
  expectResumeCommand,
  disconnectContinuation,
} from "./support/codexContinuation.ts";
import { markDoneAnyway } from "./support/markDone.ts";

test.use({ projectFolders: ["open-dough"] });
let journey: LaunchJourney | undefined;
test.beforeAll(async () => {
  test.setTimeout(120_000);
  journey = await publishLaunchJourney();
});
test.afterAll(() => journey?.cleanup());

test("shared host choice uses own installation/defaults, keeps equal IDs distinct and survives page/server restart", async ({
  page,
  dashboard,
  codexProtocol: protocol,
  machine,
}) => {
  const native = protocol;
  if (native === undefined) throw new Error("Missing native fixture.");
  if (journey === undefined) throw new Error("Missing published journey.");
  const root = codexSkill(dashboard.home, "--before-switch");
  installRefinementSkill(dashboard.home);
  const { refine, card } = await openTakenBacklog(page, journey);
  dashboard.claudeScenario("launched");
  await refine(notRefinedStory).click();
  let dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name: "Start", exact: true }).click();
  await expect(cardSessions(card(notRefinedStory))).toHaveCount(1);
  const claudeSession = String(dashboard.claudeListing()[0]?.["sessionId"]);
  await markDoneAnyway(cardSessions(card(notRefinedStory)));
  await expect(cardSessions(card(notRefinedStory))).toHaveCount(0);
  native.threadId = claudeSession;
  await refine(notRefinedStory).click();
  dialog = page.getByRole("dialog");
  await showOptions(dialog);
  await dialog.getByRole("checkbox", { name: "Explore", exact: true }).check();
  await dialog.getByRole("combobox", { name: "Model" }).selectOption("opus");
  codexSkill(dashboard.home, "--codex-only"); // Change after page read: host switch must reread its installation.
  await dialog.getByRole("combobox", { name: "Host" }).selectOption("codex");
  await expect(dialog).toHaveAccessibleName("Start refinement in Codex");
  await expect(dialog).toContainText(
    "Not offered any more, so not sent: --explore.",
  );
  await expect(dialog.getByRole("combobox", { name: "Model" })).toHaveValue("");
  await expect(
    dialog.getByRole("combobox", { name: "Model" }).locator("option"),
  ).toHaveText(["Use Codex setting", "Native Sol", "Native Luna"]);
  await expect(
    dialog.getByRole("checkbox", { name: "Explore", exact: true }),
  ).toHaveCount(0);
  await showOptions(dialog);
  await dialog
    .getByRole("checkbox", { name: "Codex option", exact: true })
    .check();
  await dialog
    .getByRole("textbox", { name: "Instruction (optional)" })
    .fill("Ask me about scope.");
  native.beforeInput = () => {
    expect(
      stored(dashboard.home).find((record) => record.session.host === "codex"),
    ).toMatchObject({
      session: {
        sessionId: native.threadId,
        continuation: {
          workspace: path.dirname(path.dirname(path.dirname(root))),
        },
      },
      firstInput: { state: "uncertain" },
    });
  };
  await dialog.getByRole("button", { name: "Start", exact: true }).click();
  await expect(cardSessions(card(notRefinedStory))).toHaveCount(1);
  const codex = cardSessions(card(notRefinedStory)).filter({
    hasText: "Refinement started in Codex",
  });
  await expect(codex).toContainText("First input accepted");
  await page.reload(); // Fresh shared polling replaces launch-time unknown.
  await expect(codex.locator(".session-state")).toHaveText("Working");
  await expect(
    codex.getByRole("button", { name: "Open terminal" }),
  ).toHaveCount(1);
  await expect(codex.getByRole("button", { name: "Mark as done" })).toHaveCount(
    1,
  );
  expect(native.calls.filter((call) => call.method === "thread/start")).toEqual(
    [
      {
        method: "thread/start",
        params: { cwd: path.join(dashboard.home, "git", "open-dough") },
      },
    ],
  );
  expect(
    native.calls.find((call) => call.method === "turn/start")?.params,
  ).toEqual({
    threadId: native.threadId,
    input: [
      {
        type: "text",
        text: `$dough-story-refinement ${notRefinedIdentity} --codex-only\n\nAsk me about scope.`,
      },
      {
        type: "skill",
        name: "dough-story-refinement",
        path: path.join(root, "SKILL.md"),
      },
    ],
  });
  const record = stored(dashboard.home).find(
    (entry) => entry.session.host === "codex",
  );
  if (record?.session.host !== "codex")
    throw new Error("Missing saved Codex record.");
  expect(record.request).not.toHaveProperty("model");
  expect(record.firstInput).toMatchObject({
    state: "confirmed",
    turnId: "native-turn-id",
    instruction: `$dough-story-refinement ${notRefinedIdentity} --codex-only\n\nAsk me about scope.`,
  });
  const { continuation, args } = expectSavedContinuation(
    record.session,
    dashboard.home,
    native,
  );
  const checkContinuation = (notice?: string) =>
    expectMixedContinuation(page, card(notRefinedStory), continuation, notice);
  const beforeDisplay = stored(dashboard.home);
  const sinceDisplay = native.calls.length;
  await checkContinuation();
  await page.reload();
  await checkContinuation();
  expect(stored(dashboard.home)).toEqual(beforeDisplay);
  passive(native.calls.slice(sinceDisplay));
  expect(native.sockets.size).toBe(1);
  await expect(parts(page).recentlyDone.getByRole("article")).toHaveCount(2);
  const sidebar = sidebarParts(page);
  await sidebar.button.click();
  await expect(sidebar.entries).toHaveCount(1);
  await expect(sidebar.entries.filter({ hasText: "Working" })).toHaveCount(1);
  // Both hosts share the opaque ID; the open Codex session is the sidebar entry.
  await sidebar.entries.first().getByRole("button").click();
  await expect(page.locator(".side-panel")).toHaveCount(1);
  await expect(page.locator(".xterm-rows")).toContainText(
    "original retained history",
  );
  await page
    .getByRole("region", { name: "Terminal" })
    .getByRole("button", { name: "Close", exact: true })
    .click();
  const before = dashboard.claudeCalls().length;
  expect(
    (
      await markDone(dashboard, {
        source: "open-dough",
        session: "unrecorded-codex-thread",
        host: "codex",
      })
    ).status,
  ).toBe(404);
  expect(dashboard.claudeCalls()).toHaveLength(before);
  const shownCommand = await codex
    .locator("code")
    .filter({ hasText: "--remote" })
    .innerText();
  expectResumeCommand(shownCommand, args, native);
  const { notice, records: withNotice } = await disconnectContinuation(
    record.session,
    dashboard.home,
    native,
  );
  const sinceNotice = native.calls.length;
  await page.reload();
  await checkContinuation(notice);
  expect(stored(dashboard.home)).toEqual(withNotice);
  passive(native.calls.slice(sinceNotice));
  const port = Number(new URL(dashboard.baseURL).port);
  await dashboard.close();
  await expect.poll(() => native.sockets.size).toBe(0);
  const restarted = await startDashboardServer({
    mode: "preview",
    prebuilt: builtDashboardDir,
    machine,
    github: dashboard.github,
    port,
    codexProtocol: protocol,
  });
  try {
    await page.reload();
    await checkContinuation(notice);
    expect(stored(dashboard.home)).toEqual(withNotice);
    passive(native.calls.slice(sinceNotice));
    expect(await machineSessions(restarted)).toHaveLength(2);
    expect(
      native.calls.filter((call) => call.method === "thread/start"),
    ).toHaveLength(1);
    native.failRead = true;
    expect(
      (
        await deleteRecord(restarted, {
          source: "open-dough",
          session: native.threadId,
          host: "codex",
        })
      ).status,
    ).toBe(200);
    expect(await machineSessions(restarted)).toHaveLength(1);
    expect(stored(restarted.home)[0]?.session.host).toBe("claude");
  } finally {
    await restarted.close();
  }
});
