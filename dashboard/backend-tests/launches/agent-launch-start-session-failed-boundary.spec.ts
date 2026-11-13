// A definite native refusal after establishment keeps its session start, and
// the raw launch boundary resumes it through Continue in the kept workspace
// with its landing choice and handoff. It drives a real installed start and
// bare origin, with a synthetic host. The page's recovery and an identical
// Start: ../../../e2e/launches/agent-launch-start-session-failed.spec.ts.
import { makeMe } from "../../../tests/support/makeMe.mjs";
import { realpathSync } from "node:fs";
import type { LaunchWithState } from "../../src/launchRecord.ts";
import {
  attempts,
  continued,
  launch,
  recordsOf,
} from "../../tests/agentLaunchBoundary.ts";
import { keptSessionStarts } from "../../tests/support/keptSessionStart.ts";
import { expect, test } from "../../tests/support/preparationPage.ts";
import { originMain } from "../../tests/support/sessionDialog.ts";
import {
  isolatedSession,
  isolatedStart,
  originHeads,
  recordStarts,
  sessionBlock,
  worktree,
  worktrees,
} from "../../tests/support/startSessionLanding.ts";

const request = makeMe.aLaunchRequest.adHoc().please();
type Answer = {
  kind: string;
  reason?: string;
  explanation?: string;
  record?: LaunchWithState;
};
const answerOf = async (answer: Promise<{ body: string }>) =>
  JSON.parse((await answer).body) as Answer;

test("a native refusal keeps the established session, and Continue resumes its workspace, landing choice and handoff", async ({
  dashboard,
  origin,
}) => {
  const starts = recordStarts(origin);
  const before = await originMain(origin);
  const heads = await originHeads(origin);
  const policy = { workspace: "isolated", landing: "auto-land" };
  const session = isolatedSession(
    origin.project,
    "session",
    "auto-land",
    before,
  );
  dashboard.claudeScenario("refused");
  const refused = await answerOf(launch(dashboard, { ...request, policy }));
  expect(refused).toMatchObject({
    kind: "failed",
    reason: "refused",
    sessionStartKept: true,
  });
  expect(refused.explanation).toContain(
    "Nothing was published. The established start was kept in workspace ~/git/open-dough/.worktrees/session on branch claude/session, where Continue or the same Start request can resume it.",
  );
  const [failed] = await attempts(dashboard);
  const id = failed?.id ?? "";
  expect(failed?.publication).toEqual({ kind: "none" });
  expect(keptSessionStarts(origin)[id]?.["session"]).toEqual(session);
  expect(await recordsOf(dashboard, "open-dough")).toEqual([]);

  dashboard.claudeScenario("launched");
  const launched = await answerOf(continued(dashboard, id));
  expect(launched.kind, JSON.stringify(launched)).toBe("launched");
  expect(launched.record?.establishedSession).toEqual(session);
  const calls = dashboard.claudeLaunchCalls();
  expect(calls).toHaveLength(2);
  for (const call of calls) {
    expect(call.cwd).toBe(realpathSync(worktree(origin.project, "session")));
    expect((call.argv.at(-1) ?? "").split("\n\n")[0]).toBe(
      sessionBlock(session),
    );
  }
  expect(starts().map(({ argv }) => argv)).toEqual([
    isolatedStart(origin.project, "session", "auto-land"),
  ]);
  expect(worktrees(origin.project)).toEqual(["session"]);
  expect(keptSessionStarts(origin)).toEqual({});
  expect(await attempts(dashboard)).toEqual([
    expect.objectContaining({ id, acceptedAt: failed?.acceptedAt }),
  ]);
  expect(await originHeads(origin)).toBe(heads);
});
