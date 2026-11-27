// Passive final report requests admit only a catalog project's recorded
// native identity, through the exact GET read, before any native read: Claude
// Code cannot read one, Cursor answers its retained report, and Codex reads
// its native final answer. The production boundary answers a request stream
// over a private machine home, with no Dashboard server.
import { mkdtempSync, rmSync } from "node:fs";
import {
  IncomingMessage,
  ServerResponse,
  type IncomingHttpHeaders,
} from "node:http";
import { Socket } from "node:net";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, onTestFinished, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { AgentLaunches } from "../../server/agentLaunches.ts";
import { NativeDoneMarks } from "../../server/doneMarks.ts";
import { answer } from "../../server/launchBoundaryAnswer.ts";
import { bindRecord } from "../../server/launchRecordBinding.ts";
import { machineFolder } from "../../server/localFolder.ts";
import { MachineSessionObservation } from "../../server/machineSessionObservation.ts";
import { mountProjectConfiguration } from "../../server/projectConfiguration.ts";
import { ReviewInitialSync } from "../../server/reviewInitialSync.ts";
import {
  codexEndpoint,
  installFakeCodex,
} from "../../test-support/support/fakeCodex.ts";
import {
  notRefinedIdentity as identity,
  notRefinedStory as title,
} from "../../test-support/launchJourney.ts";
import {
  keepFinalReport,
  keepTrackedClosureEvidence,
  plantTrackedClosureRepository,
  report,
} from "../../test-support/support/retainedReport.ts";

const host = "127.0.0.1:4173";
const fromDashboard: IncomingHttpHeaders = { host, origin: `http://${host}` };
const story = { identity, title };
// Cursor sessions by what their kept record retains.
const cursorSessions = {
  reported: "22222222-2222-4222-8222-222222222222",
  quiet: "33333333-3333-4333-8333-333333333333",
  absent: "44444444-4444-4444-8444-444444444444",
  closed: "55555555-5555-4555-8555-555555555555",
};
const attention = "Reminder: check the migration before landing.";

// The production boundary over a private machine home with the fake Codex
// app-server on its path; `final` sends one final report request.
async function finalReportBoundary() {
  const machine = mkdtempSync(path.join(tmpdir(), "dough-final-report-"));
  const native = await installFakeCodex(
    machine,
    process.env["PATH"] ?? "",
    true,
  );
  for (const [key, value] of Object.entries(native.env)) vi.stubEnv(key, value);
  vi.stubEnv("HOME", path.join(machine, "home"));
  onTestFinished(mountProjectConfiguration("production"));
  const doneMarks = new NativeDoneMarks({
    terminals: { withAttachment: vi.fn(), endAttachments: vi.fn() },
    hostFor: () => undefined,
    reportingFolder: machineFolder,
  });
  const launches = new AgentLaunches(doneMarks);
  const sessions = new MachineSessionObservation(
    () => {
      throw new Error("Unexpected machine session read.");
    },
    () => Promise.resolve([]),
    { waitMs: 1, reuseMs: 0 },
  );
  const initialSync = new ReviewInitialSync();
  onTestFinished(async () => {
    launches.close();
    await launches.drain();
    await doneMarks.close();
    await native.close();
    vi.unstubAllEnvs();
    rmSync(machine, { recursive: true, force: true });
  });

  async function final(query: Record<string, string>, method = "GET") {
    const route = `/__agent-launch/result?${new URLSearchParams(query)}`;
    const socket = new Socket();
    Object.defineProperty(socket, "remoteAddress", { value: "127.0.0.1" });
    const request = new IncomingMessage(socket);
    request.method = method;
    request.url = route;
    request.headers = fromDashboard;
    request.push(null);
    try {
      return await answer(
        request,
        new URL(route, fromDashboard.origin),
        new ServerResponse(request),
        launches,
        doneMarks,
        sessions,
        { nudge: vi.fn() },
        initialSync,
      );
    } finally {
      socket.destroy();
    }
  }
  return { machine, native, final };
}

