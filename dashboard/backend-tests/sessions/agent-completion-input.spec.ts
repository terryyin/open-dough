// Each host's first input ends with the shared reporting instruction in that
// host's grammar, and a truly blank ad hoc launch gains none. The blank Claude
// Code launch runs through production `attemptRun` and the real Claude Code
// host over the synthetic `claude`; its kept record keeps the reporting
// context its admitted claim needs.
import { randomUUID } from "node:crypto";
import { afterEach, beforeAll, beforeEach, expect, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { requestFacts } from "../../../Distribution/tests/support/launchRequestTestData.mjs";
import { queuedReadyRepository } from "../../../Distribution/tests/support/queued-repository.mjs";
import { codexInput } from "../../server/hosts/codex/input.ts";
import { cursorPrompt } from "../../server/hosts/cursor/prompt.ts";
import { settleAttempt } from "../../server/launchAttemptSettlement.ts";
import { keepAttempt } from "../../server/launchAttemptStore.ts";
import { launchHost } from "../../server/launchHosts.ts";
import { keptRecords } from "../../server/launchRecordStore.ts";
import { attemptRun } from "../../server/launchRun.ts";
import { OwnedAttempts } from "../../server/ownedAttempts.ts";
import { mountProjectConfiguration } from "../../server/projectConfiguration.ts";
import { reportingInstruction } from "../../server/reportingInstruction.ts";
import { StartProgress } from "../../server/startProgress.ts";
import type { LaunchResult } from "../../src/agentLaunch.ts";
import type { RecordedLaunchRequest } from "../../src/launchRequest.ts";
import {
  installFakeClaude,
  type FakeClaudeControls,
} from "../../test-support/support/fakeClaude.ts";
import {
  startOrigin,
  type StartOrigin,
} from "../../test-support/support/startOrigin.ts";
import { keepStartedOrigin } from "../../test-support/support/startOriginPreparation.ts";

const source = makeMe.aPublishedSource.openDough.please();
const repository = queuedReadyRepository().please();

let origin: StartOrigin;
let claude: FakeClaudeControls;
let unmount: () => void;

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
  const native = installFakeClaude(
    origin.machine,
    { binDir: origin.machine, path: process.env["PATH"] ?? "" },
    {},
  );
  claude = native.controls;
  for (const [key, value] of Object.entries(native.env)) vi.stubEnv(key, value);
  unmount = mountProjectConfiguration("production");
});

afterEach(() => {
  unmount();
  vi.unstubAllEnvs();
  origin.cleanup();
});

test("shared reporting instruction preserves host input grammar and truly blank intent", () => {
  const reporting = {
    reference: "00000000-0000-4000-8000-000000000001",
    origin: "http://127.0.0.1:1234",
    command: "'node' '/installed/report.mjs'",
  };
  const blank: RecordedLaunchRequest = requestFacts(
    { workflow: "ad-hoc", title: "Session", source: "open-dough" },
    { host: "codex", reporting },
  ).request;
  expect(reportingInstruction(blank)).toBeUndefined();
  expect(codexInput(blank, "/workspace")).toEqual([{ type: "text", text: "" }]);
  expect(cursorPrompt({ ...blank, host: "cursor" }, undefined)).toBeUndefined();

  const request: RecordedLaunchRequest = requestFacts(
    {
      workflow: "execution",
      identity: "SEED-A#a",
      title: "Story",
      source: "open-dough",
    },
    { host: "cursor", reporting },
  ).request;
  const instruction = reportingInstruction(request);
  expect(cursorPrompt(request, undefined)).toBe(
    `/dough-execute-plan SEED-A#a\n\n${instruction}`,
  );
  expect(codexInput({ ...request, host: "codex" }, "/workspace")[0]).toEqual({
    type: "text",
    text: `$dough-execute-plan SEED-A#a\n\n${reportingInstruction({ ...request, host: "codex" })}`,
  });
});

test("Claude native blank launch gains no first input while its admitted claim keeps reporting context", async () => {
  const attempt = makeMe.anAcceptedAttempt
    .adHoc({ host: "claude", instruction: "   " })
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

  expect(result?.kind).toBe("launched");
  const [started] = claude.claudeLaunches();
  expect(started).toBeDefined();
  expect(started).not.toHaveProperty("instruction");
  const [record] = await keptRecords(source.id);
  expect(record?.request.reporting?.landingContext).toBeDefined();
});
