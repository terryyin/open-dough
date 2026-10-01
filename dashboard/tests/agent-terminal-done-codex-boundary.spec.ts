// Host-qualified identity owns all attachments, independently of opaque native IDs.
import { test, expect, stored } from "./support/codexLaunch.ts";
import { launch, refinementRequest, markDone } from "./agentLaunchBoundary.ts";
import { launched, openTerminal, shows } from "./agentTerminalBoundary.ts";
import {
  codexAttaches,
  codexLines,
  expectCodexHungUp,
  openCodexTerminal,
} from "./support/codexTerminal.ts";

test.use({ projectFolders: ["open-dough"] });
test("done ends every Codex attachment while an equal Claude ID keeps its attachment, mark and current work", async ({
  dashboard,
  codexProtocol,
}) => {
  const native = codexProtocol;
  if (native === undefined) throw new Error("Missing native fixture");
  const claude = await launched(dashboard);
  const claudeTerminal = await openTerminal(dashboard, claude);
  expect(await shows(claudeTerminal, "attached")).toBe(true);
  native.threadId = claude.sessionId;
  await launch(dashboard, { ...refinementRequest, host: "codex" });
  native.observations.set(native.threadId, {
    status: { type: "active", activeFlags: [] },
    turns: [{ id: "codex-turn", status: "inProgress" }],
  });
  const terminals = [
    await openCodexTerminal(dashboard, native.threadId),
    await openCodexTerminal(dashboard, native.threadId),
  ];
  for (const terminal of terminals)
    expect(await shows(terminal, "original retained history")).toBe(true);
  const before = dashboard.claudeCalls().length;
  const response = await markDone(dashboard, {
    source: "open-dough",
    session: native.threadId,
    host: "codex",
  });
  expect(response.status).toBe(200);
  for (const terminal of terminals) expect(await terminal.closed).toBe(4000);
  for (const attach of codexAttaches(native)) {
    await expectCodexHungUp(native, attach.pid);
    expect(codexLines(native, attach.pid)).toEqual([]);
  }
  expect(dashboard.claudeCalls()).toHaveLength(before);
  expect(
    stored(dashboard.home).find((record) => record.session.host === "claude")
      ?.doneAt,
  ).toBeUndefined();
  expect(
    stored(dashboard.home).find((record) => record.session.host === "codex")
      ?.doneAt,
  ).toBeDefined();
  expect(dashboard.claudeListing()[0]).toMatchObject({
    sessionId: native.threadId,
    state: "working",
  });
  claudeTerminal.send({ input: "Claude still answers\r" });
  expect(await shows(claudeTerminal, "echo Claude still answers")).toBe(true);
  expect(
    native.calls.filter((call) => call.method === "turn/interrupt"),
  ).toEqual([
    {
      method: "turn/interrupt",
      params: { threadId: native.threadId, turnId: "codex-turn" },
    },
  ]);
  claudeTerminal.socket.close();
});
