// A file-anchored follow-up of a Done story's Published completion over raw
// HTTP, with a real bare origin (../../tests/support/startOrigin.ts) and the
// synthetic `claude`: the request names the story, revision and file (and
// optional line), admission checks the file and that the line exists on its
// side, and the first input holds the story block, the file block and the
// request. Different anchors are separate launches; the same anchor and text
// resume the kept start. Landed-run admission and refusals:
// agent-launch-follow-up-file-admission.spec.ts. Story-only follow-ups:
// agent-launch-follow-up-story.spec.ts.

import { attempts, launch } from "../../tests/agentLaunchBoundary.ts";
import {
  completedRenamedFileStory,
  fileFactsOf,
  fileFollowUpOf,
  fileStoryContextOf,
  publishedReviewOf,
  renamedNewPath,
  renamedOldPath,
  serveDoneAtTrunk,
} from "../../tests/support/followUpCompletedFile.ts";
import { completedPublishedStory } from "../../tests/support/completedPublishedStory.ts";
import { expect, test } from "../../tests/support/preparationPage.ts";
import {
  answerOf,
  expectFollowUpInput,
  request,
} from "./followUpBoundaryCases.ts";

test.use({ serverMode: "boundary" });

test("a renamed file's new line 12 sends both paths, the comparison and the line, then the request", async ({
  dashboard,
  origin,
}) => {
  const { completion } = await completedRenamedFileStory(origin);
  const { revision, story } = await serveDoneAtTrunk(dashboard, origin);
  const review = await publishedReviewOf(dashboard, completion);
  const renamed = review.files.find((file) => file.path === renamedNewPath);
  expect(renamed?.kind).toBe("renamed");
  if (renamed?.kind !== "renamed") throw new Error("expected rename");
  const file = fileFactsOf(review, renamed, { line: 12, side: "new" });
  const context = fileStoryContextOf(story, file);
  expect(context).toContain(`- Path: ${renamedNewPath}`);
  expect(context).toContain(`- Old path: ${renamedOldPath}`);
  expect(context).toContain(`- Line: 12`);
  expect(context).toContain("- Side: new");
  expect(context).toContain(
    `Published completion ${file.baseline} → ${file.tree}`,
  );
  dashboard.claudeScenario("launched");
  const text = "Why did the rename keep the old assertion?";

  const launched = await answerOf(
    launch(dashboard, {
      ...request,
      instruction: text,
      followUp: fileFollowUpOf(revision, file),
    }),
  );

  expect(launched.kind, JSON.stringify(launched)).toBe("launched");
  const [call] = dashboard.claudeLaunchCalls();
  expectFollowUpInput(call?.argv.at(-1), {
    context,
    own: text,
    request: launched.record?.request,
    server: dashboard,
  });
});

test("a file that includes trunk's changes names that file's own base in the comparison", async ({
  dashboard,
  origin,
}) => {
  const { completion } = await completedPublishedStory(
    origin,
    "trunk",
    "inseparable",
  );
  const { revision, story } = await serveDoneAtTrunk(dashboard, origin);
  const review = await publishedReviewOf(dashboard, completion);
  const shared = review.files.find((file) => file.path === "shared.txt");
  expect(shared?.includesTrunkFrom).toBeDefined();
  if (shared === undefined || shared.includesTrunkFrom === undefined)
    throw new Error("expected includesTrunkFrom");
  const file = fileFactsOf(review, shared);
  expect(file.baseline).toBe(shared.includesTrunkFrom);
  expect(file.baseline).not.toBe(review.baseline);
  const context = fileStoryContextOf(story, file);
  expect(context).toContain(
    `Published completion ${shared.includesTrunkFrom} → ${review.tree}`,
  );
  dashboard.claudeScenario("launched");

  const launched = await answerOf(
    launch(dashboard, {
      ...request,
      instruction: "Check the mixed line",
      followUp: fileFollowUpOf(revision, file),
    }),
  );

  expect(launched.kind, JSON.stringify(launched)).toBe("launched");
  expect(dashboard.claudeLaunchCalls()[0]?.argv.at(-1)).toContain(context);
});

test("follow-ups of two lines are two launches, and repeating one resumes its kept start", async ({
  dashboard,
  origin,
}) => {
  const { completion } = await completedRenamedFileStory(origin);
  const { revision } = await serveDoneAtTrunk(dashboard, origin);
  const review = await publishedReviewOf(dashboard, completion);
  const renamed = review.files.find((file) => file.path === renamedNewPath);
  if (renamed?.kind !== "renamed") throw new Error("expected rename");
  const lineOf = (line: number) =>
    fileFollowUpOf(
      revision,
      fileFactsOf(review, renamed, { line, side: "new" }),
    );
  const start = (line: number) => ({
    ...request,
    instruction: "  ",
    policy: { workspace: "isolated", landing: "review" },
    followUp: lineOf(line),
  });
  dashboard.claudeScenario("refused");
  const refused = await answerOf(launch(dashboard, start(11)));
  expect(refused).toMatchObject({ kind: "failed", reason: "refused" });
  const [failed] = await attempts(dashboard);

  dashboard.claudeScenario("launched");
  const other = await answerOf(launch(dashboard, start(12)));
  const resumed = await answerOf(launch(dashboard, start(11)));

  expect(other.kind, JSON.stringify(other)).toBe("launched");
  expect(resumed.kind, JSON.stringify(resumed)).toBe("launched");
  const kept = await attempts(dashboard);
  expect(kept).toHaveLength(2);
  expect(kept).toContainEqual(
    expect.objectContaining({
      id: failed?.id,
      acceptedAt: failed?.acceptedAt,
    }),
  );
  expect(dashboard.claudeLaunchCalls()).toHaveLength(3);
});

test("a blank file follow-up sends the story and file context without a request block of its own", async ({
  dashboard,
  origin,
}) => {
  const { completion } = await completedPublishedStory(origin);
  const { revision, story } = await serveDoneAtTrunk(dashboard, origin);
  const review = await publishedReviewOf(dashboard, completion);
  const file = review.files.find((each) => each.path === "[literal]*.txt");
  if (file === undefined) throw new Error("expected literal file");
  const anchor = fileFactsOf(review, file);
  const context = fileStoryContextOf(story, anchor);
  dashboard.claudeScenario("launched");

  const launched = await answerOf(
    launch(dashboard, {
      ...request,
      instruction: "  ",
      followUp: fileFollowUpOf(revision, anchor),
    }),
  );

  expect(launched.kind, JSON.stringify(launched)).toBe("launched");
  expectFollowUpInput(dashboard.claudeLaunchCalls()[0]?.argv.at(-1), {
    context,
    request: launched.record?.request,
    server: dashboard,
  });
});
