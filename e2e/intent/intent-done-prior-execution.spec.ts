// A launch's fixed first publication may precede its story's CLI completion.
// Done Intent must read that completion, not the earlier retained increment.
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import { writeRevisionFiles } from "../../Distribution/tests/support/repository-revision-files.mjs";
import { authenticatedReadEndpoint } from "../../dashboard/src/authenticatedReadRules.ts";
import {
  storyReviewEndpoint,
  storyReviewSchema,
} from "../../dashboard/src/storyReviewContract.ts";
import {
  completedReviewQuery,
  getReview,
} from "../../dashboard/test-support/support/completedReviewRequests.ts";
import { publishCommittedOrigin } from "../../dashboard/test-support/committedOrigin.ts";
import { expandIntentGroup } from "../../dashboard/test-support/intentPerspectivePage.ts";
import {
  expect,
  test,
} from "../../dashboard/test-support/support/codexStart.ts";
import {
  chooseStoryTab,
  intentDiff,
} from "../../dashboard/test-support/support/intentStoryPage.ts";
import { publishIntentTrunk } from "../../dashboard/test-support/support/intentStoryWorktree.ts";
import { commitBacklogCompletion } from "../../dashboard/test-support/support/completedStoryPublication.ts";
import { capturedPublicationSchema } from "../../dashboard/test-support/support/launchLanding.ts";
import { selectDoneStoryInIntent } from "../../dashboard/test-support/support/selectDoneStoryInIntent.ts";
import {
  claimedLaunchWithStoryCommit,
  claimedRecord,
} from "../../dashboard/test-support/support/storyBranchIntegration.ts";
import { shallowPublishedHistory } from "../../dashboard/test-support/support/reviewRepositoryFixture.ts";
import {
  commitAll,
  lines,
} from "../../dashboard/test-support/support/storyReviewWorktree.ts";

const modified = "Modified dashboard/tests/a.spec.ts";

test.beforeAll(({ queuedCodexOriginReady }) =>
  Promise.resolve(queuedCodexOriginReady),
);

test("a Done story's later completion outranks its execution launch's first captured increment", async ({
  page,
  request,
  dashboard,
  origin,
  codexProtocol,
}) => {
  if (codexProtocol === undefined) throw new Error("No native fixture");
  publishIntentTrunk(origin.project);
  const revisions = makeMe.aRepository
    .withRevision("first-increment", {
      backlog: null,
      files: {
        "dashboard/tests/a.spec.ts": `${lines("a")}earlier captured increment\n`,
      },
    })
    .withRevision("completed", {
      backlog: null,
      files: {
        "dashboard/tests/a.spec.ts": `${lines("a")}the final completed execution\n`,
      },
    })
    .please().revisions;
  const first = revisions[0];
  const completed = revisions[1];
  if (completed === undefined) throw new Error("Missing completion facts");
  const story = await claimedLaunchWithStoryCommit(origin, dashboard, false, {
    host: "codex",
    storyWork(workspace) {
      writeRevisionFiles(workspace, first);
      commitAll(workspace, "first test increment before completion");
    },
  });
  const captured = capturedPublicationSchema.parse(await story.integrated())
    .landing.receipt;
  writeRevisionFiles(story.workspace, completed);
  const completion = commitBacklogCompletion(
    story.workspace,
    "complete after the first captured increment",
  );
  const later = story.laterTrunkPublication("after-completion.txt");
  const published = await later.withoutContext();
  expect(published.ok, published.stderr).toBe(true);
  expect((await claimedRecord(dashboard)).landing?.revision).toBe(
    captured.revision,
  );
  expect(completion).not.toBe(captured.revision);
  const locations: string[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (
      url.pathname === authenticatedReadEndpoint &&
      url.searchParams.get("intent") === "locations"
    )
      locations.push(url.searchParams.get("revision") ?? "");
  });
  await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision: later.tip,
    repository: "terryyin/open-dough",
    follows: true,
  });
  const received = page.waitForResponse((response) => {
    const url = new URL(response.url());
    return (
      url.pathname === storyReviewEndpoint &&
      url.searchParams.get("historical") === "true"
    );
  });
  const { intent } = await selectDoneStoryInIntent(page);
  expect(storyReviewSchema.parse(await (await received).json())).toMatchObject({
    kind: "published",
    completion,
  });
  await chooseStoryTab(intent, "Changes");
  await expandIntentGroup(intent, "dashboard/tests");
  const original = await intentDiff(intent, modified);
  expect(original).toContain("the final completed execution");
  expect(original).not.toContain("earlier captured increment");
  expect(locations).toContain(completion);
  expect(locations).not.toContain(captured.revision);
  // If published history later becomes unavailable, the still-readable first
  // increment remains a pre-completion run, not the completed story's result.
  shallowPublishedHistory(origin);
  const unavailable = storyReviewSchema.parse(
    await (
      await getReview(request, dashboard, storyReviewEndpoint, {
        ...completedReviewQuery,
        historical: "true",
      })
    ).json(),
  );
  expect(unavailable).toMatchObject({
    kind: "unavailable",
    explanation: expect.stringMatching(/history|claim|completion/i),
  });
  expect(unavailable.selectedRun).toBeUndefined();
});
