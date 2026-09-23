import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { expect, type Page } from "@playwright/test";
import type { CommittedOrigin } from "./committedOrigin";
import { expectMembership, parts } from "./dashboardPage";
import { planHref } from "./queuedPlanNavigation";
import { commitPaths, recordState, writePlanning } from "./storyReadinessCli";
import {
  openDoughProductBacklog,
  plannedBlocked,
  plannedReady,
  planBlockedPath,
  planReadyPath,
  seedRelative,
  unrefined,
  type ReadinessRepo,
} from "./storyReadinessFixture";

export async function expectChangedQueuedAssociations(
  page: Page,
  repo: ReadinessRepo,
  origin: CommittedOrigin,
) {
  const { backlog, source, refresh } = parts(page);
  const card = backlog.getByRole("article", { name: plannedBlocked.title });
  const plan = card.getByRole("link", { name: /^Slice plan / });
  const publish = async (paths: string[], message: string) => {
    const revision = commitPaths(
      repo.directory,
      paths.map((path) => `.planning/${path}`),
      message,
    );
    repo.advanceTo(revision);
    origin.advanceTo(revision);
    await refresh.click();
    await expect(source).toContainText(revision);
    await expectMembership(page, {
      taken: [plannedReady.title],
      backlog: [unrefined.title, plannedBlocked.title],
    });
    return revision;
  };
  await expect(card.getByText("Not ready", { exact: true })).toBeVisible();
  await expect(plan).toHaveAttribute(
    "href",
    planHref("terryyin/open-dough", repo.revision),
  );

  // Publish a new canonical association with real CLI output, without adding
  // a redundant backlog link. Opening detail observes the refreshed snapshot.
  recordState(repo.directory, plannedBlocked, {
    refinement: "refined",
    approach: "planned",
    plan: "../quick/075-ready/PLAN.md",
  });
  let revision = await publish(
    [seedRelative],
    "Associate queued story with another published plan",
  );
  await expect(plan).toHaveAttribute(
    "href",
    planHref("terryyin/open-dough", revision, planReadyPath),
  );
  await card.getByRole("button", { name: "Inspect story" }).click();
  await expect(card).toContainText("0 of 5 recorded complete");

  writePlanning(
    repo.directory,
    planReadyPath,
    "# Plan\n\nA layout without an ordered-slices section.\n",
  );
  revision = await publish([planReadyPath], "Publish unsupported slice layout");
  await expect(card).toContainText("Plan slices uninterpretable");
  await expect(plan).toHaveAttribute(
    "href",
    planHref("terryyin/open-dough", revision, planReadyPath),
  );

  // Invalid persisted state must cross the actual shared reader. The writer
  // cannot create a path escaping the fixture repository, so corrupt only the
  // recorded source bytes, not any dashboard display object.
  const seed = join(repo.directory, ".planning", seedRelative);
  const original = readFileSync(seed, "utf8");
  writeFileSync(
    seed,
    original.replace(
      '"plan":"../quick/075-ready/PLAN.md"',
      '"plan":"../../../outside/PLAN.md"',
    ),
  );
  await publish([seedRelative], "Publish invalid canonical plan path");
  await expect(plan).toHaveCount(0);
  await expect(card).toContainText("Slice plan ../../../outside/PLAN.md");
  await expect(card).toContainText(
    "Not offered as a link. This does not name a file inside the observed repository.",
  );

  // A planless record and an explicit backlog plan disagree. Neither a normal
  // plan action nor progress from that backlog file can imply agreement.
  writeFileSync(seed, original);
  recordState(repo.directory, plannedBlocked, {
    refinement: "refined",
    approach: "planless",
  });
  writePlanning(
    repo.directory,
    "PRODUCT-BACKLOG.md",
    openDoughProductBacklog(planReadyPath, { includeQueuedPlan: true }),
  );
  revision = await publish(
    [seedRelative, "PRODUCT-BACKLOG.md"],
    "Publish planless versus backlog plan disagreement",
  );
  await expect(
    card.getByText("Plan association conflict", { exact: true }),
  ).toBeVisible();
  await expect(plan).toHaveCount(0);
  await expect(
    card.getByRole("link", { name: /^Disputed backlog plan / }),
  ).toHaveAttribute(
    "href",
    planHref("terryyin/open-dough", revision, planBlockedPath),
  );
  await expect(
    card.getByRole("link", { name: /^Disputed story-state plan / }),
  ).toHaveCount(0);
  await expect(card.getByText(/\d of \d recorded complete/)).toHaveCount(0);

  writePlanning(
    repo.directory,
    "PRODUCT-BACKLOG.md",
    openDoughProductBacklog(planReadyPath),
  );
  await publish(
    ["PRODUCT-BACKLOG.md"],
    "Remove legacy backlog association from planless story",
  );
  await expect(card.getByText("Planless", { exact: true })).toBeVisible();
  await expect(plan).toHaveCount(0);
  await expect(card).toContainText(
    "No associated plan is recorded for this story",
  );
}
