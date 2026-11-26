import { mkdtempSync, realpathSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeAll, beforeEach, expect, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  queuedReadyRepository,
  storyA,
} from "../../../Distribution/tests/support/queued-repository.mjs";
import { AgentLaunches } from "../../server/agentLaunches.ts";
import * as baseCi from "../../server/baseCiJudgment.ts";
import { claudeHost } from "../../server/claudeHost.ts";
import { NativeDoneMarks } from "../../server/doneMarks.ts";
import { keptRecords } from "../../server/launchRecordStore.ts";
import { admitLaunchSettings } from "../../server/launchSettingsAdmission.ts";
import { machineFolder } from "../../server/localFolder.ts";
import { mountProjectConfiguration } from "../../server/projectConfiguration.ts";
import type { AgentLaunchRequest } from "../../src/agentLaunch.ts";
import { installFakeClaude } from "../../test-support/support/fakeClaude.ts";
import {
  expectAdHocReportingInput,
  expectReportingBlock,
  installedStoryLaunchInput,
} from "../../test-support/support/reportingInputAssertions.ts";
import {
  startOrigin,
  type StartOrigin,
} from "../../test-support/support/startOrigin.ts";
import { keepStartedOrigin } from "../../test-support/support/startOriginPreparation.ts";

const source = makeMe.aPublishedSource.openDough.please();
const repository = queuedReadyRepository().please();
const storyRequest = makeMe.aLaunchRequest.executing(storyA).please();
const draftRequest = makeMe.aLaunchRequest.adHoc().please();
const reportingOrigin = "http://127.0.0.1:4173";

let root: string;
let origin: StartOrigin | undefined;
let claude: ReturnType<typeof installFakeClaude>["controls"];
let unmount: () => void;
let marks: NativeDoneMarks;
let launches: AgentLaunches;

beforeAll(async () => {
  const prepared = await startOrigin(repository);
  try {
    keepStartedOrigin("claude", repository, prepared);
  } finally {
    prepared.cleanup();
  }
});

beforeEach(() => {
  root = mkdtempSync(path.join(tmpdir(), "dough-claude-model-"));
  const native = installFakeClaude(
    root,
    { binDir: root, path: process.env["PATH"] ?? "" },
    {},
  );
  claude = native.controls;
  for (const [key, value] of Object.entries(native.env)) vi.stubEnv(key, value);
  unmount = mountProjectConfiguration("production");
  marks = new NativeDoneMarks({
    terminals: { withAttachment: vi.fn(), endAttachments: vi.fn() },
    hostFor: () => undefined,
    reportingFolder: machineFolder,
  });
  launches = new AgentLaunches(marks);
});

afterEach(async () => {
  await launches.drain();
  launches.close();
  await marks.close();
  unmount();
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  origin?.cleanup();
  origin = undefined;
  rmSync(root, { recursive: true, force: true });
});

async function settle(request: AgentLaunchRequest) {
  const project = await startOrigin(repository);
  origin = project;
  vi.stubEnv("HOME", path.join(project.machine, "home"));
  vi.spyOn(baseCi, "judgeBranchCi").mockResolvedValue({
    state: "pass",
    revision: (await project.originGit("rev-parse", "main")).trim(),
    subject: "Fixture base",
    laterWithoutResult: 0,
  });
  await admitLaunchSettings(request, claudeHost);
  const accepted = await launches.accept(source, request, reportingOrigin);
  if (accepted.kind !== "accepted")
    throw new Error(`Expected an accepted launch: ${JSON.stringify(accepted)}`);
  await launches.drain();
  const { attempts } = await launches.attempts();
  return {
    project,
    outcome: attempts.find(({ id }) => id === accepted.attempt.id)?.outcome,
    kept: await keptRecords(source.id),
  };
}

async function launched(request: AgentLaunchRequest) {
  const { project, outcome, kept } = await settle(request);
  if (outcome?.kind !== "launched")
    throw new Error(`Expected a confirmed launch: ${JSON.stringify(outcome)}`);
  const [started] = claude.claudeLaunches();
  expect(claude.claudeLaunches()).toHaveLength(1);
  const saved = kept.find(
    ({ session }) =>
      session.sessionId === outcome.session.sessionId &&
      session.host === outcome.session.host,
  );
  if (started === undefined || saved === undefined)
    throw new Error("Expected the native process and its kept record.");
  return { project, started, saved };
}

