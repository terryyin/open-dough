// A launched Cursor session stays visible without a native activity poll.
// Unknown wording is Cursor's host description. Stop and rename stay absent
// because those operations are not on the Cursor host. Delete record remains.
import { readFileSync } from "node:fs";
import type { Page } from "@playwright/test";
import { publishCommittedOrigin } from "./committedOrigin.ts";
import { parts, sessionStateOf } from "./dashboardPage.ts";
import { startSessionField } from "./launchCardPage.ts";
import {
  expectSidebarSessionShown,
  sidebarParts,
} from "./sessionSidebarPage.ts";
import { agentLaunchEndpoint } from "../src/launchRequest.ts";
import { hostDescriptions } from "../src/hostDescription.ts";
import type { HostOperations } from "../src/sessionCapabilities.ts";
import { cursorHost } from "../server/cursorHost.ts";
import { expect, test } from "./support/cursorStart.ts";
import { recordsOf } from "./agentLaunchBoundary.ts";
import type { LaunchRecord } from "../src/launchRecord.ts";
import { expectAdHocReportingInput } from "./support/reportingInputAssertions.ts";

const instruction = "inspect this session";
const unknownWords =
  "Activity unknown: Cursor has no passive status for this session";

type SessionsAnswer = {
  readonly hostOperations: HostOperations;
  readonly records: readonly {
    readonly session: { readonly host: string; readonly sessionId: string };
    readonly sessionState: {
      readonly kind: string;
      readonly activity?: string;
    };
  }[];
};

function readLog(file: string | undefined): string {
  if (file === undefined) return "";
  try {
    return readFileSync(file, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return "";
    throw error;
  }
}

function projectedSessions(page: Page): Promise<SessionsAnswer> {
  return page.evaluate(async (endpoint) => {
    const response = await fetch(endpoint);
    if (!response.ok) throw new Error("Sessions could not be read.");
    return (await response.json()) as SessionsAnswer;
  }, agentLaunchEndpoint);
}

function cursorRecord(answer: SessionsAnswer, sessionId: string) {
  return answer.records.find(
    (record) =>
      record.session.host === "cursor" &&
      record.session.sessionId === sessionId,
  );
}

test("a launched Cursor session is visible without borrowed activity, stop, or rename", async ({
  page,
  dashboard,
  origin,
  cursor,
}) => {
  test.setTimeout(120_000);
  expect(cursorHost.sessions).toBeUndefined();
  expect(cursorHost).not.toHaveProperty("stop");
  expect(cursorHost).not.toHaveProperty("rename");
  expect(hostDescriptions.cursor.unknownObservation).toEqual({
    label: "Activity unknown",
    note: "Cursor has no passive status for this session",
  });
  expect(unknownWords).not.toContain("session list could not be read");
  expect(unknownWords).not.toContain("Continue this conversation in Codex");

  const original = (await origin.originGit("rev-parse", "main")).trim();
  await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision: original,
    repository: "terryyin/open-dough",
    follows: true,
  });
  await page.goto("/");
  await page
    .getByRole("button", { name: "Start session in Open Dough" })
    .click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("combobox", { name: "Host" }).selectOption("cursor");
  await startSessionField(dialog).fill(instruction);
  await dialog.getByRole("button", { name: "Start", exact: true }).click();

  const recent = parts(page).recentSessions.getByRole("article");
  await expect(recent).toHaveCount(1);
  await expect(recent).toContainText(cursor.sessionId);
  await expect(recent).toContainText("Continue in Cursor:");
  await expect(sessionStateOf(recent)).toHaveText(unknownWords);
  await expect(recent).not.toHaveClass(/needs-attention/);
  await expect(
    recent.getByRole("button", { name: "Open terminal" }),
  ).toHaveCount(1);
  await expect(
    recent.getByRole("button", { name: "Delete record…" }),
  ).toHaveCount(1);
  await expect(page.getByRole("button", { name: "Mark as done" })).toHaveCount(
    0,
  );
  await expect(page.getByRole("button", { name: /rename/i })).toHaveCount(0);
  await expect(recent).not.toContainText("session list could not be read");
  await expect(recent).not.toContainText("Continue this conversation in Codex");
  await expect(recent).not.toContainText("Working");
  await expect(recent).not.toContainText("Needs input");
  await expect(recent).not.toContainText("Ready for review");

  const answer = await projectedSessions(page);
  expect(answer.hostOperations.cursor).toEqual({
    attach: true,
    stop: false,
    launchedSessions: false,
  });
  expect(cursorRecord(answer, cursor.sessionId)?.sessionState).toEqual({
    kind: "unknown",
  });

  const sidebar = sidebarParts(page);
  await sidebar.button.click();
  await expect(sidebar.entries).toHaveCount(1);
  await expectSidebarSessionShown(sidebar.entries, unknownWords, "unsettled");
  await expect(sidebar.badge).toHaveCount(0);
  await expect(
    sidebar.sidebar.getByRole("button", {
      name: /Delete record|Mark as done|Rename/i,
    }),
  ).toHaveCount(0);

  const callsAfterView = cursor.calls().map((call) => call.args);
  const prompt = callsAfterView[1]?.at(-1) ?? "";
  const [record] = (await recordsOf(dashboard, "open-dough")) as LaunchRecord[];
  expectAdHocReportingInput(prompt, instruction, record?.request, dashboard);
  expect(callsAfterView).toEqual([
    ["create-chat"],
    ["--workspace", origin.project, "--resume", cursor.sessionId, prompt],
  ]);
  expect(dashboard.claudeCalls()).toEqual([]);
  expect(dashboard.codex.calls).toEqual([]);
  expect(readLog(dashboard.codex.env["FAKE_CODEX_CLI_LOG"])).toBe("");
  expect(readLog(dashboard.codex.env["FAKE_CODEX_DAEMON_LOG"])).toBe("");

  await page.reload();
  await expect(sessionStateOf(recent)).toHaveText(unknownWords);
  await expect(page.getByRole("button", { name: "Mark as done" })).toHaveCount(
    0,
  );
  await expect(
    recent.getByRole("button", { name: "Delete record…" }),
  ).toHaveCount(1);
  const again = await projectedSessions(page);
  expect(again.hostOperations.cursor).toEqual({
    attach: true,
    stop: false,
    launchedSessions: false,
  });
  expect(cursorRecord(again, cursor.sessionId)?.sessionState).toEqual({
    kind: "unknown",
  });
  expect(cursor.calls().map((call) => call.args)).toEqual(callsAfterView);
  expect(dashboard.claudeCalls()).toEqual([]);
  expect(dashboard.codex.calls).toEqual([]);
  expect(readLog(dashboard.codex.env["FAKE_CODEX_CLI_LOG"])).toBe("");
});
