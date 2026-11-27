// A story-linked ad hoc session after its Done story was published and the
// original worktree retired. It keeps the legacy capture's exact comparison.
import { randomUUID } from "node:crypto";
import { rmSync } from "node:fs";
import path from "node:path";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  storyA,
  storyB,
} from "../../../Distribution/tests/support/queued-repository.mjs";
import type { IntentCoverage } from "../../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import { advanceCompletedTrunk } from "./completedStoryVisibleActions.ts";
import { publishCompletedStory } from "./completedStoryPublication.ts";
import type { DashboardServer } from "./dashboardServer.ts";
import { keepLaunchRecords } from "./launchStore.ts";
import { queuedIdentity, type StartOrigin } from "./startOrigin.ts";
import { git, lines } from "./storyReviewWorktree.ts";
import { push } from "./storyReviewTrunkCommits.ts";

type AdHocCompletedStory = {
  readonly reference: string;
  readonly identity: string;
  readonly title: string;
  readonly completion: string;
  readonly base: string;
  readonly record: LaunchRecord;
};

export async function retainAdHocCompletedStory(
  dashboard: DashboardServer,
  origin: StartOrigin,
  {
    title,
    intentCoverage,
    implementation,
    landingRepository = origin.project,
  }: {
    readonly title: string;
    readonly intentCoverage?: IntentCoverage;
    readonly implementation?: (workspace: string) => void;
    readonly landingRepository?: string;
  },
): Promise<AdHocCompletedStory> {
  const reference = randomUUID();
  makeMe
    .theWorkspace(origin.project)
    .writeAt("shared.txt", lines("line"))
    .commitAll("initial shared file")
    .please();
  push(origin.project);
  const start = await origin.publishTake({
    agent: "Yui",
    story: storyA,
    queued: [storyB],
    mode: "story-branch",
    publisher: reference,
  });
  const { workspace, branch } = start;
  const claim = git(workspace, "rev-parse", "HEAD");
  makeMe
    .theWorkspace(workspace)
    .writeAt("shared.txt", lines("line").replace("line 0\n", "story first\n"))
    .writeAt("ad-hoc-result.txt", "completed from ad hoc session\n")
    .please();
  implementation?.(workspace);
  makeMe.theWorkspace(workspace).commitAll("story implementation").please();
  git(workspace, "fetch", "--quiet", "origin", "main");
  git(workspace, "merge", "--quiet", "--no-edit", "origin/main");
  const completion = publishCompletedStory(origin, {
    workspace,
    branch,
    mode: "story-branch",
    missingAgent: false,
    completionConflict: false,
    intentCoverage,
    retainWorkspace: false,
    // codexStart installs skills under `.agents/skills`.
    skillsDirectory: ".agents/skills",
  });
  advanceCompletedTrunk(origin);
  const retiredWorkspace = path.join(
    origin.machine,
    "retired-ad-hoc-workspace",
  );
  rmSync(retiredWorkspace, { recursive: true, force: true });
  const landing = makeMe.aLaunchLanding
    .capturedFrom({ repository: landingRepository })
    .comparing({ base: claim, revision: completion });
  const record = makeMe.aLaunchRecord
    .adHoc({
      instruction: title,
      title,
      storyIdentity: queuedIdentity,
    })
    .reportingThrough({
      origin: dashboard.origin,
      reference,
      command: "report",
    })
    .inIsolatedWorkspace({
      workspace: retiredWorkspace,
      branch: "ad-hoc/retired",
    })
    .withLanding(landing)
    .completedWith({ message: "Landed the ad hoc completion." })
    .markedDone()
    .launchedAt(new Date(Date.now() - 60_000).toISOString())
    .please();
  keepLaunchRecords(dashboard, [record]);
  return {
    reference,
    identity: queuedIdentity,
    title: "Story A",
    completion,
    base: claim,
    record,
  };
}
