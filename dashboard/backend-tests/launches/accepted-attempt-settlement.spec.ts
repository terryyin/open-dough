// The owner must answer from its own state until durable settlement finishes,
// even when another process can already read the replacement.
import assert from "node:assert/strict";
import { fork } from "node:child_process";
import { on } from "node:events";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import fs from "node:fs/promises";
import { syncBuiltinESMExports } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";
import { setImmediate } from "node:timers/promises";
import { fileURLToPath } from "node:url";
import { expect, test, vi } from "vitest";
import { changedAttempt } from "../../server/launchAttemptChanges.ts";
import { LaunchAttemptOwner } from "../../server/launchAttemptOwner.ts";
import { keptAttempts } from "../../server/launchAttemptStore.ts";
import { machineDashboardPath } from "../../server/machineHome.ts";
import {
  agentLaunchRequestSchema,
  type AgentLaunchRequest,
  type ChangedAnswer,
} from "../../src/agentLaunch.ts";

const childMode = "--attempt-settlement-owner";
const attemptsFile = () => machineDashboardPath("launch-attempts.json");
const outcome = {
  kind: "uncertain",
  reason: "unconfirmed",
  explanation: "Kept for recovery.",
} as const;

async function holdSettlementInChild(
  request: AgentLaunchRequest,
): Promise<void> {
  const publish = process.send?.bind(process);
  assert(publish, "The independent owner requires IPC.");
  const send = (message: string | object) => {
    if (process.connected) publish(message);
  };
  const commands: AsyncIterable<unknown[]> = on(process, "message", {
    close: ["disconnect"],
  });
  const owner = new LaunchAttemptOwner();
  const file = attemptsFile();
  const rename = fs.rename;
  let release = () => {};
  const released = new Promise<void>((resolve) => {
    release = resolve;
  });
  fs.rename = async (from, to) => {
    await rename(from, to);
    if (to === file && readFileSync(to, "utf8").includes('"outcome":')) {
      send("replaced");
      await released;
    }
  };
  syncBuiltinESMExports();

  let firstAnswer: ChangedAnswer | undefined;
  let nextAnswer: Promise<void> | undefined;
  try {
    const accepted = await owner.accept(
      request,
      async (own, notePublication) => {
        const pending = changedAttempt(owner, own.attempt.id, 30_000);
        await notePublication({ kind: "none" });
        firstAnswer = await pending;
        return outcome;
      },
    );
    assert.equal(accepted.kind, "accepted");

    for await (const [command] of commands) {
      if (command === "first") {
        send({ kind: "first", answer: firstAnswer });
      } else if (command === "follow") {
        nextAnswer = changedAttempt(owner, accepted.attempt.id, 30_000).then(
          (answer) => {
            send({
              kind: "settled",
              answer,
              locked: existsSync(`${file}.lock`),
            });
          },
        );
        // An immediate answer reaches IPC before this event-loop boundary.
        await setImmediate();
        send("following");
      } else if (command === "release") {
        release();
      }
    }
  } finally {
    release();
    owner.close();
    await owner.drain();
    await nextAnswer;
    fs.rename = rename;
    syncBuiltinESMExports();
  }
}

if (process.argv[2] === childMode) {
  await holdSettlementInChild(
    agentLaunchRequestSchema.parse(JSON.parse(process.argv[3] ?? "")),
  );
} else {
  const { makeMe } =
    await import("../../../Distribution/tests/support/makeMe.mjs");

  test("a second process reads again after a stale answer and learns settlement after lock release", async ({
    signal,
  }) => {
    const request = makeMe.aLaunchRequest.adHoc().please();
    const home = mkdtempSync(path.join(tmpdir(), "dough-attempt-settlement-"));
    let exitCode: number | null;
    try {
      vi.stubEnv("HOME", home);
      if (process.platform === "win32") vi.stubEnv("USERPROFILE", home);
      const lock = `${attemptsFile()}.lock`;
      const child = fork(
        fileURLToPath(import.meta.url),
        [childMode, JSON.stringify(request)],
        {
          execArgv: [
            "--experimental-transform-types",
            "--disable-warning=ExperimentalWarning",
          ],
          signal,
        },
      );
      const exited = new Promise<number | null>((resolve) => {
        child.once("error", () => {
          if (child.pid === undefined) resolve(null);
        });
        child.once("exit", resolve);
      });
      const messages = on(child, "message", { signal, close: ["exit"] });
      const receive = async (): Promise<unknown> => {
        const next: IteratorResult<unknown[]> = await messages.next();
        assert(!next.done, "The owner exited before it answered the read.");
        return next.value[0];
      };

      try {
        expect(await receive()).toBe("replaced");
        const [kept] = (await keptAttempts()) ?? [];
        assert(kept);
        expect(kept.outcome).toEqual(outcome);
        expect(existsSync(lock)).toBe(true);

        child.send("first");
        const first = await receive();
        expect(first).toMatchObject({
          kind: "first",
          answer: {
            changed: true,
            attempt: { id: kept.id, owned: true, running: true },
          },
        });
        expect(first).not.toHaveProperty("answer.attempt.outcome");

        child.send("follow");
        expect(await receive()).toBe("following");
        expect(existsSync(lock)).toBe(true);

        child.send("release");
        expect(await receive()).toMatchObject({
          kind: "settled",
          answer: {
            changed: true,
            attempt: { id: kept.id, outcome, owned: false, running: false },
          },
          locked: false,
        });
        expect(existsSync(lock)).toBe(false);
      } finally {
        if (child.connected) child.disconnect();
        exitCode = await exited;
        await messages.return?.();
      }
    } finally {
      vi.unstubAllEnvs();
      rmSync(home, { recursive: true, force: true });
    }
    expect(exitCode).toBe(0);
  });
}
