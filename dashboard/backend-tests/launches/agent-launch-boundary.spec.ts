// The typed launch owner keeps a Claude session only after native confirmation.
import { execFileSync } from "node:child_process";
import {
  mkdirSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  queuedReadyRepository,
  storyA,
} from "../../../Distribution/tests/support/queued-repository.mjs";
import { AgentLaunches } from "../../server/agentLaunches.ts";
import * as baseCi from "../../server/baseCiJudgment.ts";
import { NativeDoneMarks } from "../../server/doneMarks.ts";
import { keptRecords } from "../../server/launchRecordStore.ts";
import { machineFolder } from "../../server/localFolder.ts";
import {
  configuredProject,
  mountProjectConfiguration,
} from "../../server/projectConfiguration.ts";
import type { AgentLaunchRequest } from "../../src/agentLaunch.ts";
import {
  installFakeClaude,
  type FakeClaudeControls,
} from "../../test-support/support/fakeClaude.ts";
import { processRunning } from "../../test-support/support/processGroup.ts";
import {
  startOrigin,
  type StartOrigin,
} from "../../test-support/support/startOrigin.ts";
import { git } from "../../test-support/support/startOriginObservation.ts";
import { keepStartedOrigin } from "../../test-support/support/startOriginPreparation.ts";

const repository = queuedReadyRepository().please();
const source = makeMe.aPublishedSource.openDough.please();
const execution = makeMe.aLaunchRequest.executing(storyA).please();
const reportingOrigin = "http://127.0.0.1:4173";
let origin: StartOrigin;
let native: FakeClaudeControls;
let home: string;
let launches: AgentLaunches;
let marks: NativeDoneMarks;
let unmount: () => void;

beforeAll(async () => {
  const prepared = await startOrigin(repository);
  try {
    keepStartedOrigin("claude", repository, prepared);
  } finally {
    prepared.cleanup();
  }
});

beforeEach(async () => {
  origin = await startOrigin(repository);
  const fixture = installFakeClaude(
    origin.machine,
    { binDir: origin.machine, path: process.env.PATH ?? "" },
    {},
  );
  native = fixture.controls;
  for (const [key, value] of Object.entries(fixture.env))
    vi.stubEnv(key, value);
  home = path.join(origin.machine, "home");
  vi.spyOn(baseCi, "judgeBranchCi").mockResolvedValue({
    state: "pass",
    revision: (await origin.originGit("rev-parse", "main")).trim(),
    subject: "Fixture base",
    laterWithoutResult: 0,
  });
  unmount = mountProjectConfiguration("production");
  marks = new NativeDoneMarks({
    terminals: { withAttachment: vi.fn(), endAttachments: vi.fn() },
    hostFor: () => undefined,
    reportingFolder: machineFolder,
  });
  launches = new AgentLaunches(marks);
});

afterEach(async () => {
  // In a failing timeout test, closing first still ends the held process.
  launches.close();
  await launches.drain();
  await marks.close();
  unmount();
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  origin.cleanup();
});

async function accept(request: AgentLaunchRequest) {
  const accepted = await launches.accept(source, request, reportingOrigin);
  if (accepted.kind !== "accepted") {
    throw new Error(`Expected an accepted launch: ${JSON.stringify(accepted)}`);
  }
  return accepted.attempt.id;
}

async function settle(id: string) {
  await launches.drain();
  return (await launches.attempts()).attempts.find(
    (attempt) => attempt.id === id,
  )?.outcome;
}

async function launch() {
  return settle(await accept(execution));
}

test("names a missing execution checkout without starting Claude", async () => {
  const missing = configuredProject("doughnut");
  if (missing === undefined) throw new Error("Expected a configured project.");
  const request = makeMe.aLaunchRequest
    .executing({ ...storyA, source: missing.id })
    .please();
  const answer = await launches.accept(missing, request, reportingOrigin);
  expect(answer).toMatchObject({
    kind: "failed",
    reason: "folder-not-found",
    explanation: expect.stringContaining("~/git/doughnut") as unknown,
  });
  expect(native.claudeCalls()).toEqual([]);
  expect(await keptRecords(missing.id)).toEqual([]);
});

