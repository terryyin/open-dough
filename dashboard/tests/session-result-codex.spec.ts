// The host's passive result contract uses the shape observed from Codex 0.159.3
// after workspace retirement. This vendor substitute is not native proof.
import { mkdtempSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { launchHost } from "../server/launchHosts.ts";
import type { HostSession } from "../src/agentLaunch.ts";
import { installFakeCodex, type FakeCodex } from "./support/fakeCodex.ts";

const finalReport = {
  type: "agentMessage",
  id: "final-report",
  text: "Landed on main at `a5df85d90a`.\n\nNo product code changed.",
  phase: "final_answer",
  memoryCitation: null,
  delivery: null,
  questions: null,
};

async function withNative(
  observe: (native: FakeCodex, session: HostSession) => Promise<void>,
) {
  const root = mkdtempSync(path.join(tmpdir(), "dough-codex-result-"));
  const native = await installFakeCodex(root, process.env["PATH"] ?? "", true);
  const session: HostSession = {
    host: "codex",
    sessionId: native.threadId,
    name: "Retained example",
    continuation: {
      workspace: path.join(root, "absent-workspace"),
      endpoint: `unix://${path.join(root, "codex.sock")}`,
      args: [],
    },
  };
  native.cwd = session.continuation?.workspace ?? "";
  native.history = [
    {
      id: "latest-turn",
      status: "completed",
      items: [
        { type: "reasoning", summary: [], content: [] },
        { type: "agentMessage", text: "Working", phase: "commentary" },
        finalReport,
      ],
    },
  ];
  try {
    await observe(native, session);
    expect(existsSync(session.continuation?.workspace ?? "")).toBe(false);
    expect(
      native.calls.every((call) =>
        ["initialize", "initialized", "thread/read"].includes(call.method),
      ),
    ).toBe(true);
    const reads = native.calls.filter((call) => call.method === "thread/read");
    expect(
      reads.every(
        (call) =>
          call.params["threadId"] === session.sessionId &&
          call.params["includeTurns"] === true,
      ),
    ).toBe(true);
    await expect.poll(() => native.sockets.size).toBe(0);
  } finally {
    await native.close();
    rmSync(root, { recursive: true, force: true });
  }
}

const read = (session: HostSession, signal = AbortSignal.timeout(10_000)) => {
  const boundary = launchHost("codex");
  if (boundary?.readResult === undefined)
    throw new Error("Missing Codex result operation");
  return boundary.readResult(session, signal);
};

test("reads the retained completed final report without native control or workspace creation", async () => {
  await withNative(async (native, session) => {
    expect(await read(session)).toEqual({
      kind: "available",
      turnId: "latest-turn",
      text: finalReport.text,
    });
    expect(native.calls.map((call) => call.method)).toEqual([
      "initialize",
      "initialized",
      "thread/read",
    ]);
    expect(typeof launchHost("claude")?.readResult).toBe("undefined");
  });
});

test("rejects wrong native identity or workspace without changing the recorded session", async () => {
  await withNative(async (fixture, session) => {
    const native = fixture;
    const original = structuredClone(session);
    native.threadId = "another-conversation";
    expect(await read(session)).toMatchObject({ kind: "unavailable" });
    native.threadId = session.sessionId;
    native.cwd = "another-workspace";
    expect(await read(session)).toMatchObject({ kind: "unavailable" });
    expect(session).toEqual(original);
  });
});

test("refusal, lost connection, or caller cancellation leaves result availability unconfirmed", async () => {
  await withNative(async (fixture, session) => {
    const native = fixture;
    native.readError = true;
    expect(await read(session)).toMatchObject({ kind: "unavailable" });
    native.readError = false;
    native.failRead = true;
    expect(await read(session)).toMatchObject({ kind: "unavailable" });
    native.failRead = false;
    expect(await read(session, AbortSignal.abort())).toMatchObject({
      kind: "unavailable",
    });
    expect(await read(session)).toMatchObject({
      kind: "available",
      text: finalReport.text,
    });
  });
});

test("does not substitute older reports for missing, unrecognized, or unfinished latest results", async () => {
  await withNative(async (fixture, session) => {
    const native = fixture;
    const completed = native.history[0];
    if (completed === undefined) throw new Error("Missing history fixture");
    for (const items of [
      [],
      [{ ...finalReport, phase: "commentary" }],
      [{ ...finalReport, phase: "futurePhase" }],
      [{ ...finalReport, text: "  " }],
      [finalReport, { ...finalReport, text: 42 }],
    ]) {
      native.history = [
        completed,
        { id: "newer-turn", status: "completed", items },
      ];
      expect(await read(session)).toMatchObject({ kind: "unavailable" });
    }
    for (const status of ["inProgress", "interrupted", "futureStatus"]) {
      native.history = [
        completed,
        { id: "newer-turn", status, items: [finalReport] },
      ];
      expect(await read(session)).toMatchObject({ kind: "unavailable" });
    }
  });
});
