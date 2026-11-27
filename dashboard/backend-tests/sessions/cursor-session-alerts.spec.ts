// The Cursor host's held evidence supplies the session reading that alerts use.
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, onTestFinished, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import type { HeldCursorSessions } from "../../server/hosts/cursor/heldSessions.ts";
import { cursorSessionLabel } from "../../server/hosts/cursor/idleScreen.ts";
import { observeCursorSessions } from "../../server/hosts/cursor/sessions.ts";
import { withStates } from "../../server/launchStates.ts";
import { machineFolder } from "../../server/localFolder.ts";
import {
  SessionAlerts,
  type SessionAlertNotifier,
} from "../../server/sessionAlerts.ts";
import { cursorHeldLabel } from "../../src/cursorHeldLabel.ts";
import { cursorRunnerSentence } from "../../src/cursorRunnerSessions.ts";
import type { LaunchRecord, SessionState } from "../../src/launchRecord.ts";
import { agentNotRunningLabel } from "../../src/sessionRecovery.ts";
import { repoRoot } from "../../test-support/support/repositoryRoot.ts";

const sessionId = "20830b4f-3cf4-4a71-bc03-3480373f71c8";
const cursorRecord = () =>
  makeMe.aLaunchRecord
    .executing({
      identity: "SEED-413#cursor-alerts",
      title: "Inspect this session",
    })
    .inCursorSession({ sessionId, continuation: { workspace: repoRoot } })
    .withFirstInput({ state: "confirmed" });

const followUp = "→ Add a follow-up";
const working = `${followUp}\nctrl+c to stop`;
const question = "1. Which color do you prefer, Red or Blue?";
const waiting = [
  "Color preference",
  "Question 1 of 1",
  question,
  "› [ ] Red",
  "  [ ] Blue",
  "  [ ] Other: (type to answer)",
  "↑/↓ option · ←/→ question · Space select · Enter next/submit · Esc to skip",
].join("\n");
const unheld: HeldCursorSessions = { runner: "running", sessions: [] };

function heldScreen(record: LaunchRecord, screen: string): HeldCursorSessions {
  const label = cursorSessionLabel(screen);
  return {
    runner: "running",
    sessions: [
      { record, label, ...(label === cursorHeldLabel.waiting && { screen }) },
    ],
  };
}

function observe(initial: LaunchRecord) {
  const home = mkdtempSync(path.join(tmpdir(), "dough-cursor-alerts-"));
  vi.stubEnv("HOME", home);
  vi.stubEnv("DOUGH_ALERT_CHECK_MS", "20");
  let record = initial;
  let evidence = heldScreen(record, working);
  let polls = 0;
  let latest: SessionState | undefined;
  const messages: string[] = [];
  const notifier: SessionAlertNotifier = {
    probe: () => Promise.resolve(undefined),
    send({ message }) {
      messages.push(message);
      return Promise.resolve(undefined);
    },
  };
  const alerts = new SessionAlerts(
    {
      async machineSessions() {
        polls += 1;
        const sessions = await withStates(
          machineFolder(),
          [record],
          "recurring",
          () => (records) =>
            observeCursorSessions(records, () => Promise.resolve(evidence)),
        );
        latest = sessions[0]?.sessionState;
        return sessions;
      },
    },
    () => "http://127.0.0.1:49175",
    notifier,
  );
  onTestFinished(() => {
    alerts.close();
    vi.unstubAllEnvs();
    rmSync(home, { recursive: true, force: true });
  });

  async function reading() {
    // A second new poll proves that the first new reading and its alerts settled.
    const next = polls + 2;
    await expect
      .poll(() => polls, { interval: 5 })
      .toBeGreaterThanOrEqual(next);
    return latest;
  }

  return {
    reading,
    see(screen: string) {
      evidence = heldScreen(record, screen);
      return reading();
    },
    seeNoAgent(replacement = record) {
      record = replacement;
      evidence = unheld;
      return reading();
    },
    seeStoppedRunner() {
      evidence = { runner: "not-running", sessions: [] };
      return reading();
    },
    messages,
  };
}

const loaded = (activity: "awaiting-instruction" | "working" | "review") =>
  ({ kind: "available", availability: "loaded", activity }) as const;

test("a follow-up prompt before confirmed first input reads awaiting instruction and stays quiet", async () => {
  const cursor = observe(
    cursorRecord().withFirstInput({ state: "awaiting" }).please(),
  );
  expect(await cursor.reading()).toEqual(loaded("working"));
  expect(await cursor.see(followUp)).toEqual(loaded("awaiting-instruction"));
  expect(cursor.messages).toEqual([]);
});

test("a held Cursor session alerts once per actionable entry and re-arms after working", async () => {
  const cursor = observe(cursorRecord().please());
  expect(await cursor.reading()).toEqual(loaded("working"));
  expect(cursor.messages).toEqual([]);

  const needsInput = `Needs input: ${question}`;
  expect(await cursor.see(waiting)).toEqual({
    kind: "available",
    availability: "loaded",
    activity: "waiting",
    waitingFor: question,
  });
  expect(cursor.messages).toEqual([needsInput]);

  expect(await cursor.see(working)).toEqual(loaded("working"));
  expect(cursor.messages).toEqual([needsInput]);
  await cursor.see(waiting);
  expect(cursor.messages).toEqual([needsInput, needsInput]);
  expect(await cursor.see(working)).toEqual(loaded("working"));
  expect(await cursor.see(followUp)).toEqual(loaded("review"));
  expect(cursor.messages).toEqual([needsInput, needsInput, "Ready for review"]);

  expect(await cursor.seeNoAgent()).toEqual({
    kind: "unknown",
    label: agentNotRunningLabel,
  });
  expect(await cursor.seeStoppedRunner()).toEqual({
    kind: "unknown",
    label: cursorRunnerSentence("not-running"),
  });
  expect(cursor.messages).toEqual([needsInput, needsInput, "Ready for review"]);
});

test("cancelled and failed history at the follow-up prompt alerts only ready for review", async () => {
  const cursor = observe(cursorRecord().please());
  expect(await cursor.reading()).toEqual(loaded("working"));
  expect(cursor.messages).toEqual([]);

  const settled = [
    "$ sleep 45",
    "Cancelled • 3.7s",
    "$ false",
    "exit 1 • 184ms",
    "The exit code was 1.",
    followUp,
    "Press Ctrl+C again to exit",
  ].join("\n");
  expect(await cursor.see(settled)).toEqual(loaded("review"));
  expect(cursor.messages).toEqual(["Ready for review"]);
  expect(await cursor.seeNoAgent()).toEqual({
    kind: "unknown",
    label: agentNotRunningLabel,
  });
  expect(cursor.messages).toEqual(["Ready for review"]);
});

test("an unheld finished Cursor record stays unknown without an absence claim or alert", async () => {
  const cursor = observe(cursorRecord().please());
  expect(await cursor.reading()).toEqual(loaded("working"));
  expect(await cursor.seeNoAgent()).toEqual({
    kind: "unknown",
    label: agentNotRunningLabel,
  });
  const finished = cursorRecord().completedWith({}).please();
  expect(await cursor.seeNoAgent(finished)).toEqual({ kind: "unknown" });
  expect(cursor.messages).toEqual([]);
});
