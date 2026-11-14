import { makeMe } from "../../../tests/support/makeMe.mjs";
import { direction } from "../../../tests/support/product-backlog-fixture.mjs";
import {
  queuedReadyRepository,
  storyA,
  storySeed,
} from "../../../tests/support/queued-repository.mjs";
import { expect } from "../dashboardTest.ts";
import { publishCommittedOrigin } from "../committedOrigin.ts";
import { chooseProject, parts } from "../dashboardPage.ts";
import { expectRoute } from "../agentRosterRecords.ts";
import { openUntilRead } from "../pageRequestNotes.ts";
import {
  test,
  twoDependencies,
  recordDependency,
  publishDependencies,
  takeSupplier,
  secondInSeedB,
  suppliersInOneSeed,
} from "../storyDependencyFixture.ts";
import { startOrigin } from "../support/startOrigin.ts";
import { storyCard } from "../storyCardControls.ts";
import {
  dependencySummary,
  followReference,
  openDependencies,
  storyReference,
} from "../storyReference.ts";

// Story A waits on Story B and needs a decision about Story C.
test.use({
  hasTouch: true,
  originRepository: queuedReadyRepository()
    .withRevision("dependencies", twoDependencies())
    .please(),
});

const pygardonHome =
  "seeds/SEED-120-release-readiness.md#story-checked-artifact-eligibility";

async function recordReveals(page: import("@playwright/test").Page) {
  await page.addInitScript(() => {
    // The captured native method is called with the actual element below.
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const original = Element.prototype.scrollIntoView;
    const reveals: { name: string | null; behavior: string | undefined }[] = [];
    Object.assign(window, { storyReveals: reveals });
    Element.prototype.scrollIntoView = function (options) {
      reveals.push({
        name: this.getAttribute("aria-label"),
        behavior: typeof options === "object" ? options.behavior : undefined,
      });
      original.call(this, options);
    };
  });
}

test("distinct stories in one seed follow their recorded identities by keyboard and touch at a narrow reduced-motion viewport", async ({
  page,
  origin,
  dashboard,
}) => {
  await origin.publishRevision(suppliersInOneSeed());
  recordDependency(origin, {
    supplier: secondInSeedB,
    state: "waiting",
  });
  takeSupplier(origin);
  const revision = await publishDependencies(origin);
  await publishCommittedOrigin(page, {
    repoDir: origin.project,
    revision,
    repository: "terryyin/open-dough",
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await recordReveals(page);
  await openUntilRead(page);
  const consumer = storyCard(parts(page).backlog, "Story A");
  const first = storyCard(parts(page).taken, "Story B");
  const second = storyCard(parts(page).backlog, "Second story in seed B");
  await openDependencies(consumer, "tap");
  await followReference(consumer, "Second story in seed B", "keyboard");
  await expect(
    second.getByRole("region", { name: "Detail for Second story in seed B" }),
  ).toBeVisible();
  await expect(second).toBeFocused();
  await expect(second).toBeInViewport({ ratio: 0.5 });
  await expect(first.getByRole("region")).toHaveCount(0);
  expect(
    await page.evaluate(
      () =>
        (
          window as unknown as { storyReveals: { behavior: string }[] }
        ).storyReveals.at(-1)?.behavior,
    ),
  ).toBe("auto");
  await followReference(consumer, "Story B", "tap");
  await expect(
    first.getByRole("region", { name: "Detail for Story B" }),
  ).toBeVisible();
  await expect(first).toBeFocused();
  await expect(first).toBeInViewport({ ratio: 0.5 });
  // The earlier reference's detail stays open beside it.
  await expect(
    second.getByRole("region", { name: "Detail for Second story in seed B" }),
  ).toBeVisible();
  expect(dashboard.claudeLaunchCalls()).toEqual([]);
  expect(dashboard.claudeAttaches()).toEqual([]);
});

test("each project's rendered pinned reference opens its own telling of the same identity, including Pygardon's seed URL shape", async ({
  page,
  origin,
  dashboard,
  afterGitHubStops,
}) => {
  const revision = (await origin.originGit("rev-parse", "main")).trim();
  await publishCommittedOrigin(page, {
    repoDir: origin.project,
    revision,
    repository: "terryyin/open-dough",
  });
  // Pygardon tells the same identity, SEED-B#b, in a seed of its own.
  const pygardonStory = makeMe.aBacklogEntry
    .with({
      identity: "SEED-B#b",
      href: pygardonHome,
      title: "Pygardon selected story",
    })
    .please();
  const pygardon = await startOrigin(
    queuedReadyRepository()
      .withRevision("dependencies", twoDependencies())
      .withRevision("pygardon story", {
        backlog: { direction, queued: [storyA, pygardonStory] },
        files: {
          [`.planning/${pygardonHome.split("#")[0]}`]: storySeed(
            pygardonStory,
            "Deliver Pygardon outcome.",
          ),
        },
      })
      .please(),
    { repository: "terryyin/pygardon", projectId: "pygardon" },
  );
  afterGitHubStops(() => {
    pygardon.cleanup();
  });
  recordDependency(pygardon, {
    supplier: { identity: "SEED-B#b", href: pygardonHome },
    state: "waiting",
  });
  const targetRevision = await publishDependencies(pygardon);
  await publishCommittedOrigin(page, {
    repoDir: pygardon.project,
    revision: targetRevision,
    repository: "terryyin/pygardon",
  });
  await openUntilRead(page);
  const consumer = storyCard(parts(page).backlog, "Story A");
  await openDependencies(consumer);
  await followReference(consumer, "Story B");
  await expect(storyCard(parts(page).backlog, "Story B")).toBeFocused();
  await chooseProject(page, "Pygardon");
  await expect(dependencySummary(consumer)).toBeVisible();
  await openDependencies(consumer);
  const reference = storyReference(consumer, "Pygardon selected story");
  await expect(reference).toHaveAttribute(
    "href",
    `https://github.com/terryyin/pygardon/blob/${targetRevision}/.planning/${pygardonHome}`,
  );
  await reference.click();
  const destination = storyCard(parts(page).backlog, "Pygardon selected story");
  await expect(
    destination.getByRole("region", {
      name: "Detail for Pygardon selected story",
    }),
  ).toBeVisible();
  await expect(destination).toBeFocused();
  await expect(destination).toBeInViewport({ ratio: 0.5 });
  await expect(storyCard(parts(page).backlog, "Story B")).toHaveCount(0);
  expectRoute(page, { project: "pygardon" });
  expect(dashboard.claudeLaunchCalls()).toEqual([]);
  expect(dashboard.claudeAttaches()).toEqual([]);
});
