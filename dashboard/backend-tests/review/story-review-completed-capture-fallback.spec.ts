// Historical defaults validate completed identity, while explicitly chosen
// captures retain their existing meaning as one launch's fixed publication.
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { writeRevisionFiles } from "../../../Distribution/tests/support/repository-revision-files.mjs";
import {
  storyReviewEndpoint,
  storyReviewSchema,
} from "../../src/storyReviewContract.ts";
import { expect, test } from "../../tests/support/codexStart.ts";
import { completedPublishedStory } from "../../tests/support/completedPublishedStory.ts";
import {
  completedReviewQuery,
  getReview,
} from "../../tests/support/completedReviewRequests.ts";
import { capturedChoice } from "../../tests/support/oneShotReviewChoices.ts";
import { keepLaunchRecords } from "../../tests/support/launchStore.ts";
import { retainedIntentLanding } from "../../tests/support/retainedIntentLanding.ts";
import { queuedIdentity } from "../../tests/support/startOrigin.ts";
import { claimedRecord } from "../../tests/support/storyBranchIntegration.ts";
import { commitAll, git } from "../../tests/support/storyReviewWorktree.ts";

test.use({ serverMode: "boundary" });
const historical = { ...completedReviewQuery, historical: "true" };

for (const invalid of [
  "another target",
  "already completed base",
  "shallow result",
] as const)
  test(`a historical default rejects a capture with ${invalid} while its explicit run stays readable`, async ({
    request,
    dashboard,
    origin,
    codexProtocol,
  }) => {
    if (codexProtocol === undefined) throw new Error("No native fixture");
    const implementation = makeMe.aRepository
      .withRevision("execution", {
        backlog: null,
        files: { "dashboard/tests/a.spec.ts": "completed captured test\n" },
      })
      .please().revisions[0];
    const { story, accepted } = await retainedIntentLanding(
      dashboard,
      origin,
      codexProtocol,
      implementation,
    );
    const record = await claimedRecord(dashboard);
    const landing = record.landing;
    if (landing === undefined) throw new Error("Missing actual capture");
    if (invalid !== "shallow result") {
      git(origin.project, "pull", "--quiet", "--ff-only", "origin", "main");
      const later = makeMe.aRepository
        .withRevision("later", {
          backlog: null,
          files: { "after-capture.txt": "later trunk\n" },
        })
        .please().revisions[0];
      writeRevisionFiles(origin.project, later);
      commitAll(origin.project, "later trunk after capture");
      git(origin.project, "push", "--quiet", "origin", "main");
      record.landing = makeMe.aLaunchLanding
        .capturedFrom({
          repository: landing.repository,
          identity: queuedIdentity,
          remote: landing.remote,
          target:
            invalid === "another target" ? "refs/heads/other" : landing.target,
        })
        .forLaunch(landing.reference)
        .deliveredAs(landing)
        .comparing({
          base: invalid === "already completed base" ? accepted : landing.base,
          revision: accepted,
        })
        .receivedAt(landing.receivedAt)
        .please();
      if (invalid === "another target") {
        const start = record.start;
        if (start === undefined || "tracking" in start)
          throw new Error("Missing actual claimed start");
        const foreign = makeMe.aLaunchRecord
          .executing({
            identity: start.identity,
            title: record.request.title,
            source: record.request.source,
          })
          .onStoryBranch({
            workspace: start.workspace,
            branch: start.branch,
            target: "other",
          })
          .please().start;
        if (foreign === undefined)
          throw new Error("Missing foreign start facts");
        record.start = { ...start, target: foreign.target };
      }
      keepLaunchRecords(dashboard, [record]);
    }
    // For the shallow-result case this marks M itself shallow; other cases
    // mark only later C, leaving M's valid claim history available.
    git(origin.project, "fetch", "--quiet", "--depth=1", "origin", "main");
    expect(git(origin.project, "rev-parse", "--is-shallow-repository")).toBe(
      "true",
    );
    const answer = storyReviewSchema.parse(
      await (
        await getReview(request, dashboard, storyReviewEndpoint, historical)
      ).json(),
    );
    expect(answer).toMatchObject({
      kind: "unavailable",
      explanation: expect.stringMatching(/history|claim|completion/i),
    });
    expect(answer.selectedRun).toBeUndefined();
    const explicit = storyReviewSchema.parse(
      await (
        await getReview(request, dashboard, storyReviewEndpoint, {
          ...completedReviewQuery,
          run: story.reporting.reference,
        })
      ).json(),
    );
    expect(explicit).toMatchObject({
      kind: "landed",
      tree: accepted,
      selectedRun: story.reporting.reference,
    });
  });

test("an earlier refinement remains an explicit choice but cannot replace unavailable completion history", async ({
  request,
  dashboard,
  origin,
  codexProtocol,
}) => {
  if (codexProtocol === undefined) throw new Error("No native fixture");
  const refinement = await capturedChoice(
    dashboard,
    origin,
    codexProtocol,
    "earlier-refinement",
  );
  git(origin.project, "pull", "--quiet", "--ff-only", "origin", "main");
  await completedPublishedStory(
    origin,
    "trunk",
    undefined,
    undefined,
    undefined,
    { skillsDirectory: ".agents/skills" },
  );
  git(origin.project, "pull", "--quiet", "--ff-only", "origin", "main");
  const later = makeMe.aRepository
    .withRevision("later", {
      backlog: null,
      files: { "after-completion.txt": "later trunk\n" },
    })
    .please().revisions[0];
  writeRevisionFiles(origin.project, later);
  commitAll(origin.project, "later trunk after completion");
  git(origin.project, "push", "--quiet", "origin", "main");
  git(origin.project, "fetch", "--quiet", "--depth=1", "origin", "main");
  const answer = storyReviewSchema.parse(
    await (
      await getReview(request, dashboard, storyReviewEndpoint, historical)
    ).json(),
  );
  expect(answer).toMatchObject({
    kind: "unavailable",
    explanation: expect.stringMatching(/history|claim/),
  });
  expect(answer.selectedRun).toBeUndefined();
  const explicit = storyReviewSchema.parse(
    await (
      await getReview(request, dashboard, storyReviewEndpoint, {
        ...completedReviewQuery,
        run: refinement.key,
      })
    ).json(),
  );
  expect(explicit).toMatchObject({
    kind: "landed",
    tree: refinement.receipt.revision,
    selectedRun: refinement.key,
    landing: { workflow: "refinement" },
  });
  if (explicit.kind !== "landed")
    throw new Error("Missing explicit refinement");
  expect(explicit.files).toContainEqual(
    expect.objectContaining({ kind: "added", path: "earlier-refinement.txt" }),
  );
});
