// A Taken story whose agent profile on trunk records Story Branch Mode shows
// its slice progress from the plan at that branch's head, named as branch
// progress that is not in trunk; trunk's copy of the plan is never shown as
// its progress. Trunk Mode stories keep trunk's progress unlabelled; a story
// without a profile shows trunk's copy, labelled as such, and nothing is read
// from a branch named like it. Two profiles naming a story, a branch no longer
// published, and a plan missing or uninterpretable on the branch are each
// shown as that gap. The fake GitHub only publishes trunk and the branch heads
// (./branchProgressRecords.ts); the local read boundary, the shared readers,
// and the page decide everything shown.

import type { Page } from "@playwright/test";
import { expect, githubFor, test } from "./dashboardTest";
import { expectMembership, parts } from "./dashboardPage";
import { publishFiles } from "./publishedOrigin";
import {
  beforeProfiles,
  branchDeleted,
  branchHead,
  branches,
  onBranch,
  onTrunk,
  opened,
  planMissing,
  planPath,
  planUninterpretable,
  profilePath,
  repository,
  revision,
  similarlyNamed,
  stories,
  trunk,
  twoOwners,
} from "./branchProgressRecords";

async function openedAtOpening(page: Page) {
  await page.clock.install({ time: opened });
  await page.clock.pauseAt(opened);
  const requests = await publishFiles(page, {
    repository,
    ...trunk,
    branches,
  });
  await page.goto("/");
  await expectMembership(page, {
    taken: stories.map(({ title }) => title),
    backlog: [],
  });
  await expect(page.getByText("Reading plan slices…")).toHaveCount(0);
  await expect(page.getByText("Reading current slice time…")).toHaveCount(0);
  const { taken } = parts(page);
  const progress = (title: string) =>
    taken.getByRole("article", { name: title }).locator(".card-progress");
  return { requests, taken, progress };
}

test("Taken cards show progress from where each story is published, or the gap that stops it", async ({
  page,
}) => {
  const { requests, taken, progress } = await openedAtOpening(page);

  await test.step("a Story Branch Mode story shows 6 of 8 from its branch head, named as not in trunk", async () => {
    await expect(progress(onBranch)).toContainText(
      `From branch story/example at ${branchHead.slice(0, 7)}; not in trunk.`,
    );
    await expect(
      progress(onBranch).getByRole("img", {
        name: "6 of 8 slices recorded done",
      }),
    ).toBeVisible();
    await expect(progress(onBranch)).not.toContainText("0 of 8");
  });

  await test.step("its clock runs from the branch plan's last commit", async () => {
    await expect(progress(onBranch)).toContainText(
      "Current slice running for 7 min",
    );
  });

  await test.step("a Trunk Mode story shows trunk's progress with no source label", async () => {
    await expect(progress(onTrunk)).toContainText(
      "1 of 2 slices recorded done",
    );
    await expect(progress(onTrunk)).toContainText(
      "Current slice running for 12 min",
    );
    await expect(progress(onTrunk).locator(".progress-source")).toHaveCount(0);
  });

  await test.step("a story without a profile shows trunk's copy, labelled, and not the similarly named branch", async () => {
    await expect(progress(beforeProfiles)).toContainText(
      "Trunk copy; execution branch not recorded.",
    );
    await expect(progress(beforeProfiles)).toContainText(
      "1 of 2 slices recorded done",
    );
  });

  await test.step("two profiles naming a story leave no single progress source", async () => {
    await expect(progress(twoOwners)).toContainText(
      "More than one agent profile names this story, so it has no single progress source.",
    );
    await expect(progress(twoOwners).getByRole("img")).toHaveCount(0);
  });

  await test.step("a recorded branch no longer published is a gap, not trunk's count", async () => {
    await expect(progress(branchDeleted)).toContainText(
      "The recorded branch story/deleted is no longer published",
    );
    await expect(progress(branchDeleted).getByRole("img")).toHaveCount(0);
    await expect(progress(branchDeleted)).not.toContainText("recorded done");
  });

  await test.step("a plan missing on the branch is that gap", async () => {
    await expect(progress(planMissing)).toContainText(
      `The associated plan ${planPath("plan-missing")} is missing on this branch.`,
    );
    await expect(progress(planMissing)).toContainText(
      `From branch story/plan-missing at ${branches["story/plan-missing"]?.revision.slice(0, 7) ?? ""}; not in trunk.`,
    );
    await expect(progress(planMissing).getByRole("img")).toHaveCount(0);
  });

  await test.step("a plan uninterpretable on the branch is that gap", async () => {
    await expect(progress(planUninterpretable)).toContainText(
      "Plan slices uninterpretable:",
    );
    await expect(progress(planUninterpretable).getByRole("img")).toHaveCount(0);
  });

  await test.step("only recorded, unambiguous branches were asked for, and on them only their plan", () => {
    const calls = githubFor(page).calls;
    const asked = calls.flatMap(({ request }) =>
      request.kind === "branch" ? [request.branch] : [],
    );
    expect(asked.sort()).toEqual(
      [
        "story/deleted",
        "story/example",
        "story/plan-missing",
        "story/uninterpretable",
      ].sort(),
    );
    const trunkRevisions = new Set([revision]);
    const onBranches = requests.flatMap(({ request }) =>
      request.kind === "content" || request.kind === "commit-list"
        ? trunkRevisions.has(request.revision)
          ? []
          : [`${request.kind} ${request.path}@${request.revision}`]
        : [],
    );
    expect(onBranches.sort()).toEqual(
      [
        `content ${planPath("on-branch")}@${branchHead}`,
        `commit-list ${planPath("on-branch")}@${branchHead}`,
        `content ${planPath("plan-missing")}@${branches["story/plan-missing"]?.revision ?? ""}`,
        `content ${planPath("plan-uninterpretable")}@${branches["story/uninterpretable"]?.revision ?? ""}`,
      ].sort(),
    );
    expect(
      calls.some(
        ({ request }) =>
          request.kind === "branch" && request.branch === similarlyNamed,
      ),
    ).toBe(false);
    // The Take is read on trunk, where the profile was read.
    expect(
      requests.some(
        ({ request }) =>
          request.kind === "commit-list" &&
          request.path === profilePath("Akiho") &&
          request.revision === revision,
      ),
    ).toBe(true);
  });

  await test.step("the detail shows the same branch source and its slices", async () => {
    const card = taken.getByRole("article", { name: onBranch });
    await card.getByRole("button", { name: "Inspect story" }).click();
    const detail = card.getByRole("region", { name: `Detail for ${onBranch}` });
    await expect(detail).toContainText("6 of 8 recorded complete");
    await expect(detail).toContainText(
      `From branch story/example at ${branchHead.slice(0, 7)}; not in trunk.`,
    );
  });
});
