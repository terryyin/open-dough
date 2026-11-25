import { execFileSync } from "node:child_process";
import {
  appendFileSync,
  mkdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { expect, onTestFinished, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  ReviewInitialSync,
  type ReviewInitialSyncRequest,
} from "../../server/reviewInitialSync.ts";
import { admitReviewInitialSync } from "../../server/reviewInitialSyncBoundary.ts";
import { configuredProject } from "../../server/projectConfiguration.ts";
import { reviewRepositoryPath } from "../../server/reviewRepository.ts";
import { reviewInitialSyncEndpoint } from "../../src/reviewInitialSync.ts";
import { configuredFixtureProject } from "../support/fixtureProject.ts";

const inactivityMs = 200;
const scaledFormerDeadlineMs = 500;
const receive = "Receiving objects:   5% (1/20)";

async function coldSync() {
  const { repository, project } = await configuredFixtureProject(
    makeMe.aRepository
      .withRevision("published", {
        files: { "change.txt": "published contents\n" },
      })
      .please(),
    (fixture) => path.join(fixture.fixture, "absent-checkout"),
  );
  const sync = new ReviewInitialSync(inactivityMs);
  onTestFinished(() => sync.close());
  const ask = (operation: ReviewInitialSyncRequest["operation"]) => {
    const url = new URL(reviewInitialSyncEndpoint, "http://127.0.0.1:4173");
    url.searchParams.set("source", project.id);
    if (operation === "retry") url.searchParams.set("retry", "true");
    const method = operation === "status" ? "GET" : "POST";
    return sync.answer(
      admitReviewInitialSync({ method, url }, configuredProject),
      new AbortController().signal,
    );
  };
  return { repository, project, sync, ask };
}

// Gate the same --progress Git call the server will make, and release it to
// the real origin once the case has observed the progress or stall behavior.
function gatedGit(root: string) {
  const bin = path.join(root, "bin");
  const log = path.join(root, "sync-processes.log");
  const gate = fileURLToPath(
    new URL("./fixtures/review-initial-sync-git.mjs", import.meta.url),
  );
  const git = execFileSync("which", ["git"], { encoding: "utf8" }).trim();
  mkdirSync(bin);
  writeFileSync(log, "");
  writeFileSync(
    path.join(bin, "git"),
    `#!/bin/sh
case " $* " in
  *" fetch --progress "*) exec "$DOUGH_SYNC_TEST_NODE" "$DOUGH_SYNC_TEST_GATE" "$@" ;;
esac
exec "$DOUGH_SYNC_TEST_GIT" "$@"
`,
    { mode: 0o755 },
  );
  vi.stubEnv("PATH", `${bin}${path.delimiter}${process.env.PATH ?? ""}`);
  vi.stubEnv("DOUGH_SYNC_TEST_GIT", git);
  vi.stubEnv("DOUGH_SYNC_TEST_LOG", log);
  vi.stubEnv("DOUGH_SYNC_TEST_GATE", gate);
  vi.stubEnv("DOUGH_SYNC_TEST_NODE", process.execPath);
  const events = () => readFileSync(log, "utf8").trim().split("\n");
  const pids = () =>
    events()
      .filter((event) => event.startsWith("pid "))
      .map((event) => Number(event.slice(4)));
  return {
    pids,
    events,
    send(report: string) {
      const pid = pids().at(-1);
      if (pid === undefined)
        throw new Error("Expected a Git process to receive its report");
      appendFileSync(`${log}.${pid}`, `${report}\n`);
    },
  };
}

function syncClock() {
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
  const timers = vi.spyOn(globalThis, "setTimeout");
  onTestFinished(() => {
    timers.mockRestore();
    vi.useRealTimers();
  });
  return () =>
    timers.mock.calls.filter(([, delay]) => delay === inactivityMs).length;
}

// Vitest advances mocked time by the poll interval. Child-process receipts
// use real I/O, so they wait without spending any of Git's virtual budget.
function waitForGit<T>(read: () => T) {
  return expect.poll(read, { interval: 0 });
}

test("Git advances beyond the former per-open deadline and verifies the fetched target", async () => {
  const { ask, project, repository } = await coldSync();
  const git = gatedGit(repository.fixture);
  const timerStarts = syncClock();
  const progress = [
    `${receive}, 256.00 KiB | 12.00 MiB/s`,
    `${receive}, 1.00 MiB | 12.00 MiB/s`,
    `${receive}, 1.50 MiB | 12.00 MiB/s`,
    "Resolving deltas: 50% (1/2)",
  ];
  const stepMs = 150;

  expect(ask("start")).toEqual({ kind: "running" });
  await waitForGit(git.pids).toHaveLength(1);
  for (const [index, report] of progress.entries()) {
    vi.advanceTimersByTime(stepMs);
    git.send(report);
    // The rearm is the transport receipt, so virtual time progresses only
    // after the real Git stderr event reaches its production reader.
    await waitForGit(timerStarts).toBe(index + 2);
  }
  expect(stepMs * progress.length).toBeGreaterThan(scaledFormerDeadlineMs);
  expect(ask("status")).toEqual({ kind: "running" });
  git.send("fetch");

  await waitForGit(() => ask("status")).toEqual({
    kind: "ready",
    revision: repository.trunkSha,
  });
  const shown = execFileSync(
    "git",
    ["show", `refs/remotes/origin/${project.ref}:change.txt`],
    {
      cwd: reviewRepositoryPath(project),
      encoding: "utf8",
    },
  );
  expect(shown).toBe("published contents\n");
});

test("unchanged counters and diagnostic traffic cannot keep Git alive, and retry joins after close", async () => {
  const { ask, repository } = await coldSync();
  const git = gatedGit(repository.fixture);
  const timerStarts = syncClock();

  ask("start");
  await waitForGit(git.pids).toHaveLength(1);
  const [stalled] = git.pids();
  if (stalled === undefined)
    throw new Error("Expected the stalled Git process");
  git.send(`${receive}, 1.00 MiB | 12.00 MiB/s`);
  await waitForGit(timerStarts).toBe(2);
  vi.advanceTimersByTime(inactivityMs - 1);
  git.send(`${receive}, 1.00 MiB | 10.00 MiB/s`);
  git.send("flood");
  await waitForGit(git.events).toContain("sent flood");
  expect(timerStarts()).toBe(2);
  expect(ask("status")).toEqual({ kind: "running" });

  vi.advanceTimersByTime(1);
  const failure = {
    kind: "failed",
    problem: "Initial sync stalled: Git made no progress for 0.2 seconds.",
  };
  await waitForGit(() => ask("status")).toEqual(failure);
  expect(() => process.kill(stalled, 0)).toThrow("ESRCH");
  expect(ask("start")).toEqual(failure);
  expect(git.pids()).toEqual([stalled]);

  expect(ask("retry")).toEqual({ kind: "running" });
  expect(ask("retry")).toEqual({ kind: "running" });
  await waitForGit(git.pids).toHaveLength(2);
  git.send("fetch");
  await waitForGit(() => ask("status")).toEqual({
    kind: "ready",
    revision: repository.trunkSha,
  });
  expect(git.pids()).toHaveLength(2);
});

test("origin refusal stays visible on reopen until an explicit retry succeeds", async () => {
  const { ask, repository } = await coldSync();
  syncClock();
  const away = `${repository.origin}-away`;
  renameSync(repository.origin, away);
  try {
    ask("start");
    const failure = {
      kind: "failed",
      problem: "fatal: Could not read from remote repository.",
    };
    await waitForGit(() => ask("status")).toEqual(failure);
    expect(ask("start")).toEqual(failure);
  } finally {
    renameSync(away, repository.origin);
  }
  expect(ask("retry")).toEqual({ kind: "running" });
  await waitForGit(() => ask("status")).toEqual({
    kind: "ready",
    revision: repository.trunkSha,
  });
});

test("server shutdown clears the active Git attempt and its transport process group", async () => {
  const { ask, repository, sync } = await coldSync();
  const git = gatedGit(repository.fixture);
  syncClock();

  ask("start");
  await waitForGit(git.pids).toHaveLength(1);
  const [pid] = git.pids();
  if (pid === undefined) throw new Error("Expected the running Git process");
  git.send("hold-child");
  await waitForGit(git.events).toContainEqual(expect.stringMatching(/^child /));
  await sync.close();

  expect(() => process.kill(pid, 0)).toThrow("ESRCH");
  expect(() => ask("retry")).toThrow();
});
