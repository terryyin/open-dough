// Worktree update-and-retry repairs only the retained checkout and continues
// the same accepted attempt. The native host boundary supplies the session.
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  afterEach,
  beforeAll,
  beforeEach,
  expect,
  test,
  vi,
  type MockInstance,
} from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { queuedReadyRepository } from "../../../Distribution/tests/support/queued-repository.mjs";
import { AgentLaunches } from "../../server/agentLaunches.ts";
import { claudeHost } from "../../server/claudeHost.ts";
import { NativeDoneMarks } from "../../server/doneMarks.ts";
import { keepAttempt, keptAttempts } from "../../server/launchAttemptStore.ts";
import { attemptRun } from "../../server/launchRun.ts";
import { keptRecords } from "../../server/launchRecordStore.ts";
import { machineFolder } from "../../server/localFolder.ts";
import { mountProjectConfiguration } from "../../server/projectConfiguration.ts";
import { StartProgress } from "../../server/startProgress.ts";
import { startStore, type StartStore } from "../../server/startStore.ts";
import type { LaunchResult } from "../../src/agentLaunch.ts";
import {
  installHook,
  removeHook,
} from "../../test-support/keptExecutionStart.ts";
import { plantIncompleteInstall } from "../../test-support/support/incompleteReportingInstall.ts";
import { repoRoot } from "../../test-support/support/repositoryRoot.ts";
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
const accepted = () =>
  makeMe.anAcceptedAttempt
    .requesting(request)
    .reportingTo("http://127.0.0.1:9")
    .publicationUnknown();
const fakeHelper = path.join(
  repoRoot,
  "dashboard/test-support/support/fakeReleaseApply.sh",
);
const session = makeMe.aHostSession.claude({ sessionId: "claude-1" }).please();
const note = () => Promise.resolve();

let origin: StartOrigin;
let store: StartStore;
let unmount: () => void;
let marks: NativeDoneMarks;
let launches: AgentLaunches;
let dispatch: MockInstance<typeof claudeHost.launch>;
let missing: string;
let workspace: string;

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
  const home = path.join(origin.machine, "home");
  vi.stubEnv("HOME", home);
  vi.spyOn(claudeHost, "executionStartRefusal").mockResolvedValue(undefined);
  unmount = mountProjectConfiguration("production");
  store = startStore("execution", home);
  marks = new NativeDoneMarks({
    terminals: { withAttachment: vi.fn(), endAttachments: vi.fn() },
    hostFor: () => undefined,
    reportingFolder: machineFolder,
  });
  launches = new AgentLaunches(marks);
  dispatch = vi.spyOn(claudeHost, "launch").mockResolvedValue({
    kind: "launched",
    session,
    sessionState: makeMe.aSessionState.loaded("working").please(),
  });

  installHook(origin, "echo refused >&2\nexit 1\n");
  let first: LaunchResult;
  try {
    first = await attemptRun(
      source,
      {
        request,
        attempt: accepted().please(),
        controller: new AbortController(),
        changes: 0,
      },
      note,
      note,
      note,
      new StartProgress(),
      marks,
    );
  } finally {
    removeHook(origin);
  }
  if (first.kind !== "failed" || first.reason !== "start-refused")
    throw new Error(`Expected a refused Take: ${JSON.stringify(first)}`);
  const kept = await store.kept(source.id, queuedIdentity);
  if (kept === undefined) throw new Error("Missing kept Take candidate.");
  workspace = kept.workspace;
  missing = plantIncompleteInstall(workspace);

  const attempt = accepted()
    .ended(first)
    .settledAt(new Date().toISOString())
    .please();
  await keepAttempt(attempt);
  const resumed = await launches.continueAttempt(source, attempt.id);
  expect(resumed.kind).toBe("accepted");
  const missingInstallExplanation: unknown = expect.stringContaining(missing);
  const reportingRefusal = {
    kind: "failed",
    reason: "refused",
    worktreeUpdateNeeded: true,
    explanation: missingInstallExplanation,
  };
  // The attempt file can be readable before the owner finishes settling it.
  await expect
    .poll(async () => {
      const { attempts } = await launches.attempts();
      return attempts.find(({ id }) => id === attempt.id);
    })
    .toMatchObject({ running: false, outcome: reportingRefusal });
  const outcome = (await keptAttempts())?.find(
    ({ id }) => id === attempt.id,
  )?.outcome;
  expect(outcome).toMatchObject(reportingRefusal);
  expect(dispatch).not.toHaveBeenCalled();
});

