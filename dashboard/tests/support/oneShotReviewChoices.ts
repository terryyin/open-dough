// Multiple runs are actual installed launches/captures; only native transport
// and the later ordinary launch record supply external fixture evidence.
import path from "node:path";
import { writeFileSync } from "node:fs";
import type { DashboardServer } from "./dashboardServer.ts";
import type { StartOrigin } from "./startOrigin.ts";
import type { FakeCodex } from "./fakeCodex.ts";
import { stored } from "./codexStart.ts";
import {
  startReviewRun,
  captureReviewRun,
  retireReviewRun,
} from "./oneShotReview.ts";
import { commit, git } from "./oneShotLanding.ts";
import { recordOperation } from "./completionRecovery.ts";
import { keepLaunchRecords, storyALaunchRecord } from "./storyLaunchRecord.ts";
import { sessionKey } from "../../src/sessionReference.ts";

export async function capturedChoice(
  dashboard: DashboardServer,
  origin: StartOrigin,
  native: FakeCodex,
  name: string,
) {
  const nativeSession = native;
  nativeSession.threadId = `review-${name}`;
  const run = await startReviewRun(dashboard);
  commit(run.established.workspace, `${name}.txt`);
  const receipt = captureReviewRun(run, origin);
  retireReviewRun(run, origin, receipt.revision);
  await recordOperation(dashboard, "setRecordDoneAt", [
    "open-dough",
    run.record.session,
    new Date().toISOString(),
  ]);
  return { ...run, receipt, key: receipt.reference, name };
}
export async function reviewChoices(
  dashboard: DashboardServer,
  origin: StartOrigin,
  native: FakeCodex,
) {
  const nativeSession = native;
  nativeSession.threadId = "review-legacy";
  const legacy = await startReviewRun(dashboard);
  retireReviewRun(legacy, origin, legacy.established.startingRevision ?? "");
  // A real launch predating the reporting capability has no optional handoff.
  const old = { ...legacy.record, request: { ...legacy.record.request } };
  delete old.request.reporting;
  await keepLaunchRecords(dashboard, [old]);
  await recordOperation(dashboard, "setRecordDoneAt", [
    "open-dough",
    old.session,
    new Date().toISOString(),
  ]);
  const first = await capturedChoice(dashboard, origin, native, "first");
  const second = await capturedChoice(dashboard, origin, native, "second");
  git(origin.project, "fetch", "--quiet", "origin", "main");
  const workspace = path.join(origin.project, ".worktrees", "live-review");
  git(
    origin.project,
    "worktree",
    "add",
    "--quiet",
    "-b",
    "claude/story-a",
    workspace,
    "origin/main",
  );
  commit(workspace, "live.txt");
  const live = storyALaunchRecord(workspace);
  await keepLaunchRecords(dashboard, [...stored(dashboard.home), live]);
  return {
    first,
    second,
    legacy: { ...old, key: sessionKey(old.session) },
    live,
    workspace,
  };
}
export function addLiveEdit(workspace: string) {
  writeFileSync(
    path.join(workspace, "after-mark.txt"),
    "after workspace mark\n",
  );
}
