// An ad hoc review names the project and session and reads the retained
// landing after the worktree is gone and trunk has advanced.
import path from "node:path";
import { readFileSync, writeFileSync } from "node:fs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { materializeLocalCheckout } from "../../../Distribution/tests/support/repository-fixture.mjs";
import {
  storyReviewEndpoint,
  storyReviewSchema,
} from "../../src/storyReviewContract.ts";
import { reviewedWorkQuery } from "../../src/reviewedWorkSubject.ts";
import { test, expect } from "../../tests/support/codexStart.ts";
import { getReview } from "../../tests/support/completedReviewRequests.ts";
import { keepLaunchRecords } from "../../tests/support/launchStore.ts";
import { queuedIdentity } from "../../tests/support/startOrigin.ts";
import { commitAll, git } from "../../tests/support/storyReviewWorktree.ts";

test.use({ serverMode: "boundary" });

test("a kept ad hoc landing answers as landed after worktree removal and trunk advance", async ({
  request,
  dashboard,
}) => {
  const repository = await materializeLocalCheckout(
    undefined,
    makeMe.aRepository
      .withRevision("base", {
        backlog: null,
        files: { "delivered.txt": "before\n" },
      })
      .withRevision("result", {
        backlog: null,
        files: { "delivered.txt": "after\n" },
      })
      .please(),
  );
  try {
    const base = repository.revisions.base;
    const revision = repository.revisions.result;
    const workspace = path.join(dashboard.home, "retired-ad-hoc");
    const launchedAt = "2026-01-02T12:00:00.000Z";
    const sessionId = "ad-hoc-landed-session";
    const record = makeMe.aLaunchRecord
      .adHoc({
        title: "Landed ad hoc",
        instruction: "Deliver the change.",
      })
      .inIsolatedWorkspace({ workspace, branch: "ad-hoc/landed" })
      .inClaudeSession({ sessionId, shortId: "ad-hoc" })
      .launchedAt(launchedAt)
      .withLanding(
        makeMe.aLaunchLanding
          .capturedFrom({ repository: repository.integration })
          .comparing({ base, revision })
          .please(),
      )
      .markedDone()
      .please();
    keepLaunchRecords(dashboard, [record]);
    expect(git(repository.integration, "rev-parse", "HEAD")).toBe(revision);
    writeFileSync(
      path.join(repository.integration, "later-trunk.txt"),
      "later\n",
    );
    commitAll(repository.integration, "later trunk after capture");
    const advanced = git(repository.integration, "rev-parse", "HEAD");
    expect(advanced).not.toBe(revision);
    const before = {
      head: advanced,
      index: path.join(repository.integration, ".git", "index"),
    };
    const index = readFileSync(before.index);
    const query = reviewedWorkQuery({
      source: "open-dough",
      host: "claude",
      session: sessionId,
    });
    const response = await getReview(
      request,
      dashboard,
      storyReviewEndpoint,
      query,
    );
    expect(response.status()).toBe(200);
    const answer = storyReviewSchema.parse(await response.json());
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
        expect.objectContaining({
          path: "delivered.txt",
          kind: "modified",
        }),
      ],
    });
    expect(answer.runs).toBeUndefined();
    expect(answer.selectedRun).toBeUndefined();
    expect(
      "repository" in (answer.kind === "landed" ? answer.landing : {}),
    ).toBe(false);
    expect(git(repository.integration, "rev-parse", "HEAD")).toBe(before.head);
    expect(readFileSync(before.index)).toEqual(index);
  } finally {
    await repository.cleanup();
  }
});

test("ad hoc review refuses a story session, an unknown session, and a dual subject", async ({
  request,
  dashboard,
}) => {
  const workspace = path.join(dashboard.home, "story-session");
  const story = makeMe.aLaunchRecord
    .executing({ identity: queuedIdentity, title: "Story A" })
    .onStoryBranch({
      workspace,
      branch: "story-a",
      tracking: "one-shot",
      role: "isolated",
      landing: "auto-land",
    })
    .inClaudeSession({ sessionId: "story-session", shortId: "story" })
    .launchedAt("2026-01-02T00:00:00.000Z")
    .markedDone()
    .please();
  keepLaunchRecords(dashboard, [story]);
  const storySession = reviewedWorkQuery({
    source: "open-dough",
    host: "claude",
    session: "story-session",
  });
  const unknown = reviewedWorkQuery({
    source: "open-dough",
    host: "claude",
    session: "no-such-session",
  });
  const both = {
    source: "open-dough",
    identity: queuedIdentity,
    host: "claude",
    session: "story-session",
  };
  for (const [query, status, error] of [
    [
      storySession,
      400,
      "This session belongs to a story launch and is reviewed by its story.",
    ],
    [unknown, 404, "This dashboard launched no such session for this project."],
    [both, 400, "The review names both a story and a session."],
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
});
