// Store/HTTP recovery of a blank ad hoc Codex start owns intent and
// decisions; the fixture only answers native RPC. Other read failures and a
// mismatched workspace or conversation keep blank recovery uncertain, and
// only the known refusal establishes persistence. Lost acknowledgments across
// a restart, on the page:
// ../../../e2e/launches/agent-launch-ad-hoc-codex-recovery.spec.ts.
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { test, expect, stored } from "../../tests/support/codexLaunch.ts";
import { launch } from "../../tests/agentLaunchBoundary.ts";

const request = makeMe.aLaunchRequest.adHoc({ host: "codex" }).please();
test.use({ projectFolders: ["open-dough"] });

test("other read failures and mismatched context keep blank recovery uncertain; only the known refusal establishes persistence", async ({
  dashboard,
  codexProtocol,
}) => {
  const native = codexProtocol;
  if (native === undefined) throw new Error("Missing native fixture.");
  for (const error of [
    { code: -32600, message: "list_turns is not supported yet" },
    { code: -32601, message: "Another unsupported operation" },
    { code: -32000, message: "Native persistence failed" },
    { nonsense: "Unreadable native error" },
  ]) {
    native.blankHistoryError = error;
    expect(JSON.parse((await launch(dashboard, request)).body)).toMatchObject({
      kind: "uncertain",
    });
    expect(stored(dashboard.home)[0]?.firstInput).toEqual({
      state: "awaiting",
      intent: "blank",
    });
  }
  const saved = stored(dashboard.home)[0];
  if (saved === undefined) throw new Error("Missing saved identity.");
  native.blankHistoryError = undefined;
  native.failRead = true;
  expect(JSON.parse((await launch(dashboard, request)).body)).toMatchObject({
    kind: "uncertain",
  });
  native.failRead = false;
  native.readError = true;
  expect(JSON.parse((await launch(dashboard, request)).body)).toMatchObject({
    kind: "uncertain",
  });
  native.readError = false;
  const workspace = native.cwd;
  native.cwd = `${workspace}-wrong`;
  expect(JSON.parse((await launch(dashboard, request)).body)).toMatchObject({
    kind: "uncertain",
  });
  native.cwd = workspace;
  native.threadId = "different-thread";
  expect(JSON.parse((await launch(dashboard, request)).body)).toMatchObject({
    kind: "uncertain",
  });
  native.threadId = saved.session.sessionId;
  native.blankHistoryError = {
    code: -32601,
    message: "list_turns is not supported yet",
  };
  native.cwd = `${workspace}-wrong`;
  expect(JSON.parse((await launch(dashboard, request)).body)).toMatchObject({
    kind: "uncertain",
  });
  native.cwd = workspace;
  expect(stored(dashboard.home)[0]).toEqual(saved);
  expect(JSON.parse((await launch(dashboard, request)).body)).toMatchObject({
    kind: "launched",
  });
  expect(stored(dashboard.home)[0]?.firstInput).toEqual({
    state: "not-requested",
    intent: "blank",
  });
  expect(
    native.calls.filter((call) => call.method === "thread/start"),
  ).toHaveLength(1);
  expect(native.calls.filter((call) => call.method === "turn/start")).toEqual(
    [],
  );
  expect(
    native.calls.filter((call) => call.method === "thread/resume"),
  ).toEqual([]);
  expect(native.history).toEqual([]);
  await expect.poll(() => native.sockets.size).toBe(0);
});
