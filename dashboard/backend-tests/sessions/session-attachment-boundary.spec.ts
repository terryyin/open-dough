// Real local upload admission and the files retained by the machine server.
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import path from "node:path";
import { beforeEach, expect, onTestFinished, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { respondToLaunch } from "../../server/agentLaunchResponse.ts";
import { AgentLaunches } from "../../server/agentLaunches.ts";
import { NativeDoneMarks } from "../../server/doneMarks.ts";
import { executionCheckout } from "../../server/executionCheckout.ts";
import { answer } from "../../server/launchBoundaryAnswer.ts";
import { launchHost } from "../../server/launchHosts.ts";
import { bindRecord } from "../../server/launchRecordStore.ts";
import { machineFolder } from "../../server/localFolder.ts";
import { machineDashboardPath } from "../../server/machineHome.ts";
import { MachineSessionObservation } from "../../server/machineSessionObservation.ts";
import { mountProjectConfiguration } from "../../server/projectConfiguration.ts";
import { ReviewInitialSync } from "../../server/reviewInitialSync.ts";
import type { LaunchRecord, SessionState } from "../../src/launchRecord.ts";
import { sessionAttachmentEndpoint } from "../../src/agentTerminal.ts";
import type { SessionReference } from "../../src/sessionReference.ts";
import {
  launchAttachmentEmpty,
  launchAttachmentNameHeader,
  launchAttachmentTooLarge,
  launchAttachmentUnsupportedType,
} from "../../src/launchAttachments.ts";
import {
  installFakeClaude,
  type FakeClaudeControls,
} from "../../test-support/support/fakeClaude.ts";
import { installFakeCodex } from "../../test-support/support/fakeCodex.ts";
import {
  listedMachineDirs,
  pngA,
  pngB,
} from "../../test-support/support/launchAttachmentFixtures.ts";
import { rawRequest } from "../../test-support/support/rawHttp.ts";

const source = makeMe.aPublishedSource.openDough.please();

let dashboard: string;
let claude: FakeClaudeControls;
let launches: AgentLaunches;
// What the host's observation answers for each kept session.
let observed: SessionState;

beforeEach(async () => {
  const machine = realpathSync(
    mkdtempSync(path.join(tmpdir(), "dough-attachments-")),
  );
  const fixture = installFakeClaude(
    machine,
    { binDir: machine, path: process.env.PATH ?? "" },
    {},
  );
  // A Codex that serves nothing, so no installed runtime is reached.
  const codex = await installFakeCodex(
    machine,
    fixture.env["PATH"] ?? "",
    false,
  );
  for (const [key, value] of Object.entries({ ...fixture.env, ...codex.env }))
    vi.stubEnv(key, value);
  const unmount = mountProjectConfiguration("production");
  claude = fixture.controls;
  const doneMarks = new NativeDoneMarks({
    terminals: { withAttachment: vi.fn(), endAttachments: vi.fn() },
    hostFor: launchHost,
    reportingFolder: machineFolder,
  });
  launches = new AgentLaunches(doneMarks);
  observed = {
    kind: "available",
    availability: "loaded",
    activity: "awaiting-instruction",
  };
  vi.spyOn(launches, "stateOf").mockImplementation((...[, record]) =>
    Promise.resolve({ ...record, sessionState: observed }),
  );
  const sessions = new MachineSessionObservation(
    () => Promise.reject(new Error("Unexpected machine session read.")),
    () => Promise.resolve([]),
    { waitMs: 1, reuseMs: 0 },
  );
  // The launch boundary's own answer and response on a loopback listener.
  const server = createServer((req, res) => {
    const url = new URL(req.url ?? "", "http://placeholder");
    void answer(
      req,
      url,
      res,
      launches,
      doneMarks,
      sessions,
      { nudge: vi.fn() },
      new ReviewInitialSync(),
    ).then((outcome) => respondToLaunch(req, res, outcome));
  });
  await new Promise<void>((resolve) => {
    server.listen(0, "127.0.0.1", resolve);
  });
  dashboard = `http://127.0.0.1:${String((server.address() as AddressInfo).port)}`;
  mkdirSync(executionCheckout(source).path, { recursive: true });
  onTestFinished(async () => {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
    launches.close();
    await doneMarks.close();
    await launches.drain();
    unmount();
    await codex.close();
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    rmSync(machine, { recursive: true, force: true });
  });
});

let serial = 0;

// A kept Claude Code session this dashboard recorded for the project.
async function keptClaudeSession(): Promise<string> {
  const sessionId = `588c4c19-0000-4000-8000-${String(++serial).padStart(12, "0")}`;
  await bindRecord(
    source.id,
    makeMe.aLaunchRecord
      .executing({
        identity: `SEED-874#image-${String(serial)}`,
        title: "Paste",
      })
      .inClaudeSession({ sessionId })
      .please(),
  );
  return sessionId;
}

// A kept Codex conversation under its native thread ID.
async function keptCodexSession(sessionId: string): Promise<LaunchRecord> {
  const record = makeMe.aLaunchRecord
    .executing({ identity: "SEED-874#codex-image", title: "Paste" })
    .inCodexSession({ sessionId })
    .please();
  await bindRecord(source.id, record);
  return record;
}

const attachmentsRoot = () => machineDashboardPath("session-attachments");

function attachmentUrl(
  session: string,
  host: SessionReference["host"] = "claude",
): string {
  const url = new URL(sessionAttachmentEndpoint, dashboard);
  url.search = new URLSearchParams({
    source: "open-dough",
    host,
    session,
  }).toString();
  return url.href;
}

test("session upload enforces origin, known session, image type and bounded body before writing", async () => {
  const url = attachmentUrl(await keptClaudeSession());
  const requests = [
    { url, method: "GET", status: 405, error: "Only POST is accepted." },
    {
      url,
      origin: "https://other.example",
      method: "GET",
      status: 403,
      error: "This endpoint refuses cross-origin requests.",
    },
    {
      url,
      origin: "https://other.example",
      status: 403,
      error: "This endpoint refuses cross-origin requests.",
    },
    {
      url: attachmentUrl("missing"),
      status: 404,
      error: "This dashboard launched no such session for this project.",
    },
    {
      url,
      type: "application/pdf",
      body: "not an image",
      status: 415,
      error: launchAttachmentUnsupportedType,
    },
    { url, status: 400, error: launchAttachmentEmpty },
    {
      url,
      body: "x".repeat(12 * 1024 * 1024),
      status: 413,
      error: launchAttachmentTooLarge,
    },
  ];
  for (const { url, origin, method, type, body, status, error } of requests) {
    const response = await rawRequest({
      url,
      method: method ?? "POST",
      headers: {
        Origin: origin ?? dashboard,
        "Content-Type": type ?? "image/png",
        "Content-Length": String(body?.length ?? 0),
      },
      ...(body === undefined ? {} : { body }),
    });
    expect(response.status).toBe(status);
    expect(JSON.parse(response.body)).toEqual({ error });
    expect(response.headers["cache-control"]).toBe("no-store");
    expect(existsSync(attachmentsRoot())).toBe(false);
  }
  expect(claude.claudeAttaches()).toEqual([]);
});

test("an unavailable native session cannot store a pasted image", async () => {
  const { session } = await keptCodexSession("native-thread-id");
  observed = { kind: "unavailable" };
  const response = await rawRequest({
    url: attachmentUrl(session.sessionId, "codex"),
    method: "POST",
    headers: { Origin: dashboard, "Content-Type": "image/png" },
    body: "image bytes",
  });
  expect(response.status).toBe(410);
  expect(JSON.parse(response.body)).toEqual({
    error: "This conversation is no longer available in Codex.",
  });
  expect(existsSync(attachmentsRoot())).toBe(false);
});

test("successful requests keep numbered images and a storage refusal keeps the existing file", async () => {
  const sessionId = await keptClaudeSession();
  const upload = (image: Buffer, name: string) =>
    fetch(attachmentUrl(sessionId), {
      method: "POST",
      headers: {
        Origin: dashboard,
        "Content-Type": "image/png",
        [launchAttachmentNameHeader]: name,
      },
      body: new Uint8Array(image),
    });
  const directory = path.join(attachmentsRoot(), "claude", sessionId);
  for (const [index, image] of [pngA, pngB].entries()) {
    const response = await upload(image, "../pasted.png");
    expect(response.status).toBe(200);
    const stored = path.join(directory, `${String(index + 1)}-pasted.png`);
    expect(await response.json()).toEqual({ path: stored });
    expect(readFileSync(stored)).toEqual(image);
  }
  const concurrent = await Promise.all([
    upload(pngA, "front.png"),
    upload(pngB, "back.png"),
  ]);
  for (const [index, response] of concurrent.entries()) {
    expect(response.status).toBe(200);
    const stored = (await response.json()) as { path: string };
    expect(readFileSync(stored.path)).toEqual(index === 0 ? pngA : pngB);
  }
  const files = listedMachineDirs(directory);
  expect(files.map((name) => name.split("-")[0])).toEqual(["1", "2", "3", "4"]);

  const blocked = await keptClaudeSession();
  const blockingRecord = path.join(attachmentsRoot(), "claude", blocked);
  writeFileSync(blockingRecord, "keep this existing file");
  const refused = await fetch(attachmentUrl(blocked), {
    method: "POST",
    headers: { Origin: dashboard, "Content-Type": "image/png" },
    body: new Uint8Array(pngA),
  });
  expect(refused.status).toBe(503);
  expect(await refused.json()).toEqual({
    error: "The image could not be stored.",
  });
  expect(readFileSync(blockingRecord, "utf8")).toBe("keep this existing file");
  expect(readFileSync(path.join(directory, "1-pasted.png"))).toEqual(pngA);
});

test("an opaque host session ID cannot select a storage path component", async () => {
  const { session } = await keptCodexSession("../another/session");
  const response = await fetch(attachmentUrl(session.sessionId, "codex"), {
    method: "POST",
    headers: { Origin: dashboard, "Content-Type": "image/png" },
    body: new Uint8Array(pngA),
  });
  expect(response.status).toBe(200);
  const key = createHash("sha256").update(session.sessionId).digest("hex");
  const stored = path.join(
    attachmentsRoot(),
    "codex",
    `~${key}`,
    "1-image.png",
  );
  expect(await response.json()).toEqual({ path: stored });
  expect(readFileSync(stored)).toEqual(pngA);
});
