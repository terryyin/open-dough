// Done admission refuses unbound, inaccessible, or malformed requests before
// Claude Code runs. Origin admission is covered at the shared launch boundary.
import { mkdirSync, mkdtempSync, rmdirSync, rmSync } from "node:fs";
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
import { admittedDone } from "../../server/sessionAdmission.ts";
import {
  installFakeClaude,
  type FakeClaudeControls,
} from "../../test-support/support/fakeClaude.ts";

const source = makeMe.aPublishedSource.openDough.please();
const otherSource = makeMe.aPublishedSource.pygardon.please();
const sessionId = "588c4c19-0000-4000-8000-000000000001";
const body = { source: source.id, session: sessionId };

let launches: AgentLaunches;
let claude: FakeClaudeControls;
let folder: LocalFolder;

beforeEach(async () => {
  const machine = mkdtempSync(path.join(tmpdir(), "dough-done-refusal-"));
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
  mkdirSync(executionCheckout(otherSource).path);
  const marks = new NativeDoneMarks({
    terminals: { withAttachment: vi.fn(), endAttachments: vi.fn() },
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
  const record = makeMe.aLaunchRecord
    .executing({
      source: source.id,
      identity: "SEED-867#native-done",
      title: "Keep this session busy",
    })
    .inClaudeSession({ sessionId })
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
      .please(),
  ]);
});

async function expectUnmarkedAndBusy() {
  const [record] = await keptRecords(source.id);
  expect(record).toMatchObject({ session: { sessionId } });
  expect(record).not.toHaveProperty("doneAt");
  expect(claude.claudeListing()).toContainEqual(
    expect.objectContaining({ sessionId, status: "busy" }),
  );
}

test("refuses an unrecorded session or another project's session before running Claude Code", async () => {
  for (const requested of [
    { ...body, session: "00000000-0000-4000-8000-000000000000" },
    { ...body, source: otherSource.id },
  ]) {
    await expect(admittedDone(requested, launches)).rejects.toMatchObject({
      status: 404,
      message: "This dashboard launched no such session for this project.",
    });
    expect(claude.claudeCalls()).toEqual([]);
  }
  await expectUnmarkedAndBusy();
});

test("refuses a session with a missing execution checkout before running Claude Code", async () => {
  rmdirSync(folder.path);

  await expect(admittedDone(body, launches)).rejects.toMatchObject({
    status: 404,
    message:
      "The execution checkout ~/git/open-dough was not found on this machine.",
  });
  expect(claude.claudeCalls()).toEqual([]);
  await expectUnmarkedAndBusy();
});

test("refuses an unknown project before running Claude Code", async () => {
  await expect(
    admittedDone({ ...body, source: "not-a-real-project" }, launches),
  ).rejects.toMatchObject({ status: 404, message: "Unknown catalog source." });
  expect(claude.claudeCalls()).toEqual([]);
  await expectUnmarkedAndBusy();
});

test("refuses a malformed Done body before running Claude Code", async () => {
  await expect(
    admittedDone({ ...body, command: "ls" }, launches),
  ).rejects.toMatchObject({
    status: 400,
    message: "The done request is malformed.",
  });
  expect(claude.claudeCalls()).toEqual([]);
  await expectUnmarkedAndBusy();
});
