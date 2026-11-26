// Attempt settlement distinguishes an incomplete install from an older,
// compatible reporting install at the boundary before native dispatch.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync, unlinkSync } from "node:fs";
import path from "node:path";
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
  vi,
  type MockInstance,
} from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { queuedReadyRepository } from "../../../Distribution/tests/support/queued-repository.mjs";
import { claudeHost } from "../../server/claudeHost.ts";
import { NativeDoneMarks } from "../../server/doneMarks.ts";
import { attemptRun } from "../../server/launchRun.ts";
import { machineFolder } from "../../server/localFolder.ts";
import { mountProjectConfiguration } from "../../server/projectConfiguration.ts";
import { reportingInstruction } from "../../server/reportingInstruction.ts";
import { StartProgress } from "../../server/startProgress.ts";
import {
  startStore,
  type StartRecord,
  type StartStore,
} from "../../server/startStore.ts";
import type {
  LaunchResult,
  PublicationReceipt,
} from "../../src/agentLaunch.ts";
import { shellCommand } from "../../src/sessionCapabilities.ts";
import {
  installHook,
  removeHook,
} from "../../test-support/keptExecutionStart.ts";
import {
  plantIncompleteInstall,
  scriptsOf,
} from "../../test-support/support/incompleteReportingInstall.ts";
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
const reportingOrigin = "http://127.0.0.1:9";
const attempt = makeMe.anAcceptedAttempt
  .requesting(request)
  .reportingTo(reportingOrigin)
  .publicationUnknown()
  .please();
const note = () => Promise.resolve();

let origin: StartOrigin;
let home: string;
let store: StartStore;
let unmount: () => void;
let marks: NativeDoneMarks;
let pending: Promise<LaunchResult> | undefined;
let dispatch: MockInstance<typeof claudeHost.launch>;
const publication = vi.fn<(receipt: PublicationReceipt) => Promise<void>>();

beforeAll(async () => {
  const initial = await startOrigin(repository);
  try {
    keepStartedOrigin("claude", repository, initial);
  } finally {
    initial.cleanup();
  }
});

beforeEach(async () => {
  pending = undefined;
  origin = await startOrigin(repository);
  home = path.join(origin.machine, "home");
  vi.stubEnv("HOME", home);
  vi.spyOn(claudeHost, "executionStartRefusal").mockResolvedValue(undefined);
  unmount = mountProjectConfiguration("production");
  store = startStore("execution", home);
  marks = new NativeDoneMarks({
    terminals: { withAttachment: vi.fn(), endAttachments: vi.fn() },
    hostFor: () => undefined,
    reportingFolder: machineFolder,
  });
  dispatch = vi.spyOn(claudeHost, "launch").mockResolvedValue({
    kind: "launched",
    session: makeMe.aHostSession.claude({ sessionId: "claude-1" }).please(),
    sessionState: makeMe.aSessionState.loaded("working").please(),
  });
  publication.mockReset().mockResolvedValue(undefined);
});

afterEach(async () => {
  await Promise.allSettled([pending]);
  await marks.close();
  vi.restoreAllMocks();
  unmount();
  vi.unstubAllEnvs();
  origin.cleanup();
});

function run() {
  pending = attemptRun(
    source,
    { request, attempt, controller: new AbortController(), changes: 0 },
    publication,
    note,
    note,
    new StartProgress(),
    marks,
  );
  return pending;
}

function publishInstall(description: string) {
  const git = (...args: string[]) =>
    execFileSync("git", args, { cwd: origin.project });
  git("add", "-A");
  git("commit", "-m", description);
  git("push", "-q", "origin", "main");
}

describe("a kept start with incomplete reporting support", () => {
  let kept: StartRecord;
  let missing: string;

  beforeEach(async () => {
    installHook(origin, "echo refused >&2\nexit 1\n");
    const first = await run().finally(() => {
      removeHook(origin);
    });
    assert(first.kind === "failed" && first.reason === "start-refused");
    const draft = await store.kept(source.id, queuedIdentity);
    assert(draft !== undefined);
    kept = draft;
    missing = plantIncompleteInstall(kept.workspace);
  });

  test("Continue refuses before dispatch and names the missing helper", async () => {
    const before = await origin.originGit("rev-parse", "main");

    const outcome = await run();

    expect(outcome).toMatchObject({
      kind: "failed",
      reason: "refused",
      worktreeUpdateNeeded: true,
    });
    assert(outcome.kind === "failed");
    expect(outcome.explanation).toContain(missing);
    expect(outcome.explanation).toContain("Update worktree and retry");
    expect(outcome.explanation).toMatch(
      /The start was kept and can be resumed\. Nothing was launched\.$/,
    );
    expect(outcome.explanation).not.toMatch(
      /may or may not have started|ENOENT/i,
    );
    expect(dispatch).not.toHaveBeenCalled();
    expect(await store.kept(source.id, queuedIdentity)).toEqual(kept);
    expect(await origin.originGit("rev-parse", "main")).toBe(before);
  });
});

test("a fresh Take with incomplete reporting support settles without a native launch", async () => {
  plantIncompleteInstall(origin.project);
  publishInstall("Install landing without its sibling");
  const before = (await origin.originGit("rev-parse", "main")).trim();

  const result = await run();

  expect(result).toMatchObject({
    kind: "failed",
    reason: "refused",
    worktreeUpdateNeeded: true,
  });
  assert(result.kind === "failed");
  expect(result.explanation).toContain("first-landing-expectation.mjs");
  expect(result.explanation).toMatch(/Taken by .+; no session started/);
  expect(result.explanation).not.toMatch(/may or may not have started/i);
  expect(dispatch).not.toHaveBeenCalled();
  const head = (await origin.originGit("rev-parse", "main")).trim();
  expect(head).not.toBe(before);
  expect(publication).toHaveBeenCalledWith({
    kind: "published",
    revision: head,
  });
  expect(await origin.takenProfiles()).toMatchObject([
    { identity: queuedIdentity },
  ]);
  expect(await store.kept(source.id, queuedIdentity)).toMatchObject({
    start: { publishedSha: head },
  });
});

test("an older install without landing still dispatches with completion reporting", async () => {
  unlinkSync(path.join(scriptsOf(origin.project), "dashboard-landing.mjs"));
  plantIncompleteInstall(origin.project);
  publishInstall("Install completion reporting without landing");

  const result = await run();

  assert(result.kind === "launched", JSON.stringify(result));
  const [call] = dispatch.mock.calls;
  const nativeRequest = call?.[1];
  const workspace = call?.[4]?.workspace.path;
  assert(nativeRequest !== undefined && workspace !== undefined);
  const script = path.join(
    home,
    ".open-dough/dashboard/reporting",
    attempt.id,
    "dashboard-completion.mjs",
  );
  const command = shellCommand([
    "node",
    script,
    "--origin",
    reportingOrigin,
    "--source",
    source.id,
    "--host",
    request.host,
    "--reference",
    attempt.id,
  ]);
  expect(dispatch).toHaveBeenCalledTimes(1);
  expect(nativeRequest.reporting).toEqual({
    origin: reportingOrigin,
    reference: attempt.id,
    command,
  });
  expect(result.record.request.reporting).toEqual(nativeRequest.reporting);
  const instruction = reportingInstruction(nativeRequest);
  expect(instruction).toContain("Dashboard reporting context:");
  expect(instruction).toContain(`- reporting command: ${command}`);
  expect(instruction).not.toContain("supply --landing-context");
  expect(readFileSync(script)).toEqual(
    readFileSync(path.join(scriptsOf(workspace), "dashboard-completion.mjs")),
  );
});
