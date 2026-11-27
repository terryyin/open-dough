import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { expect, test } from "../../test-support/support/preparationPage.ts";
import { shallowPublishedHistory } from "../../test-support/support/reviewRepositoryFixture.ts";
import {
  getReview,
  completedReviewQuery,
  completedStoryQuery,
} from "../../test-support/support/completedReviewRequests.ts";
import {
  returnedCompletedHistory,
  returnedThenTakeoverCompletedHistory,
} from "../../test-support/support/completedStoryHistory.ts";
import { agentWorktree } from "../../test-support/support/agentAuthoredWorktree.ts";
import { git } from "../../test-support/support/storyReviewWorktree.ts";
import {
  commitAllAs,
  push,
} from "../../test-support/support/storyReviewTrunkCommits.ts";
import {
  agentIdentity,
  renderAgentProfile,
} from "../../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import { doneRecordFileName } from "../../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs";
import { queuedIdentity } from "../../test-support/support/startOrigin.ts";
import {
  storyReviewEndpoint,
  storyReviewFileEndpoint,
  storyReviewSchema,
} from "../../src/storyReviewContract.ts";

test.use({ serverMode: "boundary" });

const yui = agentIdentity("Yui").agent;
const doneRecord = `.planning/done/${doneRecordFileName(queuedIdentity)}`;

function publishedDoneRecord(
  project: string,
  completion: string,
): Record<string, unknown> {
  return JSON.parse(
    git(project, "show", `${completion}:${doneRecord}`),
  ) as Record<string, unknown>;
}

test.describe("returned", () => {
  test.use({ originRepository: returnedCompletedHistory() });

  test("a returned story recovers its unique published execution agent and keeps its fixed file review", async ({
    request,
    dashboard,
    origin,
  }) => {
    const completion = origin.revision("completion");
    expect(publishedDoneRecord(origin.project, completion)).not.toHaveProperty(
      "agent",
    );
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
      completion,
      agent: yui,
    });
    if (review.kind !== "published") throw new Error("No recovered review");
    const future = await agentWorktree(
      origin,
      "Airi-chan",
      "later-claim",
      completion,
    );
    makeMe
      .theWorkspace(future)
      .writeAt(
        ".planning/agents/airi-chan.json",
        renderAgentProfile(
          makeMe.anAgentProfile
            .executing({
              name: "Airi",
              identity: queuedIdentity,
              mode: "trunk",
              branch: "exec/later-claim",
            })
            .please(),
        ),
      )
      .commitAll("later claim must not change the historical review")
      .please();
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
    expect(publishedDoneRecord(origin.project, completion)).not.toHaveProperty(
      "agent",
    );
  });

  test("an agentless completion refuses shallow claim history", async ({
    request,
    dashboard,
    origin,
  }) => {
    expect(
      publishedDoneRecord(origin.project, origin.revision("completion")),
    ).not.toHaveProperty("agent");
    shallowPublishedHistory(origin);
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
});

test.describe("returned-takeover", () => {
  test.use({ originRepository: returnedThenTakeoverCompletedHistory() });

  test("an agentless completion refuses conflicting published execution owners", async ({
    request,
    dashboard,
    origin,
  }) => {
    expect(
      publishedDoneRecord(origin.project, origin.revision("completion")),
    ).not.toHaveProperty("agent");
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
});

for (const preparation of [false, true]) {
  test(`an agentless completion with ${preparation ? "only preparation" : "no claim"} history is not attributed`, async ({
    request,
    dashboard,
    origin,
  }) => {
    if (preparation) {
      const agent = agentIdentity("Airi");
      makeMe
        .theWorkspace(origin.project)
        .writeAt(
          `.planning/${agent.path}`,
          renderAgentProfile(
            makeMe.anAgentProfile
              .preparing({
                name: "Airi",
                identity: queuedIdentity,
              })
              .please(),
          ),
        )
        .please();
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
    makeMe
      .theWorkspace(origin.project)
      .commitAll("complete without an execution claim")
      .please();
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
