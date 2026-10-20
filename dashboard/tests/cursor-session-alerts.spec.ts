// A held Cursor session alerts through the dashboard server's shared
// session-alert loop (../server/sessionAlerts.ts): entering Needs input
// fires one notification naming the question, working re-arms it so a
// later question alerts again, and finishing to the follow-up prompt after
// a confirmed first instruction fires one Ready for review. A client the
// runner no longer holds and a stopped runner keep the honest unknown
// readings and fire nothing. The synthetic `cursor-agent`
// (./support/fakeCursor.ts) and `terminal-notifier` are all the server
// reaches; the server reads the sessions every 100 ms here.
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, test } from "./support/pageTest.ts";
import { launch, machineSessions } from "./agentLaunchBoundary.ts";
import type { LaunchRecord } from "../src/launchRecord.ts";
import { agentNotRunningLabel } from "../src/sessionRecovery.ts";
import { cursorRunnerSentence } from "../src/cursorRunnerSessions.ts";
import { stopCursorRunner } from "../server/hosts/cursor/runnerClient.ts";
import { installFakeCursor } from "./support/fakeCursor.ts";
import {
  instructedCursorRequest,
  keptCursor,
  startCursorDashboard,
  withCursorLaunch,
} from "./support/keptCursorTurn.ts";
import { messages } from "./support/sessionAlerts.ts";
import { cursorQuestion } from "./support/cursorSessionReading.ts";
import { completionReport } from "./support/completionReport.ts";
import { waitUntil } from "./support/waitUntil.ts";

// This spec's alert loop reads every 100 ms. After a screen change, give
// that loop several reads in the new state before changing the screen
// again, so re-arming is observed by the loop and not only by this test's
// own session reads.
async function awaitAlertPolls(): Promise<void> {
  await waitUntil(() => false, { timeoutMs: 350 });
}

type CursorServer = Parameters<typeof launch>[0];

// Launches one instructed Cursor session and requires its first
// instruction to be confirmed delivered.
async function launchConfirmed(server: CursorServer): Promise<void> {
  const launched = await launch(
    server,
    instructedCursorRequest("inspect this session"),
  );
  expect(launched.status).toBe(200);
  expect(keptCursor(server.home).firstInput?.state).toBe("confirmed");
}

// Replaces the one kept Cursor record with `change` applied to it.
function rewriteKeptRecord(
  server: CursorServer,
  change: (record: LaunchRecord) => LaunchRecord,
): void {
  const recordsFile = path.join(
    server.home,
    ".open-dough",
    "dashboard",
    "agent-launches.json",
  );
  const kept = JSON.parse(readFileSync(recordsFile, "utf8")) as Record<
    string,
    LaunchRecord[]
  >;
  const [record] = kept["open-dough"] ?? [];
  if (record === undefined) throw new Error("No Cursor session recorded.");
  kept["open-dough"] = [change(record)];
  writeFileSync(recordsFile, JSON.stringify(kept));
}

