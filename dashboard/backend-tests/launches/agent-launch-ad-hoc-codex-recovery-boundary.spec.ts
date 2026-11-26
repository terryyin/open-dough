// A blank Codex launch stays uncertain until its original thread and workspace
// establish persistence. No recovery path submits a turn.
import path from "node:path";
import { afterEach, beforeAll, beforeEach, expect, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { queuedReadyRepository } from "../../../Distribution/tests/support/queued-repository.mjs";
import { AgentLaunches } from "../../server/agentLaunches.ts";
import { NativeDoneMarks } from "../../server/doneMarks.ts";
import { keptAttempts } from "../../server/launchAttemptStore.ts";
import { keptRecords } from "../../server/launchRecordStore.ts";
import { machineFolder } from "../../server/localFolder.ts";
import { mountProjectConfiguration } from "../../server/projectConfiguration.ts";
import type { Acceptance } from "../../src/agentLaunch.ts";
import {
  installFakeCodex,
  type FakeCodex,
} from "../../test-support/support/fakeCodex.ts";
import {
  startOrigin,
  type StartOrigin,
} from "../../test-support/support/startOrigin.ts";
import { keepStartedOrigin } from "../../test-support/support/startOriginPreparation.ts";

const repository = queuedReadyRepository().please();
const source = makeMe.aPublishedSource.openDough.please();
const request = makeMe.aLaunchRequest.adHoc({ host: "codex" }).please();

let origin: StartOrigin;
let native: FakeCodex;
let marks: NativeDoneMarks;
let launches: AgentLaunches;
let unmount: () => void;

beforeAll(async () => {
  const prepared = await startOrigin(repository, { host: "codex" });
  try {
    keepStartedOrigin("codex", repository, prepared);
  } finally {
    prepared.cleanup();
  }
});

beforeEach(async () => {
  origin = await startOrigin(repository, { host: "codex" });
  native = await installFakeCodex(
    origin.machine,
    process.env["PATH"] ?? "",
    true,
  );
  for (const [key, value] of Object.entries(native.env)) vi.stubEnv(key, value);
  vi.stubEnv("HOME", path.join(origin.machine, "home"));
  unmount = mountProjectConfiguration("production");
  marks = new NativeDoneMarks({
    terminals: { withAttachment: vi.fn(), endAttachments: vi.fn() },
    hostFor: () => undefined,
    reportingFolder: machineFolder,
  });
  launches = new AgentLaunches(marks);
});

afterEach(async () => {
  launches.close();
  await launches.drain();
  await marks.close();
  await native.close();
  unmount();
  vi.unstubAllEnvs();
  origin.cleanup();
});

async function outcome(accepted: Acceptance) {
  if (accepted.kind !== "accepted") return accepted;
  let seen = accepted.attempt.changes;
  for (;;) {
    const { attempt } = await launches.changed(
      accepted.attempt.id,
      4_500,
      seen,
    );
    if (attempt?.running === false) return attempt.outcome;
    if (attempt === undefined || attempt.changes === seen)
      throw new Error("The Codex attempt did not settle.");
    seen = attempt.changes;
  }
}

const launch = async () =>
  outcome(await launches.accept(source, request, "http://127.0.0.1:4173"));

test("only matching native context with the known history refusal confirms blank persistence", async () => {
  for (const error of [
    { code: -32600, message: "list_turns is not supported yet" },
    { code: -32601, message: "Another unsupported operation" },
    { code: -32000, message: "Native persistence failed" },
    { nonsense: "Unreadable native error" },
  ]) {
    native.blankHistoryError = error;
    expect(await launch()).toMatchObject({ kind: "uncertain" });
    const [record] = await keptRecords(source.id);
    expect(record?.firstInput).toEqual({ state: "awaiting", intent: "blank" });
  }
  const [saved] = await keptRecords(source.id);
  if (saved === undefined || saved.session.host !== "codex")
    throw new Error("Missing the original Codex conversation.");
  const workspace = saved.session.continuation?.workspace;
  if (workspace === undefined) throw new Error("Missing the saved workspace.");
  if (
    saved.request.workflow !== "ad-hoc" ||
    saved.request.storyIdentity === undefined
  )
    throw new Error("The blank launch must retain its published story.");
  const revision = (await origin.originGit("rev-parse", "main")).trim();
  expect(await keptAttempts()).toMatchObject([
    {
      publication: {
        kind: "published",
        identity: saved.request.storyIdentity,
        revision,
      },
    },
  ]);

  native.blankHistoryError = undefined;
  native.failRead = true;
  expect(await launch()).toMatchObject({ kind: "uncertain" });
  native.failRead = false;
  native.readError = true;
  expect(await launch()).toMatchObject({ kind: "uncertain" });
  native.readError = false;

  native.cwd = `${workspace}-wrong`;
  expect(await launch()).toMatchObject({ kind: "uncertain" });
  native.cwd = workspace;
  native.threadId = "different-thread";
  expect(await launch()).toMatchObject({ kind: "uncertain" });

  native.blankHistoryError = {
    code: -32601,
    message: "list_turns is not supported yet",
  };
  expect(await launch()).toMatchObject({ kind: "uncertain" });
  native.threadId = saved.session.sessionId;
  native.cwd = `${workspace}-wrong`;
  expect(await launch()).toMatchObject({ kind: "uncertain" });

  native.cwd = workspace;
  expect(await keptRecords(source.id)).toEqual([saved]);
  expect(await launch()).toMatchObject({
    kind: "launched",
    session: { sessionId: saved.session.sessionId },
  });
  expect(await keptRecords(source.id)).toEqual([
    { ...saved, firstInput: { state: "not-requested", intent: "blank" } },
  ]);
  expect(
    native.calls.filter(({ method }) => method === "thread/start"),
  ).toHaveLength(1);
  expect(
    native.calls.filter(({ method }) => method === "thread/read").slice(-2),
  ).toEqual([
    {
      method: "thread/read",
      params: { threadId: saved.session.sessionId, includeTurns: true },
    },
    {
      method: "thread/read",
      params: { threadId: saved.session.sessionId, includeTurns: false },
    },
  ]);
  expect(
    native.calls.filter(
      ({ method }) => method === "turn/start" || method === "thread/resume",
    ),
  ).toEqual([]);
  expect(native.history).toEqual([]);
  await expect.poll(() => native.sockets.size).toBe(0);
});