afterEach(async () => {
  await launches.drain();
  launches.close();
  await marks.close();
  vi.restoreAllMocks();
  unmount();
  vi.unstubAllEnvs();
  origin.cleanup();
});

test("applies the updater to the exact kept worktree and resumes that attempt once", async () => {
  const applyLog = path.join(origin.machine, "fake-apply.log");
  vi.stubEnv("OPEN_DOUGH_RELEASE_HELPER", fakeHelper);
  vi.stubEnv("OPEN_DOUGH_FAKE_APPLY_LOG", applyLog);
  const kept = await store.kept(source.id, queuedIdentity);
  const id = accepted().please().id;
  expect(existsSync(missing)).toBe(false);

  const acceptance = await launches.updateWorktreeAndRetry(source, id);
  await launches.drain();

  expect(acceptance).toMatchObject({ kind: "accepted", attempt: { id } });
  const { attempts } = await launches.attempts();
  expect(attempts).toMatchObject([
    {
      id,
      outcome: { kind: "launched", session: { sessionId: session.sessionId } },
    },
  ]);
  expect(existsSync(missing)).toBe(true);
  expect(readFileSync(applyLog, "utf8")).toBe(
    `apply --target ${workspace} --platform claude\n`,
  );
  expect(dispatch).toHaveBeenCalledTimes(1);
  expect(dispatch.mock.calls[0]?.[4]?.workspace.path).toBe(workspace);
  expect(readdirSync(path.dirname(workspace))).toEqual([
    path.basename(workspace),
  ]);
  expect(await keptRecords(source.id)).toMatchObject([
    {
      start: {
        workspace,
        branch: kept?.branch,
        publishedSha: kept?.candidateSha,
      },
    },
  ]);
  expect(await origin.takenProfiles()).toMatchObject([
    { identity: queuedIdentity },
  ]);
  expect((await origin.originGit("rev-parse", "main")).trim()).toBe(
    kept?.candidateSha,
  );
  expect(await store.kept(source.id, queuedIdentity)).toBeUndefined();
});

test("updater refusal leaves an actionable explanation and dispatches nothing", async () => {
  const refusedUpdater = path.join(origin.machine, "refuse-apply.sh");
  writeFileSync(
    refusedUpdater,
    '#!/bin/sh\nprintf "%s\\n" "Installation preserved. Restore its release baseline before updating." >&2\nexit 1\n',
  );
  vi.stubEnv("OPEN_DOUGH_RELEASE_HELPER", refusedUpdater);
  const kept = await store.kept(source.id, queuedIdentity);
  const before = await origin.originGit("rev-parse", "main");

  const refused = await launches.updateWorktreeAndRetry(
    source,
    accepted().please().id,
  );
  await launches.drain();

  expect(refused).toMatchObject({
    kind: "failed",
    reason: "refused",
    worktreeUpdateNeeded: true,
  });
  if (refused.kind !== "failed") throw new Error("Expected updater refusal.");
  expect(refused.explanation).toContain(
    "Restore its release baseline before updating.",
  );
  expect(refused.explanation).toContain(
    "Nothing was launched. No forced reinstall was attempted.",
  );
  expect(existsSync(missing)).toBe(false);
  expect(dispatch).not.toHaveBeenCalled();
  expect(await store.kept(source.id, queuedIdentity)).toEqual(kept);
  expect(await origin.originGit("rev-parse", "main")).toBe(before);
});
