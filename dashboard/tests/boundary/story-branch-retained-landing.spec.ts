// Real installed start/publication/reporting and dashboard terminal/Done
// boundaries. Synthetic Claude supplies only native session and follow-up work.
import { existsSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "../support/pageTest.ts";
import { markDone } from "../agentLaunchBoundary.ts";
import {
  lastAttachEnded,
  openTerminal,
  shows,
} from "../agentTerminalBoundary.ts";
import { quote, reportingChild } from "../support/completionRecovery.ts";
import type { DashboardServer } from "../support/dashboardServer.ts";
import {
  capturedPublicationSchema,
  commit,
  git,
} from "../support/launchLanding.ts";
import { startBoundary } from "../support/launchDashboard.ts";
import {
  executionRecordBytes,
  nativeNextSlice,
} from "../support/retainedStoryLanding.ts";
import { startOrigin, type StartOrigin } from "../support/startOrigin.ts";
import {
  claimedLaunchWithStoryCommit,
  claimedRecord,
} from "../support/storyBranchIntegration.ts";

const pendingPlan =
  "# Story A plan\n\n## Ordered slices\n\n### 1. Reviewed result\nType: Behavior\nStatus: done\n\n### 2. Release result\nType: Behavior\nStatus: planned\n";
let origin: StartOrigin;
let server: DashboardServer;
test.beforeEach(async () => {
  origin = await startOrigin();
  server = await startBoundary(origin);
});
test.afterEach(async () => {
  await server.close();
  origin.cleanup();
});

test("a retained unfinished landing keeps the published prefix, local suffix, claim and session usable for its next slice; manual Done changes only session acknowledgment", async () => {
  const story = await claimedLaunchWithStoryCommit(origin, server, true, {
    checkQueuedClosures: true,
    storyWork(workspace) {
      writeFileSync(
        path.join(workspace, ".planning/slice-plans/A/PLAN.md"),
        pendingPlan,
      );
      git(workspace, "commit", "-am", "Record pending release slice");
    },
    localWork: (workspace) => {
      commit(workspace, "local-reviewed.txt");
    },
  });
  const { workspace, branch, start, record, reporting } = story;
  if (
    record.session.host !== "claude" ||
    start.plan === undefined ||
    start.agent === undefined
  )
    throw new Error("Missing claimed Claude execution context");
  expect(start.mode).toBe("story-branch");
  const before = executionRecordBytes(workspace, start.plan, start.agent);
  expect(before.backlog).toContain("## Taken");
  expect(before.plan).toBe(pendingPlan);
  expect(before.profile).toContain('"mode": "story-branch"');
  expect(
    (await origin.takenProfiles()).some(
      (profile) => profile["identity"] === start.identity,
    ),
  ).toBe(true);
  const launchCalls = server.claudeLaunchCalls().length;

  const landed = capturedPublicationSchema.parse(await story.integrated());
  expect(landed).toMatchObject({ classification: "published", pushCount: 1 });
  const accepted = (await origin.originGit("rev-parse", "main")).trim();
  for (const sha of [story.storyTip, story.reviewedTip, story.trunkTip])
    git(workspace, "merge-base", "--is-ancestor", sha, accepted);
  expect(git(workspace, "show", `${accepted}:local-reviewed.txt`)).toBe(
    "local-reviewed.txt",
  );
  expect(git(workspace, "branch", "--show-current")).toBe(branch);
  expect(git(workspace, "rev-parse", "HEAD")).toBe(story.reviewedTip);
  expect((await origin.originGit("rev-parse", branch)).trim()).toBe(
    story.storyTip,
  );
  expect(existsSync(workspace)).toBe(true);
  expect(executionRecordBytes(workspace, start.plan, start.agent)).toEqual(
    before,
  );
  const againWithout: unknown = await story.integrated();
  expect(againWithout).toMatchObject({
    classification: "already-accepted",
    pushCount: 0,
  });
  expect(againWithout).not.toHaveProperty("landing");
  expect((await origin.originGit("rev-parse", "main")).trim()).toBe(accepted);
  expect(git(workspace, "rev-parse", "HEAD")).toBe(story.reviewedTip);

  const attention =
    "Reviewed changes landed. Story unfinished; workspace and branches retained. Continue slice 2: Release result.";
  const message = path.join(origin.machine, "unfinished.txt");
  writeFileSync(message, attention);
  const reported = await reportingChild(
    `${reporting.command} --outcome unfinished --message-file ${quote(message)}`,
    origin.machine,
  );
  expect(reported.ok, reported.stderr).toBe(true);
  expect(JSON.parse(reported.stdout)).toMatchObject({ state: "recorded" });
  const unfinished = await claimedRecord(server);
  expect(unfinished.completion).toMatchObject({
    outcome: "unfinished",
    message: attention,
  });
  expect(unfinished.doneAt).toBeUndefined();
  expect(unfinished.start).toEqual(start);
  expect(unfinished.session).toEqual(record.session);
  expect(server.claudeStopCalls()).toHaveLength(0);

  const instruction = `Continue pending slice 2 for ${start.identity}.`;
  nativeNextSlice(origin.machine, instruction);
  const terminal = await openTerminal(server, record.session);
  expect(await shows(terminal, "Claude Code")).toBe(true);
  terminal.send({ input: `${instruction}\r` });
  expect(await shows(terminal, `echo ${instruction}`)).toBe(true);
  expect(server.claudeAttaches().at(-1)).toMatchObject({
    id: record.session.shortId,
    lines: [instruction],
  });
  expect(git(workspace, "branch", "--show-current")).toBe(branch);
  expect(git(workspace, "log", "-1", "--format=%s")).toBe(
    "Continue pending slice",
  );
  expect(git(workspace, "rev-parse", "HEAD^")).toBe(story.reviewedTip);
  expect(readFileSync(path.join(workspace, "next-slice.txt"), "utf8")).toBe(
    `${realpathSync(workspace)}\n${branch}\n`,
  );
  expect(server.claudeLaunchCalls()).toHaveLength(launchCalls);
  terminal.socket.close();
  expect(await lastAttachEnded(server)).toBe("SIGHUP");

  const acknowledgedHead = git(workspace, "rev-parse", "HEAD");
  const remoteBefore = await origin.originGit("show-ref");
  server.claudeSessionBecomes(record.session.sessionId, "working-idle");
  const acknowledged = await markDone(server, {
    source: "open-dough",
    session: record.session.sessionId,
  });
  expect(acknowledged.status).toBe(200);
  expect((await claimedRecord(server)).doneAt).toBeDefined();
  expect((await claimedRecord(server)).completion).toEqual(
    unfinished.completion,
  );
  expect(executionRecordBytes(workspace, start.plan, start.agent)).toEqual(
    before,
  );
  expect(git(workspace, "rev-parse", "HEAD")).toBe(acknowledgedHead);
  expect(await origin.originGit("show-ref")).toBe(remoteBefore);
  expect(existsSync(workspace)).toBe(true);
});
