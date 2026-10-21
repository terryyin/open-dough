// Actual HTTP/store launch decisions; the fixture only supplies native replies.
import path from "node:path";
import { test, expect, stored } from "../support/codexLaunch.ts";
import { test as startTest } from "../support/codexStart.ts";
import { launch } from "../agentLaunchBoundary.ts";
import { emptyBacklog, publishMovingOrigin } from "../publishedOrigin.ts";
import { feedbackWatchListPath } from "../../src/feedbackReview.ts";
import {
  authorizeFeedbackMaintenance,
  dayFromToday,
  dueWatchList,
} from "../support/feedbackMaintenanceDue.ts";
import type { FakeGitHub } from "../support/fakeGitHub.ts";
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

// The feedback maintenance check (../../server/feedbackMaintenanceCheck.ts)
// starting its session on Codex: the cycle's invocation as text, with the
// reporting context, and the cycle's skill as the structured item a story
// launch's first input carries. Ordinary ad hoc input has none (above).
const dueOnCodex = "a due feedback maintenance cycle authorized on Codex";

// Publishes Open Dough's watch list due on `due`, and turns the standing
// authorization on for Codex in this server's home.
async function dueAndOn(github: FakeGitHub, home: string, due: string) {
  const moving = await publishMovingOrigin(github);
  moving.push("f".repeat(40), emptyBacklog, {
    [feedbackWatchListPath]: dueWatchList(due),
  });
  authorizeFeedbackMaintenance(home, { host: "codex" });
}

type InputPart = { type: string; text?: string; name?: string; path?: string };

startTest.describe(dueOnCodex, () => {
  startTest.use({ extraEnv: { DOUGH_MAINTENANCE_CHECK_MS: "100" } });

  startTest(
    "starts with $maintain-feedback-cycle and its skill item",
    async ({ dashboard, codexProtocol, github }) => {
      const native = codexProtocol;
      if (native === undefined) throw new Error("Missing native fixture.");
      const due = dayFromToday(-1);
      await dueAndOn(github, dashboard.home, due);

      const turns = () =>
        native.calls.filter((call) => call.method === "turn/start");
      await expect.poll(() => turns().length).toBe(1);
      const [record] = stored(dashboard.home);
      expect(record?.request).toMatchObject({
        workflow: "ad-hoc",
        host: "codex",
        title: "Feedback maintenance",
        maintenance: { due },
      });
      const started = native.calls.find(
        (call) => call.method === "thread/start",
      );
      const { cwd } = started?.params as { cwd: string };
      const { input } = turns()[0]?.params as { input: InputPart[] };
      expect(input.map(({ type }) => type)).toEqual(["text", "skill"]);
      const [invocation, reporting, ...extra] = (input[0]?.text ?? "").split(
        "\n\n",
      );
      expect(invocation).toBe("$maintain-feedback-cycle");
      expect(extra).toEqual([]);
      expectReportingBlock(reporting, record?.request, dashboard);
      const skill = "maintain-feedback-cycle";
      expect(input[1]).toEqual({
        type: "skill",
        name: skill,
        path: path.join(cwd, ".agents", "skills", skill, "SKILL.md"),
      });
    },
  );
});
