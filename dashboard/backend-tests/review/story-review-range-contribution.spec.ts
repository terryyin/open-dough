import { execFileSync } from "node:child_process";
import { chmod, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { delimiter, join } from "node:path";
import { afterAll, beforeAll, expect, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { materializeRepository } from "../../../Distribution/tests/support/repository-fixture.mjs";
import {
  appendConfiguredProject,
  mountProjectConfiguration,
} from "../../server/projectConfiguration.ts";
import { storyReviewRange } from "../../server/storyReviewRange.ts";
import { rangeRequest } from "../../server/storyReviewRangeRequest.ts";
import { storyReviewRangeEndpoint } from "../../src/storyReviewContract.ts";
import { queuedIdentity } from "../../test-support/support/startOrigin.ts";
import { git } from "../../test-support/support/storyReviewWorktree.ts";
import { takenBranchContributionHistory } from "../../test-support/support/takenBranchContributionHistory.ts";

const subject = { source: "open-dough", identity: queuedIdentity };
let cleanRepository: (() => Promise<void>) | undefined;
let unmount: (() => void) | undefined;
let fromTree: string;
let endTree: string;
let rangeQuery: URL;

beforeAll(async () => {
  const repository = await materializeRepository(
    takenBranchContributionHistory(),
  );
  cleanRepository = repository.cleanup;
  vi.stubEnv("HOME", repository.fixture);
  unmount = mountProjectConfiguration("development");
  appendConfiguredProject(
    makeMe.aConfiguredProject
      .with({
        id: subject.source,
        label: "Open Dough",
        repository: "terryyin/open-dough",
        localPath: repository.integration,
      })
      .please(),
  );
  const { revisions, integration } = repository;
  const end = revisions["merge trunk"];
  fromTree = git(integration, "rev-parse", `${end}^1^{tree}`);
  endTree = git(integration, "rev-parse", `${end}^{tree}`);
  const fromBaseline = revisions.take;
  const baseline = revisions["incoming trunk"];
  rangeQuery = new URL(storyReviewRangeEndpoint, "http://localhost");
  rangeQuery.search = new URLSearchParams({
    ...subject,
    fromTree,
    fromBaseline,
    tree: endTree,
    baseline,
    integrations: JSON.stringify([{ fromTree, fromBaseline, baseline }]),
  }).toString();
});

afterAll(async () => {
  unmount?.();
  vi.unstubAllEnvs();
  await cleanRepository?.();
});

test("the admitted range widens from the selected first parent's tree to the same end", async () => {
  const query = new URL(rangeQuery);
  query.searchParams.set("withMerged", "1");
  const range = await rangeRequest(query);
  const answer = await storyReviewRange(range, new AbortController().signal);
  if (answer.kind !== "comparison") throw new Error(answer.explanation);
  expect(answer.tree).toBe(endTree);
  expect(answer.files.map(({ path }) => path)).not.toContain(
    "guides/incoming.txt",
  );
  expect(
    answer.files.find(({ path }) => path === "guides/mixed.txt"),
  ).toMatchObject({
    includesTrunkFrom: fromTree,
  });
  expect(answer.withMerged?.from).toBe(fromTree);
  expect(answer.withMerged?.files.map(({ path }) => path)).toContain(
    "guides/incoming.txt",
  );
  expect(
    answer.withMerged?.files.find(({ path }) => path === "guides/mixed.txt")
      ?.includesTrunkFrom,
  ).toBeUndefined();
});

test("an ordinary range request keeps its attributed answer shape", async () => {
  const range = await rangeRequest(rangeQuery);
  const answer = await storyReviewRange(range, new AbortController().signal);
  expect(answer).toMatchObject({ kind: "comparison" });
  expect(answer).not.toHaveProperty("withMerged");
});

test("a failed restatement offers neither attributed files nor the wider range", async () => {
  const query = new URL(rangeQuery);
  query.searchParams.set("withMerged", "1");
  const range = await rangeRequest(query);
  const realGit = execFileSync("which", ["git"], { encoding: "utf8" }).trim();
  const directory = await mkdtemp(join(tmpdir(), "dough-range-old-git-"));
  const path = process.env.PATH;
  try {
    const shim = join(directory, "git");
    await writeFile(
      shim,
      `#!/bin/sh
[ "$1" != merge-tree ] || exit 129
exec "${realGit}" "$@"
`,
    );
    await chmod(shim, 0o755);
    vi.stubEnv("PATH", [directory, path].join(delimiter));
    const answer = await storyReviewRange(range, new AbortController().signal);
    expect(answer).toEqual({
      kind: "unavailable",
      explanation:
        "This machine's Git cannot leave out trunk's changes integrated within the chosen commits, so this range cannot be compared across them.",
    });
  } finally {
    vi.stubEnv("PATH", path);
    await rm(directory, { recursive: true, force: true });
  }
});
