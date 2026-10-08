// Recover for an unfinished Cursor session the runner does not hold: the
// not-held offer, resume through the runner, one continuation only on the
// idle composer with confirmed first input, and cases that type nothing or
// withhold Recover.
import { writeFileSync } from "node:fs";
import path from "node:path";
import { cursorCannotLoadChat } from "../src/cursorCannotLoad.ts";
import { cursorHeldLabel } from "../src/cursorHeldLabel.ts";
import { cursorRunnerSentence } from "../src/cursorRunnerSessions.ts";
import type { LaunchRecord } from "../src/launchRecord.ts";
import { stopCursorRunner } from "../server/hosts/cursor/runnerClient.ts";
import { recordsOf } from "./agentLaunchBoundary.ts";
import { parts } from "./dashboardPage.ts";
import { completionReport } from "./support/completionReport.ts";
import {
  agentCalls,
  expectHeldLabel,
  expectReadingWithoutScreenLabel,
  openTakenCursorSession,
  projectedSessions,
  cursorRecord,
} from "./support/cursorSessionReading.ts";
import {
  agentNotRunningLabel,
  endHeldClient,
  keptRecords,
  openStoppedCursorEntry,
  startCursorExecution,
} from "./support/cursorSessionRecovery.ts";
import { expect, test } from "./support/cursorStart.ts";
import { rawRequest } from "./support/rawHttp.ts";
import { queuedIdentity } from "./support/startOrigin.ts";

test("an unfinished not-held Cursor session says the agent is not running, offers Recover, and starts no agent", async ({
  page,
  dashboard,
  origin,
  cursor,
}) => {
  test.setTimeout(120_000);
  const entry = await openStoppedCursorEntry(
    page,
    origin,
    cursor,
    dashboard.home,
  );
  await expect(entry).not.toHaveClass(/needs-attention/);
  await expect(
    entry.getByRole("button", { name: "Delete record…" }),
  ).toHaveCount(1);
  const answer = await projectedSessions(page);
  expect(cursorRecord(answer, cursor.sessionId)?.sessionState).toEqual({
    kind: "unknown",
    label: agentNotRunningLabel,
  });
});

test("Recover on the idle composer with confirmed first input resumes the same chat and sends one continuation", async ({
  page,
  dashboard,
  origin,
  cursor,
}) => {
  test.setTimeout(120_000);
  await startCursorExecution(page, origin, cursor);
  const [record] = (await recordsOf(dashboard, "open-dough")) as LaunchRecord[];
  expect(record?.firstInput?.state).toBe("confirmed");
  expect(record?.start).toMatchObject({
    identity: queuedIdentity,
    branch: expect.any(String),
    workspace: expect.any(String),
  });
  const originalPrompt = "Implement the selected slice.";
  const before = cursor.attaches().length;
  await endHeldClient(page, cursor, dashboard.home);
  await page.reload();
  const stopped = parts(page).taken.locator(".session-entry");
  await expectReadingWithoutScreenLabel(stopped, agentNotRunningLabel);
  await stopped.getByRole("button", { name: "Recover" }).click();
  await expectHeldLabel(stopped, cursorHeldLabel.followUp);
  await expect(stopped.getByRole("button", { name: "Recover" })).toHaveCount(0);
  await expect.poll(() => cursor.attaches().length).toBe(before + 1);
  const resumed = cursor.attaches().at(-1);
  expect(resumed?.sessionId).toBe(cursor.sessionId);
  const workspace =
    record?.session.host === "cursor"
      ? record.session.continuation.workspace
      : "";
  expect(resumed?.args).toEqual([
    "--workspace",
    workspace,
    "--resume",
    cursor.sessionId,
  ]);
  const typed = cursor.input(resumed?.pid ?? 0).replace(/\r$/u, "");
  expect(typed).toContain("Continue the recorded Execution");
  expect(typed).toContain(`Identity: ${queuedIdentity}.`);
  expect(typed).toContain(`Branch: ${record?.start?.branch}.`);
  expect(typed).toContain(`Worktree: ${workspace}.`);
  expect(typed).toContain("without opening another assignment");
  expect(typed).toContain(record?.request.reporting?.command ?? "missing");
  expect(typed).not.toContain(originalPrompt);
  expect(cursor.calls().map((call) => call.args)).toEqual([["create-chat"]]);
});

