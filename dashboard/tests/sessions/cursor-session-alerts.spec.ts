// Held Cursor sessions alert once per actionable state; unheld or stopped
// sessions stay unknown. The real server observes synthetic hosts and notifier.
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, test } from "../support/pageTest.ts";
import { launch } from "../agentLaunchBoundary.ts";
import { agentNotRunningLabel } from "../../src/sessionRecovery.ts";
import { cursorRunnerSentence } from "../../src/cursorRunnerSessions.ts";
import { stopCursorRunner } from "../../server/hosts/cursor/runnerClient.ts";
import { installFakeCursor } from "../support/fakeCursor.ts";
import {
  instructedCursorRequest,
  keptCursor,
  rewriteKeptCursor,
  startCursorDashboard,
  withCursorLaunch,
} from "../support/keptCursorTurn.ts";
import { messages } from "../support/sessionAlerts.ts";
import {
  cursorQuestion,
  cursorState,
} from "../support/cursorSessionReading.ts";
import { completionReport } from "../support/completionReport.ts";
import { waitUntil } from "../support/waitUntil.ts";

// Let the 100 ms alert loop observe re-arming before changing the screen again.
async function awaitAlertPolls(): Promise<void> {
  await waitUntil(() => false, { timeoutMs: 350 });
}

type CursorServer = Parameters<typeof launch>[0];

async function launchConfirmed(server: CursorServer): Promise<void> {
  const launched = await launch(
    server,
    instructedCursorRequest("inspect this session"),
  );
  expect(launched.status).toBe(200);
  expect(keptCursor(server.home).firstInput?.state).toBe("confirmed");
}

test("a follow-up prompt whose first instruction was never confirmed reads Awaiting first instruction and alerts nothing", async () => {
  const cursor = installFakeCursor({ screen: "working" });
  const machine = mkdtempSync(path.join(tmpdir(), "dough-cursor-guard-"));
  let server = await startCursorDashboard(
    { mode: "boundary" },
    cursor,
    machine,
    { alertCheckMs: 100 },
  );
  try {
    const readState = () => cursorState(server);
    await launchConfirmed(server);
    await server.close();
    rewriteKeptCursor(server.home, (record) => ({
      ...record,
      firstInput: { state: "awaiting" },
    }));
    cursor.setAttachMode("follow-up");
    server = await startCursorDashboard({ mode: "boundary" }, cursor, machine, {
      alertCheckMs: 100,
    });
    await expect.poll(readState).toEqual({
      kind: "available",
      availability: "loaded",
      activity: "awaiting-instruction",
    });
    expect(server.notifierCalls()).toEqual([]);
  } finally {
    await server.close();
    await stopCursorRunner(path.join(machine, "home"));
    cursor.cleanup();
    rmSync(machine, { recursive: true, force: true });
  }
});

test("a held Cursor session alerts once per actionable entry, re-arms after working, and stays quiet when it vanishes or the runner stops", async () => {
  const cursor = installFakeCursor({ screen: "working" });
  await withCursorLaunch(
    { mode: "boundary" },
    cursor,
    async (server) => {
      const readState = () => cursorState(server);
      await launchConfirmed(server);
      const pid = cursor.attaches()[0]?.pid ?? 0;
      await expect.poll(readState).toEqual({
        kind: "available",
        availability: "loaded",
        activity: "working",
      });
      expect(server.notifierCalls()).toEqual([]);

      cursor.setAttachMode("waiting");
      await expect.poll(() => server.notifierCalls().length).toBe(1);
      expect(messages(server)).toEqual([`Needs input: ${cursorQuestion}`]);
      await expect.poll(readState).toEqual({
        kind: "available",
        availability: "loaded",
        activity: "waiting",
        waitingFor: cursorQuestion,
      });
      expect(server.notifierCalls()).toHaveLength(1);

      cursor.setAttachMode("working");
      await expect.poll(readState).toEqual({
        kind: "available",
        availability: "loaded",
        activity: "working",
      });
      await awaitAlertPolls();
      expect(server.notifierCalls()).toHaveLength(1);

      cursor.setAttachMode("waiting");
      await expect.poll(() => server.notifierCalls().length).toBe(2);
      expect(messages(server)).toEqual([
        `Needs input: ${cursorQuestion}`,
        `Needs input: ${cursorQuestion}`,
      ]);

      cursor.setAttachMode("working");
      await expect.poll(readState).toEqual({
        kind: "available",
        availability: "loaded",
        activity: "working",
      });
      await awaitAlertPolls();
      cursor.setAttachMode("follow-up");
      await expect.poll(() => server.notifierCalls().length).toBe(3);
      expect(messages(server).at(-1)).toBe("Ready for review");
      await expect.poll(readState).toEqual({
        kind: "available",
        availability: "loaded",
        activity: "review",
      });
      expect(server.notifierCalls()).toHaveLength(3);

      process.kill(pid, "SIGTERM");
      await expect.poll(readState).toEqual({
        kind: "unknown",
        label: agentNotRunningLabel,
      });
      await awaitAlertPolls();
      expect(server.notifierCalls()).toHaveLength(3);

      await stopCursorRunner(server.home);
      await expect.poll(readState).toEqual({
        kind: "unknown",
        label: cursorRunnerSentence("not-running"),
      });
      await awaitAlertPolls();
      expect(server.notifierCalls()).toHaveLength(3);
      expect(messages(server)).toEqual([
        `Needs input: ${cursorQuestion}`,
        `Needs input: ${cursorQuestion}`,
        "Ready for review",
      ]);
    },
    { alertCheckMs: 100 },
  );
});

