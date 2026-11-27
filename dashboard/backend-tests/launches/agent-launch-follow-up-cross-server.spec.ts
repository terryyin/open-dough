// A follow-up still running on one server is answered by a second process
// after its source record is gone. The second process starts nothing.
import assert from "node:assert/strict";
import { fork } from "node:child_process";
import { on } from "node:events";
import fs from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test, vi } from "vitest";
import { LaunchAttemptOwner } from "../../server/launchAttemptOwner.ts";
import type { AttemptRun } from "../../server/launchAttemptSettlement.ts";
import { keptAttempts } from "../../server/launchAttemptStore.ts";
import { keptSession } from "../../server/launchRecordStore.ts";
import { replaceRecords } from "../../server/launchRecordDocument.ts";
import {
  appendConfiguredProject,
  mountProjectConfiguration,
  removeConfiguredProject,
} from "../../server/projectConfiguration.ts";
import type { AgentLaunchRequest } from "../../src/agentLaunch.ts";
import {
  acceptFollowUp,
  acceptInChild,
  attemptsFile,
  childAnswer,
  childMode,
  runningExplanation,
  storyIdentity,
  waitForClose,
} from "./followUpCrossServer.ts";

type IndependentOwner = {
  send: (request: AgentLaunchRequest) => void;
  receive: () => Promise<unknown>;
};

async function withIndependentOwner<T>(
  signal: AbortSignal,
  exercise: (owner: IndependentOwner) => Promise<T>,
): Promise<T> {
  const home = fs.mkdtempSync(path.join(tmpdir(), "dough-follow-up-cross-"));
  vi.stubEnv("HOME", home);
  if (process.platform === "win32") vi.stubEnv("USERPROFILE", home);

  let exitCode: number | null;
  let result: T;
  try {
    const child = fork(
      fileURLToPath(import.meta.url),
      [childMode, "watch-lock"],
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

if (process.argv[2] === childMode) {
  await acceptInChild(process.argv[3] === "watch-lock");
} else {
  const { makeMe } =
    await import("../../../Distribution/tests/support/makeMe.mjs");
  const { doneFollowUpSession, followUpStart } =
    await import("./followUpAttemptIdentity.ts");

  test("answers uncertain for a follow-up still running on another server after its source record is gone", async ({
    signal,
  }) => {
    await withIndependentOwner(signal, async ({ send, receive }) => {
      const home = process.env.HOME;
      assert(home !== undefined);
      const checkout = path.join(home, "checkout");
      fs.mkdirSync(checkout);
      const project = makeMe.aConfiguredProject
        .with({
          ...makeMe.aPublishedSource.openDough.please(),
          localPath: checkout,
        })
        .please();
      const source = doneFollowUpSession(
        project.id,
        "Check the cache again",
        "running-source",
        { message: "Restored the cache key." },
        storyIdentity,
      );
      const request = followUpStart(
        project.id,
        makeMe.aFollowUp.ofSession(source).please(),
      );
      const owner = new LaunchAttemptOwner();
      const unmount = mountProjectConfiguration("development");
      let startedRuns = 0;
      const run: AttemptRun = (own) => {
        startedRuns += 1;
        return waitForClose(own);
      };
      try {
        appendConfiguredProject(project);
        await replaceRecords(() => ({ [project.id]: [source] }));
        const started = await acceptFollowUp(owner, project, request, run);
        assert(started.kind === "accepted");
        expect(startedRuns).toBe(1);

        await replaceRecords(() => ({ [project.id]: [] }));
        expect(await keptSession(project.id, source.session)).toBeUndefined();

        // Held while the first attempt's run is still open. The second
        // server reports this lock, then answers once the attempt is visible.
        const lock = `${attemptsFile()}.lock`;
        fs.mkdirSync(lock);
        send(request);
        try {
          const first = await receive();
          const remote =
            first === "waiting-for-lock"
              ? childAnswer.parse(await receive())
              : childAnswer.parse(first);
          if (first === "waiting-for-lock")
            fs.rmSync(lock, { recursive: true });
          expect(remote.answer).toMatchObject({
            kind: "uncertain",
            reason: "unconfirmed",
            explanation: runningExplanation,
          });
          expect(remote.effects).toBe(0);
          expect(startedRuns).toBe(1);
          const kept = await keptAttempts();
          expect(kept?.map((attempt) => attempt.id)).toEqual([
            started.attempt.id,
          ]);
        } finally {
          fs.rmSync(lock, { recursive: true, force: true });
        }
      } finally {
        owner.close();
        await owner.drain();
        removeConfiguredProject(project.id);
        unmount();
      }
    });
  });
}
