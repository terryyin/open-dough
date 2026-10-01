// Actual HTTP/store launch decisions; the fixture only supplies native replies.
import { test, expect, stored } from "./support/codexLaunch.ts";
import { launch } from "./agentLaunchBoundary.ts";

const request = { source: "open-dough", host: "codex", workflow: "ad-hoc" };
test.use({ projectFolders: ["open-dough"] });

test("HTTP text preserves exact bytes once; completed blank launches permit another deliberate session", async ({
  dashboard,
  codexProtocol,
}) => {
  const native = codexProtocol;
  if (native === undefined) throw new Error("Missing native fixture.");
  const text = " \tInvestigate\n  the slow build.\r\n ";
  expect(
    JSON.parse(
      (await launch(dashboard, { ...request, instruction: text })).body,
    ),
  ).toMatchObject({ kind: "launched" });
  expect(stored(dashboard.home)[0]?.firstInput?.instruction).toBe(text);
  expect(native.calls.filter((call) => call.method === "turn/start")).toEqual([
    {
      method: "turn/start",
      params: { threadId: native.threadId, input: [{ type: "text", text }] },
    },
  ]);
  const textId = native.threadId;
  native.threadId = "first-blank";
  native.history = [];
  expect(JSON.parse((await launch(dashboard, request)).body)).toMatchObject({
    kind: "launched",
  });
  native.threadId = "second-blank";
  expect(JSON.parse((await launch(dashboard, request)).body)).toMatchObject({
    kind: "launched",
  });
  expect(
    stored(dashboard.home).map((record) => record.session.sessionId),
  ).toEqual([textId, "first-blank", "second-blank"]);
  expect(
    native.calls.filter((call) => call.method === "thread/start"),
  ).toHaveLength(3);
  expect(
    native.calls.filter((call) => call.method === "turn/start"),
  ).toHaveLength(1);
});
