// Historical admission binds source/story/reference/pair/path before any file read.
import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { test, expect } from "./support/codexStart.ts";
import { commit } from "./support/oneShotLanding.ts";
import {
  startReviewRun,
  captureReviewRun,
  retireReviewRun,
  repositoryObservation,
} from "./support/oneShotReview.ts";
import { queuedIdentity } from "./support/startOrigin.ts";
import {
  storyReviewEndpoint,
  storyReviewFileEndpoint,
  storyReviewMarkEndpoint,
  reviewedFileDiffSchema,
} from "../src/storyReview.ts";

test("foreign or malformed historical review requests cannot choose a repository, comparison, file, or mark", async ({
  page,
  dashboard,
  origin,
}) => {
  const run = await startReviewRun(dashboard);
  commit(run.established.workspace, "delivered.txt");
  const receipt = captureReviewRun(run, origin);
  retireReviewRun(run, origin, receipt.revision);
  const before = repositoryObservation(origin.project);
  const index = readFileSync(before.index);
  const named = {
    source: "open-dough",
    identity: queuedIdentity,
    reference: receipt.reference,
  };
  const file = {
    ...named,
    baseline: receipt.base,
    tree: receipt.revision,
    path: "delivered.txt",
  };
  for (const [endpoint, query, status] of [
    [storyReviewEndpoint, { ...named, source: "elsewhere" }, 404],
    [storyReviewEndpoint, { ...named, identity: "SEED-B#b" }, 404],
    [storyReviewEndpoint, { ...named, reference: randomUUID() }, 404],
    [storyReviewEndpoint, { ...named, reference: "HEAD" }, 400],
    [storyReviewEndpoint, { ...named, repository: origin.project }, 400],
    [storyReviewFileEndpoint, { ...file, baseline: receipt.revision }, 409],
    [storyReviewFileEndpoint, { ...file, tree: receipt.base }, 409],
    [
      storyReviewFileEndpoint,
      { ...file, path: ".planning/PRODUCT-BACKLOG.md" },
      409,
    ],
    [storyReviewFileEndpoint, { ...file, oldPath: "other.txt" }, 409],
    [storyReviewFileEndpoint, { ...file, path: "../delivered.txt" }, 409],
    [storyReviewFileEndpoint, { ...file, tree: "HEAD" }, 400],
    [
      storyReviewFileEndpoint,
      { ...file, workspace: run.established.workspace },
      400,
    ],
  ] as const) {
    const response = await page.request.get(
      `${dashboard.baseURL}${endpoint}?${new URLSearchParams(query)}`,
      { headers: { Origin: dashboard.origin } },
    );
    expect(response.status(), JSON.stringify(query)).toBe(status);
  }
  const crossOrigin = await page.request.get(
    `${dashboard.baseURL}${storyReviewEndpoint}?${new URLSearchParams(named)}`,
    { headers: { Origin: "https://elsewhere.test" } },
  );
  expect(crossOrigin.status()).toBe(403);
  const mark = await page.request.post(
    `${dashboard.baseURL}${storyReviewMarkEndpoint}`,
    {
      headers: { Origin: dashboard.origin },
      data: { ...named, baseline: receipt.base, tree: receipt.revision },
    },
  );
  expect(mark.status()).toBe(400);
  const valid = await page.request.get(
    `${dashboard.baseURL}${storyReviewFileEndpoint}?${new URLSearchParams(file)}`,
    { headers: { Origin: dashboard.origin } },
  );
  expect(valid.status()).toBe(200);
  expect(reviewedFileDiffSchema.parse(await valid.json())).toEqual({
    kind: "diff",
    printed: expect.stringContaining("+delivered.txt"),
  });
  expect(repositoryObservation(origin.project)).toEqual(before);
  expect(readFileSync(before.index)).toEqual(index);
});