test("Recover on a working screen types nothing", async ({
  page,
  dashboard,
  origin,
  cursor,
}) => {
  test.setTimeout(120_000);
  const entry = await openStoppedCursorEntry(
    page,
    origin,
    cursor,
    dashboard.home,
  );
  cursor.setAttachMode("working");
  const before = cursor.attaches().length;
  await entry.getByRole("button", { name: "Recover" }).click();
  await expectHeldLabel(entry, cursorHeldLabel.working);
  await expect.poll(() => cursor.attaches().length).toBe(before + 1);
  const resumed = cursor.attaches().at(-1);
  expect(cursor.input(resumed?.pid ?? 0)).toBe("");
});

test("Recover with unconfirmed first input types nothing", async ({
  page,
  dashboard,
  origin,
  cursor,
}) => {
  test.setTimeout(120_000);
  await openTakenCursorSession(page, origin);
  const [record] = keptRecords(dashboard.home);
  if (record === undefined) throw new Error("Missing record.");
  writeFileSync(
    path.join(
      dashboard.home,
      ".open-dough",
      "dashboard",
      "agent-launches.json",
    ),
    JSON.stringify({
      "open-dough": [
        {
          ...record,
          firstInput: {
            state: "uncertain",
            instruction: "inspect this session",
            explanation: "not confirmed",
          },
        },
      ],
    }),
  );
  await endHeldClient(page, cursor, dashboard.home);
  await page.reload();
  const entry = parts(page).taken.locator(".session-entry");
  await entry.getByRole("button", { name: "Recover" }).click();
  await expectHeldLabel(entry, cursorHeldLabel.followUp);
  const resumed = cursor.attaches().at(-1);
  expect(cursor.input(resumed?.pid ?? 0)).toBe("");
  await expect(entry).toContainText("First input acceptance uncertain");
});

test("done and completed sessions offer no Recover", async ({
  page,
  dashboard,
  origin,
  cursor,
}) => {
  test.setTimeout(120_000);
  await openTakenCursorSession(page, origin);
  await endHeldClient(page, cursor, dashboard.home);
  const [record] = keptRecords(dashboard.home);
  if (record === undefined) throw new Error("Missing record.");
  const file = path.join(
    dashboard.home,
    ".open-dough",
    "dashboard",
    "agent-launches.json",
  );
  writeFileSync(
    file,
    JSON.stringify({
      "open-dough": [{ ...record, doneAt: "2026-10-01T00:00:00.000Z" }],
    }),
  );
  await page.reload();
  let entry = parts(page).recentlyDone.locator(".session-entry");
  await expect(entry).toHaveCount(1);
  await expect(entry.getByRole("button", { name: "Recover" })).toHaveCount(0);

  writeFileSync(
    file,
    JSON.stringify({
      "open-dough": [
        {
          ...record,
          completion: completionReport({
            outcome: "completed",
            message: "Finished with attention",
          }),
        },
      ],
    }),
  );
  await page.reload();
  entry = parts(page).taken.locator(".session-entry");
  await expect(entry).toHaveCount(1);
  await expectReadingWithoutScreenLabel(
    entry,
    "Activity unknown: Cursor has no passive status for this session",
  );
  await expect(entry.getByRole("button", { name: "Recover" })).toHaveCount(0);
  await expect(entry).toContainText("Unread report");
});

