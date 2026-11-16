// File diff and text admission scenarios for an ad hoc landed review.
import { randomUUID } from "node:crypto";
import {
  storyReviewFileEndpoint,
  storyReviewFileTextEndpoint,
  reviewedFileDiffSchema,
  reviewedFileTextSchema,
} from "../../src/storyReviewContract.ts";
import { getReview } from "./completedReviewRequests.ts";
import {
  adHocReview,
  keepLandedAdHoc,
  keepLandedAdHocPair,
  landedFileQuery,
  renameRevisionRepo,
  retiredWorkspace,
  showBlob,
} from "./adHocReview.ts";
import type { APIRequestContext } from "@playwright/test";
import type { DashboardServer } from "./dashboardServer.ts";
import { expect } from "@playwright/test";

export async function expectRenameFileAdmission(
  request: APIRequestContext,
  dashboard: DashboardServer,
) {
  const repository = await renameRevisionRepo();
  try {
    const sessionId = "ad-hoc-file-admit";
    keepLandedAdHoc(dashboard, {
      sessionId,
      title: "File admit",
      workspace: retiredWorkspace(dashboard.home, "file-admit-ad-hoc"),
      branch: "ad-hoc/file-admit",
      repository: repository.integration,
      base: repository.revisions.base,
      revision: repository.revisions.result,
    });
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
    const query = landedFileQuery(sessionId, answer, renamed);
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
      baseline: showBlob(repository.integration, answer.baseline, "old.txt"),
      tree: showBlob(repository.integration, answer.tree, "new.txt"),
    });
  } finally {
    await repository.cleanup();
  }
}

export async function expectForeignFileRefusals(
  request: APIRequestContext,
  dashboard: DashboardServer,
) {
  const repository = await renameRevisionRepo();
  try {
    const sessionId = "ad-hoc-file-refuse";
    const otherReference = randomUUID();
    keepLandedAdHocPair(
      dashboard,
      {
        sessionId,
        title: "File refuse",
        workspace: retiredWorkspace(dashboard.home, "file-refuse-ad-hoc"),
        branch: "ad-hoc/file-refuse",
        repository: repository.integration,
        base: repository.revisions.base,
        revision: repository.revisions.result,
        reference: randomUUID(),
      },
      {
        sessionId: "ad-hoc-other-session",
        title: "Other session",
        workspace: retiredWorkspace(dashboard.home, "file-refuse-other"),
        branch: "ad-hoc/file-refuse-other",
        repository: repository.integration,
        base: repository.revisions.base,
        revision: repository.revisions.result,
        reference: otherReference,
      },
    );
    const answer = await adHocReview(request, dashboard, sessionId);
    expect(answer.kind).toBe("landed");
    if (answer.kind !== "landed") throw new Error("expected landed");
    const renamed = answer.files.find((file) => file.kind === "renamed");
    if (renamed?.kind !== "renamed") throw new Error("expected rename");
    const file = landedFileQuery(sessionId, answer, renamed);
    const refused =
      "The file or comparison does not belong to this captured run.";
    for (const [endpoint, query] of [
      [storyReviewFileEndpoint, { ...file, path: "missing.txt" }],
      [storyReviewFileTextEndpoint, { ...file, baseline: answer.tree }],
      [storyReviewFileEndpoint, { ...file, reference: otherReference }],
    ] as const) {
      const response = await getReview(request, dashboard, endpoint, query);
      expect(response.status(), JSON.stringify(query)).toBe(409);
      expect(await response.json()).toEqual({ error: refused });
    }
  } finally {
    await repository.cleanup();
  }
}
