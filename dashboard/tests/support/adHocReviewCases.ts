// Scenario runners for ad-hoc review boundary specs (review answer and gaps).
import path from "node:path";
import { readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { materializeLocalCheckout } from "../../../Distribution/tests/support/repository-fixture.mjs";
import { storyReviewEndpoint } from "../../src/storyReviewContract.ts";
import { getReview } from "./completedReviewRequests.ts";
import { keepLaunchRecords } from "./launchStore.ts";
import { queuedIdentity } from "./startOrigin.ts";
import { commitAll, git } from "./storyReviewWorktree.ts";
import {
  adHocReview,
  keepLandedAdHoc,
  landedAdHocRecord,
  retiredWorkspace,
  sessionQuery,
  twoRevisionRepo,
} from "./adHocReview.ts";
import type { APIRequestContext } from "@playwright/test";
import type { DashboardServer } from "./dashboardServer.ts";
import { expect } from "@playwright/test";

export async function expectLandedAfterTrunkAdvance(
  request: APIRequestContext,
  dashboard: DashboardServer,
) {
  const repository = await twoRevisionRepo(
    "delivered.txt",
    "before\n",
    "after\n",
  );
  try {
    const base = repository.revisions.base;
    const revision = repository.revisions.result;
    const launchedAt = "2026-01-02T12:00:00.000Z";
    const sessionId = "ad-hoc-landed-session";
    keepLandedAdHoc(dashboard, {
      sessionId,
      title: "Landed ad hoc",
      workspace: retiredWorkspace(dashboard.home, "retired-ad-hoc"),
      branch: "ad-hoc/landed",
      repository: repository.integration,
      base,
      revision,
      launchedAt,
    });
    writeFileSync(
      path.join(repository.integration, "later-trunk.txt"),
      "later\n",
    );
    commitAll(repository.integration, "later trunk after capture");
    const advanced = git(repository.integration, "rev-parse", "HEAD");
    expect(advanced).not.toBe(revision);
    const indexPath = path.join(repository.integration, ".git", "index");
    const index = readFileSync(indexPath);
    const answer = await adHocReview(request, dashboard, sessionId);
    expect(answer).toMatchObject({
      kind: "landed",
      baseline: base,
      tree: revision,
      landing: {
        workflow: "ad-hoc",
        launchedAt,
        remote: "origin",
        target: "refs/heads/main",
        base,
        revision,
      },
      files: [
        expect.objectContaining({ path: "delivered.txt", kind: "modified" }),
      ],
    });
    expect(answer.runs).toBeUndefined();
    expect(answer.selectedRun).toBeUndefined();
    expect(
      "repository" in (answer.kind === "landed" ? answer.landing : {}),
    ).toBe(false);
    expect(git(repository.integration, "rev-parse", "HEAD")).toBe(advanced);
    expect(readFileSync(indexPath)).toEqual(index);
  } finally {
    await repository.cleanup();
  }
}

export async function expectSessionSubjectRefusals(
  request: APIRequestContext,
  dashboard: DashboardServer,
) {
  keepLaunchRecords(dashboard, [
    makeMe.aLaunchRecord
      .executing({ identity: queuedIdentity, title: "Story A" })
      .onStoryBranch({
        workspace: path.join(dashboard.home, "story-session"),
        branch: "story-a",
        tracking: "one-shot",
        role: "isolated",
        landing: "auto-land",
      })
      .inClaudeSession({ sessionId: "story-session", shortId: "story" })
      .markedDone()
      .please(),
  ]);
  for (const [query, status, error] of [
    [
      sessionQuery("story-session"),
      400,
      "This session belongs to a story launch and is reviewed by its story.",
    ],
    [
      sessionQuery("no-such-session"),
      404,
      "This dashboard launched no such session for this project.",
    ],
    [
      {
        source: "open-dough",
        identity: queuedIdentity,
        host: "claude",
        session: "story-session",
      },
      400,
      "The review names both a story and a session.",
    ],
  ] as const) {
    const response = await getReview(
      request,
      dashboard,
      storyReviewEndpoint,
      query,
    );
    expect(response.status(), JSON.stringify(query)).toBe(status);
    expect(await response.json()).toEqual({ error });
  }
}

export async function expectDefaultLaunchNotCaptured(
  request: APIRequestContext,
  dashboard: DashboardServer,
) {
  const sessionId = "default-no-landing";
  keepLaunchRecords(dashboard, [
    makeMe.aLaunchRecord
      .adHoc({ title: "Default", instruction: "Push with plain Git." })
      .inClaudeSession({ sessionId, shortId: "default" })
      .markedDone()
      .please(),
  ]);
  const response = await getReview(
    request,
    dashboard,
    storyReviewEndpoint,
    sessionQuery(sessionId),
  );
  expect(response.status()).toBe(200);
  expect(await response.json()).toEqual({
    kind: "landing-unavailable",
    explanation: "This session's changes were not captured.",
  });
}

export async function expectUnreadableLandingGaps(
  request: APIRequestContext,
  dashboard: DashboardServer,
) {
  const repository = await twoRevisionRepo("kept.txt", "before\n", "after\n");
  try {
    const base = repository.revisions.base;
    const revision = repository.revisions.result;
    const home = dashboard.home;
    keepLaunchRecords(dashboard, [
      landedAdHocRecord({
        sessionId: "missing-repo",
        title: "Missing repo",
        workspace: retiredWorkspace(home, "unreadable-ad-hoc"),
        branch: "ad-hoc/missing-repo",
        repository: path.join(home, "gone-landing-repo"),
        base,
        revision,
      }),
      landedAdHocRecord({
        sessionId: "missing-objects",
        title: "Missing objects",
        workspace: retiredWorkspace(home, "unreadable-ad-hoc-objects"),
        branch: "ad-hoc/missing-objects",
        repository: repository.integration,
        base,
        revision,
      }),
    ]);
    expect(await adHocReview(request, dashboard, "missing-repo")).toEqual({
      kind: "landing-unavailable",
      explanation: "The captured landing repository is missing or unreadable.",
    });
    unlinkSync(
      path.join(
        repository.integration,
        ".git",
        "objects",
        revision.slice(0, 2),
        revision.slice(2),
      ),
    );
    expect(await adHocReview(request, dashboard, "missing-objects")).toEqual({
      kind: "landing-unavailable",
      explanation:
        "The captured landing comparison objects are missing or unreadable.",
    });
  } finally {
    await repository.cleanup();
  }
}

export async function expectEmptySameTreeLanding(
  request: APIRequestContext,
  dashboard: DashboardServer,
) {
  const repository = await materializeLocalCheckout(
    undefined,
    makeMe.aRepository
      .withRevision("same", {
        backlog: null,
        files: { "unchanged.txt": "same\n" },
      })
      .please(),
  );
  try {
    const tip = repository.revisions.same;
    const sessionId = "empty-landing";
    keepLandedAdHoc(dashboard, {
      sessionId,
      title: "Empty landing",
      workspace: retiredWorkspace(dashboard.home, "empty-ad-hoc"),
      branch: "ad-hoc/empty",
      repository: repository.integration,
      base: tip,
      revision: tip,
    });
    expect(await adHocReview(request, dashboard, sessionId)).toMatchObject({
      kind: "landed",
      baseline: tip,
      tree: tip,
      files: [],
    });
  } finally {
    await repository.cleanup();
  }
}
