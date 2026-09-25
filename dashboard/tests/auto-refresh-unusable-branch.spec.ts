// A Taken profile recording a story branch whose name Git allows but the
// local read boundary cannot use: that card shows the gap, the page never
// names the branch to read or watch it, and the automatic check keeps its
// pace, still reading trunk when it moves. Recorded branches the boundary can
// use: ./auto-refresh-branches.spec.ts.

import type { Page } from "@playwright/test";
import { expect, githubFor, test } from "./dashboardTest.ts";
import { parts } from "./dashboardPage.ts";
import {
  callsSince,
  expectSteadyPace,
  passTimeUntilChecked,
} from "./autoRefreshJourney.ts";
import {
  agentProfile,
  branches,
  profilePath,
  trunk,
} from "./branchProgressRecords.ts";
import {
  openedSettled,
  readsBesideChecks,
  trunkMoved,
} from "./branchRefreshJourney.ts";
import type { PublishedRevision } from "./publishedFiles.ts";

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
}) => {
  const named = branchesNamedByPage(page);
  const onUnusable: PublishedRevision = {
    ...trunk,
    files: {
      ...trunk.files,
      [profilePath("Akiho")]: agentProfile("on-branch", {
        agent: "Akiho",
        mode: "story-branch",
        branch: unusable,
      }),
    },
  };
  const { origin, progress } = await openedSettled(page, {
    trunk: onUnusable,
    branches: {
      ...branches,
      [unusable]: { revision: "f7".repeat(20), files: trunk.files },
    },
  });
  const { source } = parts(page);
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
    origin.moveTrunk({ ...onUnusable, revision: trunkMoved });
    const from = githubFor(page).calls.length;
    expectSteadyPace(await passTimeUntilChecked(page));
    await expect(source).toContainText(trunkMoved);
    await expect(progress).toContainText(
      `The recorded branch ${unusable} has a name this dashboard cannot use`,
    );
    const reads = readsBesideChecks(callsSince(page, from));
    expect(reads).toContain(
      `content .planning/PRODUCT-BACKLOG.md@${trunkMoved}`,
    );
    expect(reads).not.toContain(`branch ${unusable}`);
    expect(named).not.toContain(unusable);
  });
});