test("keeps a refused execution start in the store and never reports it running", async () => {
  native.claudeScenario("refused");
  expect(await launch()).toMatchObject({ kind: "failed" });
  const stored = JSON.parse(
    readFileSync(
      path.join(home, ".open-dough/dashboard/execution-starts.json"),
      "utf8",
    ),
  ) as Record<string, Record<string, unknown>>;
  expect(Object.keys(stored[source.id] ?? {})).toEqual([storyA.identity]);
  expect(await launches.keptStarts()).toEqual([
    expect.objectContaining({ identity: storyA.identity }),
  ]);
  expect(launches.runningStarts()).toEqual([]);
});

describe("a published story launching without an installed start", () => {
  beforeEach(() => {
    rmSync(
      path.join(
        origin.project,
        ".claude/skills/dough-execute-plan/scripts/established-start.mjs",
      ),
    );
  });

  test.each([
    { scenario: "untrusted", reason: "folder-not-trusted" },
    { scenario: "refused", reason: "refused" },
  ] as const)(
    "keeps no session after $reason and explains it without forwarding native stderr",
    async ({ scenario, reason }) => {
      native.claudeScenario(scenario);
      const answer = await launch();
      if (answer?.kind !== "failed")
        throw new Error(`Expected a failure: ${JSON.stringify(answer)}`);
      expect(answer.reason).toBe(reason);
      expect(answer.explanation).toContain("Run `claude` in that folder once");
      expect(answer.explanation).toContain("~/git/open-dough");
      expect(answer.explanation).not.toContain(home);
      expect(answer.explanation).not.toContain(
        "secret-marker-from-claude-stderr",
      );
      expect(native.claudeCalls().map(({ argv }) => argv[0])).toEqual(["--bg"]);
      expect(await keptRecords(source.id)).toEqual([]);
    },
  );

  test("answers uncertain when the reported session is absent from Claude's listing", async () => {
    native.claudeScenario("unlisted");
    expect(await launch()).toMatchObject({
      kind: "uncertain",
      reason: "unconfirmed",
      explanation: expect.stringContaining("claude agents") as unknown,
    });
    expect(native.claudeCalls().map(({ argv }) => argv[0])).toEqual([
      "--bg",
      "agents",
    ]);
    expect(await keptRecords(source.id)).toEqual([]);
  });

  test("ends the waiting Claude process with SIGTERM when launch times out", async () => {
    const endWait = path.join(origin.machine, "end-launch-wait");
    vi.stubEnv("DOUGH_TEST_LAUNCH_WAIT_END_FILE", endWait);
    native.claudeScenario("hang");
    const id = await accept(execution);

    await expect
      .poll(() => native.heldClaudePid(), { timeout: 4_000 })
      .toEqual(expect.any(Number));
    const pid = native.heldClaudePid();
    expect(processRunning(pid)).toBe(true);
    writeFileSync(endWait, "");
    expect(await settle(id)).toMatchObject({
      kind: "uncertain",
      reason: "timed-out",
      explanation: expect.stringContaining("claude agents") as unknown,
    });
    await expect.poll(() => processRunning(pid)).toBe(false);
    expect(native.heldClaudeEndedBy()).toBe("SIGTERM");
    expect(await keptRecords(source.id)).toEqual([]);
  });
});

test("refuses before publishing a Take when Claude is absent", async () => {
  const bin = path.join(origin.machine, "git-only");
  mkdirSync(bin);
  symlinkSync(
    execFileSync("which", ["git"], { encoding: "utf8" }).trim(),
    path.join(bin, "git"),
  );
  const main = await origin.originGit("rev-parse", "refs/heads/main");
  const worktrees = await git(
    origin.project,
    "worktree",
    "list",
    "--porcelain",
  );
  vi.stubEnv("PATH", bin);

  expect(await launch()).toMatchObject({
    kind: "failed",
    reason: "start-refused",
    explanation:
      "Claude Code (`claude`) was not found on this machine. Install it to start a session.",
  });
  expect(await origin.originGit("rev-parse", "refs/heads/main")).toBe(main);
  expect(await git(origin.project, "worktree", "list", "--porcelain")).toBe(
    worktrees,
  );
  expect(native.claudeCalls()).toEqual([]);
  expect(await keptRecords(source.id)).toEqual([]);
});
