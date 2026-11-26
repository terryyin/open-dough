// A developer's Done uses what Claude Code lists to choose stop or removal.
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  realpathSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { beforeEach, expect, onTestFinished, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { AgentLaunches } from "../../server/agentLaunches.ts";
import { NativeDoneMarks } from "../../server/doneMarks.ts";
import { executionCheckout } from "../../server/executionCheckout.ts";
import { launchHost } from "../../server/launchHosts.ts";
import { bindRecord } from "../../server/launchRecordBinding.ts";
import { keptRecords } from "../../server/launchRecordStore.ts";
import { machineFolder, type LocalFolder } from "../../server/localFolder.ts";
import { mountProjectConfiguration } from "../../server/projectConfiguration.ts";
import type { LaunchRecord } from "../../src/agentLaunch.ts";
import {
  installFakeClaude,
  type FakeClaudeControls,
} from "../../test-support/support/fakeClaude.ts";

const source = makeMe.aPublishedSource.openDough.please();
const sessionId = "588c4c19-0000-4000-8000-000000000001";
const shortId = sessionId.slice(0, 8);
const launch = () =>
  makeMe.aLaunchRecord
    .executing({
      source: source.id,
      identity: "SEED-867#native-done",
      title: "Finish this session",
    })
    .inClaudeSession({ sessionId, shortId });
const withAttachment = vi.fn((): never => {
  throw new Error("No rename terminal should be needed.");
});

let claude: FakeClaudeControls;
let folder: LocalFolder;
let marks: NativeDoneMarks;
let launches: AgentLaunches;

beforeEach(() => {
  const machine = realpathSync(
    mkdtempSync(path.join(tmpdir(), "dough-done-stop-")),
  );
  const fixture = installFakeClaude(
    machine,
    { binDir: machine, path: process.env.PATH ?? "" },
    {},
  );
  for (const [key, value] of Object.entries(fixture.env))
    vi.stubEnv(key, value);
  const unmount = mountProjectConfiguration("production");
  claude = fixture.controls;
  folder = executionCheckout(source);
  mkdirSync(folder.path);
  withAttachment.mockClear();
  marks = new NativeDoneMarks({
    terminals: { withAttachment, endAttachments: vi.fn() },
    hostFor: launchHost,
    reportingFolder: machineFolder,
  });
  launches = new AgentLaunches(marks);
  onTestFinished(async () => {
    launches.close();
    await marks.close();
    await launches.drain();
    unmount();
    vi.unstubAllEnvs();
    rmSync(machine, { recursive: true, force: true });
  });
});

async function keepListed(
  record: LaunchRecord,
  appearance: "working" | "done-exited",
) {
  await bindRecord(source.id, record);
  claude.claudeListingBecomes([
    makeMe.aClaudeListingRow
      .background({
        sessionId,
        name: record.session.name,
        cwd: folder.path,
        startedAt: Date.parse(record.launchedAt),
      })
      .as(appearance)
      .please(),
  ]);
}

test("keeps Done with the rename cause when Claude Code no longer lists the session", async () => {
  const record = launch().please();
  await keepListed(record, "working");
  claude.claudeSessionBecomes(sessionId, "forgotten");

  const marked = await marks.markDone(source, record, folder, launches);

  expect(await keptRecords(source.id)).toMatchObject([
    {
      doneAt: expect.any(String) as unknown,
      doneProblem:
        "Local done mark retained. Claude Code rename failed: The session is no longer running, so it was not renamed.",
      session: { sessionId, name: record.session.name },
    },
  ]);
  expect((await launches.stateOf(source, marked)).sessionState.kind).toBe(
    "unavailable",
  );
  expect(withAttachment).not.toHaveBeenCalled();
  expect(claude.claudeAttaches()).toEqual([]);
  expect(claude.claudeStopCalls()).toEqual([]);
  expect(claude.claudeRemovalCalls()).toEqual([]);
});

test("removes an exited session's Claude Code job without renaming or stopping it", async () => {
  const record = launch().please();
  await keepListed(record, "done-exited");

  const marked = await marks.markDone(source, record, folder, launches);

  const [kept] = await keptRecords(source.id);
  expect(kept).toMatchObject({
    doneAt: expect.any(String) as unknown,
    session: { sessionId, name: record.session.name },
  });
  expect(kept).not.toHaveProperty("doneProblem");
  expect((await launches.stateOf(source, marked)).sessionState.kind).toBe(
    "unavailable",
  );
  expect(claude.claudeRemovalCalls()).toEqual([
    { argv: ["rm", shortId], cwd: folder.path },
  ]);
  expect(withAttachment).not.toHaveBeenCalled();
  expect(claude.claudeAttaches()).toEqual([]);
  expect(claude.claudeStopCalls()).toEqual([]);
  expect(claude.claudeListing()).not.toContainEqual(
    expect.objectContaining({ sessionId }),
  );
  expect(existsSync(folder.path)).toBe(true);
});

test("keeps a failed removal's cause and retries the job removal on the next Done", async () => {
  const record = launch().please();
  await keepListed(record, "done-exited");
  claude.claudeRemovalFails(true);

  const failed = await marks.markDone(source, record, folder, launches);

  expect(await keptRecords(source.id)).toMatchObject([
    {
      doneAt: expect.any(String) as unknown,
      session: { sessionId, name: record.session.name },
      doneProblem:
        "Local done mark retained. Claude Code removal failed: Claude Code refused to remove the session.",
    },
  ]);
  expect(JSON.stringify(failed)).not.toContain("secret-marker-from-claude-rm");
  expect(claude.claudeRemovalCalls()).toEqual([
    { argv: ["rm", shortId], cwd: folder.path },
  ]);

  claude.claudeRemovalFails(false);
  await marks.markDone(source, failed, folder, launches);

  const [kept] = await keptRecords(source.id);
  expect(kept).toMatchObject({ doneAt: expect.any(String) as unknown });
  expect(kept).not.toHaveProperty("doneProblem");
  expect(claude.claudeRemovalCalls()).toEqual([
    { argv: ["rm", shortId], cwd: folder.path },
    { argv: ["rm", shortId], cwd: folder.path },
  ]);
  expect(claude.claudeListing()).not.toContainEqual(
    expect.objectContaining({ sessionId }),
  );
});

test("clears an earlier stop failure by removing the exited session's job", async () => {
  const problem =
    "Local done mark retained. Claude Code stop failed: The native operation could not be confirmed.";
  const day = 24 * 60 * 60 * 1000;
  const today = Date.now();
  const record = launch()
    .launchedAt(new Date(today - 2 * day).toISOString())
    .markedDoneAt(new Date(today - day).toISOString(), { problem })
    .please();
  await keepListed(record, "done-exited");
  expect(await keptRecords(source.id)).toMatchObject([
    { session: { sessionId }, doneProblem: problem },
  ]);

  await marks.markDone(source, record, folder, launches);

  const [kept] = await keptRecords(source.id);
  expect(kept).toMatchObject({ doneAt: expect.any(String) as unknown });
  expect(kept).not.toHaveProperty("doneProblem");
  expect(claude.claudeRemovalCalls()).toEqual([
    { argv: ["rm", shortId], cwd: folder.path },
  ]);
  expect(claude.claudeStopCalls()).toEqual([]);
});

test("stops a session even when its Claude Code listing cannot be read", async () => {
  const record = launch().please();
  await keepListed(record, "working");
  claude.claudeListingFails(true);
  vi.stubEnv("DOUGH_DONE_RENAME_WAIT_MS", "200");

  const marked = await marks.markDone(source, record, folder, launches);

  expect(await keptRecords(source.id)).toMatchObject([
    {
      doneAt: expect.any(String) as unknown,
      session: { sessionId, name: record.session.name },
    },
  ]);
  expect((await launches.stateOf(source, marked)).sessionState.kind).toBe(
    "unknown",
  );
  expect(claude.claudeStopCalls()).toEqual([
    { argv: ["stop", shortId], cwd: folder.path },
  ]);
  expect(claude.claudeRemovalCalls()).toEqual([]);
});
