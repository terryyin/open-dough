// Manual Done's bounded Claude Code rename failures retain their cause and
// still stop the session. The fake supplies a new idle session for a retry.
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

const source = makeMe.aPublishedSource.openDough.please();
const sessionId = "588c4c19-0000-4000-8000-000000000003";
const shortId = sessionId.slice(0, 8);

let claude: FakeClaudeControls;
let folder: LocalFolder;
let marks: NativeDoneMarks;
let launches: AgentLaunches;

beforeEach(() => {
  const machine = realpathSync(
    mkdtempSync(path.join(tmpdir(), "dough-done-rename-wait-")),
  );
  const fixture = installFakeClaude(
    machine,
    { binDir: machine, path: process.env.PATH ?? "" },
    { doneRenameWaitMs: 2_000 },
  );
  for (const [key, value] of Object.entries(fixture.env))
    vi.stubEnv(key, value);
  const unmount = mountProjectConfiguration("production");
  claude = fixture.controls;
  folder = executionCheckout(source);
  mkdirSync(folder.path);
  const terminals = new AgentTerminals(null, () =>
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

async function keepSession(appearance: "working-idle" | "working") {
  const record = makeMe.aLaunchRecord
    .executing({
      source: source.id,
      identity: "SEED-867#native-done",
      title: "Finish this session",
    })
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
      .as(appearance)
      .please(),
  ]);
  return record;
}

const listed = () =>
  claude.claudeListing().find((row) => row["sessionId"] === sessionId);

test("retains an unconfirmed rename cause, stops the session and renames it when idle again", async () => {
  const record = await keepSession("working-idle");
  const name = `done-${record.session.name}`;
  claude.claudeRenamesIgnored(true);

  const marked = await marks.markDone(source, record, folder, launches);

  expect(Date.parse(marked.doneAt ?? "")).not.toBeNaN();
  expect(await keptRecords(source.id)).toMatchObject([
    {
      doneAt: marked.doneAt,
      doneProblem:
        "Local done mark retained. Claude Code rename failed: The native rename could not be confirmed.",
      session: record.session,
    },
  ]);
  expect((await launches.stateOf(source, marked)).sessionState).toMatchObject({
    kind: "available",
    availability: "retained",
    activity: "interrupted",
  });
  expect(claude.claudeAttaches()).toEqual([
    expect.objectContaining({ id: shortId, lines: [`/rename ${name}`] }),
  ]);
  expect(listed()).toMatchObject({
    name: record.session.name,
    state: "stopped",
  });
  expect(claude.claudeStopCalls()).toEqual([
    { argv: ["stop", shortId], cwd: folder.path },
  ]);
  expect(claude.claudeRemovalCalls()).toEqual([]);

  claude.claudeRenamesIgnored(false);
  claude.claudeSessionBecomes(sessionId, "done-live");
  await marks.markDone(source, marked, folder, launches);

  const [kept] = await keptRecords(source.id);
  expect(kept?.doneProblem).toBeUndefined();
  expect(claude.claudeAttaches()).toHaveLength(2);
  expect(listed()).toMatchObject({ name });
});

test("names a still-working session's exhausted wait without attaching, stops it and renames it when idle", async () => {
  const record = await keepSession("working");

  const marked = await marks.markDone(source, record, folder, launches);

  expect(Date.parse(marked.doneAt ?? "")).not.toBeNaN();
  expect(await keptRecords(source.id)).toMatchObject([
    {
      doneAt: marked.doneAt,
      doneProblem:
        "Local done mark retained. Claude Code rename failed: The session was still working when the wait ended.",
      session: record.session,
    },
  ]);
  expect(claude.claudeAttaches()).toEqual([]);
  expect(claude.claudeStopCalls()).toEqual([
    { argv: ["stop", shortId], cwd: folder.path },
  ]);

  claude.claudeSessionBecomes(sessionId, "done-live");
  await marks.markDone(source, marked, folder, launches);

  const [kept] = await keptRecords(source.id);
  expect(kept?.doneProblem).toBeUndefined();
  expect(claude.claudeAttaches()).toHaveLength(1);
  expect(listed()).toMatchObject({ name: `done-${record.session.name}` });
});
