// A Git without `merge-tree --write-tree` (older than 2.38) cannot read how
// the story's merge was resolved, so completed review explains that gap
// instead of a partial comparison. The server alone runs a `git` that refuses
// `merge-tree` the way such a Git does; every other command reaches real Git.
import { execFileSync } from "node:child_process";
import { chmodSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, test } from "../../tests/support/preparationPage.ts";
import {
  getReview,
  completedReviewQuery,
} from "../../tests/support/completedReviewRequests.ts";
import { completedPublishedStory } from "../../tests/support/completedPublishedStory.ts";
import { storyReviewEndpoint } from "../../src/storyReviewContract.ts";
import { writeAt } from "../../tests/support/storyReviewWorktree.ts";

test.use({
  serverMode: "boundary",
  // Playwright's fixture API requires the empty destructuring pattern.
  // eslint-disable-next-line no-empty-pattern
  pathPrefix: async ({}, use) => {
    const realGit = execFileSync("which", ["git"], { encoding: "utf8" }).trim();
    const bin = mkdtempSync(path.join(tmpdir(), "dough-old-git-"));
    writeAt(
      bin,
      "git",
      [
        "#!/bin/sh",
        'if [ "$1" = merge-tree ]; then',
        '  echo "error: unknown option \\`write-tree\'" >&2',
        "  exit 129",
        "fi",
        `exec '${realGit}' "$@"`,
        "",
      ].join("\n"),
    );
    chmodSync(path.join(bin, "git"), 0o755);
    await use([bin]);
    rmSync(bin, { recursive: true, force: true });
  },
});

test("a Git that cannot write merge trees explains the merge resolution gap without files", async ({
  request,
  dashboard,
  origin,
}) => {
  await completedPublishedStory(origin, "story-branch", "merge-edit");
  const response = await getReview(
    request,
    dashboard,
    storyReviewEndpoint,
    completedReviewQuery,
  );
  expect(response.status()).toBe(200);
  expect(await response.json()).toEqual({
    kind: "unavailable",
    explanation:
      "Published execution history contains a merge whose resolution evidence could not be read.",
  });
});
