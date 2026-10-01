// HTTP/store and optional WS/PTY exercise native rename and exact-turn interruption.
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { test, expect, stored } from "./support/codexLaunch.ts";
import {
  launch,
  refinementRequest,
  markDone,
  recordsOf,
} from "./agentLaunchBoundary.ts";
import { shows } from "./agentTerminalBoundary.ts";
import {
  codexAttaches,
  codexEnded,
  codexLines,
  openCodexTerminal,
} from "./support/codexTerminal.ts";
import { processRunning } from "./support/processGroup.ts";

test.use({ projectFolders: ["open-dough"] });
for (const status of ["active", "idle", "notLoaded"] as const) {
  for (const attached of [false, true]) {
    test(`${status} conversation marked done ${attached ? "with" : "without"} attachment preserves history and native identity`, async ({
      dashboard,
      codexProtocol: native,
    }) => {
      if (native === undefined) throw new Error("Missing native fixture");
      await launch(dashboard, { ...refinementRequest, host: "codex" });
      native.observations.set(native.threadId, {
        status: {
          type: status,
          ...(status === "active" ? { activeFlags: [] } : {}),
        },
        turns: [
          {
            id: "observed-turn",
            status: status === "active" ? "inProgress" : "completed",
          },
        ],
      });
      const record = stored(dashboard.home)[0];
      const terminal = attached
        ? await openCodexTerminal(dashboard, native.threadId)
        : undefined;
      if (terminal !== undefined)
        expect(await shows(terminal, "original retained history")).toBe(true);
      const response = await markDone(dashboard, {
        source: "open-dough",
        session: native.threadId,
        host: "codex",
      });
      expect(response.status).toBe(200);
      expect(JSON.parse(response.body)).toMatchObject({
        record: {
          doneAt: expect.any(String),
          session: { sessionId: native.threadId, name: record?.session.name },
          sessionState: {
            kind: "available",
            activity: status === "active" ? "interrupted" : "review",
          },
        },
      });
      expect(stored(dashboard.home)[0]?.doneAt).toBeDefined();
      expect(stored(dashboard.home)[0]?.doneProblem).toBeUndefined();
      expect(native.names.get(native.threadId)).toBe(
        `done-${record?.session.name ?? ""}`,
      );
      expect(
        native.calls.filter((call) => call.method === "thread/name/set"),
      ).toEqual([
        {
          method: "thread/name/set",
          params: {
            threadId: native.threadId,
            name: `done-${record?.session.name ?? ""}`,
          },
        },
      ]);
      expect(
        native.calls.filter((call) => call.method === "turn/interrupt"),
      ).toEqual(
        status === "active"
          ? [
              {
                method: "turn/interrupt",
                params: { threadId: native.threadId, turnId: "observed-turn" },
              },
            ]
          : [],
      );
      expect(native.observations.get(native.threadId)?.turns).toHaveLength(1);
      expect(native.history).toHaveLength(1);
      expect(
        native.calls.filter((call) =>
          ["thread/start", "turn/start"].includes(call.method),
        ),
      ).toHaveLength(2);
      if (terminal !== undefined) {
        expect(await terminal.closed).toBe(4000);
        const pid = codexAttaches(native)[0]?.pid ?? 0;
        await expect.poll(() => codexEnded(native, pid)).toBe("SIGHUP");
        await expect.poll(() => processRunning(pid)).toBe(false);
        expect(codexLines(native, pid)).toEqual([]);
      }
      expect(await recordsOf(dashboard, "open-dough")).toContainEqual(
        expect.objectContaining({ doneAt: stored(dashboard.home)[0]?.doneAt }),
      );
    });
  }
}

test("unrecorded and cross-origin done requests fail before native reads or writes", async ({
  dashboard,
  codexProtocol: native,
}) => {
  if (native === undefined) throw new Error("Missing native fixture");
  await launch(dashboard, { ...refinementRequest, host: "codex" });
  const before = [...native.calls];
  expect(
    (
      await markDone(dashboard, {
        source: "open-dough",
        session: "unknown",
        host: "codex",
      })
    ).status,
  ).toBe(404);
  expect(
    (
      await markDone(
        dashboard,
        { source: "open-dough", session: native.threadId, host: "codex" },
        { Origin: "http://evil.example" },
      )
    ).status,
  ).toBe(403);
  expect(native.calls).toEqual(before);
  expect(stored(dashboard.home)[0]?.doneAt).toBeUndefined();
});

test("missing saved endpoint retains local intent, closes attachments and reports unconfirmed operations", async ({
  dashboard,
  codexProtocol: native,
}) => {
  if (native === undefined) throw new Error("Missing native fixture");
  await launch(dashboard, { ...refinementRequest, host: "codex" });
  const terminal = await openCodexTerminal(dashboard, native.threadId);
  expect(await shows(terminal, "original retained history")).toBe(true);
  const file = path.join(
    dashboard.home,
    ".open-dough",
    "dashboard",
    "agent-launches.json",
  );
  const document = JSON.parse(readFileSync(file, "utf8")) as Record<
    string,
    unknown[]
  >;
  document["open-dough"] = stored(dashboard.home).map((record) => ({
    ...record,
    session: {
      host: "codex",
      sessionId: native.threadId,
      name: record.session.name,
    },
  }));
  writeFileSync(file, JSON.stringify(document));
  const before = [...native.calls];
  const response = await markDone(dashboard, {
    source: "open-dough",
    session: native.threadId,
    host: "codex",
  });
  expect(response.status).toBe(200);
  expect(JSON.parse(response.body)).toMatchObject({
    record: {
      doneAt: expect.any(String),
      doneProblem: expect.stringContaining("Saved native endpoint is missing"),
      sessionState: { kind: "unknown" },
    },
  });
  expect(stored(dashboard.home)[0]?.doneProblem).toContain(
    "Local done mark retained",
  );
  expect(native.calls).toEqual(before);
  expect(await terminal.closed).toBe(4000);
});