test("final report admission refuses unknown projects, unrecorded or wrong-host sessions, hosts without a report reader, arbitrary endpoints and methods before native read", async () => {
  const { machine, native, final } = await finalReportBoundary();
  // Its retired workspace is gone; Codex keeps the conversation's final answer.
  const workspace = path.join(machine, "private-workspace");
  keepFinalReport(native, workspace, report);
  native.observations.set(native.threadId, {
    status: { type: "notLoaded" },
    turns: [{ id: "landing-turn", status: "completed" }],
  });
  const cursorCompletion = makeMe.aCompletionReport
    .saying(attention)
    .withReceipt("aaaaaaaa-0000-4000-8000-000000000002")
    .please();
  const cursorRecord = (sessionId: string) =>
    makeMe.aLaunchRecord
      .refining(story)
      .inCursorSession({ sessionId, continuation: { workspace } });
  const closureRepository = path.join(machine, "closure-repository");
  const { revision } = plantTrackedClosureRepository(closureRepository);
  for (const record of [
    makeMe.aLaunchRecord
      .refining(story)
      .inCodexSession({
        sessionId: native.threadId,
        continuation: { workspace, endpoint: codexEndpoint(native) },
      })
      .please(),
    makeMe.aLaunchRecord
      .refining(story)
      .inClaudeSession({ sessionId: "claude-reported", shortId: "claude-r" })
      .completedWith({
        message: attention,
        receipt: "aaaaaaaa-0000-4000-8000-000000000001",
      })
      .please(),
    cursorRecord(cursorSessions.reported)
      .completedWith(cursorCompletion)
      .please(),
    // Its quiet report closed it just now.
    cursorRecord(cursorSessions.quiet)
      .completedWith({ message: "", receivedAt: new Date().toISOString() })
      .please(),
    cursorRecord(cursorSessions.absent).please(),
    keepTrackedClosureEvidence(
      cursorRecord(cursorSessions.closed).please(),
      closureRepository,
      revision,
      workspace,
    ),
  ])
    await bindRecord("open-dough", record);

  const codex = {
    source: "open-dough",
    host: "codex",
    session: native.threadId,
  };
  const nativeReads = () =>
    native.calls.filter(({ method }) => method === "thread/read").length;
  for (const [query, status, method] of [
    [{ ...codex, source: "other" }, 404],
    [{ ...codex, host: "claude" }, 404],
    [{ ...codex, session: "unrecorded" }, 404],
    [{ ...codex, endpoint: "unix:///arbitrary" }, 400],
    [codex, 405, "POST"],
  ] as const) {
    const refused = await final(query, method);
    expect(refused.status).toBe(status);
    expect(refused).toHaveProperty("body.error", expect.any(String));
  }
  const claude = await final({
    ...codex,
    host: "claude",
    session: "claude-reported",
  });
  expect(claude).toEqual({
    status: 400,
    body: { error: "This host cannot read a final report." },
  });
  // Recorded Cursor sessions answer their retained report, with no native read.
  const cursor = (session: string) =>
    final({ ...codex, host: "cursor", session });
  const nativeLimit =
    "Cursor cannot read a native final report here. The saved conversation is unchanged.";
  const noMessage = `No final dashboard message was saved. ${nativeLimit}`;
  expect(await cursor(cursorSessions.reported)).toEqual({
    status: 200,
    body: {
      kind: "available",
      receipt: cursorCompletion.receipt,
      text: attention,
    },
  });
  expect(await cursor(cursorSessions.quiet)).toEqual({
    status: 200,
    body: {
      kind: "unavailable",
      explanation: `Quiet completion was recorded with no attention message. ${nativeLimit}`,
    },
  });
  expect(await cursor(cursorSessions.absent)).toEqual({
    status: 200,
    body: { kind: "unavailable", explanation: noMessage },
  });
  expect(await cursor(cursorSessions.closed)).toEqual({
    status: 200,
    body: {
      kind: "unavailable",
      explanation: noMessage,
      productClosureEvidence: true,
    },
  });
  expect(nativeReads()).toBe(0);
  expect(await final(codex)).toEqual({
    status: 200,
    body: { kind: "available", turnId: "landing-turn", text: report },
  });
});
