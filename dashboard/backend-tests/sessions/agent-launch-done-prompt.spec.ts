// A private Claude Code attachment types Done's rename once its composer
// appears. When the composer never becomes ready, Done retains the cause.
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
import type { LaunchRecord } from "../../src/launchRecord.ts";
import {
  installFakeClaude,
  type FakeClaudeControls,
} from "../../test-support/support/fakeClaude.ts";

const source = makeMe.aPublishedSource.openDough.please();
const sessionId = "588c4c19-0000-4000-8000-000000000004";
const shortId = sessionId.slice(0, 8);

let claude: FakeClaudeControls;
let folder: LocalFolder;
let marks: NativeDoneMarks;
let launches: AgentLaunches;
let sawBanner: boolean;
let typedKeys: { keys: string; composerShown: boolean }[];

beforeEach(() => {
  const machine = realpathSync(
    mkdtempSync(path.join(tmpdir(), "dough-done-prompt-")),
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
  sawBanner = false;
  typedKeys = [];
  let composerShown = false;
  const terminals = new AgentTerminals(null, () =>
    Promise.reject(new Error("This test runs without terminal upgrades.")),
  );
  marks = new NativeDoneMarks({
    terminals: {
      withAttachment: (session, at, use, signal, ready) =>
        terminals.withAttachment(
          session,
          at,
          (type) =>
            use((keys) => {
              typedKeys.push({ keys, composerShown });
              type(keys);
            }),
          signal,
          (screen, cursorVisible) => {
            sawBanner ||= screen.includes(`attached ${shortId}`);
            composerShown ||= screen.includes("❯");
            return ready(screen, cursorVisible);
          },
        ),
      endAttachments: (session) => {
        terminals.endAttachments(session);
      },
    },
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

async function keepIdleSession() {
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
      .as("working-idle")
      .please(),
  ]);
  return record;
}

const listed = () =>
  claude.claudeListing().find((row) => row["sessionId"] === sessionId);

async function expectUnopenedComposer(
  marked: LaunchRecord,
  endedBy: "SIGHUP" | "SIGTERM",
) {
  expect(Date.parse(marked.doneAt ?? "")).not.toBeNaN();
  expect(await keptRecords(source.id)).toMatchObject([
    {
      doneAt: marked.doneAt,
      doneProblem:
        "Local done mark retained. Claude Code rename failed: The terminal attachment could not be opened.",
      session: marked.session,
    },
  ]);
  expect(typedKeys).toEqual([]);
  await expect
    .poll(() => claude.claudeAttaches())
    .toMatchObject([{ id: shortId, lines: [], endedBy }]);
  expect(claude.claudeStopCalls()).toEqual([
    { argv: ["stop", shortId], cwd: folder.path },
  ]);
  expect(listed()).toMatchObject({
    name: marked.session.name,
    state: "stopped",
  });
}

test("waits for the private composer after its banner before typing the rename", async () => {
  vi.stubEnv("DOUGH_DONE_RENAME_WAIT_MS", "30000");
  const record = await keepIdleSession();
  const name = `done-${record.session.name}`;
  claude.claudeAttachPromptDelay(800);

  const marked = await marks.markDone(source, record, folder, launches);

  expect(Date.parse(marked.doneAt ?? "")).not.toBeNaN();
  expect(await keptRecords(source.id)).toMatchObject([
    { doneAt: marked.doneAt, session: record.session },
  ]);
  expect(marked.doneProblem).toBeUndefined();
  expect(sawBanner).toBe(true);
  expect(typedKeys.filter(({ composerShown }) => !composerShown)).toEqual([]);
  await expect
    .poll(() => claude.claudeAttaches())
    .toMatchObject([
      { id: shortId, lines: [`/rename ${name}`], endedBy: "SIGHUP" },
    ]);
  expect(listed()).toMatchObject({ name, state: "stopped" });
});

test("hangs up without typing when the private composer arrives after the rename wait", async () => {
  const record = await keepIdleSession();
  claude.claudeAttachPromptDelay(10_000);

  const marked = await marks.markDone(source, record, folder, launches);

  expect(sawBanner).toBe(true);
  await expectUnopenedComposer(marked, "SIGHUP");
});

test("does not type when the private client exits before its composer", async () => {
  vi.stubEnv("DOUGH_DONE_RENAME_WAIT_MS", "30000");
  const record = await keepIdleSession();
  claude.claudeAttachPromptDelay(10_000);
  const closeClient = async () => {
    await expect.poll(() => sawBanner).toBe(true);
    const [attached] = claude.claudeAttaches();
    if (attached === undefined)
      throw new Error("The private attach was not recorded.");
    process.kill(attached.pid, "SIGTERM");
  };

  const [marked] = await Promise.all([
    marks.markDone(source, record, folder, launches),
    closeClient(),
  ]);

  await expectUnopenedComposer(marked, "SIGTERM");
});

test("hangs up a private attachment that never opens once the wait ends", async () => {
  const record = await keepIdleSession();
  claude.claudeAttachesSilent(true);

  const marked = await marks.markDone(source, record, folder, launches);

  expect(sawBanner).toBe(false);
  await expectUnopenedComposer(marked, "SIGHUP");
});
