import assert from "node:assert/strict";
import { fork } from "node:child_process";
import { on, once } from "node:events";
import fs from "node:fs";
import { syncBuiltinESMExports } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test, vi } from "vitest";
import { z } from "zod";
import { LaunchAttemptOwner } from "../../server/launchAttemptOwner.ts";
import type { AttemptRun } from "../../server/launchAttemptSettlement.ts";
import { keptAttempts } from "../../server/launchAttemptStore.ts";
import { machineDashboardPath } from "../../server/machineHome.ts";
import {
  acceptanceSchema,
  agentLaunchRequestSchema,
  storyOf,
  type AgentLaunchRequest,
} from "../../src/agentLaunch.ts";

const childMode = "--launch-admission-child";
const childAnswer = z.object({ answer: acceptanceSchema, effects: z.number() });
const attemptsFile = () => machineDashboardPath("launch-attempts.json");

const waitForClose: AttemptRun = ({ controller }) =>
  once(controller.signal, "abort").then(() => ({
    kind: "failed",
    reason: "refused",
    explanation: "The test closed the attempt owner.",
  }));

// Signal only after a real acquisition found this machine's lock held.
function reportFirstLockWait(report: () => void): void {
  const lock = `${attemptsFile()}.lock`;
  const mkdirSync = fs.mkdirSync;
  fs.mkdirSync = (directory, options) => {
    try {
      return mkdirSync(directory, options);
    } catch (error) {
      if (
        directory === lock &&
        (error as NodeJS.ErrnoException).code === "EEXIST"
      ) {
        fs.mkdirSync = mkdirSync;
        syncBuiltinESMExports();
        report();
      }
      throw error;
    }
  };
  syncBuiltinESMExports();
}

async function acceptInChild(watchLock: boolean): Promise<void> {
  const send = process.send?.bind(process);
  assert(send, "The independent attempt owner requires IPC.");
  if (watchLock) reportFirstLockWait(() => send("waiting-for-lock"));

  const owner = new LaunchAttemptOwner();
  const closed = once(process, "disconnect").then(() => {
    owner.close();
  });
  const requested = once(process, "message").then(
    (messages): unknown => messages[0],
  );
  send("ready");
  const message = await Promise.race([requested, closed]);
  if (message === undefined) return;

  let effects = 0;
  const run: AttemptRun = (...args) => {
    effects += 1;
    return waitForClose(...args);
  };
  const request = agentLaunchRequestSchema.parse(message);
  const answer = await owner.accept(request, run);
  send({ answer, effects } satisfies z.input<typeof childAnswer>);
  await closed;
  await owner.drain();
}

type IndependentOwner = {
  send: (request: AgentLaunchRequest) => void;
  receive: () => Promise<unknown>;
};

async function withIndependentOwner<T>(
  signal: AbortSignal,
  exercise: (owner: IndependentOwner) => Promise<T>,
  watchLock?: "watch-lock",
): Promise<T> {
  const home = fs.mkdtempSync(path.join(tmpdir(), "dough-cross-admission-"));
  vi.stubEnv("HOME", home);
  if (process.platform === "win32") vi.stubEnv("USERPROFILE", home);

  let exitCode: number | null;
  let result: T;
  try {
    // Run this spec's typed child entry directly, outside the Vitest worker.
    const child = fork(
      fileURLToPath(import.meta.url),
      [childMode, watchLock ?? ""],
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
    const receive = async () => {
      const next: IteratorResult<unknown[]> = await messages.next();
      assert(!next.done, "Attempt owner exited during admission.");
      return next.value[0];
    };
    try {
      expect(await receive()).toBe("ready");
      result = await exercise({ receive, send: child.send.bind(child) });
    } finally {
      if (child.connected) child.disconnect();
      exitCode = await exited;
    }
  } finally {
    vi.unstubAllEnvs();
    fs.rmSync(home, { recursive: true, force: true });
  }
  expect(exitCode).toBe(0);
  return result;
}

function overlappingAdmissions(
  signal: AbortSignal,
  localRequest: AgentLaunchRequest,
  childRequest: AgentLaunchRequest,
) {
  return withIndependentOwner(signal, async ({ send, receive }) => {
    const owner = new LaunchAttemptOwner();
    const run = vi.fn<AttemptRun>(waitForClose);
    send(childRequest);
    const localReply = owner.accept(localRequest, run);
    try {
      const [answer, remote] = await Promise.all([localReply, receive()]);
      const local = { answer, effects: run.mock.calls.length };
      const independent = childAnswer.parse(remote);
      return { local, independent, kept: await keptAttempts() };
    } finally {
      owner.close();
      await localReply.catch(() => undefined);
      await owner.drain();
    }
  });
}

if (process.argv[2] === childMode) {
  await acceptInChild(process.argv[3] === "watch-lock");
} else {
  const { makeMe } =
    await import("../../../Distribution/tests/support/makeMe.mjs");
  const story = { identity: "SEED-001#first", title: "First story" };
  const anotherStory = { identity: "SEED-002#second", title: "Second story" };

  test("rechecks newly kept attempts under the lock", async ({ signal }) => {
    const contender = makeMe.aLaunchRequest.executing(story).please();
    const first = makeMe.anAcceptedAttempt
      .refining(story)
      .publicationUnknown()
      .please();

    await withIndependentOwner(
      signal,
      async ({ send, receive }) => {
        const file = attemptsFile();
        const lock = `${file}.lock`;
        fs.mkdirSync(path.dirname(file), { recursive: true });
        fs.mkdirSync(lock);

        try {
          send(contender);
          expect(await receive()).toBe("waiting-for-lock");
          fs.writeFileSync(
            file,
            JSON.stringify({ [first.request.source]: [first] }),
          );
        } finally {
          fs.rmdirSync(lock);
        }

        const { answer, effects } = childAnswer.parse(await receive());
        expect(answer).toMatchObject({
          kind: "failed",
          reason: "already-starting",
        });
        expect(effects).toBe(0);
        expect(await keptAttempts()).toEqual([first]);
      },
      "watch-lock",
    );
  });

  test("admits one start per story across owners", async ({ signal }) => {
    const execution = makeMe.aLaunchRequest.executing(story).please();
    const refinement = makeMe.aLaunchRequest.refining(story).please();

    const { local, independent, kept } = await overlappingAdmissions(
      signal,
      execution,
      refinement,
    );
    const executionWon = local.answer.kind === "accepted";
    const [winner, refused] = executionWon
      ? [local, independent]
      : [independent, local];

    expect(winner.answer.kind).toBe("accepted");
    expect(refused.answer).toMatchObject({
      kind: "failed",
      reason: "already-starting",
    });
    expect([winner.effects, refused.effects]).toEqual([1, 0]);
    expect(kept?.map((attempt) => attempt.request)).toEqual([
      executionWon ? execution : refinement,
    ]);
  });

  test("admits both starts for distinct stories", async ({ signal }) => {
    const execution = makeMe.aLaunchRequest.executing(story).please();
    const refinement = makeMe.aLaunchRequest.refining(anotherStory).please();

    const { local, independent, kept } = await overlappingAdmissions(
      signal,
      execution,
      refinement,
    );

    for (const { answer, effects } of [local, independent]) {
      expect([answer.kind, effects]).toEqual(["accepted", 1]);
    }
    const identities = kept?.map(({ request }) => storyOf(request)).sort();
    expect(identities).toEqual([story.identity, anotherStory.identity]);
  });
}
