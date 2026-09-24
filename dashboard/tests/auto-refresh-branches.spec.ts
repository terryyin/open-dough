// The automatic check follows every published branch: while trunk stays
// still, one conditional listing of every branch head tells the page when a
// story branch a Taken profile records has moved, and only that story's
// progress is read again -- its plan and its commit time at the new head --
// without Refresh. Other branches moving read nothing; trunk moving reads
// the whole snapshot as before; an unchanged listing is answered by GitHub's
// `304`; a recorded branch deleted becomes that gap. The fake GitHub only
// publishes trunk and branch heads that move (./publishedFiles.ts); the local
// read boundary, the shared readers, and the page decide everything shown.
// Hidden-page and rate-limit behavior: ./auto-refresh-visibility.spec.ts and
// ./auto-refresh-rate-limit.spec.ts.

import type { Page } from "@playwright/test";
import { expect, githubFor, test } from "./dashboardTest";
import { expectMembership, parts } from "./dashboardPage";
import {
  callsSince,
  expectSteadyPace,
  passTimeUntilChecked,
  refCheckArgv,
  refChecks,
} from "./autoRefreshJourney";
import {
  branchHead,
  branches,
  onBranch,
  opened,
  planPath,
  profilePath,
  repository,
  revision,
  slicePlan,
  stories,
  trunk,
} from "./branchProgressRecords";
import { isRefCheck } from "./originObservation";
import { publishMovingFiles, type PublishedRevision } from "./publishedFiles";
import type { GhCall } from "./support/fakeGitHub";

const example = "story/example";
const unrelated = "story/unrelated-work";
const movedHead = "e6".repeat(20);
const trunkMoved = "d5".repeat(20);

// What GitHub was asked besides the checks, as `<kind> <path>@<revision>` or
// `branch <name>`.
function readsBesideChecks(calls: readonly GhCall[]): string[] {
  return calls
    .filter((call) => !isRefCheck(call))
    .map(({ request }) => {
      switch (request.kind) {
        case "content":
        case "listing":
        case "commit-list":
          return `${request.kind} ${request.path}@${request.revision}`;
        case "branch":
          return `branch ${request.branch}`;
        case "ref":
          return `ref ${request.ref}`;
        default:
          return request.kind;
      }
    });
}

// The branch heads published beside trunk, by name.
function headsOf(
  published: Readonly<Record<string, PublishedRevision>>,
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(published).map(([branch, at]) => [branch, at.revision]),
  );
}

async function openedSettled(page: Page) {
  await page.clock.install({ time: opened });
  await page.clock.pauseAt(opened);
  const origin = publishMovingFiles(page, { repository, ...trunk, branches });
  await page.goto("/");
  await expectMembership(page, {
    taken: stories.map(({ title }) => title),
    backlog: [],
  });
  await expect(page.getByText("Reading plan slices…")).toHaveCount(0);
  await expect(page.getByText("Reading current slice time…")).toHaveCount(0);
  const card = parts(page).taken.getByRole("article", { name: onBranch });
  return { origin, progress: card.locator(".card-progress") };
}

test("the automatic check follows each recorded story branch, reading only the progress on a branch that moved", async ({
  page,
}) => {
  const { origin, progress } = await openedSettled(page);
  const { source } = parts(page);
  const published = { ...branches };
  await expect(progress).toContainText(
    `From branch ${example} at ${branchHead.slice(0, 7)}; not in trunk.`,
  );
  await expect(progress).toContainText("Current slice running for 7 min");

  await test.step("while nothing moves, checks read nothing, and a repeated check is answered by GitHub's 304", async () => {
    const from = githubFor(page).calls.length;
    expectSteadyPace(await passTimeUntilChecked(page));
    expectSteadyPace(await passTimeUntilChecked(page));
    const calls = callsSince(page, from);
    expect(refChecks(calls).map(({ argv }) => argv)).toEqual([
      refCheckArgv(undefined, repository),
      // Conditional on the listing still naming every head as shown.
      refCheckArgv(revision, repository, headsOf(published)),
    ]);
    expect(readsBesideChecks(calls)).toEqual([]);
  });

  await test.step("a new slice commit on the recorded branch shows its count and a restarted clock within the check pace, reading only its plan and commit time there", async () => {
    const now = await page.evaluate(() => Date.now());
    published[example] = {
      revision: movedHead,
      files: { ...trunk.files, [planPath("on-branch")]: slicePlan(8, 7) },
      committed: {
        [planPath("on-branch")]: new Date(now - 2 * 60_000),
        [profilePath("Akiho")]: new Date(opened.getTime() - 60 * 60_000),
      },
    };
    origin.moveBranch(example, published[example]);
    const from = githubFor(page).calls.length;
    expectSteadyPace(await passTimeUntilChecked(page));
    await expect(
      progress.getByRole("img", { name: "7 of 8 slices recorded done" }),
    ).toBeVisible();
    await expect(progress).toContainText(
      `From branch ${example} at ${movedHead.slice(0, 7)}; not in trunk.`,
    );
    await expect(progress).toContainText("Current slice running for 2 min");
    await expect(source).toContainText(revision);
    expect(readsBesideChecks(callsSince(page, from)).sort()).toEqual(
      [
        `content ${planPath("on-branch")}@${movedHead}`,
        `commit-list ${planPath("on-branch")}@${movedHead}`,
      ].sort(),
    );
  });

  await test.step("an unrelated branch moving reads nothing further", async () => {
    published[unrelated] = { revision: "f6".repeat(20), files: trunk.files };
    origin.moveBranch(unrelated, published[unrelated]);
    const from = githubFor(page).calls.length;
    expectSteadyPace(await passTimeUntilChecked(page));
    // The next check comes at the steady pace: nothing was read between.
    expectSteadyPace(await passTimeUntilChecked(page));
    expect(readsBesideChecks(callsSince(page, from))).toEqual([]);
    await expect(
      progress.getByRole("img", { name: "7 of 8 slices recorded done" }),
    ).toBeVisible();
  });

  await test.step("trunk moving reads the whole snapshot at its new revision, as before", async () => {
    origin.moveTrunk({ ...trunk, revision: trunkMoved });
    const from = githubFor(page).calls.length;
    expectSteadyPace(await passTimeUntilChecked(page));
    await expect(source).toContainText(trunkMoved);
    await expect(page.getByText("Reading plan slices…")).toHaveCount(0);
    await expect(page.getByText("Reading current slice time…")).toHaveCount(0);
    await expect(
      progress.getByRole("img", { name: "7 of 8 slices recorded done" }),
    ).toBeVisible();
    const reads = readsBesideChecks(callsSince(page, from));
    expect(reads).toContain(
      `content .planning/PRODUCT-BACKLOG.md@${trunkMoved}`,
    );
    expect(reads).toContain(`branch ${example}`);
    expect(reads).not.toContain("ref main");
  });

  await test.step("the recorded branch deleted shows, at the next check, that it is no longer published", async () => {
    origin.moveBranch(example, undefined);
    const from = githubFor(page).calls.length;
    expectSteadyPace(await passTimeUntilChecked(page));
    await expect(progress).toContainText(
      `The recorded branch ${example} is no longer published`,
    );
    await expect(progress.getByRole("img")).toHaveCount(0);
    await expect(progress).not.toContainText("recorded done");
    await expect(progress).not.toContainText("running for");
    expect(readsBesideChecks(callsSince(page, from))).toEqual([]);
  });
});
