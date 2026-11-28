import { expect, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { renderStorySection } from "../../../Distribution/tests/support/published-seed.mjs";
import { materializeRepository } from "../../../Distribution/tests/support/repository-fixture.mjs";
import { BranchHeads } from "../../server/branchHeads.ts";
import { execGh, runGh } from "../../server/ghRead.ts";
import {
  performBranchHeadRead,
  performOnBranch,
} from "../../server/performedBranchRead.ts";
import { performRevisionCheck } from "../../server/performedRevisionCheck.ts";
import { PinnedTexts } from "../../server/pinnedTexts.ts";
import { listedAgentProfiles } from "../../server/recordsBesideBacklog.ts";
import { parseRequestedRead } from "../../server/requestedRead.ts";
import { RetainedAnswers } from "../../server/retainedAnswers.ts";
import { RevisionChecks } from "../../server/revisionChecks.ts";
import { RevisionMemo } from "../../server/revisionMemo.ts";
import {
  commitOf,
  headsOf,
  listedAt,
  publishBranch,
  showAt,
} from "../../test-support/committedOriginRepo.ts";
import { directoryListingAnswer } from "../../test-support/listingAnswers.ts";
import { headsAnswer } from "../../test-support/originAnswers.ts";
import { parseRequest } from "../../test-support/support/ghRequest.ts";

vi.mock(import("../../server/ghRead.ts"), async (importOriginal) => ({
  ...(await importOriginal()),
  runGh: vi.fn(),
  execGh: vi.fn(),
}));

const source = makeMe.aPublishedSource.openDough.please();
const repositoryName = source.repository;
const branch = "story/recorded";
const otherBranch = "story/unrecorded";
const seedPath = ".planning/seeds/SEED-branch.md";
const planPath = ".planning/slice-plans/092-branch/PLAN.md";
const firstPlan = "# First branch plan\n\n## Slices\n";
const nextPlan = "# Updated branch plan\n\n## Slices\n";
function storyEntry(anchor: string, title: string) {
  return makeMe.aBacklogEntry
    .with({
      title,
      identity: `SEED-branch#${anchor}`,
      href: `seeds/SEED-branch.md#${anchor}`,
    })
    .please();
}

const branchStory = storyEntry("story", "Branch story");
const trunkStory = storyEntry("trunk", "Trunk story");

const description = makeMe.aRepository
  .withRevision("trunk", {
    backlog: { taken: [branchStory, trunkStory] },
    files: {
      [seedPath]: `# Seed\n\n${renderStorySection(branchStory)}`,
      [planPath]: "# Trunk plan\n",
    },
    storyStates: [
      {
        identity: branchStory.identity,
        href: branchStory.href,
        ...makeMe.aStoryPreparation
          .plannedIn("../slice-plans/092-branch/PLAN.md")
          .please(),
      },
    ],
    agentProfiles: [
      makeMe.anAgentProfile
        .executing({
          name: "Yui",
          identity: branchStory.identity,
          mode: "story-branch",
          branch,
        })
        .please(),
      makeMe.anAgentProfile
        .executing({
          name: "Akiho",
          identity: trunkStory.identity,
          mode: "trunk",
        })
        .please(),
    ],
  })
  .withRevision("resolved", { files: { [planPath]: firstPlan } })
  .withRevision("advanced", { files: { [planPath]: nextPlan } })
  .please();

test("reads recorded plans only at resolved or watched heads", async ({
  onTestFinished,
}) => {
  const { origin, revisions, cleanup } =
    await materializeRepository(description);
  onTestFinished(cleanup);
  const { trunk: revision, resolved: head, advanced: checkedHead } = revisions;
  publishBranch(origin, source.ref, revision);
  publishBranch(origin, branch, head);
  publishBranch(origin, otherBranch, checkedHead);

  const provider = vi.mocked(runGh);
  const heads = vi.mocked(execGh);
  provider.mockImplementation((args) => {
    const request = parseRequest(args);
    if (!("repository" in request) || request.repository !== repositoryName) {
      throw new Error(`Unexpected GitHub repository: ${args.join(" ")}`);
    }
    switch (request.kind) {
      case "branch":
        return Promise.resolve(
          commitOf(origin, `refs/heads/${request.branch}`) ?? "",
        );
      case "content": {
        const text = showAt(origin, request.revision, request.path);
        return Promise.resolve(text ?? "");
      }
      case "listing": {
        const files = listedAt(origin, request.revision, request.path) ?? [];
        return Promise.resolve(
          directoryListingAnswer(request.path, files).body,
        );
      }
      default:
        throw new Error(`Unexpected GitHub read: ${args.join(" ")}`);
    }
  });
  const pinned = new PinnedTexts(new RevisionMemo(new RetainedAnswers()));
  const readers = {
    pinned,
    branches: new BranchHeads(),
    checks: new RevisionChecks({
      tracked: new Set(),
      scope: () => Promise.resolve(undefined),
    }),
  };
  const signal = new AbortController().signal;
  const readPinned = pinned.reader(source, revision, signal);
  const listPinned = pinned.lister(source, revision, signal);
  pinned.namedByRef(source, revision);
  const backlog = await readPinned(source.backlogPath);
  pinned.answeredBacklog(source, revision);
  await readPinned(seedPath);
  for (const { path } of await listedAgentProfiles(source, listPinned)) {
    await readPinned(path);
  }
  provider.mockClear();

  const at = "2026-11-27T00:00:00Z";
  const read = (params: Record<string, string>) => {
    const request = parseRequestedRead(new URLSearchParams(params));
    switch (request.kind) {
      case "branch-head-at":
        return performBranchHeadRead(readers, source, request, signal);
      case "revision-check":
        return performRevisionCheck(readers, source, request, signal, () => ({
          askedAt: at,
          trunk: { kind: "verified", revision, backlog, confirmedAt: at },
        }));
      case "file-at":
        if (request.onBranch !== undefined)
          return performOnBranch(
            readers,
            source,
            request,
            request.onBranch,
            signal,
          );
    }
    throw new Error(`Unexpected read: ${request.kind}`);
  };
  const resolve = (branch: string) => read({ revision, branch });
  const fileAt = (head: string, path = planPath) =>
    read({ revision, branch, head, path });
  const check = (watch: string) => read({ since: revision, watch });
  const expectPlan = async (head: string, text: string) => {
    await expect(fileAt(head)).resolves.toEqual({
      kind: "answered",
      answer: { revision: head, path: planPath, text },
    });
    const contents = `repos/${repositoryName}/contents/${planPath}?ref=${head}`;
    expect(provider).toHaveBeenCalledExactlyOnceWith(
      ["api", "-H", "Accept: application/vnd.github.raw", contents],
      signal,
    );
  };
  const unrecorded = {
    kind: "refused",
    status: 404,
    message:
      "That branch is not recorded by a Taken entry's agent profile at this source revision.",
  };

  await expect(resolve(otherBranch)).resolves.toEqual(unrecorded);
  await expect(resolve("origin/main")).resolves.toEqual(unrecorded);
  await expect(fileAt(head)).resolves.toEqual({
    kind: "refused",
    status: 409,
    message: "That branch head was not resolved by this read boundary.",
  });
  expect(provider).not.toHaveBeenCalled();

  await expect(resolve(branch)).resolves.toEqual({
    kind: "answered",
    answer: { revision, branch, head },
  });
  const branchRef = `repos/${repositoryName}/git/ref/heads/${branch}`;
  expect(provider).toHaveBeenCalledExactlyOnceWith(
    ["api", branchRef, "--jq", ".object.sha"],
    signal,
  );
  provider.mockClear();

  await expect(fileAt(head, seedPath)).resolves.toMatchObject({
    kind: "refused",
    status: 404,
  });
  expect(provider).not.toHaveBeenCalled();
  await expectPlan(head, firstPlan);
  provider.mockClear();

  publishBranch(origin, branch, checkedHead);
  await expect(check(otherBranch)).resolves.toEqual(unrecorded);
  expect(heads).not.toHaveBeenCalled();
  expect(provider).not.toHaveBeenCalled();
  const { status, body } = headsAnswer(headsOf(origin, source.ref, revision));
  heads.mockResolvedValueOnce({
    status,
    body,
    headers: new Map(),
    failure: undefined,
    askedAt: "2026-11-27T00:00:00Z",
  });
  await expect(check(branch)).resolves.toMatchObject({
    kind: "answered",
    answer: {
      revision,
      changed: false,
      branches: [{ branch, head: checkedHead }],
    },
  });
  await expectPlan(checkedHead, nextPlan);
  expect(heads.mock.calls.map(([args]) => args)).toEqual([
    ["api", `repos/${repositoryName}/git/matching-refs/heads/`],
  ]);
});
