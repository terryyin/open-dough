import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { expect, type Page } from "@playwright/test";
import type { CommittedOrigin } from "./committedOrigin";
import { parts } from "./dashboardPage";
import { commitPaths, recordState } from "./storyReadinessCli";
import {
  plannedBlocked,
  seedRelative,
  type ReadinessRepo,
} from "./storyReadinessFixture";

export async function expectQueuedPlanFocusDuringEnrichment(
  page: Page,
  repo: ReadinessRepo,
  origin: CommittedOrigin,
) {
  const { backlog, refresh, project } = parts(page);
  const card = backlog.getByRole("article", { name: plannedBlocked.title });
  const plan = card.getByRole("link", { name: /^Slice plan / });
  await expect(plan).toBeVisible();

  // Membership temporarily drops the derived link. While canonical reading is
  // held, a deliberate move away from fallback card wins over deferred focus.
  for (const movedTo of [
    project.getByRole("radio", { checked: true }),
    card.getByRole("button", { name: "Inspect story" }),
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
    const releaseMain = origin.hold("main");
    const releaseSeed = origin.hold(`.planning/${seedRelative}`);
    await refresh.click();
    await plan.focus();
    releaseMain();
    await expect(card).toBeFocused();
    await expect(plan).toHaveCount(0);
    await movedTo.focus();
    releaseSeed();
    await expect(plan).toBeVisible();
    await expect(movedTo).toBeFocused();
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
  const releaseRemoved = origin.hold("main");
  await refresh.click();
  await plan.focus();
  releaseRemoved();
  await expect(card.getByText("Planless", { exact: true })).toBeVisible();
  await expect(plan).toHaveCount(0);
  await expect(card).toBeFocused();
}
