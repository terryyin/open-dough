// Manual Done types Claude Code's rename in an open or private terminal,
// then ends the attachment, stops the session and retains the local mark.
import { mkdirSync, mkdtempSync, realpathSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { beforeEach, expect, onTestFinished, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { AgentLaunches } from "../../server/agentLaunches.ts";
import { AgentTerminals } from "../../server/agentTerminals.ts";
import { NativeDoneMarks } from "../../server/doneMarks.ts";
import { executionCheckout } from "../../server/executionCheckout.ts";
import { launchHost } from "../../server/launchHosts.ts";
import { bindRecord } from "../../server/launchRecordBinding.ts";
import { keptRecords } from "../../server/launchRecordStore.ts";
import { machineFolder, type LocalFolder } from "../../server/localFolder.ts";
import { mountProjectConfiguration } from "../../server/projectConfiguration.ts";
import {
  installFakeClaude,
  type FakeClaudeControls,
} from "../../test-support/support/fakeClaude.ts";
import { processRunning } from "../../test-support/support/processGroup.ts";

const source = makeMe.aPublishedSource.openDough.please();
const sessionId = "588c4c19-0000-4000-8000-000000000002";
const shortId = sessionId.slice(0, 8);

let claude: FakeClaudeControls;
let folder: LocalFolder;
let terminals: AgentTerminals;
let marks: NativeDoneMarks;
let launches: AgentLaunches;

beforeEach(() => {
  const machine = realpathSync(mkdtempSync(path.join(tmpdir(), "dough-done-")));
  const fixture = installFakeClaude(
    machine,
    { binDir: machine, path: process.env.PATH ?? "" },
    { doneRenameWaitMs: 3_000 },
  );
  for (const [key, value] of Object.entries(fixture.env))
    vi.stubEnv(key, value);
  const unmount = mountProjectConfiguration("production");
  claude = fixture.controls;
  folder = executionCheckout(source);
  mkdirSync(folder.path);
  terminals = new AgentTerminals(null, () =>
    Promise.reject(new Error("This test runs without terminal upgrades.")),
  );
  marks = new NativeDoneMarks({
    terminals,
    hostFor: launchHost,
    reportingFolder: machineFolder,
  });
  launches = new AgentLaunches(marks);
  onTestFinished(async () => {
    launches.close();
    await marks.close();
    terminals.close();
    await launches.drain();
    unmount();
    vi.unstubAllEnvs();
    rmSync(machine, { recursive: true, force: true });
  });
});

async function keepIdleSession(title = "Finish this session") {
  const record = makeMe.aLaunchRecord
    .executing({ source: source.id, identity: "SEED-867#native-done", title })
    .inClaudeSession({ sessionId, shortId })
    .please();
  await bindRecord(source.id, record);
  claude.claudeListingBecomes([
    makeMe.aClaudeListingRow
      .background({
        sessionId,
        name: record.session.name,
        cwd: folder.path,
        startedAt: Date.parse(record.launchedAt),
      })
      .as("working-idle")
      .please(),
  ]);
  return record;
}

// Stand in for the already-open composer. Claude lists the name submitted
// through it only when clearing the draft and entering a rename succeeded.
function openComposer() {
  const keys: string[] = [];
  let draft = "a leftover draft";
  const withAttachment = vi
    .spyOn(terminals, "withAttachment")
    .mockImplementation((...[session, , use]) =>
      use((input) => {
        keys.push(input);
        if (input === "\u0015") draft = "";
        else if (input === "\r") {
          const name = /^\/rename (.+)$/.exec(draft)?.[1];
          if (name === undefined) return;
          claude.claudeListingBecomes(
            claude
              .claudeListing()
              .map((row) =>
                row["sessionId"] === session.sessionId ? { ...row, name } : row,
              ),
          );
        } else draft += input;
      }),
    );
  return { keys, withAttachment, end: vi.spyOn(terminals, "endAttachments") };
}

const listed = () =>
  claude.claudeListing().find((row) => row["sessionId"] === sessionId);

test("renames through the open terminal, ends it, then stops the session and keeps the mark", async () => {
  const record = await keepIdleSession();
  const open = openComposer();
  const name = `done-${record.session.name}`;

  const marked = await marks.markDone(source, record, folder, launches);

  expect(Date.parse(marked.doneAt ?? "")).not.toBeNaN();
  expect(marked.doneProblem).toBeUndefined();
  expect(open.withAttachment).toHaveBeenCalledTimes(1);
  expect(open.withAttachment.mock.calls[0]?.slice(0, 2)).toEqual([
    record.session,
    folder,
  ]);
  expect(open.keys).toEqual(["\u0015", `/rename ${name}`, "\r"]);
  expect(open.end).toHaveBeenCalledExactlyOnceWith(record.session);
  expect(claude.claudeAttaches()).toEqual([]);
  expect(claude.claudeStopCalls()).toEqual([
    { argv: ["stop", shortId], cwd: folder.path },
  ]);
  expect(listed()).toMatchObject({ name, state: "stopped" });
  expect(listed()).not.toHaveProperty("status");
  const { sessionState } = await launches.stateOf(source, marked);
  expect(sessionState).toMatchObject({
    kind: "available",
    availability: "retained",
    activity: "interrupted",
  });
  expect(sessionState).not.toHaveProperty("status");
  expect(await keptRecords(source.id)).toMatchObject([
    { doneAt: marked.doneAt, session: record.session },
  ]);
});

test("keeps Done with the control-character cause without typing into the open terminal", async () => {
  const record = await keepIdleSession("Finish this session \u001b[2J");
  const open = openComposer();

  const marked = await marks.markDone(source, record, folder, launches);

  expect(Date.parse(marked.doneAt ?? "")).not.toBeNaN();
  expect(await keptRecords(source.id)).toMatchObject([
    {
      doneAt: marked.doneAt,
      doneProblem:
        "Local done mark retained. Claude Code rename failed: The native name contains terminal control characters.",
      session: record.session,
    },
  ]);
  expect(open.withAttachment).not.toHaveBeenCalled();
  expect(open.keys).toEqual([]);
  expect(open.end).toHaveBeenCalledExactlyOnceWith(record.session);
  expect(claude.claudeStopCalls()).toEqual([
    { argv: ["stop", shortId], cwd: folder.path },
  ]);
  expect(listed()).toMatchObject({
    name: record.session.name,
    state: "stopped",
  });
  expect((await launches.stateOf(source, marked)).sessionState).toMatchObject({
    kind: "available",
    availability: "retained",
    activity: "interrupted",
  });
});

test("renames through one private attachment, hangs it up and stops the session", async () => {
  const record = await keepIdleSession();
  const name = `done-${record.session.name}`;

  const marked = await marks.markDone(source, record, folder, launches);

  expect(Date.parse(marked.doneAt ?? "")).not.toBeNaN();
  expect(await keptRecords(source.id)).toMatchObject([
    { doneAt: marked.doneAt, session: record.session },
  ]);
  expect(marked.doneProblem).toBeUndefined();
  expect(claude.claudeAttaches()).toEqual([
    expect.objectContaining({ id: shortId, lines: [`/rename ${name}`] }),
  ]);
  await expect.poll(() => claude.claudeAttaches()[0]?.endedBy).toBe("SIGHUP");
  await expect
    .poll(() => processRunning(claude.claudeAttaches()[0]?.pid))
    .toBe(false);
  expect(claude.claudeStopCalls()).toEqual([
    { argv: ["stop", shortId], cwd: folder.path },
  ]);
  expect(listed()).toMatchObject({ name, state: "stopped" });
  expect((await launches.stateOf(source, marked)).sessionState).toMatchObject({
    kind: "available",
    availability: "retained",
    activity: "interrupted",
  });
});
