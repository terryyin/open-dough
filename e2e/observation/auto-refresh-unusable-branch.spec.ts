// A Taken profile recording a story branch whose name Git allows but the
// local read boundary cannot use: that card shows the gap, the page never
// names the branch to read or watch it, and the automatic check keeps its
// pace, still reading trunk when it moves. Recorded branches the boundary can
// use: ./auto-refresh-branches.spec.ts.

import { remoteBranchHead } from "../../dashboard/server/gitTargetFetch.ts";
import { gitHubRepositoryUrl } from "../../dashboard/test-support/support/fixtureOriginRoute.ts";
import type { Page } from "@playwright/test";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import {
  expect,
  githubFor,
  test,
} from "../../dashboard/test-support/dashboardTest.ts";
import {
  shortRevision,
  parts,
} from "../../dashboard/test-support/dashboardPage.ts";
import {
  callsSince,
  expectSteadyPace,
  passTimeUntilChecked,
} from "../../dashboard/test-support/autoRefreshJourney.ts";
import {
  branches,
  repository,
  fromTrunk,
  trunk,
} from "../../dashboard/test-support/branchProgressRecords.ts";
import { openedSettled } from "../../dashboard/test-support/branchRefreshJourney.ts";
import { readsBesideChecks } from "../../dashboard/test-support/originObservation.ts";
import type { PublishedRevision } from "../../dashboard/test-support/publishedFiles.ts";

// A name Git allows but the local read boundary does not use.
const unusable = "story/café";

// The branch every boundary request from the page names, to read or watch.
function branchesNamedByPage(page: Page): string[] {
  const named: string[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.pathname === "/__authenticated-read") {
      named.push(
        ...url.searchParams.getAll("branch"),
        ...url.searchParams.getAll("watch"),
      );
    }
  });
  return named;
}

test("a recorded branch whose name cannot be used is that card's gap, is never read or watched, and trunk moving is still read", async ({
  page,
  dashboard,
  afterGitHubStops,
}) => {
  const named = branchesNamedByPage(page);
  const onUnusable: PublishedRevision = {
    ...trunk,
    ...fromTrunk(trunk.revision, {
      agentProfiles: [
        makeMe.anAgentProfile
          .executing({
            name: "Akiho",
            identity: "SEED-092#on-branch",
            mode: "story-branch",
            branch: unusable,
            host: "claude",
          })
          .please(),
      ],
    }),
  };
  const { origin, progress } = await openedSettled(page, afterGitHubStops, {
    published: {
      trunk: onUnusable,
      branches: { ...branches, [unusable]: trunk },
    },
    advances: [{ name: "nextTrunk", parent: "trunk" }],
  });
  const routed = (ref: string) =>
    remoteBranchHead(gitHubRepositoryUrl(repository), `refs/heads/${ref}`, {
      cwd: dashboard.home,
      env: { HOME: dashboard.home },
      maxBuffer: 4096,
    });
  expect(await routed("main")).toBe(origin.at("trunk").revision);
  expect(await routed(unusable)).toBe(origin.at(unusable).revision);
  const trunkMoved = origin.at("nextTrunk").revision;
  const { readRevision } = parts(page);
  await expect(progress).toContainText(
    `The recorded branch ${unusable} has a name this dashboard cannot use, so its slice progress cannot be read. Trunk's copy is not its progress.`,
  );
  await expect(progress.getByRole("img")).toHaveCount(0);

  await test.step("checks keep their pace and answer, never naming the unusable branch", async () => {
    expectSteadyPace(await passTimeUntilChecked(page));
    expect(named).not.toContain(unusable);
    // The other recorded branches are still read and watched.
    expect(named).toContain("story/plan-missing");
  });

  await test.step("trunk moving is read within the check pace, still never naming the unusable branch", async () => {
    origin.moveTrunk({ ...origin.at("trunk"), revision: trunkMoved });
    expect(await routed("main")).toBe(trunkMoved);
    const from = githubFor(page).calls.length;
    expectSteadyPace(await passTimeUntilChecked(page));
    await expect(readRevision).toContainText(shortRevision(trunkMoved));
    await expect(progress).toContainText(
      `The recorded branch ${unusable} has a name this dashboard cannot use`,
    );
    const reads = readsBesideChecks(callsSince(page, from));
    expect(reads).not.toContain(
      `content .planning/PRODUCT-BACKLOG.md@${trunkMoved}`,
    );
    expect(reads).not.toContain(`branch ${unusable}`);
    expect(named).not.toContain(unusable);
  });
});
