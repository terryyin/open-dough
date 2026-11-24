import path from "node:path";
import { expect, onTestFinished, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  queuedReadyRepository,
  storyA,
  storyB,
  takeRevision,
} from "../../../Distribution/tests/support/queued-repository.mjs";
import { materializeRepository } from "../../../Distribution/tests/support/repository-fixture.mjs";
import {
  appendConfiguredProject,
  mountProjectConfiguration,
} from "../../server/projectConfiguration.ts";
import {
  reviewedFileDiff,
  reviewedFileText,
} from "../../server/storyReviewFileResponse.ts";
import { storyReview } from "../../server/storyReviewSnapshot.ts";
import { queuedIdentity } from "../../test-support/support/startOrigin.ts";
import {
  dashboardDeveloper,
  type StartRepository,
} from "../../test-support/support/startOriginPreparation.ts";
import { yui } from "../../test-support/support/storyReviewTrunkCommits.ts";
import { trunkModeStory } from "../../test-support/support/storyReviewTrunkMode.ts";
import {
  branch,
  git,
  writeAt,
} from "../../test-support/support/storyReviewWorktree.ts";
import { takenBranchContributionHistory } from "../../test-support/support/takenBranchContributionHistory.ts";

async function takenStoryReader(
  history: StartRepository = takenBranchContributionHistory(),
) {
  const repository = await materializeRepository(history);
  const reader = path.join(repository.fixture, "reader");
  git(
    repository.fixture,
    "clone",
    "--quiet",
    "--single-branch",
    "--branch",
    "main",
    repository.origin,
    reader,
  );
  vi.stubEnv("HOME", reader);
  const unmount = mountProjectConfiguration("development");
  onTestFinished(async () => {
    unmount();
    vi.unstubAllEnvs();
    await repository.cleanup();
  });
  const project = makeMe.aConfiguredProject
    .with({
      id: "open-dough",
      label: "Open Dough",
      repository: "terryyin/open-dough",
      localPath: reader,
    })
    .please();
  appendConfiguredProject(project);
  if (repository.execution === undefined) throw new Error("Missing writer");
  return {
    reader,
    writer: repository.execution,
    revisions: repository.revisions,
    subject: { source: project.id, identity: queuedIdentity },
    signal: new AbortController().signal,
  };
}

const publishBranch = (writer: string) =>
  git(writer, "push", "--quiet", "origin", `HEAD:refs/heads/${branch}`);

function commitStoryFile(writer: string, file: string, text: string) {
  writeAt(writer, file, text);
  git(writer, "--literal-pathspecs", "add", "--", file);
  git(
    writer,
    "-c",
    `user.name=${yui.agent}`,
    "-c",
    `user.email=${yui.email}`,
    "commit",
    "--quiet",
    "-m",
    "Published story file",
  );
  return git(writer, "rev-parse", "HEAD");
}

test("a Taken story reads its published branch and attributable merge edit without a local launch or worktree", async () => {
  const { subject, signal, writer, revisions } = await takenStoryReader();
  publishBranch(writer);

  const review = await storyReview({ read: { subject, taken: true } }, signal);

  expect(review).toMatchObject({
    kind: "published-taken",
    head: revisions["merge trunk"],
  });
  if (review.kind !== "published-taken") throw new Error("No published branch");
  const attributedPaths = review.files.map(({ path }) => path);
  expect(attributedPaths).toContain("guides/merge.txt");
  expect(attributedPaths).not.toContain("guides/incoming.txt");
  expect(
    review.files.find(({ path }) => path === "guides/mixed.txt")
      ?.includesTrunkFrom,
  ).toBe(revisions["story start"]);
  expect(review.withMerged?.from).toBe(revisions["story start"]);
  expect(review.withMerged?.files.map(({ path }) => path)).toContain(
    "guides/incoming.txt",
  );
});

