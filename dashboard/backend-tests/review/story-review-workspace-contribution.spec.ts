import { afterAll, beforeAll, expect, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { materializeRepository } from "../../../Distribution/tests/support/repository-fixture.mjs";
import {
  appendConfiguredProject,
  mountProjectConfiguration,
} from "../../server/projectConfiguration.ts";
import { reviewedFileText } from "../../server/storyReviewFileResponse.ts";
import { knownSource } from "../../server/sessionAdmission.ts";
import { storyWorkspace } from "../../server/storyReviewWorkspaceAdmission.ts";
import { storyReviewSnapshot } from "../../server/storyReviewWorkspaceSnapshot.ts";
import { agentProfileDirectoryOf } from "../../server/recordsBesideBacklog.ts";
import { storyReviewSchema } from "../../src/storyReviewContract.ts";
import { queuedIdentity } from "../../test-support/support/startOrigin.ts";
import { git } from "../../test-support/support/storyReviewWorktree.ts";
import { takenBranchContributionHistory } from "../../test-support/support/takenBranchContributionHistory.ts";

const subject = { source: "open-dough", identity: queuedIdentity };
const signal = new AbortController().signal;
let cleanRepository: (() => Promise<void>) | undefined;
let storyStart: string;
let branchContribution: string;
let mergeRevision: string;
let firstParentTree: string;
let endTree: string;
let integrated: string;
let unmount: (() => void) | undefined;

beforeAll(async () => {
  const fixture = await materializeRepository(takenBranchContributionHistory());
  cleanRepository = fixture.cleanup;
  vi.stubEnv("HOME", fixture.fixture);
  unmount = mountProjectConfiguration("development");
  appendConfiguredProject(
    makeMe.aConfiguredProject
      .with({
        id: subject.source,
        label: "Open Dough",
        repository: "terryyin/open-dough",
        localPath: fixture.integration,
      })
      .please(),
  );
  storyStart = fixture.revisions["story start"];
  branchContribution = fixture.revisions["branch contribution"];
  mergeRevision = fixture.revisions["merge trunk"];
  integrated = fixture.revisions["incoming trunk"];
  firstParentTree = git(
    fixture.integration,
    "rev-parse",
    `${branchContribution}^{tree}`,
  );
  endTree = git(fixture.integration, "rev-parse", `${mergeRevision}^{tree}`);
});

afterAll(async () => {
  unmount?.();
  vi.unstubAllEnvs();
  await cleanRepository?.();
});

async function readWorkspaceSnapshot() {
  const source = knownSource(subject.source);
  const established = await storyWorkspace(source, subject.identity);
  return storyReviewSnapshot(
    established,
    {
      identity: subject.identity,
      profileDirectory: agentProfileDirectoryOf(source),
    },
    established.workspace,
    signal,
  );
}

test("a merge in the Review snapshot names its first-parent commit separately from its tree", async () => {
  const result = await readWorkspaceSnapshot();
  const snapshot = storyReviewSchema.parse(JSON.parse(JSON.stringify(result)));
  if (snapshot.kind !== "snapshot") throw new Error("No Review snapshot");
  const merge = snapshot.commits.find(
    ({ revision }) => revision === mergeRevision,
  );
  expect(merge).toMatchObject({
    firstParent: branchContribution,
    fromTree: firstParentTree,
  });
  expect(merge?.firstParent).not.toBe(integrated);
  expect(merge?.firstParent).not.toBe(firstParentTree);
});

test("the Review reader accepts older snapshots with no first-parent commit ID", () => {
  const older = JSON.stringify(
    makeMe.aStoryReview.please(),
    (key: string, value: unknown) =>
      key === "firstParent" ? undefined : value,
  );
  const snapshot = storyReviewSchema.parse(JSON.parse(older));
  if (snapshot.kind !== "snapshot") throw new Error("No Review snapshot");
  expect(snapshot.commits[0]).toMatchObject({ kind: "commit" });
  expect(snapshot.commits[0]).not.toHaveProperty("firstParent");
});

test("a Taken branch compares the two bases to the same committed and working trees", async () => {
  const result = await readWorkspaceSnapshot();
  if (result.kind !== "snapshot" || result.committed === undefined)
    throw new Error("No committed and working comparisons");
  const { committed } = result;
  expect(result.baseline).toBe(integrated);
  expect(
    result.files.find(({ path }) => path === "guides/mixed.txt"),
  ).toMatchObject({ includesTrunkFrom: storyStart });
  expect(result.files.map(({ path }) => path)).toContain("guides/merge.txt");
  expect(result.files.map(({ path }) => path)).not.toContain(
    "guides/incoming.txt",
  );
  expect(result.withMerged?.from).toBe(storyStart);
  expect(result.withMerged?.files.map(({ path }) => path)).toContain(
    "guides/draft.txt",
  );
  expect(committed.tree).toBe(endTree);
  expect(committed.withMerged?.from).toBe(storyStart);
  expect(committed.withMerged?.files.map(({ path }) => path)).toContain(
    "guides/incoming.txt",
  );
  expect(committed.withMerged?.files.map(({ path }) => path)).not.toContain(
    "guides/draft.txt",
  );
});

test("workspace file admission reads incoming text at the widened pair", async () => {
  const read = {
    subject,
    baseline: storyStart,
    tree: endTree,
    path: "guides/incoming.txt",
  };
  await expect(reviewedFileText({ read }, signal)).resolves.toEqual({
    kind: "text",
    baseline: null,
    tree: "incoming trunk change\n",
  });
});