test("runner not running offers Recover; the click starts the runner and resumes", async ({
  page,
  dashboard,
  origin,
  cursor,
}) => {
  test.setTimeout(120_000);
  await openTakenCursorSession(page, origin);
  const calls = agentCalls(cursor);
  const attaches = cursor.attaches().length;
  await stopCursorRunner(dashboard.home);
  await page.reload();
  const entry = parts(page).taken.locator(".session-entry");
  await expectReadingWithoutScreenLabel(
    entry,
    cursorRunnerSentence("not-running"),
  );
  await expect(entry.getByRole("button", { name: "Recover" })).toHaveCount(1);
  expect(agentCalls(cursor)).toEqual(calls);
  expect(cursor.attaches()).toHaveLength(attaches);
  await entry.getByRole("button", { name: "Recover" }).click();
  await expectHeldLabel(entry, cursorHeldLabel.followUp);
  await expect.poll(() => cursor.attaches().length).toBeGreaterThan(attaches);
});

test("cannot-load resume replaces the chat on the same launch", async ({
  page,
  dashboard,
  origin,
  cursor,
}) => {
  test.setTimeout(120_000);
  await startCursorExecution(page, origin, cursor);
  const [before] = (await recordsOf(dashboard, "open-dough")) as LaunchRecord[];
  expect(before?.firstInput?.state).toBe("confirmed");
  if (before?.session.host !== "cursor") throw new Error("Missing Cursor.");
  const oldId = before.session.sessionId;
  const originalPrompt = "Implement the selected slice.";
  const replacementId = "a1b2c3d4-e5f6-4789-abcd-ef0123456789";
  await endHeldClient(page, cursor, dashboard.home);
  cursor.setAttachMode("cannot-load");
  cursor.queueCreateChatId(replacementId);
  const createBefore = cursor
    .calls()
    .filter((call) => call.args.includes("create-chat")).length;
  await page.reload();
  const entry = parts(page).taken.locator(".session-entry");
  const recoverResponse = page.waitForResponse((response) =>
    response.url().includes("/__agent-launch/recover"),
  );
  await entry.getByRole("button", { name: "Recover" }).click();
  const recover = await recoverResponse;
  const recoverBody = (await recover.json()) as {
    kind: string;
    explanation?: string;
    record?: { session?: { sessionId?: string } };
  };
  expect(
    {
      status: recover.status(),
      kind: recoverBody.kind,
      explanation: recoverBody.explanation,
      sessionId: recoverBody.record?.session?.sessionId,
      createCalls: cursor
        .calls()
        .filter((call) => call.args.includes("create-chat"))
        .map((call) => call.args),
      attachIds: cursor.attaches().map((attach) => attach.sessionId),
    },
    "recover response",
  ).toMatchObject({
    status: 200,
    kind: "recovered",
    sessionId: replacementId,
  });
  await expectHeldLabel(entry, cursorHeldLabel.followUp);
  await expect
    .poll(
      () =>
        cursor.calls().filter((call) => call.args.includes("create-chat"))
          .length,
    )
    .toBe(createBefore + 1);
  const [after] = keptRecords(dashboard.home);
  if (after?.session.host !== "cursor") throw new Error("Missing Cursor.");
  expect(after.session.sessionId).toBe(replacementId);
  expect(after.session.continuation.args).toEqual([
    expect.any(String),
    "--workspace",
    before.session.continuation.workspace,
    "--resume",
    replacementId,
  ]);
  const resumed = cursor.attaches().at(-1);
  expect(resumed?.sessionId).toBe(replacementId);
  const typed = cursor.input(resumed?.pid ?? 0).replace(/\r$/u, "");
  expect(typed).toContain(originalPrompt);
  expect(typed).toContain("Continue the recorded Execution");
  expect(typed).toContain(`Identity: ${queuedIdentity}.`);
  expect(typed).not.toContain(cursorCannotLoadChat);
  const reference = after.request.reporting?.reference;
  if (reference === undefined) throw new Error("Missing reporting reference.");
  const post = (session: string) =>
    rawRequest({
      url: `${dashboard.baseURL}/__agent-launch/completion`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: dashboard.origin,
      },
      body: JSON.stringify({
        source: "open-dough",
        host: "cursor",
        reference,
        session,
        outcome: "unfinished",
        message: "Replacement completion check.",
      }),
    });
  expect((await post(replacementId)).status).toBe(200);
  expect((await post(oldId)).status).toBe(409);
  expect((await post(oldId)).body).toContain(
    "The report does not name this launch's recorded session.",
  );
});
