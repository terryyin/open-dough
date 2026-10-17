// Actual HTTP/store launch decisions; the fixture only supplies native replies.
import { test, expect, stored } from "../support/codexLaunch.ts";
import { test as startTest } from "../support/codexStart.ts";
import { launch } from "../agentLaunchBoundary.ts";
import { dirty, status } from "../support/defaultCheckoutChanges.ts";
import { expectReportingBlock } from "../support/reportingInputAssertions.ts";
import {
  defaultMainSession,
  sessionBlock,
} from "../support/startSessionLanding.ts";

// No page: the local boundaries alone answer these requests.
test.use({ serverMode: "boundary", projectFolders: ["open-dough"] });

const request = { source: "open-dough", host: "codex", workflow: "ad-hoc" };

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

// With the real installed start (../support/codexStart.ts): existing changes
// in default main are confirmed before anything is created, and a session
// that lands automatically is handed its established session first.
startTest(
  "existing changes are confirmed before Codex creates anything, and an established session's block and reporting context are the whole first input",
  async ({ dashboard, codexProtocol, origin }) => {
    const native = codexProtocol;
    if (native === undefined) throw new Error("Missing native fixture.");
    const revision = (await origin.originGit("rev-parse", "main")).trim();
    dirty(origin.project);
    const changes = status(origin.project);
    const asked = {
      ...request,
      policy: { workspace: "default-checkout", landing: "auto-land" },
    };
    const found = JSON.parse((await launch(dashboard, asked)).body) as {
      kind: string;
      count: number;
      fingerprint: string;
    };
    expect(found).toMatchObject({ kind: "existing-changes", count: 4 });
    expect(native.calls).toEqual([]);

    expect(
      JSON.parse(
        (
          await launch(dashboard, {
            ...asked,
            existingChanges: found.fingerprint,
          })
        ).body,
      ),
    ).toMatchObject({ kind: "launched" });
    const [record] = stored(dashboard.home);
    const session = defaultMainSession(origin.project, "auto-land", revision);
    expect(record?.establishedSession).toEqual(session);
    expect(record?.request).toMatchObject({ policy: asked.policy });
    expect(JSON.stringify(record)).not.toContain("existingChanges");
    const turns = native.calls.filter((call) => call.method === "turn/start");
    expect(turns).toHaveLength(1);
    const input = (
      turns[0]?.params as { input: { type: string; text: string }[] }
    ).input;
    expect(input.map(({ type }) => type)).toEqual(["text"]);
    const [block, reporting, ...extra] = (input[0]?.text ?? "").split("\n\n");
    expect(block).toBe(sessionBlock(session));
    expect(extra).toEqual([]);
    expectReportingBlock(reporting, record?.request, dashboard);
    expect(record?.firstInput?.instruction).toBe(input[0]?.text);
    expect(
      native.calls.find((call) => call.method === "thread/start")?.params,
    ).toMatchObject({ cwd: origin.project });
    expect(status(origin.project)).toBe(changes);
  },
);
