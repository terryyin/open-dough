// A refused first launch after a published claim
// (../../server/agentLaunches.ts), over the launch boundary: its answer names
// the Agent and workspace, and the machine names the kept start, with no
// second claim, until a later launch opens a session. The Taken card's Start
// that offer leads to: ../../../e2e/launches/agent-launch-start-taken.spec.ts.

import { keptStarts, launch } from "../../tests/agentLaunchBoundary.ts";
import { expect } from "../../tests/dashboardTest.ts";
import { queuedIdentity } from "../../tests/support/startOrigin.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { test, workspaceShown } from "../../tests/keptStartJourney.ts";

test("a refused session launch after a published claim answers the Agent and workspace, the machine names the kept start until a session starts", async ({
  dashboard,
  origin,
}) => {
  const request = makeMe.aLaunchRequest
    .executing({ identity: queuedIdentity, title: "Story A" })
    .please();
  expect(await keptStarts(dashboard)).toEqual([]);
  dashboard.claudeScenario("refused");
  const failed = JSON.parse((await launch(dashboard, request)).body) as {
    kind: string;
    reason: string;
    explanation: string;
  };
  const agent = String(
    (await origin.takenProfiles()).find(
      (each) => each["identity"] === queuedIdentity,
    )?.["agent"],
  );
  expect(failed).toMatchObject({ kind: "failed", reason: "refused" });
  expect(failed.explanation).toMatch(
    new RegExp(
      `^Claude Code refused to start a session in ${workspaceShown}\\..* Taken by ${agent}; no session started\\. Workspace ${workspaceShown}\\.$`,
    ),
  );
  expect(await keptStarts(dashboard)).toEqual([
    {
      host: "claude",
      workflow: "execution",
      source: "open-dough",
      identity: queuedIdentity,
      workspace: workspaceShown,
      branch: "claude/story-a",
      agent,
    },
  ]);

  dashboard.claudeScenario("launched");
  const second = JSON.parse((await launch(dashboard, request)).body) as {
    kind: string;
  };
  expect(second.kind).toBe("launched");
  expect(await keptStarts(dashboard)).toEqual([]);
  expect(await origin.takenProfiles()).toHaveLength(1);
});
