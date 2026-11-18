// The captured comparison survives worktree removal and later trunk commits.
import path from "node:path";
import { readFileSync, writeFileSync } from "node:fs";
import { expect, test } from "../../test-support/support/codexStart.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { materializeLocalCheckout } from "../../../Distribution/tests/support/repository-fixture.mjs";
import { adHocReview } from "../../test-support/support/adHocReview.ts";
import { keepLaunchRecords } from "../../test-support/support/launchStore.ts";
import {
  commitAll,
  git,
} from "../../test-support/support/storyReviewWorktree.ts";

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
      .withRevision("result", { files: { "delivered.txt": "after\n" } })
      .please(),
  );
  try {
    const base = repository.revisions.base;
    const revision = repository.revisions.result;
    const launchedAt = "2026-01-02T12:00:00.000Z";
    const sessionId = "ad-hoc-landed-session";
    keepLaunchRecords(dashboard, [
      makeMe.aLaunchRecord
        .adHoc({ title: "Landed ad hoc" })
        .inIsolatedWorkspace({
          workspace: path.join(dashboard.home, "retired-ad-hoc"),
          branch: "ad-hoc/landed",
        })
        .inClaudeSession({ sessionId })
        .withLanding(
          makeMe.aLaunchLanding
            .capturedFrom({ repository: repository.integration })
            .comparing({ base, revision }),
        )
        .launchedAt(launchedAt)
        .markedDone()
        .please(),
    ]);
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
});

test("an ad hoc landing whose base and revision hold the same tree is landed empty", async ({
  request,
  dashboard,
}) => {
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
    keepLaunchRecords(dashboard, [
      makeMe.aLaunchRecord
        .adHoc({ title: "Empty landing" })
        .inIsolatedWorkspace({
          workspace: path.join(dashboard.home, "empty-landing-retired"),
          branch: "ad-hoc/landed",
        })
        .inClaudeSession({ sessionId })
        .withLanding(
          makeMe.aLaunchLanding
            .capturedFrom({ repository: repository.integration })
            .comparing({ base: tip, revision: tip }),
        )
        .markedDone()
        .please(),
    ]);

    expect(await adHocReview(request, dashboard, sessionId)).toMatchObject({
      kind: "landed",
      baseline: tip,
      tree: tip,
      files: [],
    });
  } finally {
    await repository.cleanup();
  }
});
