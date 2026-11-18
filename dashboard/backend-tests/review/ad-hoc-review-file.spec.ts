// File admission uses the captured reference, comparison and listed rename.
import { randomUUID } from "node:crypto";
import path from "node:path";
import { expect, test } from "../../tests/support/codexStart.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { materializeLocalCheckout } from "../../../Distribution/tests/support/repository-fixture.mjs";
import {
  storyReviewFileEndpoint,
  storyReviewFileTextEndpoint,
  reviewedFileDiffSchema,
  reviewedFileTextSchema,
} from "../../src/storyReviewContract.ts";
import { getReview } from "../../tests/support/completedReviewRequests.ts";
import { keepLaunchRecords } from "../../tests/support/launchStore.ts";
import { lines } from "../../tests/support/storyReviewWorktree.ts";
import {
  adHocReview,
  adHocSessionFileDiff,
} from "../../tests/support/adHocReview.ts";

test.use({ serverMode: "boundary" });

test("an ad hoc landed answer admits its file diff and text for a rename's old path", async ({
  request,
  dashboard,
}) => {
  const repository = await renameRevisionRepo();
  try {
    const sessionId = "ad-hoc-file-admit";
    keepLaunchRecords(dashboard, [
      makeMe.aLaunchRecord
        .adHoc({ title: "File admit" })
        .inIsolatedWorkspace({
          workspace: path.join(dashboard.home, "file-admit-retired"),
          branch: "ad-hoc/landed",
        })
        .inClaudeSession({ sessionId })
        .withLanding(
          makeMe.aLaunchLanding
            .capturedFrom({ repository: repository.integration })
            .comparing({
              base: repository.revisions.base,
              revision: repository.revisions.result,
            }),
        )
        .markedDone()
        .please(),
    ]);
    const answer = await adHocReview(request, dashboard, sessionId);
    expect(answer.kind).toBe("landed");
    if (answer.kind !== "landed") throw new Error("expected landed");
    const renamed = answer.files.find((file) => file.kind === "renamed");
    expect(renamed).toMatchObject({
      kind: "renamed",
      path: "new.txt",
      oldPath: "old.txt",
    });
    if (renamed?.kind !== "renamed") throw new Error("expected rename");
    const query = {
      source: "open-dough",
      host: "claude",
      session: sessionId,
      reference: answer.landing.reference,
      baseline: answer.baseline,
      tree: answer.tree,
      path: "new.txt",
      oldPath: "old.txt",
    };
    const diff = await getReview(
      request,
      dashboard,
      storyReviewFileEndpoint,
      query,
    );
    expect(diff.status()).toBe(200);
    expect(reviewedFileDiffSchema.parse(await diff.json())).toEqual({
      kind: "diff",
      printed: expect.stringContaining("renamed"),
    });
    const text = await getReview(
      request,
      dashboard,
      storyReviewFileTextEndpoint,
      query,
    );
    expect(text.status()).toBe(200);
    expect(reviewedFileTextSchema.parse(await text.json())).toEqual({
      kind: "text",
      baseline: lines("kept"),
      tree: `${lines("kept")}renamed\n`,
    });
  } finally {
    await repository.cleanup();
  }
});

for (const [subject, endpoint, field] of [
  ["a foreign path", storyReviewFileEndpoint, "path"],
  ["a foreign comparison", storyReviewFileTextEndpoint, "baseline"],
  ["another session's reference", storyReviewFileEndpoint, "reference"],
] as const) {
  test(`an ad hoc file read refuses ${subject}`, async ({
    request,
    dashboard,
  }) => {
    const repository = await renameRevisionRepo();
    try {
      const sessionId = "ad-hoc-file-refuse";
      const otherReference = randomUUID();
      keepLaunchRecords(dashboard, [
        makeMe.aLaunchRecord
          .adHoc({ title: "File refuse" })
          .inIsolatedWorkspace({
            workspace: path.join(dashboard.home, "file-refuse-retired"),
            branch: "ad-hoc/landed",
          })
          .inClaudeSession({ sessionId })
          .withLanding(
            makeMe.aLaunchLanding
              .capturedFrom({ repository: repository.integration })
              .forLaunch(randomUUID())
              .comparing({
                base: repository.revisions.base,
                revision: repository.revisions.result,
              }),
          )
          .markedDone()
          .please(),
        makeMe.aLaunchRecord
          .adHoc({ title: "Other session" })
          .inIsolatedWorkspace({
            workspace: path.join(dashboard.home, "other-session-retired"),
            branch: "ad-hoc/landed",
          })
          .withLanding(
            makeMe.aLaunchLanding
              .capturedFrom({ repository: repository.integration })
              .forLaunch(otherReference)
              .comparing({
                base: repository.revisions.base,
                revision: repository.revisions.result,
              }),
          )
          .markedDone()
          .please(),
      ]);
      const answer = await adHocReview(request, dashboard, sessionId);
      expect(answer.kind).toBe("landed");
      if (answer.kind !== "landed") throw new Error("expected landed");
      const file = {
        source: "open-dough",
        host: "claude",
        session: sessionId,
        reference: answer.landing.reference,
        baseline: answer.baseline,
        tree: answer.tree,
        path: "new.txt",
        oldPath: "old.txt",
      };
      const refused =
        "The file or comparison does not belong to this captured run.";
      const mismatches = {
        path: "missing.txt",
        baseline: answer.tree,
        reference: otherReference,
      };
      const response = await getReview(request, dashboard, endpoint, {
        ...file,
        [field]: mismatches[field],
      });
      expect(response.status()).toBe(409);
      expect(await response.json()).toEqual({ error: refused });
    } finally {
      await repository.cleanup();
    }
  });
}

test("a file read naming a kept run's pair of a session's commits is answered, and any other pair or path refused", async ({
  request,
  dashboard,
}) => {
  const repository = await renameRevisionRepo();
  try {
    const { base, result } = repository.revisions;
    const sessionId = "session-commits-file";
    keepLaunchRecords(dashboard, [
      makeMe.aLaunchRecord
        .adHoc({ title: "Session commits file" })
        .inDefaultCheckout({
          workspace: repository.integration,
          landing: "review",
          revision: base,
        })
        .inClaudeSession({ sessionId })
        .keptSessionCommits({
          repository: repository.integration,
          runs: [{ base, revision: result }],
        })
        .markedDone()
        .please(),
    ]);
    const read = (named: object) =>
      adHocSessionFileDiff(request, dashboard, sessionId, {
        baseline: base,
        tree: result,
        path: "new.txt",
        oldPath: "old.txt",
        ...named,
      });
    const kept = await read({});
    expect(kept.status()).toBe(200);
    expect(reviewedFileDiffSchema.parse(await kept.json())).toEqual({
      kind: "diff",
      printed: expect.stringContaining("renamed"),
    });
    for (const other of [{ baseline: result }, { path: "missing.txt" }]) {
      const refused = await read(other);
      expect(refused.status()).toBe(409);
      expect(await refused.json()).toEqual({
        error:
          "The file or comparison does not belong to this session's kept commits.",
      });
    }
  } finally {
    await repository.cleanup();
  }
});

// Enough identical lines that a small edit stays a rename under Git -M.
async function renameRevisionRepo() {
  const body = lines("kept");
  return materializeLocalCheckout(
    undefined,
    makeMe.aRepository
      .withRevision("base", {
        backlog: null,
        files: { "old.txt": body },
      })
      .withRevision("result", {
        backlog: null,
        remove: ["old.txt"],
        files: { "new.txt": `${body}renamed\n` },
      })
      .please(),
  );
}
