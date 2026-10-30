import { execFileSync } from "node:child_process";
import path from "node:path";
import { expect, test } from "../support/preparationPage.ts";
import {
  getReview,
  completedReviewQuery,
  completedStoryQuery,
} from "../support/completedReviewRequests.ts";
import { completedPublishedStory } from "../support/completedPublishedStory.ts";
import { agentWorktree } from "../support/agentAuthoredWorktree.ts";
import { commitAll, git, writeAt } from "../support/storyReviewWorktree.ts";
import { commitAllAs, push } from "../support/storyReviewTrunkCommits.ts";
import {
  agentIdentity,
  renderAgentProfile,
} from "../../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import { doneRecordFileName } from "../../../src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs";
import { queuedIdentity } from "../support/startOrigin.ts";
import {
  storyReviewEndpoint,
  storyReviewFileEndpoint,
  storyReviewSchema,
} from "../../src/storyReviewContract.ts";

test.use({ serverMode: "boundary" });

test("a returned story recovers its unique published execution agent and keeps its fixed file review", async ({
  request,
  dashboard,
  origin,
}) => {
  const story = await completedPublishedStory(origin, "trunk", "returned");
  const record = `.planning/done/${doneRecordFileName(queuedIdentity)}`;
  expect(
    JSON.parse(git(origin.project, "show", `${story.completion}:${record}`)),
  ).not.toHaveProperty("agent");
  const read = async () =>
    storyReviewSchema.parse(
      await (
        await getReview(
          request,
          dashboard,
          storyReviewEndpoint,
          completedReviewQuery,
        )
      ).json(),
    );
  const review = await read();
  expect(review).toMatchObject({
    kind: "published",
    completion: story.completion,
    agent: story.agent,
  });
  if (review.kind !== "published") throw new Error("No recovered review");
  const future = await agentWorktree(
    origin,
    "Airi-chan",
    "later-claim",
    story.completion,
  );
  writeAt(
    future,
    ".planning/agents/airi-chan.json",
    renderAgentProfile({
      name: "Airi",
      identity: queuedIdentity,
      mode: "trunk",
      branch: "exec/later-claim",
    }),
  );
  commitAll(future, "later claim must not change the historical review");
  push(future);
  git(origin.project, "worktree", "remove", future);
  expect(await read()).toEqual(review);
  const file = await getReview(request, dashboard, storyReviewFileEndpoint, {
    ...completedStoryQuery,
    completion: review.completion,
    baseline: review.baseline,
    tree: review.tree,
    path: "[literal]*.txt",
  });
  expect(await file.json()).toMatchObject({
    kind: "diff",
    printed: expect.stringContaining("+delivered on another machine"),
  });
  expect(
    JSON.parse(git(origin.project, "show", `${story.completion}:${record}`)),
  ).not.toHaveProperty("agent");
});

test("an agentless completion refuses conflicting published execution owners", async ({
  request,
  dashboard,
  origin,
}) => {
  await completedPublishedStory(origin, "trunk", "returned-takeover");
  const response = await getReview(
    request,
    dashboard,
    storyReviewEndpoint,
    completedReviewQuery,
  );
  expect(await response.json()).toMatchObject({
    kind: "unavailable",
    explanation: expect.stringContaining("multiple execution agents"),
  });
});

for (const preparation of [false, true]) {
  test(`an agentless completion with ${preparation ? "only preparation" : "no claim"} history is not attributed`, async ({
    request,
    dashboard,
    origin,
  }) => {
    if (preparation) {
      const agent = agentIdentity("Airi");
      writeAt(
        origin.project,
        `.planning/${agent.path}`,
        renderAgentProfile({
          name: "Airi",
          identity: queuedIdentity,
          activity: "preparation",
        }),
      );
      commitAllAs(
        origin.project,
        "published preparation is no execution claim",
        agent,
      );
    }
    execFileSync(
      process.execPath,
      [
        path.join(
          origin.project,
          ".claude/skills/dough-product-backlog/scripts/product-backlog.mjs",
        ),
        "complete",
        "--identity",
        queuedIdentity,
      ],
      { cwd: origin.project },
    );
    commitAll(origin.project, "complete without an execution claim");
    push(origin.project);
    const response = await getReview(
      request,
      dashboard,
      storyReviewEndpoint,
      completedReviewQuery,
    );
    expect(await response.json()).toMatchObject({
      kind: "unavailable",
      explanation: expect.stringContaining("published execution claim"),
    });
  });
}

test("an agentless completion refuses shallow claim history", async ({
  request,
  dashboard,
  origin,
}) => {
  await completedPublishedStory(origin, "trunk", "returned");
  git(origin.project, "fetch", "--quiet", "--depth=1", "origin", "main");
  const response = await getReview(
    request,
    dashboard,
    storyReviewEndpoint,
    completedReviewQuery,
  );
  expect(await response.json()).toMatchObject({
    kind: "unavailable",
    explanation: expect.stringContaining("shallow"),
  });
});
