import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { expect, type Page } from "@playwright/test";
import {
  passTimeUntilChecked,
  passTimeUntilCheckedAfterSettled,
} from "./autoRefreshJourney.ts";
import type { CommittedOrigin } from "./committedOrigin.ts";
import { parts } from "./dashboardPage.ts";
import { untilPageReadsAnswered } from "./pageRequestNotes.ts";
import { commitPaths, recordState } from "./storyReadinessCli.ts";
import {
  plannedBlocked,
  seedRelative,
  type ReadinessRepo,
} from "./storyReadinessFixture.ts";

export async function expectQueuedPlanFocusDuringEnrichment(
  page: Page,
  repo: ReadinessRepo,
  origin: CommittedOrigin,
) {
  const { backlog, project } = parts(page);
  const card = backlog.getByRole("article", { name: plannedBlocked.title });
  // The plan link is in the story's detail, which stays open across snapshots.
  await card.getByRole("button", { name: "Inspect story" }).click();
  const plan = card
    .getByRole("region", { name: `Detail for ${plannedBlocked.title}` })
    .getByRole("link", { name: /^Slice plan / });
  await expect(plan).toBeVisible();
  // Settle enrichment before advancing the paused clock: a still-pending
  // detail ask would hit the wait bound and arm recovery that blocks checks.
  await untilPageReadsAnswered(page);

  // Membership temporarily drops the derived link. While canonical reading is
  // held, a deliberate move away from fallback card wins over deferred focus.
  for (const movedTo of [
    project.getByRole("radio", { checked: true }),
    card.getByRole("button", { name: "Hide detail" }),
  ]) {
    const seed = join(repo.directory, ".planning", seedRelative);
    writeFileSync(seed, `${readFileSync(seed, "utf8")}\n`);
    const fresh = commitPaths(
      repo.directory,
      [`.planning/${seedRelative}`],
      "Publish fresh preparation for focus observation",
    );
    repo.advanceTo(fresh);
    origin.advanceTo(fresh);
    const releaseSeed = origin.hold(`.planning/${seedRelative}`);
    await plan.focus();
    await passTimeUntilChecked(page);
    await expect(card).toBeFocused();
    await expect(plan).toHaveCount(0);
    await movedTo.focus();
    releaseSeed();
    await expect(plan).toBeVisible();
    await expect(movedTo).toBeFocused();
    await untilPageReadsAnswered(page);
  }

  // A truly removed association completes enrichment without a plan link and
  // leaves focus on the original work card, rather than another card/link.
  recordState(repo.directory, plannedBlocked, {
    refinement: "refined",
    approach: "planless",
  });
  const revision = commitPaths(
    repo.directory,
    [`.planning/${seedRelative}`],
    "Remove queued plan association",
  );
  repo.advanceTo(revision);
  origin.advanceTo(revision);
  await plan.focus();
  await passTimeUntilCheckedAfterSettled(page);
  await expect(card.getByText("Planless", { exact: true })).toBeVisible();
  await expect(plan).toHaveCount(0);
  await expect(card).toBeFocused();
}
