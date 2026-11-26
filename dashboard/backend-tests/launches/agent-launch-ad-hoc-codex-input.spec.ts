import { launchStoryIdentity } from "../../test-support/support/unattachedLaunchAssertions.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
// Actual HTTP/store launch decisions; the fixture only supplies native replies.
import path from "node:path";
import {
  test,
  expect,
  expectCodexAdHocInput,
  stored,
} from "../../test-support/support/codexLaunch.ts";
import { test as startTest } from "../../test-support/support/codexStart.ts";
import { launch } from "../../test-support/agentLaunchBoundary.ts";
import { publishMovingOrigin } from "../../test-support/publishedOrigin.ts";
import { pushWatchList } from "../../test-support/support/feedbackMaintenanceServer.ts";
import {
  authorizeFeedbackMaintenance,
  dayFromToday,
  dueWatchList,
} from "../../test-support/support/feedbackMaintenanceDue.ts";
import type { FakeGitHub } from "../../test-support/support/fakeGitHub.ts";
import { expectReportingBlock } from "../../test-support/support/reportingInputAssertions.ts";
import { launchWaitMs } from "../../test-support/support/launchWait.ts";

// No page: the local boundaries alone answer these requests.
test.use({
  serverMode: "boundary",
  projectFolders: ["open-dough"],
});

const request = makeMe.aLaunchRequest.adHoc({ host: "codex" }).please();

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
  expectCodexAdHocInput(native, text, stored(dashboard.home)[0], dashboard);
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

// The feedback maintenance check (../../server/feedbackMaintenanceCheck.ts)
// starting its session on Codex: the cycle's invocation as text, with the
// reporting context, and the cycle's skill as the structured item a story
// launch's first input carries. Ordinary ad hoc input has none (above).
const dueOnCodex = "a due feedback maintenance cycle authorized on Codex";

// Publishes Open Dough's watch list due on `due`, and turns the standing
// authorization on for Codex in this server's home.
async function dueAndOn(github: FakeGitHub, home: string, due: string) {
  pushWatchList(await publishMovingOrigin(github), dueWatchList(due));
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
      // Contested CI can stretch the first due check past the 5s default poll
      // (gh ref + watch-list read + Codex launch). Bound matches launchWaitMs.
      await expect
        .poll(() => turns().length, { timeout: launchWaitMs })
        .toBe(1);
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
      expect(extra).toEqual([`Taken story: ${launchStoryIdentity(record)}`]);
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
