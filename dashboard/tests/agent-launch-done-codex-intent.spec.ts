// Local intent survives asynchronous native evidence and is cleared only by readiness.
import { shows } from "./agentTerminalBoundary.ts";
import { openCodexTerminal } from "./support/codexTerminal.ts";
import { test, expect, stored } from "./support/codexLaunch.ts";
import {
  launch,
  refinementRequest,
  markDone,
  deleteRecord,
  machineSessions,
} from "./agentLaunchBoundary.ts";

test.use({ projectFolders: ["open-dough"] });
test("a late failed interruption cannot restore local done intent after successful native readiness", async ({
  dashboard,
  codexProtocol,
}) => {
  const native = codexProtocol;
  if (native === undefined) throw new Error("Missing native fixture");
  await launch(dashboard, { ...refinementRequest, host: "codex" });
  native.observations.set(native.threadId, {
    status: { type: "active", activeFlags: [] },
    turns: [{ id: "slow-turn", status: "inProgress" }],
  });
  native.hold = true;
  native.interruptError = { code: -32000, message: "Late interrupt refusal." };
  const marking = markDone(dashboard, {
    source: "open-dough",
    session: native.threadId,
    host: "codex",
  });
  await expect
    .poll(
      () =>
        native.calls.filter((call) => call.method === "turn/interrupt").length,
    )
    .toBe(1);
  expect(stored(dashboard.home)[0]?.doneAt).toBeDefined();
  const terminal = await openCodexTerminal(dashboard, native.threadId);
  expect(await shows(terminal, "original retained history")).toBe(true);
  terminal.send({
    cursorVisible: true,
    screen: ["› original conversation", "configured native footer"],
  });
  await expect.poll(() => stored(dashboard.home)[0]?.doneAt).toBeUndefined();
  native.release();
  const response = await marking;
  expect(response.status).toBe(200);
  expect(
    (JSON.parse(response.body) as { record: unknown }).record,
  ).not.toHaveProperty("doneAt");
  expect(
    (JSON.parse(response.body) as { record: unknown }).record,
  ).not.toHaveProperty("doneProblem");
  expect(stored(dashboard.home)[0]?.doneAt).toBeUndefined();
  expect(stored(dashboard.home)[0]?.doneProblem).toBeUndefined();
  terminal.socket.close();
});

test("a native lifecycle callback retains done intent and a diagnostic before unknown record deletion", async ({
  dashboard,
  codexProtocol,
}) => {
  const native = codexProtocol;
  if (native === undefined) throw new Error("Missing native fixture");
  await launch(dashboard, { ...refinementRequest, host: "codex" });
  native.observations.set(native.threadId, {
    status: { type: "active", activeFlags: [] },
    turns: [{ id: "running-turn", status: "inProgress" }],
  });
  native.interruptError = { code: -32000, message: "Native stop refused." };
  const response = await markDone(dashboard, {
    source: "open-dough",
    session: native.threadId,
    host: "codex",
  });
  expect(response.status).toBe(200);
  const marked = stored(dashboard.home)[0];
  native.failConnection();
  await expect
    .poll(() => {
      const session = stored(dashboard.home)[0]?.session;
      return session?.host === "codex"
        ? session.continuation?.notice
        : undefined;
    })
    .toContain("native connection ended");
  expect(stored(dashboard.home)[0]?.doneAt).toBe(marked?.doneAt);
  expect(stored(dashboard.home)[0]?.doneProblem).toBe(marked?.doneProblem);
  native.observations.set(native.threadId, {
    status: { type: "idle" },
    turns: [],
    metadataError: { code: -32000, message: "Unreadable." },
  });
  expect(
    (
      await deleteRecord(dashboard, {
        source: "open-dough",
        session: native.threadId,
        host: "codex",
      })
    ).status,
  ).toBe(200);
  native.failConnection();
  await expect.poll(() => native.sockets.size).toBe(0);
  expect(stored(dashboard.home)).toEqual([]);
  expect(await machineSessions(dashboard)).toEqual([]);
});

test("a failed done operation returning after record deletion does not recreate the record", async ({
  dashboard,
  codexProtocol,
}) => {
  const native = codexProtocol;
  if (native === undefined) throw new Error("Missing native fixture");
  await launch(dashboard, { ...refinementRequest, host: "codex" });
  const observation = {
    status: { type: "active", activeFlags: [] },
    turns: [{ id: "deleted-turn", status: "inProgress" }],
    metadataError: undefined as unknown,
  };
  native.observations.set(native.threadId, observation);
  native.hold = true;
  native.interruptError = { code: -32000, message: "Late stop refused." };
  const marking = markDone(dashboard, {
    source: "open-dough",
    session: native.threadId,
    host: "codex",
  });
  await expect
    .poll(
      () =>
        native.calls.filter((call) => call.method === "turn/interrupt").length,
    )
    .toBe(1);
  observation.metadataError = {
    code: -32000,
    message: "Observation unreadable.",
  };
  expect(
    (
      await deleteRecord(dashboard, {
        source: "open-dough",
        session: native.threadId,
        host: "codex",
      })
    ).status,
  ).toBe(200);
  expect(stored(dashboard.home)).toEqual([]);
  native.release();
  expect((await marking).status).toBe(200);
  expect(stored(dashboard.home)).toEqual([]);
  native.failConnection();
  await expect.poll(() => native.sockets.size).toBe(0);
  expect(await machineSessions(dashboard)).toEqual([]);
});
