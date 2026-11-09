// Literal-file admission is independent of the completed comparison's
// interleaved-work and later-trunk stability journey.
import { expect, test } from "../../tests/support/preparationPage.ts";
import {
  getReview as get,
  completedStoryQuery as named,
  completedReviewQuery as completed,
} from "../../tests/support/completedReviewRequests.ts";
import { completedPublishedStory } from "../../tests/support/completedPublishedStory.ts";
import { git } from "../../tests/support/storyReviewWorktree.ts";
import {
  storyReviewEndpoint,
  storyReviewFileEndpoint,
  storyReviewMarkEndpoint,
  storyReviewSchema,
} from "../../src/storyReviewContract.ts";

test.use({ serverMode: "boundary" });

for (const mode of ["trunk", "story-branch"] as const)
  test(`${mode} completion refuses mismatched literal-file identities, paths, callers and review marks`, async ({
    request,
    dashboard,
    origin,
  }) => {
    const { completion } = await completedPublishedStory(origin, mode);
    const response = await get(
      request,
      dashboard,
      storyReviewEndpoint,
      completed,
    );
    expect(response.status()).toBe(200);
    const review = storyReviewSchema.parse(await response.json());
    expect(review).toMatchObject({ kind: "published", completion });
    if (review.kind !== "published") throw new Error("No published review");
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
    try {
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
      const fixed = await get(
        request,
        dashboard,
        storyReviewFileEndpoint,
        file,
      );
      expect(fixed.status()).toBe(200);
      expect(await fixed.json()).toEqual(await accepted.json());
    } finally {
      git(origin.project, "config", "remote.origin.url", remote);
    }
  });
