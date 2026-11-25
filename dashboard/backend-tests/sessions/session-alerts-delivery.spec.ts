// Literal notification title and message reach SessionAlerts' notifier with
// the correct callback URL. An ad hoc session keeps a project-only destination
// (this file owns that proof after the story-linked alert cutover). Leading-
// character argv encoding is proven through sendTerminalNotification and the
// synthetic helper; the durable inline command stays in
// ./session-alerts-activation-command.spec.ts.
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  SessionAlerts,
  type SessionAlertNotifier,
} from "../../server/sessionAlerts.ts";
import {
  sendTerminalNotification,
  type TerminalNotificationContent,
} from "../../server/terminalNotifier.ts";
import type { LaunchRecord, LaunchWithState } from "../../src/agentLaunch.ts";
import { installFakeClaude } from "../../test-support/support/fakeClaude.ts";

const checkMsKey = "DOUGH_ALERT_CHECK_MS";
const origin = "http://127.0.0.1:49176";
const oddTitle = "Say \"hi\" to a \\ back\\slash and 'quotes'";
const waitingFor = 'Use "this" \\ that?';

const storyRecord = (sessionId: string, title: string): LaunchRecord =>
  makeMe.aLaunchRecord
    .executing({
      identity: `SEED-413#delivery-${sessionId}`,
      title,
      source: "open-dough",
    })
    .inClaudeSession({ sessionId, shortId: sessionId.slice(0, 8) })
    .please();

const adHocRecord = (sessionId: string, instruction: string): LaunchRecord =>
  makeMe.aLaunchRecord
    .adHoc({ instruction, title: instruction })
    .inClaudeSession({ sessionId, shortId: sessionId.slice(0, 8) })
    .please();

const observed = (
  kept: LaunchRecord,
  sessionState: LaunchWithState["sessionState"],
): LaunchWithState =>
  makeMe.anObservedLaunch.of(kept).withSessionState(sessionState).please();

const working = (kept: LaunchRecord) =>
  observed(kept, makeMe.aSessionState.loaded("working").please());

const waiting = (kept: LaunchRecord, forText: string) =>
  observed(
    kept,
    makeMe.aSessionState.loaded("waiting").waitingFor(forText).please(),
  );

function observe(initial: readonly LaunchWithState[]) {
  let sessions = [...initial];
  let reads = 0;
  const sent: TerminalNotificationContent[] = [];
  const notifier: SessionAlertNotifier = {
    probe: () => Promise.resolve(undefined),
    send: (content) => {
      sent.push(content);
      return Promise.resolve(undefined);
    },
  };
  const alerts = new SessionAlerts(
    {
      machineSessions: () => {
        reads += 1;
        return Promise.resolve(sessions);
      },
    },
    () => origin,
    notifier,
  );
  return {
    sent,
    become(next: readonly LaunchWithState[]) {
      sessions = [...next];
    },
    async further() {
      const prior = reads;
      await expect.poll(() => reads).toBeGreaterThanOrEqual(prior + 2);
    },
    close() {
      alerts.close();
    },
  };
}

let priorCheckMs: string | undefined;
const owners: { close(): void }[] = [];

beforeEach(() => {
  priorCheckMs = process.env[checkMsKey];
  process.env[checkMsKey] = "20";
});

afterEach(() => {
  while (owners.length > 0) owners.pop()?.close();
  if (priorCheckMs === undefined)
    Reflect.deleteProperty(process.env, checkMsKey);
  else process.env[checkMsKey] = priorCheckMs;
});

test("a quoted title, backslash and leading character stay literal in the notice and story destination", async () => {
  const kept = storyRecord("odd-title", oddTitle);
  const owner = observe([working(kept)]);
  owners.push(owner);
  await owner.further();
  expect(owner.sent).toEqual([]);

  owner.become([waiting(kept, waitingFor)]);
  await expect.poll(() => owner.sent.length).toBe(1);
  expect(owner.sent).toEqual([
    {
      title: `open-dough · ${oddTitle}`,
      message: `Needs input: ${waitingFor}`,
      destination: `${origin}/?project=open-dough&story=SEED-413%23delivery-odd-title`,
    },
  ]);
});

test("an ad hoc session alerts to its project without inventing a story destination", async () => {
  const instruction = "[ad hoc] with 'quotes' and \\ text";
  const kept = adHocRecord("ad-hoc", instruction);
  const owner = observe([working(kept)]);
  owners.push(owner);
  await owner.further();

  owner.become([waiting(kept, "Choose an option")]);
  await expect.poll(() => owner.sent.length).toBe(1);
  expect(owner.sent).toEqual([
    {
      title: `open-dough · ${instruction}`,
      message: "Needs input: Choose an option",
      destination: `${origin}/?project=open-dough`,
    },
  ]);
});

test("all leading characters use the native-proven literal text encoding", async () => {
  const directory = mkdtempSync(path.join(tmpdir(), "dough-delivery-encode-"));
  const native = installFakeClaude(
    directory,
    { binDir: directory, path: process.env.PATH ?? "" },
    {},
  );
  const environment = {
    PATH: native.env["PATH"],
    HOME: native.env["HOME"],
    FAKE_CLAUDE_DIR: native.env["FAKE_CLAUDE_DIR"],
  };
  const prior = Object.fromEntries(
    Object.keys(environment).map((key) => [key, process.env[key]]),
  );
  for (const [key, value] of Object.entries(environment))
    process.env[key] = value;
  const texts = [
    "[bracket]",
    "(parenthesis)",
    "{brace}",
    '"quoted"',
    "\\backslash",
    "-leading-dash",
    "'single-quote'",
    "normal text",
  ];
  const signal = new AbortController().signal;
  try {
    for (const [index, text] of texts.entries()) {
      expect(
        await sendTerminalNotification(
          {
            title: text,
            message: `Needs input: ${text}`,
            destination: `${origin}/?project=open-dough`,
          },
          signal,
        ),
      ).toBeUndefined();
      expect(native.controls.notifierCalls()).toHaveLength(index + 1);
      const argv = native.controls.notifierCalls().at(-1)?.argv ?? [];
      expect(argv[1]).toBe(`\\${text}`);
      expect(argv[3]).toBe(`\\Needs input: ${text}`);
    }
  } finally {
    for (const [key, value] of Object.entries(prior)) {
      if (value === undefined) Reflect.deleteProperty(process.env, key);
      else process.env[key] = value;
    }
    rmSync(directory, { recursive: true, force: true });
  }
});
