// The actual alert owner with an isolated native executable, including states
// that a normally listening server never exposes to a browser. Unavailable-
// address availability lives in ./session-alerts-refused.spec.ts.
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, test as base } from "../../test-support/support/pageTest.ts";
import {
  installFakeClaude,
  type FakeClaudeControls,
} from "../../test-support/support/fakeClaude.ts";
import { processRunning } from "../../test-support/support/processGroup.ts";
import { SessionAlerts } from "../../server/sessionAlerts.ts";
import type { LaunchWithState } from "../../src/agentLaunch.ts";
import { launchRequest } from "../../test-support/agentLaunchBoundary.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";

// The kept launch the alert owner reads, in the project `source`.
const kept = (source: string) =>
  makeMe.aLaunchRecord
    .executing({
      identity: launchRequest.identity,
      title: launchRequest.title,
      source,
    })
    .inClaudeSession({ sessionId: "native-test", shortId: "native" })
    .please();

const working: LaunchWithState = makeMe.anObservedLaunch
  .of(kept(launchRequest.source))
  .withSessionState(makeMe.aSessionState.loaded("working").please())
  .please();

const test = base.extend<{
  helper: {
    readonly native: FakeClaudeControls;
    start(origin: () => string | undefined): SessionAlerts;
    state(
      activity: "working" | "waiting",
      source?: string,
      waitingFor?: string,
    ): void;
    further(): Promise<void>;
  };
}>({
  // eslint-disable-next-line no-empty-pattern
  helper: async ({}, use) => {
    const temp = mkdtempSync(path.join(tmpdir(), "dough-notifier-owner-"));
    const fake = installFakeClaude(
      temp,
      { binDir: temp, path: process.env.PATH ?? "" },
      {},
    );
    const environment = {
      PATH: fake.env["PATH"],
      HOME: fake.env["HOME"],
      FAKE_CLAUDE_DIR: fake.env["FAKE_CLAUDE_DIR"],
      DOUGH_ALERT_CHECK_MS: "20",
    };
    const before = Object.fromEntries(
      Object.keys(environment).map((key) => [key, process.env[key]]),
    );
    for (const [key, value] of Object.entries(environment))
      process.env[key] = value;
    const owners: SessionAlerts[] = [];
    let session = working;
    let reads = 0;
    try {
      await use({
        native: fake.controls,
        start(origin) {
          const alerts = new SessionAlerts(
            {
              machineSessions: () => {
                reads++;
                return Promise.resolve([session]);
              },
            },
            origin,
          );
          owners.push(alerts);
          return alerts;
        },
        state(activity, source = launchRequest.source, waitingFor) {
          const sessionState = makeMe.aSessionState.loaded(activity);
          if (waitingFor !== undefined) sessionState.waitingFor(waitingFor);
          session = makeMe.anObservedLaunch
            .of(kept(source))
            .withSessionState(sessionState.please())
            .please();
        },
        async further() {
          const prior = reads;
          await expect.poll(() => reads).toBeGreaterThanOrEqual(prior + 3);
        },
      });
    } finally {
      for (const alerts of owners) alerts.close();
      const held = fake.controls.heldNotifierPid();
      if (held !== undefined)
        await expect.poll(() => processRunning(held)).toBe(false);
      for (const [key, value] of Object.entries(before)) {
        if (value === undefined) Reflect.deleteProperty(process.env, key);
        else process.env[key] = value;
      }
      rmSync(temp, { recursive: true, force: true });
    }
  },
});

test("closing aborts a held startup diagnostic without reporting a helper refusal", async ({
  helper,
}) => {
  helper.native.notifierBecomes("hang-probe");
  const alerts = helper.start(() => "http://127.0.0.1:49175");
  await expect.poll(() => helper.native.heldNotifierPid()).toBeDefined();
  const prior = alerts.availability();
  const pid = helper.native.heldNotifierPid();
  expect(processRunning(pid)).toBe(true);
  alerts.close();
  await expect.poll(() => helper.native.heldNotifierEndedBy()).toBe("SIGTERM");
  await expect.poll(() => processRunning(pid)).toBe(false);
  expect(alerts.availability()).toEqual(prior);
  expect(helper.native.notifierCalls()).toEqual([]);
});

test("closing aborts a held delivery without changing the last successful availability", async ({
  helper,
}) => {
  const alerts = helper.start(() => "http://127.0.0.1:49175");
  await expect.poll(() => alerts.availability()).toEqual({ available: true });
  await helper.further();
  helper.native.notifierBecomes("hang");
  helper.state("waiting");
  await expect.poll(() => helper.native.heldNotifierPid()).toBeDefined();
  alerts.close();
  await expect.poll(() => helper.native.heldNotifierEndedBy()).toBe("SIGTERM");
  await expect
    .poll(() => processRunning(helper.native.heldNotifierPid()))
    .toBe(false);
  expect(alerts.availability()).toEqual({ available: true });
});
