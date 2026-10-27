import { expect, test } from "../support/preparationPage.ts";
import {
  getReview as get,
  completedStoryQuery as named,
  completedReviewQuery as completed,
} from "../support/completedReviewRequests.ts";
import {
  completedPublishedStory,
  advanceCompletedTrunk,
} from "../support/completedPublishedStory.ts";
import { queuedIdentity } from "../support/startOrigin.ts";
import { git, writeAt } from "../support/storyReviewWorktree.ts";
import { doneRecordFileName } from "../../../src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs";
import {
  storyReviewEndpoint,
  storyReviewFileEndpoint,
  storyReviewMarkEndpoint,
  storyReviewSchema,
} from "../../src/storyReviewContract.ts";
import { realpathSync, renameSync } from "node:fs";
import path from "node:path";

test.use({ serverMode: "boundary" });

for (const mode of ["trunk", "story-branch"] as const) {
  test(`${mode} completion isolates interleaved work and admits only its fixed literal files`, async ({
    request,
    dashboard,
    origin,
  }) => {
    // This matrix executes real Git attribution separately for each HTTP read.
    test.slow();
    const { completion } = await completedPublishedStory(origin, mode);
    const response = await get(
      request,
      dashboard,
      storyReviewEndpoint,
      completed,
    );
    expect(response.status()).toBe(200);
    const review = storyReviewSchema.parse(await response.json());
    expect(review.kind).toBe("published");
    if (review.kind !== "published") throw new Error("No published review");
    expect(review.completion).toBe(completion);
    expect(review.files.map((file) => file.path)).toContain("shared.txt");
    expect(review.files.map((file) => file.path)).not.toContain(
      "other-story.txt",
    );
    expect(review.files.map((file) => file.path)).not.toContain(
      "integration-other.txt",
    );
    const file = {
      ...named,
      completion,
      baseline: review.baseline,
      tree: review.tree,
      path: "[literal]*.txt",
    };
    const remote = git(origin.project, "config", "--get", "remote.origin.url");
    git(
      origin.project,
      "config",
      "remote.origin.url",
      `${origin.machine}/unreachable.git`,
    );
    const accepted = await get(
      request,
      dashboard,
      storyReviewFileEndpoint,
      file,
    );
    expect(accepted.status()).toBe(200);
    expect(await accepted.json()).toMatchObject({
      kind: "diff",
      printed: expect.stringContaining("+delivered on another machine"),
    });
    const shared = await get(request, dashboard, storyReviewFileEndpoint, {
      ...file,
      path: "shared.txt",
    });
    expect(await shared.json()).toMatchObject({
      kind: "diff",
      printed: expect.stringContaining("+story first"),
    });
    const printed = ((await shared.json()) as { printed: string }).printed;
    expect(printed).not.toContain("+other last");
    expect(printed).not.toContain("-line 11");
    for (const [change, status] of [
      [{ source: "elsewhere" }, 404],
      [{ identity: "SEED-B#b" }, 409],
      [{ completion: review.tree }, 409],
      [{ completion: "HEAD" }, 400],
      [{ baseline: review.tree }, 409],
      [{ tree: review.baseline }, 409],
      [{ path: "other-story.txt" }, 409],
      [{ path: "*.txt" }, 409],
      [{ path: "../[literal]*.txt" }, 409],
      [{ oldPath: "shared.txt" }, 409],
      [{ repository: origin.project }, 400],
      [{ reference: "00000000-0000-4000-8000-000000000000" }, 400],
    ] as const) {
      expect(
        (
          await get(request, dashboard, storyReviewFileEndpoint, {
            ...file,
            ...change,
          })
        ).status(),
        JSON.stringify(change),
      ).toBe(status);
    }
    expect(
      (
        await request.get(
          `${dashboard.baseURL}${storyReviewEndpoint}?${new URLSearchParams(completed)}`,
          { headers: { Origin: "https://elsewhere.test" } },
        )
      ).status(),
    ).toBe(403);
    const mark = await request.post(
      `${dashboard.baseURL}${storyReviewMarkEndpoint}`,
      {
        headers: { Origin: dashboard.origin },
        data: { ...named, baseline: review.baseline, tree: review.tree },
      },
    );
    expect(mark.status()).toBe(404);
    git(origin.project, "config", "remote.origin.url", remote);
    advanceCompletedTrunk(origin);
    expect(
      storyReviewSchema.parse(
        await (
          await get(request, dashboard, storyReviewEndpoint, completed)
        ).json(),
      ),
    ).toEqual(review);
    const fixed = await get(request, dashboard, storyReviewFileEndpoint, file);
    expect(await fixed.json()).toEqual(await accepted.json());
  });
}

test("a configured project folder cannot borrow a parent checkout's published history or file diffs", async ({
  request,
  dashboard,
  origin,
}) => {
  await completedPublishedStory(origin);
  const review = storyReviewSchema.parse(
    await (
      await get(request, dashboard, storyReviewEndpoint, completed)
    ).json(),
  );
  if (review.kind !== "published")
    throw new Error("No initial published review");
  const metadata = path.join(origin.project, ".git");
  const parentMetadata = path.join(path.dirname(origin.project), ".git");
  renameSync(metadata, parentMetadata);
  try {
    // Git would otherwise walk upwards and read this other checkout's trees.
    expect(
      realpathSync(git(origin.project, "rev-parse", "--show-toplevel")),
    ).toBe(realpathSync(path.dirname(origin.project)));
    const parent = path.dirname(origin.project);
    // Publish the done evidence where Git's child-relative pathspec finds it.
    // These are actual commits in the parent checkout, not a review answer.
    git(
      parent,
      "update-ref",
      "refs/heads/main",
      git(parent, "rev-parse", "origin/main"),
    );
    git(parent, "read-tree", "origin/main");
    const done = `.planning/done/${doneRecordFileName(queuedIdentity)}`;
    writeAt(origin.project, done, git(parent, "show", `origin/main:${done}`));
    git(parent, "add", "--", `${path.basename(origin.project)}/.planning/done`);
    git(
      parent,
      "commit",
      "--quiet",
      "-m",
      "parent checkout publishes nested completion evidence",
    );
    git(parent, "push", "--quiet", "origin", "HEAD:main");
    const other = await get(request, dashboard, storyReviewEndpoint, completed);
    expect(other.status()).toBe(200);
    expect(await other.json()).toMatchObject({
      kind: "unavailable",
      explanation: expect.stringContaining("configured project folder"),
    });
    expect(await other.json()).not.toHaveProperty("files");
    const file = await get(request, dashboard, storyReviewFileEndpoint, {
      ...named,
      completion: review.completion,
      baseline: review.baseline,
      tree: review.tree,
      path: "[literal]*.txt",
    });
    expect(file.status()).toBe(409);
    expect(await file.json()).toMatchObject({
      error: expect.stringContaining("configured project folder"),
    });
  } finally {
    renameSync(parentMetadata, metadata);
  }
});
