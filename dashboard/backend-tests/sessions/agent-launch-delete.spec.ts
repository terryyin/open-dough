// Deletion admits a kept session, then consults its native state before
// changing the machine's records. Origin refusal belongs to the shared route.
import {
  chmodSync,
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
import { deleted } from "../../server/launchRecordDeletion.ts";
import { keptRecords } from "../../server/launchRecordStore.ts";
import { machineFolder } from "../../server/localFolder.ts";
import { machineDashboardDirectory } from "../../server/machineHome.ts";
import { mountProjectConfiguration } from "../../server/projectConfiguration.ts";
import { admittedDelete } from "../../server/sessionAdmission.ts";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import {
  installFakeClaude,
  type FakeClaudeControls,
} from "../../test-support/support/fakeClaude.ts";

const source = makeMe.aPublishedSource.openDough.please();
const otherSource = makeMe.aPublishedSource.pygardon.please();
const keptId = "588c4c19-0000-4000-8000-000000000001";
const targetId = "ed479a94-0000-4000-8000-000000000002";
const body = { source: source.id, session: targetId };

let launches: AgentLaunches;
let claude: FakeClaudeControls;

beforeEach(() => {
  const machine = realpathSync(
    mkdtempSync(path.join(tmpdir(), "dough-delete-")),
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
  mkdirSync(executionCheckout(source).path, { recursive: true });
  mkdirSync(executionCheckout(otherSource).path, { recursive: true });
});

function launch(sessionId: string, identity: string) {
  return makeMe.aLaunchRecord
    .executing({ source: source.id, identity, title: "Keep track of work" })
    .inClaudeSession({ sessionId });
}

async function keepListed(record: LaunchRecord) {
  await bindRecord(source.id, record);
  claude.claudeListingBecomes([
    ...claude.claudeListing(),
    makeMe.aClaudeListingRow
      .background({
        sessionId: record.session.sessionId,
        name: record.session.name,
        cwd: executionCheckout(source).path,
        startedAt: Date.parse(record.launchedAt),
      })
      .as("working")
      .please(),
  ]);
}

test("deletes only the record whose listing cannot be read, stopping and renaming nothing", async () => {
  await keepListed(launch(keptId, "SEED-867#keep").please());
  await keepListed(launch(targetId, "SEED-867#delete").please());
  const before = await keptRecords(source.id);
  const listing = claude.claudeListing();
  claude.claudeListingFails(true);

  const answer = await deleted(await admittedDelete(body, launches), launches);

  expect(answer).toEqual({ kind: "deleted" });
  expect(await keptRecords(source.id)).toEqual(
    before.filter(({ session }) => session.sessionId !== targetId),
  );
  expect(claude.claudeListing()).toEqual(listing);
  expect(claude.claudeStopCalls()).toEqual([]);
  expect(claude.claudeAttaches()).toEqual([]);
});

test("deletes only the unmarked record Claude Code no longer lists", async () => {
  await keepListed(launch(keptId, "SEED-867#keep").please());
  await keepListed(launch(targetId, "SEED-867#delete-forgotten").please());
  claude.claudeSessionBecomes(targetId, "forgotten");
  const before = await keptRecords(source.id);
  const listing = claude.claudeListing();

  const answer = await deleted(await admittedDelete(body, launches), launches);

  expect(answer).toEqual({ kind: "deleted" });
  expect(await keptRecords(source.id)).toEqual(
    before.filter(({ session }) => session.sessionId !== targetId),
  );
  expect(claude.claudeListing()).toEqual(listing);
  expect(claude.claudeStopCalls()).toEqual([]);
  expect(claude.claudeAttaches()).toEqual([]);
});

test.each([
  {
    known: "working",
    done: false,
    state: { kind: "available", availability: "loaded", activity: "working" },
  },
  {
    known: "unlisted and marked Done",
    done: true,
    state: { kind: "unavailable" },
  },
])(
  "keeps the $known session's record and answers its state",
  async ({ done, state }) => {
    const record = launch(targetId, "SEED-867#known");
    await keepListed((done ? record.markedDone() : record).please());
    if (done) claude.claudeSessionBecomes(targetId, "forgotten");
    const before = await keptRecords(source.id);
    const listing = claude.claudeListing();

    const answer = await deleted(
      await admittedDelete(body, launches),
      launches,
    );

    expect(answer).toMatchObject({
      kind: "state-known",
      record: { session: { sessionId: targetId }, sessionState: state },
    });
    expect(await keptRecords(source.id)).toEqual(before);
    expect(claude.claudeListing()).toEqual(listing);
    expect(claude.claudeStopCalls()).toEqual([]);
    expect(claude.claudeAttaches()).toEqual([]);
  },
);

test("refuses unrecorded sessions, another project's session and unknown projects before Claude Code runs", async () => {
  await keepListed(launch(targetId, "SEED-867#keep").please());
  const before = await keptRecords(source.id);
  for (const [requested, message] of [
    [
      { ...body, session: "00000000-0000-4000-8000-000000000000" },
      "This dashboard launched no such session for this project.",
    ],
    [
      { ...body, source: otherSource.id },
      "This dashboard launched no such session for this project.",
    ],
    [{ ...body, source: "not-a-real-project" }, "Unknown catalog source."],
  ] as const) {
    await expect(admittedDelete(requested, launches)).rejects.toMatchObject({
      status: 404,
      message,
    });
    expect(claude.claudeCalls()).toEqual([]);
  }
  expect(await keptRecords(source.id)).toEqual(before);
});

test("explains why an unwritable record cannot be deleted and keeps it", async () => {
  await keepListed(launch(targetId, "SEED-867#keep").please());
  const before = await keptRecords(source.id);
  const directory = machineDashboardDirectory();
  claude.claudeListingFails(true);
  chmodSync(directory, 0o500);
  try {
    const admitted = await admittedDelete(body, launches);
    const answer = deleted(admitted, launches);
    await expect(answer).rejects.toHaveProperty("status", 500);
    await expect(answer).rejects.toThrow(
      /The session record could not be deleted: .*EACCES/,
    );
  } finally {
    chmodSync(directory, 0o700);
  }
  expect(await keptRecords(source.id)).toEqual(before);
});
