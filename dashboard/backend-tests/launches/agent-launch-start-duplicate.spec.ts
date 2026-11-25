import { mkdirSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { afterEach, beforeAll, beforeEach, expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { queuedReadyRepository } from "../../../Distribution/tests/support/queued-repository.mjs";
import {
  publicationOf,
  started,
  type Started,
} from "../../server/launchStart.ts";
import { localFolder } from "../../server/localFolder.ts";
import { StartProgress } from "../../server/startProgress.ts";
import { startStore } from "../../server/startStore.ts";
import {
  queuedIdentity,
  queuedTitle,
  startOrigin,
  type StartOrigin,
} from "../../test-support/support/startOrigin.ts";
import { keepStartedOrigin } from "../../test-support/support/startOriginPreparation.ts";

const source = makeMe.aPublishedSource.openDough.please();
const repository = queuedReadyRepository().please();
const request = makeMe.aLaunchRequest
  .executing({ identity: queuedIdentity, title: queuedTitle })
  .please();

let origin: StartOrigin;
let progress: StartProgress;
let attempts: Promise<Started>[];
let start: (attemptId: string) => ReturnType<typeof started>;

beforeAll(async () => {
  const initial = await startOrigin(repository);
  try {
    keepStartedOrigin("claude", repository, initial);
  } finally {
    initial.cleanup();
  }
});

beforeEach(async () => {
  origin = await startOrigin(repository);
  progress = new StartProgress();
  attempts = [];
  const home = path.join(origin.machine, "home");
  const bin = path.join(home, "bin");
  mkdirSync(bin);
  writeFileSync(path.join(bin, "claude"), "", { mode: 0o755 });
  const folder = localFolder("~/git/open-dough", home);
  const store = startStore("execution", home);
  const inputs = {
    store: () => store,
    env: {
      ...process.env,
      HOME: home,
      PATH: `${bin}${path.delimiter}${process.env["PATH"] ?? ""}`,
    },
  };
  start = (attemptId) => {
    const attempt = started(
      source,
      request,
      folder,
      progress,
      inputs,
      attemptId,
    );
    attempts.push(attempt);
    return attempt;
  };
});

afterEach(async () => {
  await Promise.allSettled(attempts);
  origin.cleanup();
});

test("refuses a second Start while the first awaits publication", async () => {
  const push = origin.holdPushes();
  const first = start("first");
  let second: Promise<Started> | undefined;
  try {
    await expect.poll(() => push.isHeld(), { timeout: 2_500 }).toBe(true);
    expect(progress.all()).toEqual([
      {
        workflow: "execution",
        source: source.id,
        identity: queuedIdentity,
        phase: "preparing",
        host: "claude",
      },
    ]);

    let answer: Started | undefined;
    second = start("second").then((result) => {
      answer = result;
      return result;
    });
    await expect
      .poll(() => answer)
      .toMatchObject({
        kind: "stopped",
        result: {
          kind: "failed",
          reason: "already-starting",
          explanation:
            "This story is already starting on this machine, so a second start was not made. Wait for the running start to end; its card shows its progress. Nothing was launched.",
        },
      });
    expect(publicationOf(await second, undefined)).toEqual({ kind: "none" });
    expect((await origin.originGit("rev-parse", "main")).trim()).toBe(
      origin.revision("base"),
    );
    expect(readdirSync(path.join(origin.project, ".worktrees"))).toHaveLength(
      1,
    );
  } finally {
    push.release();
    await Promise.all([first, second]);
  }

  expect(await first).toMatchObject({ kind: "established" });
  expect(await origin.takenProfiles()).toHaveLength(1);
  expect(readdirSync(path.join(origin.project, ".worktrees"))).toHaveLength(1);
});

test("concurrent Starts establish one launch handoff, one claim and one workspace", async () => {
  const push = origin.holdPushes();
  const first = start("first");
  const second = start("second");
  const pending = Promise.all([first, second]);
  try {
    await expect.poll(() => push.isHeld(), { timeout: 2_500 }).toBe(true);
  } finally {
    push.release();
    await pending;
  }

  const answers = await pending;
  expect(answers.map(({ kind }) => kind).sort()).toEqual([
    "established",
    "stopped",
  ]);
  expect(answers.find(({ kind }) => kind === "stopped")).toMatchObject({
    result: { reason: "already-starting" },
  });
  expect(await origin.takenProfiles()).toHaveLength(1);
  expect(readdirSync(path.join(origin.project, ".worktrees"))).toHaveLength(1);
});
