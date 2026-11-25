// Closing SessionAlerts ends a held synthetic helper child, keeps the last
// confirmed availability, and starts no further session reads. Naming, sound
// and repeat across a page reload stay in ../../../e2e/sessions/session-alerts.spec.ts.
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { afterEach, expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { SessionAlerts } from "../../server/sessionAlerts.ts";
import type { LaunchWithState } from "../../src/agentLaunch.ts";
import {
  installFakeClaude,
  type FakeClaudeControls,
} from "../../test-support/support/fakeClaude.ts";
import { processRunning } from "../../test-support/support/processGroup.ts";

const checkMsKey = "DOUGH_ALERT_CHECK_MS";
const origin = "http://127.0.0.1:49175";
const envKeys = ["PATH", "HOME", "FAKE_CLAUDE_DIR", checkMsKey] as const;

const record = (sessionId: string) =>
  makeMe.aLaunchRecord
    .executing({
      identity: `SEED-413#lifetime-${sessionId}`,
      title: `Lifetime ${sessionId}`,
      source: "open-dough",
    })
    .inClaudeSession({ sessionId, shortId: sessionId.slice(0, 8) })
    .please();

const observed = (
  kept: ReturnType<typeof record>,
  sessionState: LaunchWithState["sessionState"],
): LaunchWithState =>
  makeMe.anObservedLaunch.of(kept).withSessionState(sessionState).please();

const working = (kept: ReturnType<typeof record>) =>
  observed(kept, makeMe.aSessionState.loaded("working").please());

const waiting = (kept: ReturnType<typeof record>) =>
  observed(
    kept,
    makeMe.aSessionState.loaded("waiting").waitingFor("Choose").please(),
  );

type Owner = {
  readonly alerts: SessionAlerts;
  readonly native: FakeClaudeControls;
  become(next: readonly LaunchWithState[]): void;
  further(): Promise<void>;
  reads(): number;
  close(): void;
};

let priorEnv: Partial<Record<(typeof envKeys)[number], string | undefined>> =
  {};
let tempRoot: string | undefined;
let heldPid: number | undefined;
const owners: Owner[] = [];

function start(
  initial: readonly LaunchWithState[],
  options: { readonly hangProbe?: boolean } = {},
): Owner {
  const directory = mkdtempSync(path.join(tmpdir(), "dough-alerts-lifetime-"));
  tempRoot = directory;
  const native = installFakeClaude(
    directory,
    { binDir: directory, path: process.env.PATH ?? "" },
    options.hangProbe === true ? { notifier: "hang-probe" } : {},
  );
  priorEnv = Object.fromEntries(envKeys.map((key) => [key, process.env[key]]));
  process.env.PATH = native.env["PATH"];
  process.env.HOME = native.env["HOME"];
  process.env.FAKE_CLAUDE_DIR = native.env["FAKE_CLAUDE_DIR"];
  process.env[checkMsKey] = "20";

  let sessions = [...initial];
  let reads = 0;
  const alerts = new SessionAlerts(
    {
      machineSessions: () => {
        reads += 1;
        return Promise.resolve(sessions);
      },
    },
    () => origin,
  );
  const owner: Owner = {
    alerts,
    native: native.controls,
    become(next) {
      sessions = [...next];
    },
    async further() {
      const prior = reads;
      await expect.poll(() => reads).toBeGreaterThanOrEqual(prior + 2);
    },
    reads: () => reads,
    close() {
      alerts.close();
    },
  };
  owners.push(owner);
  return owner;
}

afterEach(async () => {
  heldPid = owners.at(-1)?.native.heldNotifierPid() ?? heldPid;
  while (owners.length > 0) owners.pop()?.close();
  if (heldPid !== undefined)
    await expect.poll(() => processRunning(heldPid)).toBe(false);
  heldPid = undefined;
  for (const key of envKeys) {
    const value = priorEnv[key];
    if (value === undefined) Reflect.deleteProperty(process.env, key);
    else process.env[key] = value;
  }
  priorEnv = {};
  if (tempRoot !== undefined) {
    rmSync(tempRoot, { recursive: true, force: true });
    tempRoot = undefined;
  }
});

async function observeChildExitAndQuietReads(
  owner: Owner,
  pid: number | undefined,
  readsAtClose: number,
): Promise<void> {
  heldPid = pid;
  owner.close();
  await expect.poll(() => owner.native.heldNotifierEndedBy()).toBe("SIGTERM");
  await expect.poll(() => processRunning(pid)).toBe(false);
  await delay(80);
  expect(owner.reads()).toBe(readsAtClose);
}

test("closing aborts a held startup diagnostic without reporting a helper refusal", async () => {
  const owner = start([working(record("startup"))], { hangProbe: true });
  await expect.poll(() => owner.native.heldNotifierPid()).toBeDefined();
  const prior = owner.alerts.availability();
  const pid = owner.native.heldNotifierPid();
  expect(processRunning(pid)).toBe(true);
  await observeChildExitAndQuietReads(owner, pid, owner.reads());
  expect(owner.alerts.availability()).toEqual(prior);
  expect(owner.native.notifierCalls()).toEqual([]);
});

test("closing aborts a held delivery without changing the last successful availability", async () => {
  const kept = record("delivery");
  const owner = start([working(kept)]);
  await expect
    .poll(() => owner.alerts.availability())
    .toEqual({
      available: true,
    });
  await owner.further();
  owner.native.notifierBecomes("hang");
  owner.become([waiting(kept)]);
  await expect.poll(() => owner.native.heldNotifierPid()).toBeDefined();
  await observeChildExitAndQuietReads(
    owner,
    owner.native.heldNotifierPid(),
    owner.reads(),
  );
  expect(owner.alerts.availability()).toEqual({ available: true });
});
