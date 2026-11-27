// Closing native Done abandons the rename wait, persists its cause, and
// lets the developer's stop finish.
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
const sessionId = "588c4c19-0000-4000-8000-000000000005";
const shortId = sessionId.slice(0, 8);

let claude: FakeClaudeControls;
let folder: LocalFolder;
let marks: NativeDoneMarks;
let launches: AgentLaunches;
let terminals: AgentTerminals;

beforeEach(() => {
  const machine = realpathSync(
    mkdtempSync(path.join(tmpdir(), "dough-done-close-")),
  );
  const fixture = installFakeClaude(
    machine,
    { binDir: machine, path: process.env.PATH ?? "" },
    { doneRenameWaitMs: 30_000 },
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

async function keepSession(appearance: "working" | "working-idle") {
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

test("closing while manual Done waits for a working session retains the rename cause and still stops it", async () => {
  const record = await keepSession("working");
  const closeDuringWait = async () => {
    await expect
      .poll(async () => (await keptRecords(source.id))[0]?.doneAt)
      .toEqual(expect.any(String));
    // The state read and two rename reads show the wait is polling a
    // working session before it is abandoned.
    await expect
      .poll(
        () =>
          claude.claudeCalls().filter(({ argv }) => argv[0] === "agents")
            .length,
        { timeout: 3_000 },
      )
      .toBeGreaterThanOrEqual(3);
    await marks.close();
    return keptRecords(source.id);
  };

  const [marked, keptAtClose] = await Promise.all([
    marks.markDone(source, record, folder, launches),
    closeDuringWait(),
  ]);

  expect(Date.parse(marked.doneAt ?? "")).not.toBeNaN();
  expect(keptAtClose).toMatchObject([
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
  expect(claude.claudeListing()).toMatchObject([
    { sessionId, name: record.session.name, state: "stopped" },
  ]);
});

test("closing before the private composer abandons manual rename without typing", async () => {
  const record = await keepSession("working-idle");
  claude.claudeAttachPromptDelay(60_000);
  let sawBanner = false;
  const typed = vi.fn<(keys: string) => void>();
  const withAttachment = terminals.withAttachment.bind(terminals);
  vi.spyOn(terminals, "withAttachment").mockImplementation(
    (session, at, use, signal, ready) =>
      withAttachment(
        session,
        at,
        (type) =>
          use((keys) => {
            typed(keys);
            type(keys);
          }),
        signal,
        (screen, cursorVisible) => {
          sawBanner ||= screen.includes(`attached ${shortId}`);
          return ready(screen, cursorVisible);
        },
      ),
  );
  const closeDuringAttach = async () => {
    await expect.poll(() => sawBanner).toBe(true);
    await marks.close();
    return keptRecords(source.id);
  };

  const [marked, keptAtClose] = await Promise.all([
    marks.markDone(source, record, folder, launches),
    closeDuringAttach(),
  ]);

  expect(Date.parse(marked.doneAt ?? "")).not.toBeNaN();
  expect(keptAtClose).toMatchObject([
    {
      doneAt: marked.doneAt,
      doneProblem:
        "Local done mark retained. Claude Code rename failed: The terminal attachment could not be opened.",
      session: record.session,
    },
  ]);
  expect(typed).not.toHaveBeenCalled();
  await expect
    .poll(() => claude.claudeAttaches())
    .toMatchObject([{ id: shortId, lines: [], endedBy: "SIGHUP" }]);
  expect(claude.claudeStopCalls()).toEqual([
    { argv: ["stop", shortId], cwd: folder.path },
  ]);
});
