// Reported Done renames through the real Claude Code host and private terminal
// attachment. The kept record already has its quiet completion receipt.
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
import * as records from "../../server/launchRecordStore.ts";
import type { LocalFolder } from "../../server/localFolder.ts";
import { mountProjectConfiguration } from "../../server/projectConfiguration.ts";
import {
  installFakeClaude,
  type FakeClaudeControls,
} from "../../test-support/support/fakeClaude.ts";

const source = makeMe.aPublishedSource.openDough.please();
const sessionId = "588c4c19-0000-4000-8000-000000000006";
const shortId = sessionId.slice(0, 8);
const pending = "Local done mark retained. Native done mark is pending.";
const stillWorking =
  "Local done mark retained. Claude Code rename failed: The session was still working when the wait ended.";

let claude: FakeClaudeControls;
let folder: LocalFolder;
let terminals: AgentTerminals;
let marks: NativeDoneMarks;
let launches: AgentLaunches;

beforeEach(() => {
  const machine = realpathSync(
    mkdtempSync(path.join(tmpdir(), "dough-quiet-rename-")),
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
    reportingFolder: () => folder,
  });
  launches = new AgentLaunches(marks);
  onTestFinished(async () => {
    launches.close();
    await marks.close();
    terminals.close();
    await launches.drain();
    vi.restoreAllMocks();
    unmount();
    vi.unstubAllEnvs();
    rmSync(machine, { recursive: true, force: true });
  });
});

async function keepReportedSession(appearance: "working" | "done-live") {
  // A fresh report that predates the developer's own Done time.
  const receivedAt = new Date(Date.now() - 60_000).toISOString();
  const record = makeMe.aLaunchRecord
    .executing({
      source: source.id,
      identity: "SEED-867#native-done",
      title: "Finish this session",
    })
    .inClaudeSession({ sessionId, shortId })
    .completedWith({ receivedAt })
    .please();
  const receipt = await bindRecord(source.id, record);
  if (receipt === undefined) throw new Error("Expected the kept completion.");
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
  const [kept] = await records.keptRecords(source.id);
  if (kept === undefined) throw new Error("Expected the kept session.");
  return { record: kept, receipt, doneName: `done-${record.session.name}` };
}

const keptDoneAt = async () =>
  (await records.keptRecords(source.id))[0]?.doneAt;
const listed = () =>
  claude.claudeListing().find((row) => row["sessionId"] === sessionId);

test("Mark as done takes over the running report wait, drops its write and renames once", async () => {
  const { record, receipt, doneName } = await keepReportedSession("working");
  expect(record).toMatchObject({
    doneAt: receipt.receivedAt,
    doneProblem: pending,
  });
  const writes = vi.spyOn(records, "setRecordDoneAt");
  const reporting = marks.reported(source.id, receipt);
  // The report has entered the busy rename wait before the developer acts.
  await expect
    .poll(() => claude.claudeCalls().some(({ argv }) => argv[0] === "agents"))
    .toBe(true);

  const marking = marks.markDone(source, record, folder, launches);
  await expect
    .poll(async () => (await keptDoneAt()) ?? receipt.receivedAt)
    .not.toBe(receipt.receivedAt);
  claude.claudeSessionBecomes(sessionId, "done-live");
  const [marked] = await Promise.all([marking, reporting]);

  expect(writes).toHaveBeenCalledTimes(2);
  expect(
    writes.mock.calls.some(([, , , options]) => options?.automatic === true),
  ).toBe(false);
  expect(Date.parse(marked.doneAt ?? "")).not.toBeNaN();
  const [kept] = await records.keptRecords(source.id);
  expect(kept).toMatchObject({ doneAt: marked.doneAt, completion: receipt });
  expect(kept?.doneProblem).toBeUndefined();
  await expect
    .poll(() => claude.claudeAttaches())
    .toMatchObject([
      { id: shortId, lines: [`/rename ${doneName}`], endedBy: "SIGHUP" },
    ]);
  expect(claude.claudeStopCalls()).toEqual([
    { argv: ["stop", shortId], cwd: folder.path },
  ]);
});

test("a report's exhausted wait keeps Done with its cause until a later Done renames the idle session", async () => {
  vi.stubEnv("DOUGH_DONE_RENAME_WAIT_MS", "2000");
  const { record, receipt, doneName } = await keepReportedSession("working");

  await marks.reported(source.id, receipt);

  expect(await records.keptRecords(source.id)).toMatchObject([
    {
      doneAt: receipt.receivedAt,
      doneProblem: stillWorking,
      completion: receipt,
    },
  ]);
  expect(claude.claudeAttaches()).toEqual([]);
  expect(claude.claudeStopCalls()).toEqual([]);

  vi.stubEnv("DOUGH_DONE_RENAME_WAIT_MS", "30000");
  claude.claudeSessionBecomes(sessionId, "done-live");
  const marked = await marks.markDone(source, record, folder, launches);

  const [kept] = await records.keptRecords(source.id);
  expect(kept).toMatchObject({ doneAt: marked.doneAt, completion: receipt });
  expect(kept?.doneProblem).toBeUndefined();
  expect(listed()?.["name"]).toBe(doneName);
  await expect
    .poll(() => claude.claudeAttaches())
    .toMatchObject([
      { id: shortId, lines: [`/rename ${doneName}`], endedBy: "SIGHUP" },
    ]);
});

test("closing during a reported rename hangs up the private attachment and leaves Done pending", async () => {
  const { receipt } = await keepReportedSession("done-live");
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

  const reporting = marks.reported(source.id, receipt);
  await expect.poll(() => sawBanner).toBe(true);
  await marks.close();
  await reporting;

  expect(await records.keptRecords(source.id)).toMatchObject([
    { doneAt: receipt.receivedAt, doneProblem: pending, completion: receipt },
  ]);
  expect(typed).not.toHaveBeenCalled();
  await expect
    .poll(() => claude.claudeAttaches())
    .toMatchObject([{ id: shortId, lines: [], endedBy: "SIGHUP" }]);
  expect(claude.claudeStopCalls()).toEqual([]);
});
