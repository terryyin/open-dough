// Accepted attempt evidence removed or corrupted after Codex creates its
// thread, before the launch binds, makes the launch uncertain: it names the
// native thread for recovery, binds no record and submits no first input. The
// attempt runs through production `attemptRun` and the real Codex host over
// the in-process fake Codex daemon.
import { randomUUID } from "node:crypto";
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { afterEach, beforeAll, beforeEach, expect, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { queuedReadyRepository } from "../../../Distribution/tests/support/queued-repository.mjs";
import { settleAttempt } from "../../server/launchAttemptSettlement.ts";
import { keepAttempt } from "../../server/launchAttemptStore.ts";
import { launchHost } from "../../server/launchHosts.ts";
import { keptRecords } from "../../server/launchRecordStore.ts";
import { attemptRun } from "../../server/launchRun.ts";
import { machineDashboardPath } from "../../server/machineHome.ts";
import { OwnedAttempts } from "../../server/ownedAttempts.ts";
import { mountProjectConfiguration } from "../../server/projectConfiguration.ts";
import { StartProgress } from "../../server/startProgress.ts";
import type { LaunchResult } from "../../src/agentLaunch.ts";
import {
  installFakeCodex,
  type FakeCodex,
} from "../../test-support/support/fakeCodex.ts";
import {
  startOrigin,
  type StartOrigin,
} from "../../test-support/support/startOrigin.ts";
import { keepStartedOrigin } from "../../test-support/support/startOriginPreparation.ts";

const source = makeMe.aPublishedSource.openDough.please();
const repository = queuedReadyRepository().please();

let origin: StartOrigin;
let native: FakeCodex;
let unmount: () => void;

beforeAll(async () => {
  const prepared = await startOrigin(repository, { host: "codex" });
  try {
    keepStartedOrigin("codex", repository, prepared);
  } finally {
    prepared.cleanup();
  }
});

beforeEach(async () => {
  origin = await startOrigin(repository, { host: "codex" });
  native = await installFakeCodex(
    origin.machine,
    process.env["PATH"] ?? "",
    true,
  );
  for (const [key, value] of Object.entries(native.env)) vi.stubEnv(key, value);
  vi.stubEnv("HOME", path.join(origin.machine, "home"));
  unmount = mountProjectConfiguration("production");
});

afterEach(async () => {
  native.release();
  await native.close();
  unmount();
  vi.unstubAllEnvs();
  origin.cleanup();
});

for (const fault of ["missing", "unreadable"] as const) {
  test(`mid-launch ${fault} attempt refuses a false binding, retains native recovery identity and submits no first input`, async () => {
    const attempts = machineDashboardPath("launch-attempts.json");
    let reached = false;
    native.afterCreation = () => {
      expect(existsSync(attempts)).toBe(true);
      reached = true;
      if (fault === "missing") rmSync(attempts);
      else writeFileSync(attempts, "unreadable attempt evidence\n");
    };
    const attempt = makeMe.anAcceptedAttempt
      .adHoc({ host: "codex", instruction: "Start this bounded assignment." })
      .withId(randomUUID())
      .acceptedAt(new Date().toISOString())
      .reportingTo("http://127.0.0.1:4173")
      .please();
    await keepAttempt(attempt);
    const owned = new OwnedAttempts();
    let result: LaunchResult | undefined;
    await settleAttempt(
      owned,
      owned.own(attempt.request, attempt),
      async (own, notes) => {
        result = await attemptRun(source, own, {
          progress: new StartProgress(),
          doneMarks: { reported: vi.fn() },
          native: launchHost,
          notes,
        });
        return result;
      },
    );

    expect(reached).toBe(true);
    if (result?.kind !== "uncertain")
      throw new Error(`No uncertain recovery outcome: ${result?.kind}`);
    expect(result.explanation).toContain(native.threadId);
    expect(result.explanation).toContain("could not be saved in the dashboard");
    expect(result.explanation).toContain("No first input was submitted");
    expect(result.explanation).toContain("codex");
    expect(result.explanation).toContain("resume");
    const methods = native.calls.map(({ method }) => method);
    expect(methods.filter((method) => method === "thread/start")).toHaveLength(
      1,
    );
    expect(methods).not.toContain("turn/start");
    expect(await keptRecords(source.id)).toEqual([]);
    if (fault === "unreadable") {
      expect(readFileSync(`${attempts}.unreadable`, "utf8")).toBe(
        "unreadable attempt evidence\n",
      );
    }
  });
}