test("a Taken story's unpublished branch leaves a review gap", async () => {
  const { subject, signal } = await takenStoryReader();

  await expect(
    storyReview({ read: { subject, taken: true } }, signal),
  ).resolves.toMatchObject({
    kind: "unavailable",
    explanation: `The recorded story branch ${branch} is not published on origin.`,
  });
});

test("a named published branch pair admits its literal file after origin advances", async () => {
  const history = queuedReadyRepository()
    .withRevision(
      "take",
      takeRevision({
        story: storyA,
        queued: [storyB],
        agent: yui.name as string,
        branch,
        committer: dashboardDeveloper,
      }),
    )
    .withWorkspace(branch, { from: "take", agent: yui.agent })
    .please();
  const { subject, signal, writer } = await takenStoryReader(history);
  const path = "guides/[literal]*.txt";
  const firstHead = commitStoryFile(writer, path, "first published text\n");
  publishBranch(writer);
  const review = await storyReview({ read: { subject, taken: true } }, signal);
  if (review.kind !== "published-taken") throw new Error("No published branch");
  commitStoryFile(writer, path, "second published text\n");
  publishBranch(writer);
  const read = {
    subject,
    publishedHead: firstHead,
    baseline: review.baseline,
    tree: review.tree,
    path,
  };

  const diff = await reviewedFileDiff({ read }, signal);
  if (diff.kind !== "diff") throw new Error("No published file diff");
  expect(diff.printed).toContain("+first published text");
  await expect(reviewedFileText({ read }, signal)).resolves.toEqual({
    kind: "text",
    baseline: null,
    tree: "first published text\n",
  });
  await expect(
    reviewedFileDiff({ read: { ...read, path: "guides/*.txt" } }, signal),
  ).rejects.toMatchObject({ status: 409 });
  await expect(
    reviewedFileText({ read: { ...read, baseline: review.tree } }, signal),
  ).rejects.toMatchObject({ status: 409 });
});

test("locally readable unpublished commits cannot name a published file comparison", async () => {
  const { reader, subject, signal, writer } = await takenStoryReader();
  publishBranch(writer);
  const path = "guides/undelivered.txt";
  const unpublished = commitStoryFile(writer, path, "only present locally\n");
  git(reader, "fetch", "--quiet", "--no-write-fetch-head", writer, unpublished);
  const read = {
    subject,
    publishedHead: unpublished,
    baseline: git(reader, "rev-parse", `${unpublished}^1^{tree}`),
    tree: git(reader, "rev-parse", `${unpublished}^{tree}`),
    path,
  };

  await expect(reviewedFileDiff({ read }, signal)).rejects.toMatchObject({
    status: 409,
    message:
      "The named comparison is not contained in the published story branch.",
  });
});

test("a Taken Trunk story reads only its attributable changes from interleaved published history", async () => {
  const { subject, signal, writer, revisions } = await takenStoryReader(
    trunkModeStory({ published: 2, unpublished: true }),
  );
  const review = await storyReview({ read: { subject, taken: true } }, signal);

  if (review.kind !== "published-taken")
    throw new Error("No published Trunk comparison");
  expect(review.head).toBe(revisions.s2);
  expect(review.target).toBe("main");
  expect(review.withMerged).toBeUndefined();
  expect(review.files.map(({ path }) => path).sort()).toEqual([
    "d.md",
    "src/a.ts",
  ]);

  commitStoryFile(writer, "src/a.ts", "now published\n");
  git(writer, "push", "--quiet", "origin", "HEAD:refs/heads/main");
  const read = {
    subject,
    publishedHead: review.head,
    baseline: review.baseline,
    tree: review.tree,
    path: "src/a.ts",
  };
  const diff = await reviewedFileDiff({ read }, signal);
  if (diff.kind !== "diff") throw new Error("No published file diff");
  expect(diff.printed).toContain("+a one");
  expect(diff.printed).not.toContain("a last");
  const source = await reviewedFileText({ read }, signal);
  if (source.kind !== "text") throw new Error("No published file source");
  expect(source.tree).toContain("a one\n");
  expect(source.tree).not.toContain("now published");
});
