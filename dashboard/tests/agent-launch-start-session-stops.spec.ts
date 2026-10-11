// An unattached Start session whose choices cannot be honored starts no
// native session and silently runs nowhere else, with a real bare origin
// (./support/startOrigin.ts) and the synthetic `claude`: a choice the
// installation cannot establish, in default main or a new workspace, is
// refused before anything is accepted, and a start that stops, cannot be
// formatted, or outlasts its wait answers in the session's own words, which
// name no story, Take, or assignment.

import { execFileSync } from "node:child_process";
import { existsSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { installedSkillPath } from "../server/launchHosts.ts";
import { accept, launch, recordsOf } from "./agentLaunchBoundary.ts";
import { keptWords } from "./support/keptSessionStart.ts";
import { expect, test } from "./support/preparationPage.ts";
import type { StartOrigin } from "./support/startOrigin.ts";

const request = {
  source: "open-dough",
  workflow: "ad-hoc",
  host: "claude",
  policy: { workspace: "default-checkout", landing: "auto-land" },
};

const isolated = { workspace: "isolated", landing: "review" };

const installed = (origin: StartOrigin, script: string) =>
  installedSkillPath(
    "claude",
    { path: origin.project, shown: origin.project },
    "dough-execute-plan",
    "scripts",
    script,
  );

// Commits the project's edits, so its default checkout holds no changes to
// confirm.
const commit = (origin: StartOrigin) => {
  for (const args of [
    ["add", "."],
    ["commit", "-m", "edit installed skill"],
  ])
    execFileSync("git", ["-C", origin.project, ...args], { stdio: "ignore" });
};

const explanation = async (answer: Promise<{ body: string }>) =>
  JSON.parse((await answer).body) as {
    kind: string;
    reason?: string;
    explanation?: string;
  };

test("a choice the installation cannot establish is refused before anything is accepted", async ({
  dashboard,
  origin,
}) => {
  rmSync(installed(origin, "established-session.mjs"));
  commit(origin);
  for (const [policy, named] of [
    [request.policy, "Default main · Automatically land"],
    [isolated, "Isolated workspace · Wait for review"],
  ] as const) {
    const refused = await accept(dashboard, { ...request, policy });
    expect(refused.status).toBe(400);
    expect(refused.body).toContain(
      `${named} cannot be selected: the installed skills in ~/git/open-dough do not establish a session without a story.`,
    );
  }
  expect(existsSync(path.join(origin.project, ".worktrees"))).toBe(false);
  // The default choices need nothing of the installation.
  dashboard.claudeScenario("launched");
  const plain = await explanation(
    launch(dashboard, { ...request, policy: undefined, instruction: "Hello" }),
  );
  expect(plain.kind).toBe("launched");
  expect(dashboard.claudeLaunchCalls()).toHaveLength(1);
  expect(await recordsOf(dashboard, "open-dough")).toHaveLength(1);
});

test("a start that stops, or whose block cannot be formatted, launches nothing and says so in the session's words", async ({
  dashboard,
  origin,
}) => {
  writeFileSync(installed(origin, "established-session.mjs"), "export {\n");
  commit(origin);
  expect(await explanation(launch(dashboard, request))).toEqual({
    kind: "failed",
    reason: "start-refused",
    explanation:
      "The session's place was established, but the installed skill's formatter could not be read, so no session was started. Nothing was published. Workspace ~/git/open-dough on branch main.",
  });

  execFileSync("git", ["-C", origin.project, "switch", "-qc", "topic"]);
  const stopped = await explanation(launch(dashboard, request));
  expect(stopped).toMatchObject({ kind: "failed", reason: "start-refused" });
  expect(stopped.explanation).toMatch(
    /^The workspace could not be set up: .*on branch topic, not the target branch main.* Nothing was launched\.$/,
  );
  expect(dashboard.claudeLaunchCalls()).toEqual([]);
  expect(await recordsOf(dashboard, "open-dough")).toEqual([]);
});

test("a start that answers nothing readable launches nothing and says it publishes nothing", async ({
  dashboard,
  origin,
}) => {
  // The installed start ends without a result.
  writeFileSync(installed(origin, "execution-start.mjs"), "\n");
  commit(origin);
  expect(await explanation(launch(dashboard, request))).toMatchObject({
    kind: "failed",
    reason: "start-refused",
    explanation:
      "The start command gave no result this dashboard could read. A session's start publishes nothing. Nothing was launched.",
  });
  expect(dashboard.claudeLaunchCalls()).toEqual([]);
  expect(await recordsOf(dashboard, "open-dough")).toEqual([]);
});

test.describe("a start that outlasts its wait", () => {
  test.use({ startTimeoutMs: 1 });

  test("answers uncertain, naming where its kept start goes on and that it publishes nothing", async ({
    dashboard,
  }) => {
    // In default main or a new workspace, the start is kept where it goes on
    // (./agent-launch-start-session-recovery.spec.ts).
    for (const [policy, workspace, branch] of [
      [request.policy, "~/git/open-dough", "main"],
      [isolated, "~/git/open-dough/.worktrees/session", "claude/session"],
    ] as const)
      expect(
        await explanation(launch(dashboard, { ...request, policy })),
      ).toMatchObject({
        kind: "uncertain",
        reason: "timed-out",
        explanation: keptWords(workspace, branch),
      });
    expect(dashboard.claudeLaunchCalls()).toEqual([]);
    expect(await recordsOf(dashboard, "open-dough")).toEqual([]);
  });
});
