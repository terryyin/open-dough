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
import { commit, git } from "./launchLanding.ts";
import { recordOperation } from "./completionRecovery.ts";
import { keepLaunchRecords } from "./launchStore.ts";
import { storyALaunch } from "./storyLaunchRecord.ts";
import { branch } from "./storyReviewWorktree.ts";
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
// The named captured runs beside an open live story A workspace.
export async function capturedReviewChoices<const Name extends string>(
  dashboard: DashboardServer,
  origin: StartOrigin,
  native: FakeCodex,
  names: readonly Name[],
) {
  const captured = {} as Record<
    Name,
    Awaited<ReturnType<typeof capturedChoice>>
  >;
  for (const name of names)
    captured[name] = await capturedChoice(dashboard, origin, native, name);
  git(origin.project, "fetch", "--quiet", "origin", "main");
  const workspace = path.join(origin.project, ".worktrees", "live-review");
  git(
    origin.project,
    "worktree",
    "add",
    "--quiet",
    "-b",
    branch,
    workspace,
    "origin/main",
  );
  commit(workspace, "live.txt");
  // This workspace must be the latest launch beside the retained runs.
  const live = storyALaunch()
    .onStoryBranch({ workspace, branch })
    .launchedAt(new Date().toISOString())
    .please();
  keepLaunchRecords(dashboard, [...stored(dashboard.home), live]);
  return {
    ...captured,
    live,
    workspace,
  };
}
// The legacy-choice journey needs its uncaptured run before the captures.
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
  keepLaunchRecords(dashboard, [old]);
  await recordOperation(dashboard, "setRecordDoneAt", [
    "open-dough",
    old.session,
    new Date().toISOString(),
  ]);
  return {
    ...(await capturedReviewChoices(dashboard, origin, native, [
      "first",
      "second",
    ])),
    legacy: { ...old, key: sessionKey(old.session) },
  };
}
export function addLiveEdit(workspace: string) {
  writeFileSync(
    path.join(workspace, "live-edit.txt"),
    "uncommitted workspace edit\n",
  );
}
