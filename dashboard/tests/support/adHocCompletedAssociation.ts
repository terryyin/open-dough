// Retained ad hoc session whose published claim/completion evidence links it
// to one Done story (SEED-291 association). Claim-Publisher equals the launch
// reporting reference; the landing names no story identity; the execution
// workspace and branch are removed. Facts that drive each case are stated at
// the call site.
import { randomUUID } from "node:crypto";
import { rmSync } from "node:fs";
import path from "node:path";
import type { APIRequestContext } from "@playwright/test";
import { makeMe } from "../../../tests/support/makeMe.mjs";
import { storyA, storyB } from "../../../tests/support/queued-repository.mjs";
import type { IntentCoverage } from "../../../src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs";
import {
  completedStoryAssociationEndpoint,
  completedStoryAssociationSchema,
  type CompletedStoryAssociationAnswer,
} from "../../src/completedStoryAssociation.ts";
import type { LaunchLanding } from "../../src/launchLanding.ts";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import { advanceCompletedTrunk } from "./completedPublishedStory.ts";
import { publishCompletedStory } from "./completedStoryPublication.ts";
import type { DashboardServer } from "./dashboardServer.ts";
import { keepLaunchRecords } from "./launchStore.ts";
import { queuedIdentity, type StartOrigin } from "./startOrigin.ts";
import { commitAll, git, lines, writeAt } from "./storyReviewWorktree.ts";
import { push } from "./storyReviewTrunkCommits.ts";

export { queuedIdentity };

// Public completed-story association read for one retained session.
export async function associationOf(
  request: APIRequestContext,
  dashboard: DashboardServer,
  session: { host: string; sessionId: string },
): Promise<CompletedStoryAssociationAnswer> {
  const query = new URLSearchParams({
    source: "open-dough",
    host: session.host,
    session: session.sessionId,
  });
  const response = await request.get(
    `${dashboard.baseURL}${completedStoryAssociationEndpoint}?${query}`,
    { headers: { Origin: dashboard.origin } },
  );
  if (!response.ok()) {
    throw new Error(
      `association ${String(response.status())}: ${await response.text()}`,
    );
  }
  return completedStoryAssociationSchema.parse(await response.json());
}

export type AdHocCompletedAssociation = {
  readonly reference: string;
  readonly identity: string;
  readonly title: string;
  readonly completion: string;
  readonly base: string;
  readonly record: LaunchRecord;
};

export type AdHocAssociationLandingOverride = {
  readonly identity?: string;
  readonly base?: string;
  readonly revision?: string;
  readonly target?: string;
  readonly repository?: string;
  readonly reference?: string;
};

// Completes Story A with Claim-Publisher = `reference`, retires the worktree
// and branch, optionally advances trunk, and keeps a storyless ad hoc record
// whose landing is that completion (Pygardon shape).
export async function retainAdHocCompletedStory(
  dashboard: DashboardServer,
  origin: StartOrigin,
  {
    reference = randomUUID(),
    title = "Ad hoc completed session",
    intentCoverage,
    advanceTrunk = true,
    implementation,
    landing: landingOverride,
    claimPublisher,
  }: {
    readonly reference?: string;
    readonly title?: string;
    readonly intentCoverage?: IntentCoverage;
    readonly advanceTrunk?: boolean;
    readonly implementation?: (workspace: string) => void;
    readonly landing?: AdHocAssociationLandingOverride;
    readonly claimPublisher?: string;
  } = {},
): Promise<AdHocCompletedAssociation> {
  writeAt(origin.project, "shared.txt", lines("line"));
  commitAll(origin.project, "initial shared file");
  push(origin.project);
  const publisher = claimPublisher ?? reference;
  const start = await origin.publishTake({
    agent: "Yui",
    story: storyA,
    queued: [storyB],
    mode: "story-branch",
    publisher,
  });
  const { workspace, branch } = start;
  const claim = git(workspace, "rev-parse", "HEAD");
  writeAt(
    workspace,
    "shared.txt",
    lines("line").replace("line 0\n", "story first\n"),
  );
  writeAt(workspace, "ad-hoc-result.txt", "completed from ad hoc session\n");
  implementation?.(workspace);
  commitAll(workspace, "story implementation");
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
  if (advanceTrunk) advanceCompletedTrunk(origin);
  const retiredWorkspace = path.join(
    origin.machine,
    "retired-ad-hoc-workspace",
  );
  rmSync(retiredWorkspace, { recursive: true, force: true });
  const landing: LaunchLanding = makeMe.aLaunchLanding
    .capturedFrom({
      repository: landingOverride?.repository ?? origin.project,
      remote: "origin",
      target: landingOverride?.target ?? "refs/heads/main",
      ...(landingOverride?.identity !== undefined && {
        identity: landingOverride.identity,
      }),
    })
    .forLaunch(landingOverride?.reference ?? reference)
    .comparing({
      base: landingOverride?.base ?? claim,
      revision: landingOverride?.revision ?? completion,
    })
    .receivedAt(new Date().toISOString())
    .please();
  const record = makeMe.aLaunchRecord
    .adHoc({ instruction: title, title })
    .reportingThrough({
      origin: dashboard.origin,
      reference,
      command: "report",
    })
    .inIsolatedWorkspace({
      workspace: retiredWorkspace,
      branch: "ad-hoc/retired",
    })
    .withCapturedLanding(landing)
    .completedWith({ message: "Landed the ad hoc completion." })
    .markedDoneAt(new Date().toISOString())
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
