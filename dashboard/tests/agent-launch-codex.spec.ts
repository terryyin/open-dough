// The real shared host choice, native input, mixed history and continuation journey.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import {
  startDashboardServer,
  builtDashboardDir,
} from "./support/dashboardServer.ts";
import { openTakenBacklog, installRefinementSkill } from "./launchCardPage.ts";
import {
  publishLaunchJourney,
  notRefinedStory,
  notRefinedIdentity,
  type LaunchJourney,
} from "./launchJourney.ts";
import { cardSessions } from "./dashboardPage.ts";
import { parts } from "./dashboardPage.ts";
import { sidebarParts } from "./sessionSidebarPage.ts";
import { rawRequest } from "./support/rawHttp.ts";
import { markDone } from "./agentLaunchBoundary.ts";
import { test, expect, stored, codexSkill } from "./support/codexLaunch.ts";
import { machineSessions, deleteRecord } from "./agentLaunchBoundary.ts";

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
  native.threadId = String(dashboard.claudeListing()[0]?.["sessionId"]);
  await refine(notRefinedStory).click();
  dialog = page.getByRole("dialog");
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
  ).toHaveCount(1);
  await expect(
    dialog.getByRole("checkbox", { name: "Explore", exact: true }),
  ).toHaveCount(0);
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
  await expect(cardSessions(card(notRefinedStory))).toHaveCount(2);
  const codex = cardSessions(card(notRefinedStory)).filter({
    hasText: "Refinement started in Codex",
  });
  await expect(codex).toContainText("First input accepted");
  await expect(codex).toContainText("Live observation unavailable");
  await expect(
    codex.getByRole("button", { name: "Open terminal" }),
  ).toHaveCount(0);
  await expect(codex.getByRole("button", { name: "Mark as done" })).toHaveCount(
    0,
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
  expect(record?.request).not.toHaveProperty("model");
  expect(record?.firstInput).toEqual({
    state: "confirmed",
    turnId: "native-turn-id",
  });
  expect(native.sockets.size).toBe(1);
  await expect(parts(page).recentSessions.getByRole("article")).toHaveCount(2);
  const sidebar = sidebarParts(page);
  await sidebar.button.click();
  await expect(sidebar.entries).toHaveCount(2);
  await expect(
    sidebar.entries.filter({ hasText: "Live observation unavailable" }),
  ).toHaveCount(1);
  await sidebar.entries
    .filter({ hasText: "Live observation unavailable" })
    .getByRole("button")
    .click();
  await expect(page.locator(".terminal-panel")).toHaveCount(0);
  const before = dashboard.claudeCalls().length;
  expect(
    (
      await markDone(dashboard, {
        source: "open-dough",
        session: native.threadId,
        host: "codex",
      })
    ).status,
  ).toBe(400);
  expect(
    (
      await rawRequest({
        url: `${dashboard.baseURL}/__agent-terminal?source=open-dough&host=codex&session=${encodeURIComponent(native.threadId)}`,
        headers: {
          Origin: dashboard.origin,
          Connection: "Upgrade",
          Upgrade: "websocket",
          "Sec-WebSocket-Version": "13",
          "Sec-WebSocket-Key": "dGhlIHNhbXBsZSBub25jZQ==",
        },
      })
    ).status,
  ).toBe(400);
  expect(dashboard.claudeCalls()).toHaveLength(before);
  const command = await codex
    .locator("code")
    .filter({ hasText: "--remote" })
    .innerText();
  const expectedArgs = [
    "codex",
    "resume",
    "--remote",
    native.env["FAKE_CODEX_SOCKET"] === undefined
      ? ""
      : `unix://${native.env["FAKE_CODEX_SOCKET"]}`,
    "--cd",
    path.join(dashboard.home, "git", "open-dough"),
    native.threadId,
  ];
  expect(record?.session.continuation?.args).toEqual(expectedArgs);
  execFileSync("/bin/sh", ["-c", command], {
    env: { ...process.env, ...native.env },
    stdio: "pipe",
  });
  expect(
    JSON.parse(readFileSync(native.env["FAKE_CODEX_CLI_LOG"] ?? "", "utf8")),
  ).toEqual(expectedArgs.slice(1));
  await page.reload();
  await expect(page.getByText(command, { exact: true })).toHaveCount(2);
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
    await expect(page.getByText(command, { exact: true })).toHaveCount(2);
    expect(await machineSessions(restarted)).toHaveLength(2);
    expect(
      native.calls.filter((call) => call.method === "thread/start"),
    ).toHaveLength(1);
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
