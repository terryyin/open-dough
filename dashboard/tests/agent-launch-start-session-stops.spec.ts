// An unattached Start session whose choices cannot be honored starts no
// native session and silently runs nowhere else, with a real bare origin
// (./support/startOrigin.ts) and the synthetic `claude`: a choice the
// installation cannot establish, in default main or a new workspace, is
// refused before anything is accepted, and a start that stops, cannot be
// formatted answers in the session's own words, which name no story, Take,
// or assignment. Expiry wording belongs to the kept/recovery journeys.

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { installedSkillPath } from "../server/launchHosts.ts";
import {
  accept,
  attempts,
  continued,
  launch,
  recordsOf,
} from "./agentLaunchBoundary.ts";
import { keptSessionStarts } from "./support/keptSessionStart.ts";
import { expect, test } from "./support/preparationPage.ts";
import {
  isolatedSession,
  isolatedStart,
  recordStarts,
  worktrees,
} from "./support/startSessionLanding.ts";
import { originMain } from "./support/sessionDialog.ts";
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

test("a formatter failure keeps the established workspace and repairing it lets Continue launch without a second start", async ({
  dashboard,
  origin,
}) => {
  const starts = recordStarts(origin);
  const formatter = installed(origin, "established-session.mjs");
  const workingFormatter = readFileSync(formatter, "utf8");
  writeFileSync(formatter, "export {\n");
  commit(origin);
  const before = await originMain(origin);
  const failed = await explanation(
    launch(dashboard, { ...request, policy: isolated }),
  );
  expect(failed).toMatchObject({
    kind: "failed",
    reason: "start-refused",
    sessionStartKept: true,
    explanation:
      "The session's place was established, but the installed skill's formatter could not be read, so no session was started. Nothing was published. The established start was kept in workspace ~/git/open-dough/.worktrees/session on branch claude/session, where Continue or the same Start request can resume it.",
  });
  const [attempt] = await attempts(dashboard);
  const id = attempt?.id ?? "";
  const session = isolatedSession(origin.project, "session", "review", before);
  expect(keptSessionStarts(origin)[id]?.["session"]).toEqual(session);
  expect(dashboard.claudeLaunchCalls()).toEqual([]);
  expect(await recordsOf(dashboard, "open-dough")).toEqual([]);

  writeFileSync(formatter, workingFormatter);
  dashboard.claudeScenario("launched");
  expect((await explanation(continued(dashboard, id))).kind).toBe("launched");
  expect((await recordsOf(dashboard, "open-dough"))[0]).toMatchObject({
    establishedSession: session,
  });
  expect(dashboard.claudeLaunchCalls()).toHaveLength(1);
  expect(starts().map(({ argv }) => argv)).toEqual([
    isolatedStart(origin.project, "session", "review"),
  ]);
  expect(worktrees(origin.project)).toEqual(["session"]);
  expect(keptSessionStarts(origin)).toEqual({});
});

test("a start that stops before establishment launches nothing and says so in the session's words", async ({
  dashboard,
  origin,
}) => {
  execFileSync("git", ["-C", origin.project, "switch", "-qc", "topic"]);
  const stopped = await explanation(launch(dashboard, request));
  expect(stopped).toMatchObject({ kind: "failed", reason: "start-refused" });
  expect(stopped.explanation).toMatch(
    /^The workspace could not be set up: .*on branch topic, not the target branch main.* Nothing was launched\.$/,
  );
  expect(keptSessionStarts(origin)).toEqual({});
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