test("cancelled and failed history settling to the follow-up prompt reads only Ready for review, alerts no failure, and vanishing stays unknown", async () => {
  const cursor = installFakeCursor({ screen: "working" });
  await withCursorLaunch(
    { mode: "boundary" },
    cursor,
    async (server) => {
      const readState = () => cursorState(server);
      await launchConfirmed(server);
      const pid = cursor.attaches()[0]?.pid ?? 0;
      await expect.poll(readState).toEqual({
        kind: "available",
        availability: "loaded",
        activity: "working",
      });
      expect(server.notifierCalls()).toEqual([]);

      // Cancelled history alone still reads review, not failure or interruption.
      cursor.setAttachMode("cancelled-follow-up");
      await expect.poll(readState).toEqual({
        kind: "available",
        availability: "loaded",
        activity: "review",
      });
      await expect.poll(() => server.notifierCalls().length).toBe(1);
      expect(messages(server)).toEqual(["Ready for review"]);
      await awaitAlertPolls();
      expect(server.notifierCalls()).toHaveLength(1);

      process.kill(pid, "SIGTERM");
      await expect.poll(readState).toEqual({
        kind: "unknown",
        label: agentNotRunningLabel,
      });
      await awaitAlertPolls();
      expect(server.notifierCalls()).toHaveLength(1);
      expect(messages(server)).toEqual(["Ready for review"]);
    },
    { alertCheckMs: 100 },
  );
});

test("a finished Cursor record the runner does not hold stays unknown with no claim and no alert", async () => {
  const cursor = installFakeCursor({ screen: "working" });
  const machine = mkdtempSync(path.join(tmpdir(), "dough-cursor-finished-"));
  let server = await startCursorDashboard(
    { mode: "boundary" },
    cursor,
    machine,
    { alertCheckMs: 100 },
  );
  try {
    const readState = () => cursorState(server);
    await launchConfirmed(server);
    await expect.poll(readState).toEqual({
      kind: "available",
      availability: "loaded",
      activity: "working",
    });
    const pid = cursor.attaches()[0]?.pid ?? 0;
    process.kill(pid, "SIGTERM");
    await expect.poll(readState).toEqual({
      kind: "unknown",
      label: agentNotRunningLabel,
    });
    await server.close();
    rewriteKeptCursor(server.home, (record) => ({
      ...record,
      completion: completionReport(),
    }));
    server = await startCursorDashboard({ mode: "boundary" }, cursor, machine, {
      alertCheckMs: 100,
    });
    await expect.poll(readState).toEqual({ kind: "unknown" });
    await awaitAlertPolls();
    expect(server.notifierCalls()).toEqual([]);
  } finally {
    await server.close();
    await stopCursorRunner(path.join(machine, "home"));
    cursor.cleanup();
    rmSync(machine, { recursive: true, force: true });
  }
});
