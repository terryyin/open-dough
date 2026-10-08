// Range admission accepts object points and exact optional integration evidence,
// while preserving the review's read-only story-workspace boundary.
import { storyReviewRangeEndpoint } from "../src/storyReview.ts";
import { expect, test } from "./support/preparationPage.ts";
import { queuedIdentity } from "./support/startOrigin.ts";
import { keepLaunchRecord } from "./support/storyLaunchRecord.ts";
import { git, observed, storyWorktree } from "./support/storyReviewWorktree.ts";

test("a range admits only exact story and object IDs and confirms the repository holds them", async ({
  page,
  dashboard,
  origin,
}) => {
  const { workspace, merged } = storyWorktree(origin);
  await keepLaunchRecord(dashboard, workspace);
  const tree = git(workspace, "rev-parse", "HEAD^{tree}");
  const query = {
    source: "open-dough",
    identity: queuedIdentity,
    fromTree: tree,
    fromBaseline: merged,
    tree,
    baseline: merged,
  };
  const before = observed(workspace);
  for (const invalid of [
    { ...query, fromTree: "HEAD" },
    { ...query, fromBaseline: "--output=/tmp/diff" },
    { ...query, workspace },
  ]) {
    const response = await page.request.get(
      `${dashboard.baseURL}${storyReviewRangeEndpoint}?${new URLSearchParams(invalid)}`,
      { headers: { Origin: dashboard.origin } },
    );
    expect(response.status()).toBe(400);
  }
  const response = await page.request.get(
    `${dashboard.baseURL}${storyReviewRangeEndpoint}?${new URLSearchParams({ ...query, tree: `${"0".repeat(39)}1` })}`,
    { headers: { Origin: dashboard.origin } },
  );
  expect(response.status()).toBe(200);
  expect(await response.json()).toMatchObject({ kind: "unavailable" });
  expect(git(workspace, "rev-parse", "origin/main")).toBe(merged);
  expect(observed(workspace)).toEqual(before);
});

test("integration evidence requires an exact array of object points whose objects the repository holds", async ({
  page,
  dashboard,
  origin,
}) => {
  const { workspace, merged } = storyWorktree(origin);
  await keepLaunchRecord(dashboard, workspace);
  const tree = git(workspace, "rev-parse", "HEAD^{tree}");
  const integration = {
    fromTree: git(workspace, "rev-parse", "HEAD^1^{tree}"),
    fromBaseline: git(workspace, "merge-base", "HEAD^1", "origin/main"),
    baseline: merged,
  };
  const query = {
    source: "open-dough",
    identity: queuedIdentity,
    fromTree: tree,
    fromBaseline: merged,
    tree,
    baseline: merged,
  };
  const before = observed(workspace);
  const read = async (integrations: string) =>
    page.request.get(
      `${dashboard.baseURL}${storyReviewRangeEndpoint}?${new URLSearchParams({ ...query, integrations })}`,
      { headers: { Origin: dashboard.origin } },
    );
  const valid = await read(JSON.stringify([integration]));
  expect(valid.status()).toBe(200);
  expect(await valid.json()).toMatchObject({ kind: "comparison", files: [] });
  for (const malformed of [
    "{",
    "null",
    JSON.stringify(integration),
    JSON.stringify([{ ...integration, fromTree: "HEAD" }]),
    JSON.stringify([{ ...integration, fromBaseline: "--output=/tmp/diff" }]),
    JSON.stringify([{ fromTree: tree, baseline: merged }]),
    JSON.stringify([{ ...integration, path: "src/c.ts" }]),
  ]) {
    expect((await read(malformed)).status()).toBe(400);
  }
  const duplicate = new URLSearchParams({ ...query, integrations: "[]" });
  duplicate.append("integrations", "[]");
  expect(
    (
      await page.request.get(
        `${dashboard.baseURL}${storyReviewRangeEndpoint}?${duplicate}`,
        {
          headers: { Origin: dashboard.origin },
        },
      )
    ).status(),
  ).toBe(400);
  for (const missing of [
    { ...integration, fromTree: `${"0".repeat(39)}1` },
    { ...integration, fromBaseline: tree },
    { ...integration, baseline: tree },
  ]) {
    const response = await read(JSON.stringify([missing]));
    expect(response.status()).toBe(200);
    expect(await response.json()).toMatchObject({ kind: "unavailable" });
  }
  expect(observed(workspace)).toEqual(before);
});
