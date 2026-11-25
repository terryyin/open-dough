import {
  storyA,
  storyB,
} from "../../../Distribution/tests/support/queued-repository.mjs";
import { agentSettingsPath } from "../../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import { expect, test } from "../../test-support/support/preparationPage.ts";
import { ordinaryTrunkModeCompletedHistory } from "../../test-support/support/completedStoryHistory.ts";
import {
  advanceAfterCompletion,
  implemented,
  otherStory,
} from "../../test-support/support/completedStoryThroughInterleaving.ts";
import { completedReviewQuery } from "../../test-support/support/completedReviewRequests.ts";
import { queuedIdentity } from "../../test-support/support/startOrigin.ts";
import {
  commitAll,
  git,
  writeAt,
} from "../../test-support/support/storyReviewWorktree.ts";
import {
  storyResultRoute,
  storyResultSettings,
} from "../support/storyReviewResultRoute.ts";

test.use({ serverMode: "boundary" });

const subject = { source: "open-dough", identity: queuedIdentity };
const literal = "guides/:(glob)[literal]*.txt";

test.describe("published completion", () => {
  test.use({ originRepository: ordinaryTrunkModeCompletedHistory() });

  test("a Done result reads its immutable inventory and text after main advances", async ({
    origin,
    request,
    dashboard,
  }) => {
    await origin.publishRevision(advanceAfterCompletion);
    const review = storyResultRoute({ request, dashboard });
    const done = await review.review(completedReviewQuery);
    if (done.kind !== "published")
      throw new Error("Missing published comparison");
    const read = { subject, completion: done.completion, tree: done.tree };

    const inventory = await review.read(read);
    expect(inventory).toMatchObject({
      kind: "inventory",
      revision: origin.revision("completion"),
      locations: null,
    });
    if (inventory.kind !== "inventory") throw new Error("Missing inventory");
    expect(inventory.paths).toContain("[literal]*.txt");
    expect(inventory.paths).not.toContain("later.txt");
    expect(
      await review.read({ ...read, path: "other-story.txt" }),
    ).toMatchObject({
      kind: "text",
      text: otherStory["other-story.txt"],
    });
    expect(
      await review.read({ ...read, path: "[literal]*.txt" }),
    ).toMatchObject({
      kind: "text",
      text: implemented["[literal]*.txt"],
    });
  });

  test("a named result cannot use a different tree or a path outside it", async ({
    request,
    dashboard,
  }) => {
    const review = storyResultRoute({ request, dashboard });
    const done = await review.review(completedReviewQuery);
    if (done.kind !== "published")
      throw new Error("Missing published comparison");
    const read = { subject, completion: done.completion, tree: done.tree };

    expect(
      (await review.result({ ...read, tree: done.baseline })).status(),
    ).toBe(409);
    expect(
      (await review.result({ ...read, path: "../other-story.txt" })).status(),
    ).toBe(400);
    expect(await review.read({ ...read, path: "*.txt" })).toMatchObject({
      kind: "absent",
      path: "*.txt",
    });
  });
});

test("a Taken result keeps the named head's files, literal text and settings as its branch advances", async ({
  origin,
  request,
  dashboard,
}) => {
  const { branch, workspace } = await origin.publishTake({
    mode: "story-branch",
    agent: "Yui",
    story: storyA,
    queued: [storyB],
  });
  writeAt(workspace, agentSettingsPath, storyResultSettings("first"));
  writeAt(workspace, "first/first.spec.ts", "first test\n");
  writeAt(workspace, literal, "first head text\n");
  const first = commitAll(workspace, "Publish the first result");
  git(workspace, "push", "--quiet", "origin", `HEAD:refs/heads/${branch}`);
  const review = storyResultRoute({ request, dashboard });
  const published = await review.review({ ...subject, taken: "true" });
  if (published.kind !== "published-taken")
    throw new Error("Missing published head");

  writeAt(workspace, agentSettingsPath, storyResultSettings("second"));
  writeAt(workspace, "second/second.spec.ts", "another test\n");
  writeAt(workspace, literal, "second head text\n");
  const second = commitAll(workspace, "Advance the published branch");
  git(workspace, "push", "--quiet", "origin", `HEAD:refs/heads/${branch}`);
  const advanced = await review.review({ ...subject, taken: "true" });
  if (advanced.kind !== "published-taken")
    throw new Error("Missing new published head");
  const newer = { subject, publishedHead: second, tree: advanced.tree };
  expect(await review.read(newer)).toMatchObject({
    kind: "inventory",
    revision: second,
    locations: [{ path: "second", files: ["second/second.spec.ts"] }],
  });
  expect(await review.read({ ...newer, path: literal })).toMatchObject({
    kind: "text",
    revision: second,
    text: "second head text\n",
  });

  const read = { subject, publishedHead: first, tree: published.tree };
  const inventory = await review.read(read);
  expect(inventory).toMatchObject({
    kind: "inventory",
    revision: first,
    locations: [{ path: "first", files: ["first/first.spec.ts"] }],
  });
  if (inventory.kind !== "inventory") throw new Error("Missing inventory");
  expect(inventory.paths).toContain(literal);
  expect(inventory.paths).not.toContain("second/second.spec.ts");
  expect(await review.read({ ...read, path: literal })).toEqual({
    kind: "text",
    revision: first,
    path: literal,
    text: "first head text\n",
  });
});
