// The actual alert owner with an isolated native executable, including states
// that a normally listening server never exposes to a browser.
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, test as base } from "../support/pageTest.ts";
import {
  installFakeClaude,
  type FakeClaudeControls,
} from "../support/fakeClaude.ts";
import { processRunning } from "../support/processGroup.ts";
import { SessionAlerts } from "../../server/sessionAlerts.ts";
import type { LaunchWithState } from "../../src/agentLaunch.ts";
import { launchRequest } from "../agentLaunchBoundary.ts";
import { notificationActivation } from "../support/notificationActivation.ts";

const working: LaunchWithState = {
  request: { ...launchRequest, host: "claude", workflow: "execution" },
  session: {
    host: "claude",
    sessionId: "native-test",
    shortId: "native",
    name: "native-test",
  },
  launchedAt: "2026-10-19T00:00:00.000Z",
  sessionState: {
    kind: "available",
    availability: "loaded",
    activity: "working",
  },
};

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
          session = {
            ...working,
            request: { ...working.request, source },
            sessionState: {
              kind: "available",
              availability: "loaded",
              activity,
              ...(waitingFor === undefined ? {} : { waitingFor }),
            },
          };
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

test("before a usable listening address, attention cannot emit a made-up click URL", async ({
  helper,
}) => {
  const listening: { origin: string | undefined } = { origin: undefined };
  const alerts = helper.start(() => listening.origin);
  await helper.further();
  await expect.poll(() => helper.native.notifierProbes().length).toBe(2);
  // A recorded diagnostic has started; its answer establishes availability.
  await expect
    .poll(() => alerts.availability())
    .toEqual({
      available: false,
      reason:
        "The dashboard has no listening loopback HTTP address for notification clicks.",
    });
  helper.state("waiting");
  await helper.further();
  expect(helper.native.notifierCalls()).toEqual([]);
  // A later valid address is read at send time, not captured before listen.
  listening.origin = "http://127.0.0.1:49175";
  helper.state("working");
  await helper.further();
  helper.state("waiting");
  await expect.poll(() => helper.native.notifierCalls().length).toBe(1);
  expect(
    notificationActivation(helper.native.notifierCalls()[0]?.argv ?? [])
      .destination,
  ).toBe(
    `${listening.origin}/?project=open-dough&story=SEED-052%23launch-claude-planned-execution`,
  );
  await expect.poll(() => alerts.availability()).toEqual({ available: true });
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

test("all leading characters use the native-proven literal text encoding", async ({
  helper,
}) => {
  const alerts = helper.start(() => "http://127.0.0.1:49175");
  await expect.poll(() => alerts.availability()).toEqual({ available: true });
  await helper.further();
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
  for (const [index, text] of texts.entries()) {
    helper.state("working", text);
    await helper.further();
    helper.state("waiting", text, text);
    await expect
      .poll(() => helper.native.notifierCalls().length)
      .toBe(index + 1);
    const argv = helper.native.notifierCalls().at(-1)?.argv;
    expect(argv?.[1]).toBe(`\\${text} · ${launchRequest.title}`);
    expect(argv?.[3]).toBe(`\\Needs input: ${text}`);
    expect(notificationActivation(argv ?? []).destination).toBe(
      `http://127.0.0.1:49175/?${new URLSearchParams({ project: text, story: launchRequest.identity })}`,
    );
  }
});