test("a follow-up prompt whose first instruction was never confirmed reads Awaiting first instruction and alerts nothing", async () => {
  test.setTimeout(120_000);
  const cursor = installFakeCursor({ screen: "working" });
  const machine = mkdtempSync(path.join(tmpdir(), "dough-cursor-guard-"));
  let server = await startCursorDashboard(
    { mode: "boundary" },
    cursor,
    machine,
    { alertCheckMs: 100 },
  );
  try {
    await launchConfirmed(server);
    await server.close();
    // The record now says its first instruction was never confirmed; the
    // already-delivered instruction cannot confirm it again.
    rewriteKeptRecord(server, (record) => ({
      ...record,
      firstInput: { state: "awaiting" },
    }));
    cursor.setAttachMode("follow-up");
    server = await startCursorDashboard({ mode: "boundary" }, cursor, machine, {
      alertCheckMs: 100,
    });
    await expect
      .poll(() => cursorState(server))
      .toEqual({
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

type SessionState = {
  readonly kind: string;
  readonly availability?: string;
  readonly activity?: string;
  readonly waitingFor?: string;
  readonly label?: string;
};

async function cursorState(
  server: Parameters<typeof machineSessions>[0],
): Promise<SessionState | undefined> {
  const records = (await machineSessions(server)) as {
    readonly session: { readonly host: string };
    readonly sessionState: SessionState;
  }[];
  return records.find((record) => record.session.host === "cursor")
    ?.sessionState;
}

test("a held Cursor session alerts once per actionable entry, re-arms after working, and stays quiet when it vanishes or the runner stops", async () => {
  test.setTimeout(120_000);
  const cursor = installFakeCursor({ screen: "working" });
  await withCursorLaunch(
    { mode: "boundary" },
    cursor,
    async (server) => {
      await launchConfirmed(server);
      const pid = cursor.attaches()[0]?.pid ?? 0;
      await expect
        .poll(() => cursorState(server))
        .toEqual({
          kind: "available",
          availability: "loaded",
          activity: "working",
        });
      expect(server.notifierCalls()).toEqual([]);

      cursor.setAttachMode("waiting");
      await expect.poll(() => server.notifierCalls().length).toBe(1);
      expect(messages(server)).toEqual([`Needs input: ${cursorQuestion}`]);
      await expect
        .poll(() => cursorState(server))
        .toEqual({
          kind: "available",
          availability: "loaded",
          activity: "waiting",
          waitingFor: cursorQuestion,
        });
      expect(server.notifierCalls()).toHaveLength(1);

      cursor.setAttachMode("working");
      await expect
        .poll(() => cursorState(server))
        .toEqual({
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
      await expect
        .poll(() => cursorState(server))
        .toEqual({
          kind: "available",
          availability: "loaded",
          activity: "working",
        });
      await awaitAlertPolls();
      cursor.setAttachMode("follow-up");
      await expect.poll(() => server.notifierCalls().length).toBe(3);
      expect(messages(server).at(-1)).toBe("Ready for review");
      await expect
        .poll(() => cursorState(server))
        .toEqual({
          kind: "available",
          availability: "loaded",
          activity: "review",
        });
      expect(server.notifierCalls()).toHaveLength(3);

      // The client vanishes: no success, failure, or review claim, no alert.
      process.kill(pid, "SIGTERM");
      await expect
        .poll(() => cursorState(server))
        .toEqual({
          kind: "unknown",
          label: agentNotRunningLabel,
        });
      await awaitAlertPolls();
      expect(server.notifierCalls()).toHaveLength(3);

      // The runner stops: today's honest wording, and still no alert.
      await stopCursorRunner(server.home);
      await expect
        .poll(() => cursorState(server))
        .toEqual({
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
    undefined,
    { alertCheckMs: 100 },
  );
});

test("cancelled and failed history settling to the follow-up prompt reads only Ready for review, alerts no failure, and vanishing stays unknown", async () => {
  test.setTimeout(120_000);
  const cursor = installFakeCursor({ screen: "working" });
  await withCursorLaunch(
    { mode: "boundary" },
    cursor,
    async (server) => {
      await launchConfirmed(server);
      const pid = cursor.attaches()[0]?.pid ?? 0;
      await expect
        .poll(() => cursorState(server))
        .toEqual({
          kind: "available",
          availability: "loaded",
          activity: "working",
        });
      expect(server.notifierCalls()).toEqual([]);

      // History alone proves neither failure nor interruption: the exact
      // state is review (never failed/interrupted), and the only alert is
      // the follow-up prompt's Ready for review.
      cursor.setAttachMode("cancelled-follow-up");
      await expect
        .poll(() => cursorState(server))
        .toEqual({
          kind: "available",
          availability: "loaded",
          activity: "review",
        });
      await expect.poll(() => server.notifierCalls().length).toBe(1);
      expect(messages(server)).toEqual(["Ready for review"]);
      await awaitAlertPolls();
      expect(server.notifierCalls()).toHaveLength(1);

      // The client vanishes (runner still running, session unfinished):
      // agent-not-running unknown, with no success, failure, or review
      // claim and no further alert.
      process.kill(pid, "SIGTERM");
      await expect
        .poll(() => cursorState(server))
        .toEqual({
          kind: "unknown",
          label: agentNotRunningLabel,
        });
      await awaitAlertPolls();
      expect(server.notifierCalls()).toHaveLength(1);
      expect(messages(server)).toEqual(["Ready for review"]);
    },
    undefined,
    { alertCheckMs: 100 },
  );
});

test("a finished Cursor record the runner does not hold stays unknown with no claim and no alert", async () => {
  test.setTimeout(120_000);
  const cursor = installFakeCursor({ screen: "working" });
  const machine = mkdtempSync(path.join(tmpdir(), "dough-cursor-finished-"));
  let server = await startCursorDashboard(
    { mode: "boundary" },
    cursor,
    machine,
    { alertCheckMs: 100 },
  );
  try {
    await launchConfirmed(server);
    await expect
      .poll(() => cursorState(server))
      .toEqual({
        kind: "available",
        availability: "loaded",
        activity: "working",
      });
    const pid = cursor.attaches()[0]?.pid ?? 0;
    // Process exit alone: the client goes, then the record is finished
    // (a quiet completed report). Neither fact proves success, failure,
    // interruption, or review.
    process.kill(pid, "SIGTERM");
    await expect
      .poll(() => cursorState(server))
      .toEqual({
        kind: "unknown",
        label: agentNotRunningLabel,
      });
    await server.close();
    rewriteKeptRecord(server, (record) => ({
      ...record,
      completion: completionReport(),
    }));
    server = await startCursorDashboard({ mode: "boundary" }, cursor, machine, {
      alertCheckMs: 100,
    });
    // No observation for a finished, unheld session: plain unknown with
    // no label, activity, success, failure, or review claim.
    await expect.poll(() => cursorState(server)).toEqual({ kind: "unknown" });
    await awaitAlertPolls();
    expect(server.notifierCalls()).toEqual([]);
  } finally {
    await server.close();
    await stopCursorRunner(path.join(machine, "home"));
    cursor.cleanup();
    rmSync(machine, { recursive: true, force: true });
  }
});
