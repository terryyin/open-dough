// A definite native refusal after establishment keeps its session start, and
// the raw launch boundary resumes it through Continue in the kept workspace
// with its landing choice and handoff. It drives a real installed start and
// bare origin, with a synthetic host. The page's recovery and an identical
// Start: ../../../e2e/launches/agent-launch-start-session-failed.spec.ts.
import { isolatedAdmissionFlags } from "../../test-support/support/isolatedSessionAdmissionProof.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { realpathSync } from "node:fs";
import type { LaunchWithState } from "../../src/launchRecord.ts";
import {
  attempts,
  continued,
  launch,
  recordsOf,
} from "../../test-support/agentLaunchBoundary.ts";
import { keptSessionStarts } from "../../test-support/support/keptSessionStart.ts";
import { expect, test } from "../../test-support/support/preparationPage.ts";
import { originMain } from "../../test-support/support/sessionDialog.ts";
import {
  isolatedSession,
  recordStarts,
  worktree,
  worktrees,
} from "../../test-support/support/startSessionLanding.ts";

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
  const policy = { workspace: "isolated", landing: "auto-land" };
  dashboard.claudeScenario("refused");
  const refused = await answerOf(launch(dashboard, { ...request, policy }));
  expect(refused).toMatchObject({
    kind: "failed",
    reason: "refused",
    sessionStartKept: true,
  });
  expect(refused.explanation).toContain(
    "The Taken story was published. The established start was kept in workspace ~/git/open-dough/.worktrees/session on branch claude/session, where Continue or the same Start request can resume it.",
  );
  const [failed] = await attempts(dashboard);
  const id = failed?.id ?? "";
  const revision = await originMain(origin);
  expect(revision).not.toBe(before);
  expect(failed?.publication).toMatchObject({ kind: "published", revision });
  const session = isolatedSession(
    origin.project,
    "session",
    "auto-land",
    revision,
  );

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
    expect(call.argv.at(-1)).not.toContain("Established session");
  }
  expect(starts().map(({ argv }) => argv)).toEqual([
    expect.arrayContaining(isolatedAdmissionFlags(origin.project, "session")),
  ]);
  expect(worktrees(origin.project)).toEqual(["session"]);
  expect(keptSessionStarts(origin)).toEqual({});
  expect(await attempts(dashboard)).toEqual([
    expect.objectContaining({ id, acceptedAt: failed?.acceptedAt }),
  ]);
  expect(await originMain(origin)).toBe(revision);
});
