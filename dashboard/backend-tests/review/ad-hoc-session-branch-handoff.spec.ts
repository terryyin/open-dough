import { realpathSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { DashboardServer } from "../../test-support/support/dashboardServer.ts";
import { sessionBranchEntrySchema } from "../../src/sessionBranchResult.ts";
import { deleteRecord } from "../../test-support/agentLaunchBoundary.ts";
import {
  adHocReview,
  adHocSessionFileText,
  sessionBranchPins,
} from "../../test-support/support/adHocReview.ts";
import { reportingChild } from "../../test-support/support/completionRecovery.ts";
import { commit } from "../../test-support/support/launchLanding.ts";
import { expect, test } from "../../test-support/support/preparationPage.ts";
import { rawRequest } from "../../test-support/support/rawHttp.ts";
import { branchEntryCommand } from "../../test-support/support/reportingInputAssertions.ts";
import { DefaultMainSessionWork } from "../../test-support/support/sessionCheckoutWork.ts";
import { commitAt } from "../../test-support/support/sessionCheckoutGit.ts";
import { launched } from "../../test-support/support/startSessionLandingCapture.ts";
import { git } from "../../test-support/support/storyReviewWorktree.ts";

test.use({ serverMode: "boundary" });

const identify = (
  dashboard: DashboardServer,
  session: string,
  workspace: string,
  branch: string,
) =>
  rawRequest({
    url: `${dashboard.origin}/__agent-launch/branch-entry`,
    method: "POST",
    headers: { Origin: dashboard.origin, "Content-Type": "application/json" },
    body: JSON.stringify({
      source: "open-dough",
      host: "claude",
      session,
      workspace,
      branch,
    }),
  });

test("the launch command binds the original checkout's own branch and its entry state", async ({
  dashboard,
  origin,
  request,
}) => {
  const { record, sent } = await launched(dashboard, {
    instruction: "Continue the draft",
  });
  const session = record.session.sessionId;
  const work = new DefaultMainSessionWork(dashboard, origin);
  const onMain = await work.commit("2099-01-02T12:00:00Z", "main-work.txt");
  const workspace = realpathSync(origin.project);
  git(workspace, "switch", "--quiet", "-c", "draft");
  const entered = commit(workspace, "prior-commit.txt");
  writeFileSync(path.join(workspace, "prior-draft.txt"), "already here\n");
  const command = branchEntryCommand(sent);
  if (command === undefined)
    throw new Error("No branch entry command in launch input.");

  const accepted = await reportingChild(command, workspace);
  expect(accepted.ok, `${accepted.stderr}\n${accepted.stdout}`).toBe(true);
  expect(JSON.parse(accepted.stdout)).toMatchObject({
    session,
    branchEntry: {
      workspace,
      branch: "draft",
      committedTip: entered,
      defaultTip: onMain,
    },
  });
  const { branchEntry } = JSON.parse(accepted.stdout) as {
    branchEntry: unknown;
  };
  const { tree: baseline } = sessionBranchEntrySchema.parse(branchEntry);
  expect(sessionBranchPins(workspace, session)).toEqual([
    entered,
    onMain,
    baseline,
  ]);

  git(workspace, "add", "prior-draft.txt");
  const result = commit(workspace, "session.txt");
  const laterMain = path.join(origin.machine, "later-main");
  git(workspace, "worktree", "add", "--quiet", laterMain, "main");
  await commitAt(laterMain, "2099-01-02T12:05:00Z", "later-main.txt");
  const repeated = await reportingChild(command, workspace);
  expect(repeated.ok).toBe(true);
  expect(repeated.stdout).toBe(accepted.stdout);
  await work.markDone(session);

  expect(await adHocReview(request, dashboard, session)).toMatchObject({
    kind: "branch-result",
    baseline,
    tree: result,
    files: [{ kind: "added", path: "session.txt" }],
  });
  const file = await adHocSessionFileText(request, dashboard, session, {
    baseline,
    tree: result,
    path: "session.txt",
  });
  expect(await file.json()).toEqual({
    kind: "text",
    baseline: null,
    tree: "session.txt\n",
  });
  expect(await adHocReview(request, dashboard, session, 0)).toMatchObject({
    kind: "session-commits",
    tree: onMain,
    files: [{ kind: "added", path: "main-work.txt" }],
  });
});

test("a blank launch identifies one registered worktree through its confirmed session", async ({
  dashboard,
  origin,
  request,
}) => {
  const work = new DefaultMainSessionWork(dashboard, origin);
  const { sessionId } = (await work.launch()).session;
  expect(dashboard.claudeLaunches()[0]?.instruction ?? "").toBe("");
  const second = (await work.launch()).session.sessionId;
  expect(second).not.toBe(sessionId);
  const own = path.join(origin.machine, "notes");
  const other = path.join(origin.machine, "notes-other");
  const foreign = path.join(origin.machine, "outside");
  git(origin.project, "worktree", "add", "--quiet", "-b", "notes", own);
  git(origin.project, "worktree", "add", "--quiet", "-b", "notes-other", other);
  git(origin.project, "clone", "--quiet", "--local", origin.project, foreign);
  git(foreign, "switch", "--quiet", "-c", "notes");
  const prior = commit(own, "prior.txt");
  expect((await identify(dashboard, sessionId, foreign, "notes")).status).toBe(
    409,
  );
  expect((await identify(dashboard, sessionId, other, "notes")).status).toBe(
    409,
  );
  const handoff = await identify(dashboard, sessionId, own, "notes");
  expect(handoff.status, handoff.body).toBe(200);
  expect(JSON.parse(handoff.body)).toMatchObject({
    session: sessionId,
    branchEntry: {
      workspace: realpathSync(own),
      branch: "notes",
      committedTip: prior,
    },
  });
  expect(
    (await identify(dashboard, sessionId, other, "notes-other")).status,
  ).toBe(409);
  const otherHandoff = await identify(dashboard, second, other, "notes-other");
  expect(otherHandoff.status, otherHandoff.body).toBe(200);
  const ours = commit(own, "ours.txt");
  const theirs = commit(other, "theirs.txt");
  await work.markDone(sessionId);
  await work.markDone(second);

  expect(await adHocReview(request, dashboard, sessionId)).toMatchObject({
    kind: "branch-result",
    tree: ours,
    files: [{ path: "ours.txt" }],
  });
  expect(await adHocReview(request, dashboard, second)).toMatchObject({
    kind: "branch-result",
    tree: theirs,
    files: [{ path: "theirs.txt" }],
  });
  const secondPins = sessionBranchPins(origin.project, second);
  expect(sessionBranchPins(origin.project, sessionId)).toContain(prior);
  dashboard.claudeListingFails(true);
  const removed = await deleteRecord(dashboard, {
    source: "open-dough",
    session: sessionId,
  });
  expect(JSON.parse(removed.body)).toEqual({ kind: "deleted" });
  expect(sessionBranchPins(origin.project, sessionId)).toEqual([]);
  expect(sessionBranchPins(origin.project, second)).toEqual(secondPins);
});

test("an undeclared checkout move explains the missing branch association", async ({
  dashboard,
  origin,
  request,
}) => {
  const work = new DefaultMainSessionWork(dashboard, origin);
  const { sessionId } = (await work.launch()).session;
  git(origin.project, "switch", "--quiet", "-c", "not-identified");
  commit(origin.project, "not-attributed.txt");
  await work.markDone(sessionId);

  expect(await adHocReview(request, dashboard, sessionId)).toMatchObject({
    kind: "landing-unavailable",
    explanation:
      "No branch was identified for this session, and no Default main commits were captured.",
  });
});
