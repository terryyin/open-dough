// The real attachment registry distinguishes two hosts with the same native ID.
import { EventEmitter } from "node:events";
import { mkdirSync, mkdtempSync, realpathSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, onTestFinished, test, vi } from "vitest";
import type { WebSocket } from "ws";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { AgentLaunches } from "../../server/agentLaunches.ts";
import { NativeDoneMarks } from "../../server/doneMarks.ts";
import { executionCheckout } from "../../server/executionCheckout.ts";
import { launchHost } from "../../server/launchHosts.ts";
import { bindRecord, keptRecords } from "../../server/launchRecordStore.ts";
import { mountProjectConfiguration } from "../../server/projectConfiguration.ts";
import { TerminalAttachments } from "../../server/terminalAttachments.ts";
import type { HostSession } from "../../src/agentLaunch.ts";
import {
  codexAttaches,
  codexEnded,
  codexLines,
} from "../../test-support/support/codexTerminal.ts";
import { installFakeClaude } from "../../test-support/support/fakeClaude.ts";
import {
  codexEndpoint,
  installFakeCodex,
} from "../../test-support/support/fakeCodex.ts";
import { processRunning } from "../../test-support/support/processGroup.ts";

class TerminalSocket extends EventEmitter {
  readonly OPEN = 1;
  readyState = this.OPEN;
  output = "";
  closeCode?: number;

  send(text: string, options?: { binary?: boolean }): void {
    if (!options?.binary) this.output += text;
  }

  close(code: number): void {
    if (this.readyState !== this.OPEN) return;
    this.readyState = 3;
    this.closeCode = code;
    this.emit("close");
  }
}

test("done ends every Codex attachment while an equal Claude ID keeps its attachment, mark and current work", async () => {
  const root = realpathSync(mkdtempSync(path.join(tmpdir(), "dough-done-cx-")));
  const native = await installFakeCodex(root, process.env["PATH"] ?? "", true);
  const claude = installFakeClaude(
    root,
    { binDir: native.binDir, path: native.env["PATH"] ?? "" },
    {},
  );
  for (const [key, value] of Object.entries({ ...native.env, ...claude.env }))
    vi.stubEnv(key, value);
  const unmount = mountProjectConfiguration("production");
  const source = makeMe.aPublishedSource.openDough.please();
  const folder = executionCheckout(source);
  mkdirSync(folder.path);
  const terminals = new TerminalAttachments();
  const marks = new NativeDoneMarks({
    terminals,
    hostFor: launchHost,
    reportingFolder: () => folder,
  });
  const launches = new AgentLaunches(marks);
  onTestFinished(async () => {
    await marks.close();
    terminals.close();
    launches.close();
    await launches.drain();
    await native.close();
    unmount();
    vi.unstubAllEnvs();
    rmSync(root, { recursive: true, force: true });
  });

  const sessionId = "588c4c19-0000-4000-8000-000000000007";
  native.threadId = sessionId;
  const claudeRecord = makeMe.aLaunchRecord
    .executing({
      source: source.id,
      identity: "SEED-867#claude-equal-id",
      title: "Claude working",
    })
    .inClaudeSession({ sessionId, shortId: sessionId.slice(0, 8) })
    .please();
  const codexRecord = makeMe.aLaunchRecord
    .refining({
      source: source.id,
      identity: "SEED-867#codex-equal-id",
      title: "Codex working",
    })
    .inCodexSession({
      sessionId,
      continuation: { endpoint: codexEndpoint(native), workspace: folder.path },
    })
    .please();
  await bindRecord(source.id, claudeRecord);
  await bindRecord(source.id, codexRecord);
  claude.controls.claudeListingBecomes([
    makeMe.aClaudeListingRow
      .background({
        sessionId,
        name: claudeRecord.session.name,
        cwd: folder.path,
        startedAt: Date.parse(claudeRecord.launchedAt),
      })
      .as("working")
      .please(),
  ]);
  native.cwd = folder.path;
  native.history = [{ id: "native-turn-id", items: [] }];
  native.observations.set(sessionId, {
    status: { type: "active", activeFlags: [] },
    turns: [{ id: "codex-turn", status: "inProgress" }],
  });

  const attach = (session: HostSession) => {
    const socket = new TerminalSocket();
    terminals.connect(socket as unknown as WebSocket, {
      session,
      sourceId: source.id,
      folder,
      markedDone: false,
    });
    return socket;
  };
  const claudeSocket = attach(claudeRecord.session);
  const codexSockets = [
    attach(codexRecord.session),
    attach(codexRecord.session),
  ];
  await expect.poll(() => claudeSocket.output).toContain("Claude Code");
  for (const socket of codexSockets)
    await expect
      .poll(() => socket.output)
      .toContain("original retained history");
  const before = claude.controls.claudeCalls();

  const marked = await marks.markDone(source, codexRecord, folder, launches);

  expect(Date.parse(marked.doneAt ?? "")).not.toBeNaN();
  for (const socket of codexSockets) expect(socket.closeCode).toBe(4000);
  expect(codexAttaches(native)).toHaveLength(2);
  for (const { pid } of codexAttaches(native)) {
    await expect.poll(() => codexEnded(native, pid)).toBe("SIGHUP");
    await expect.poll(() => processRunning(pid)).toBe(false);
    expect(codexLines(native, pid)).toEqual([]);
  }
  expect(claudeSocket.closeCode).toBeUndefined();
  expect(claude.controls.claudeCalls()).toEqual(before);
  const kept = await keptRecords(source.id);
  expect(kept).toHaveLength(2);
  expect(
    kept.find(({ session }) => session.host === "claude")?.doneAt,
  ).toBeUndefined();
  expect(kept.find(({ session }) => session.host === "codex")?.doneAt).toBe(
    marked.doneAt,
  );
  expect(claude.controls.claudeListing()[0]).toMatchObject({
    sessionId,
    state: "working",
  });
  claudeSocket.emit(
    "message",
    Buffer.from(JSON.stringify({ input: "Claude still answers\r" })),
    false,
  );
  await expect
    .poll(() => claudeSocket.output)
    .toContain("echo Claude still answers");
  expect(
    native.calls.filter(({ method }) => method === "turn/interrupt"),
  ).toEqual([
    {
      method: "turn/interrupt",
      params: { threadId: sessionId, turnId: "codex-turn" },
    },
  ]);
});
