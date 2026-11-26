// Native connection ownership survives caller detachment and handles racing endings.
import { IncomingMessage, ServerResponse } from "node:http";
import { Socket } from "node:net";
import path from "node:path";
import { afterEach, beforeAll, beforeEach, expect, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { queuedReadyRepository } from "../../../Distribution/tests/support/queued-repository.mjs";
import { AgentLaunches } from "../../server/agentLaunches.ts";
import { NativeDoneMarks } from "../../server/doneMarks.ts";
import { answer } from "../../server/launchBoundaryAnswer.ts";
import { keptRecords } from "../../server/launchRecordStore.ts";
import { machineFolder } from "../../server/localFolder.ts";
import { MachineSessionObservation } from "../../server/machineSessionObservation.ts";
import { mountProjectConfiguration } from "../../server/projectConfiguration.ts";
import { ReviewInitialSync } from "../../server/reviewInitialSync.ts";
import { agentAcceptEndpoint } from "../../src/agentLaunch.ts";
import { agentDeleteEndpoint } from "../../src/deleteRecord.ts";
import {
  installFakeCodex,
  type FakeCodex,
} from "../../test-support/support/fakeCodex.ts";
import {
  startOrigin,
  type StartOrigin,
} from "../../test-support/support/startOrigin.ts";
import { keepStartedOrigin } from "../../test-support/support/startOriginPreparation.ts";

const request = makeMe.aLaunchRequest
  .adHoc({ host: "codex" })
  .withInstruction("Preserve this exact intent.")
  .please();
const repository = queuedReadyRepository().please();
const source = makeMe.aPublishedSource.openDough.please();
const reportingOrigin = "http://127.0.0.1:4173";

let project: StartOrigin;
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
  project = await startOrigin(repository, { host: "codex" });
  native = await installFakeCodex(
    project.machine,
    process.env["PATH"] ?? "",
    true,
  );
  for (const [key, value] of Object.entries(native.env)) vi.stubEnv(key, value);
  vi.stubEnv("HOME", path.join(project.machine, "home"));
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
  native.release();
  await launches.drain();
  await marks.close();
  await native.close();
  unmount();
  vi.unstubAllEnvs();
  project.cleanup();
});

async function post(endpoint: string, body: object) {
  const socket = new Socket();
  Object.defineProperty(socket, "remoteAddress", { value: "127.0.0.1" });
  const message = new IncomingMessage(socket);
  message.method = "POST";
  message.headers = {
    origin: reportingOrigin,
    host: new URL(reportingOrigin).host,
    "content-type": "application/json",
  };
  message.push(Buffer.from(JSON.stringify(body)));
  message.push(null);
  const response = new ServerResponse(message);
  const result = await answer(
    message,
    new URL(endpoint, reportingOrigin),
    response,
    launches,
    marks,
    new MachineSessionObservation(vi.fn(), vi.fn(), { waitMs: 1, reuseMs: 0 }),
    { nudge: vi.fn() },
    new ReviewInitialSync(),
  );
  response.emit("close");
  return result;
}

const records = () => keptRecords(source.id);
const turns = () =>
  native.calls.filter(({ method }) => method === "turn/start");
async function recoveryNotice() {
  const session = (await records())[0]?.session;
  return session?.host === "codex" ? session.continuation?.notice : undefined;
}

async function confirmedLaunch() {
  const accepted = await launches.accept(source, request, reportingOrigin);
  if (accepted.kind !== "accepted")
    throw new Error("Expected an accepted launch.");
  await launches.drain();
  const { attempt } = await launches.changed(accepted.attempt.id, 0);
  expect(attempt?.outcome).toMatchObject({ kind: "launched" });
}

test("an active detached caller still records acknowledgment and a later connection failure keeps recovery", async () => {
  const input = new Promise<void>((resolve) => {
    native.beforeInput = resolve;
  });
  native.hold = true;
  // The typed acceptance returns and the response closes while its owner keeps running.
  expect(await post(agentAcceptEndpoint, request)).toMatchObject({
    status: 200,
    body: { kind: "accepted", attempt: { request } },
  });
  await input;
  expect(turns()).toHaveLength(1);
  expect((await records())[0]?.firstInput?.state).toBe("uncertain");

  native.release();
  await expect
    .poll(async () => (await records())[0]?.firstInput?.state)
    .toBe("confirmed");
  native.failConnection();

  await expect.poll(recoveryNotice).toContain("native connection ended");
  await expect.poll(() => native.sockets.size).toBe(0);
  const session = (await records())[0]?.session;
  if (session?.host !== "codex")
    throw new Error("Missing saved Codex session.");
  expect(session.continuation?.args.at(-1)).toBe(native.threadId);
  expect(turns()).toHaveLength(1);
});

test("a completion racing acknowledgment keeps the confirmed input and closes the connection", async () => {
  native.afterAcceptance = "complete";

  await confirmedLaunch();

  await expect.poll(() => native.sockets.size).toBe(0);
  expect((await records())[0]?.firstInput?.state).toBe("confirmed");
});

test("a disconnect racing acknowledgment keeps the confirmed input and recovery", async () => {
  native.afterAcceptance = "disconnect";

  await confirmedLaunch();

  await expect.poll(() => native.sockets.size).toBe(0);
  expect((await records())[0]?.firstInput?.state).toBe("confirmed");
  await expect.poll(recoveryNotice).toContain("native connection ended");
});

test("deleting an unreadable Codex record remains deleted after a later native connection failure", async () => {
  await confirmedLaunch();
  expect(native.sockets.size).toBe(1);
  native.readError = true;

  expect(
    await post(agentDeleteEndpoint, {
      source: source.id,
      session: native.threadId,
      host: "codex",
    }),
  ).toEqual({ status: 200, body: { kind: "deleted" } });
  expect(await records()).toEqual([]);

  native.failConnection();

  await expect.poll(() => native.sockets.size).toBe(0);
  expect(await records()).toEqual([]);
  expect((await launches.machineObservation()).records).toEqual([]);
});
