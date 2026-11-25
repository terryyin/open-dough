// Opening the branch slice progress journeys' records
// (./branchProgressRecords.ts) with heads that move, for the automatic
// check's branch journeys (../../e2e/observation/auto-refresh-branches.spec.ts,
// ../../e2e/observation/auto-refresh-unusable-branch.spec.ts), which observe what the page then
// asks GitHub through ./originObservation.ts's `readsBesideChecks`.

import type { Page } from "@playwright/test";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import type {
  RepositoryBuilder,
  RevisionFacts,
} from "../../Distribution/tests/support/repositoryTestData.mjs";
import { renderSlicePlan } from "../../Distribution/tests/support/published-plan.mjs";
import { expect, pausePageClockAt } from "./dashboardTest.ts";
import { expectMembership, parts } from "./dashboardPage.ts";
import { storyCard } from "./storyCardControls.ts";
import { sliceProgress } from "./storyCardFacts.ts";
import {
  branches,
  onBranch,
  opened,
  planPath,
  repository,
  stories,
  trunk,
} from "./branchProgressRecords.ts";
import { publishCommittedFileHistory } from "./committedFiles.ts";
import type { PublishedRevision } from "./publishedFiles.ts";

export const sevenDoneOnBranch = makeMe.aSlicePlan
  .withStatuses([
    "done",
    "done",
    "done",
    "done",
    "done",
    "done",
    "done",
    "planned",
  ])
  .please();

// The plan bytes a branch progress publication changes.
export function branchPlanChange(plan: Parameters<typeof renderSlicePlan>[0]) {
  return {
    [planPath("on-branch")]: renderSlicePlan(plan, { heading: "Slices" }),
  };
}

type Advance = {
  readonly name: string;
  readonly parent: string;
  readonly facts?: RevisionFacts;
};

export async function openedSettled(
  page: Page,
  afterGitHubStops: (cleanup: () => Promise<void>) => void,
  {
    published = { trunk, branches },
    advances = [],
    whenOpening,
  }: {
    readonly published?: {
      readonly trunk: PublishedRevision;
      readonly branches: Readonly<Record<string, PublishedRevision>>;
    };
    readonly advances?: readonly Advance[];
    readonly whenOpening?: (revision: string) => Promise<unknown>;
  } = {},
) {
  await pausePageClockAt(page, opened);
  let history: RepositoryBuilder<string> = makeMe.aRepository.withRevision(
    "trunk",
    {
      files: published.trunk.files,
      tags: ["fixture-trunk"],
    },
  );
  for (const [branch, at] of Object.entries(published.branches)) {
    history = history.withRevision(branch, {
      parents: ["trunk"],
      tags: [`fixture-${branch}`],
      files: at.files,
      remove: Object.keys(published.trunk.files).filter(
        (path) => !Object.hasOwn(at.files, path),
      ),
    });
  }
  for (const { name, parent, facts } of advances)
    history = history.withRevision(name, {
      ...facts,
      parents: [parent],
      tags: [`fixture-${name}`],
    });
  const origin = await publishCommittedFileHistory(page, history.please(), {
    repository,
    trunk: "trunk",
    branches: Object.fromEntries(
      Object.keys(published.branches).map((branch) => [branch, branch]),
    ),
    details: () =>
      Object.fromEntries(
        Object.entries({ trunk: published.trunk, ...published.branches }).map(
          ([name, at]) => [
            name,
            {
              ...(at.committed === undefined
                ? {}
                : { committed: at.committed }),
              ...(at.history === undefined ? {} : { history: at.history }),
            },
          ],
        ),
      ),
    afterGitHubStops,
  });
  await Promise.all([
    whenOpening?.(origin.at("trunk").revision),
    page.goto("/"),
  ]);
  await expectMembership(page, {
    taken: stories.map(({ title }) => title),
    backlog: [],
  });
  await expect(page.getByText("Reading plan slices…")).toHaveCount(0);
  await expect(page.getByText("Reading current slice time…")).toHaveCount(0);
  return {
    origin,
    progress: sliceProgress(storyCard(parts(page).taken, onBranch)),
  };
}