test("sends the story's chosen model and keeps the alias", async () => {
  const request = makeMe.aLaunchRequest
    .executing(storyA)
    .requestingModel("opus")
    .withInstruction("go")
    .please();
  const { project, started, saved } = await launched(request);

  expect(started.model).toBe(request.model);
  expect(saved.request).toMatchObject(request);
  const input = installedStoryLaunchInput(started.instruction);
  expect(input.invocation).toBe(`/dough-execute-plan ${storyA.identity}`);
  expect(input.instruction).toBe(request.instruction);
  const claim = saved.start;
  if (claim === undefined || "tracking" in claim)
    throw new Error("Missing execution claim.");
  expect(input.handoff?.split("\n").slice(0, 2)).toEqual([
    "Established start:",
    `- identity: ${storyA.identity}`,
  ]);
  expect(input.handoff).toContain(`- publishedSha: ${claim.publishedSha}`);
  expect(input.handoff).toContain(`- workspace: ${claim.workspace}`);
  expect(input.handoff).toContain(`- branch: ${claim.branch}`);
  expect(started.cwd).toBe(realpathSync(claim.workspace));
  expectReportingBlock(input.reporting, saved.request, {
    home: path.join(project.machine, "home"),
    origin: reportingOrigin,
  });
});

test("starts an admitted blank session with the chosen model and no prompt", async () => {
  const request = makeMe.aLaunchRequest
    .adHoc()
    .requestingModel("sonnet")
    .please();
  const { project, started, saved } = await launched(request);

  expect(started).toMatchObject({
    cwd: realpathSync(project.project),
    model: request.model,
    name: `Open Dough · Ad hoc · ${saved.request.title}`,
  });
  expect(started).not.toHaveProperty("instruction");
  expect(saved.request.title).toMatch(
    /^Ad hoc work — \d{1,2} [A-Z][a-z]{2}, \d{2}:\d{2}$/,
  );
  expect(saved.request).toMatchObject(request);
});

test("sends the admitted session's text on its chosen model", async () => {
  const request = makeMe.aLaunchRequest
    .adHoc({ instruction: "look at the build" })
    .requestingModel("fable")
    .please();
  const { project, started, saved } = await launched(request);

  expect(started).toMatchObject({
    model: request.model,
    cwd: realpathSync(project.project),
  });
  expectAdHocReportingInput(
    started.instruction ?? "",
    request.instruction ?? "",
    saved.request,
    {
      home: path.join(project.machine, "home"),
      origin: reportingOrigin,
    },
  );
});

test("sends and retains the story's chosen effort", async () => {
  const request = makeMe.aLaunchRequest
    .executing(storyA)
    .requestingModel("opus")
    .withEffort("high")
    .withInstruction("go")
    .please();
  const { started, saved } = await launched(request);

  expect(started).toMatchObject({
    name: `Open Dough · Execution · ${storyA.title}`,
    model: request.model,
    effort: request.effort,
  });
  expect(saved.request).toMatchObject(request);
});

test.each([
  { kind: "a story", request: storyRequest },
  { kind: "an admitted session", request: draftRequest },
] as const)(
  "sends and retains the default effort without pinning a model for $kind",
  async ({ request }) => {
    const { started, saved } = await launched(request);

    expect(started.effort).toBe("medium");
    expect(saved.request.effort).toBe("medium");
    expect(started).not.toHaveProperty("model");
    expect(saved.request).not.toHaveProperty("model");
  },
);

test.each([
  ["opus", "with model Opus"],
  [undefined, undefined],
] as const)(
  "explains a native refusal with model choice %s without keeping a session",
  async (model, named) => {
    claude.claudeScenario("refused");
    const request = makeMe.aLaunchRequest.executing(storyA);
    if (model !== undefined) request.requestingModel(model);
    const { outcome, kept } = await settle(request.please());

    if (outcome?.kind !== "failed")
      throw new Error(`Expected native refusal: ${JSON.stringify(outcome)}`);
    expect(outcome.reason).toBe("refused");
    expect(outcome.explanation).toContain("Run `claude` in that folder once");
    if (named === undefined) expect(outcome.explanation).not.toContain("model");
    else expect(outcome.explanation).toContain(named);
    expect(kept).toEqual([]);
  },
);
