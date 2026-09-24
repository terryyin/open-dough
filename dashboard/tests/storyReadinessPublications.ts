// Publication steps that advance an existing readiness repo: plan progress,
// assessed-content change, plan-association conflict, and backlog membership
// drop/restore. Builders stay in storyReadinessFixture.ts.

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { commitPaths, writePlanning } from "./storyReadinessCli";
import {
  openDoughProductBacklog,
  planBlockedPath,
  planReadyPath,
  planReadyTwoDoneBody,
  type ReadinessRepo,
  seedRelative,
} from "./storyReadinessFixture";

function publishOpenDoughMembership(
  repo: ReadinessRepo,
  takenPlanPath: string,
  message: string,
  options?: { includeUnrefined?: boolean },
): string {
  writePlanning(
    repo.directory,
    "PRODUCT-BACKLOG.md",
    openDoughProductBacklog(takenPlanPath, options),
  );
  const next = commitPaths(
    repo.directory,
    [".planning/PRODUCT-BACKLOG.md"],
    message,
  );
  repo.advanceTo(next);
  return next;
}

// Second publication: records two of five slices done with accepted proof in
// the plan text the shared reader interprets. Does not hand-build display state.
// Only the plan path is committed so the unpushed seed edit stays unpublished.
// A caller may supply the same progress in another accepted plan layout.
export function publishTwoSlicesDone(
  repo: ReadinessRepo,
  planBody = planReadyTwoDoneBody,
): string {
  writePlanning(repo.directory, planReadyPath, planBody);
  const next = commitPaths(
    repo.directory,
    [`.planning/${planReadyPath}`],
    "Record two of five slices done with accepted proof",
  );
  repo.advanceTo(next);
  return next;
}

// Publishes assessed-content change without re-recording assessment. Shared
// seed digest shifts for every assessed story in that file.
export function publishAssessedContentChange(repo: ReadinessRepo): string {
  const seedPath = join(repo.directory, ".planning", seedRelative);
  const current = readFileSync(seedPath, "utf8");
  writeFileSync(
    seedPath,
    `${current}\n\nAssessed scope changed without a fresh assessment.\n`,
    "utf8",
  );
  const next = commitPaths(
    repo.directory,
    [`.planning/${seedRelative}`],
    "Change assessed seed content without reassessment",
  );
  repo.advanceTo(next);
  return next;
}

// Points the Taken backlog plan at the blocked plan while story-state still
// associates the ready plan — a conflict the shared readers must report.
export function publishConflictingPlanAssociation(repo: ReadinessRepo): string {
  return publishOpenDoughMembership(
    repo,
    planBlockedPath,
    "Introduce conflicting backlog plan association",
  );
}

// Drops the unrefined backlog entry from membership so a refresh can announce
// removal while another story's identity focus is preserved.
export function publishDropUnrefined(repo: ReadinessRepo): string {
  return publishOpenDoughMembership(
    repo,
    planReadyPath,
    "Drop unrefined story from published backlog membership",
    { includeUnrefined: false },
  );
}

// Restores the three-story Open Dough backlog membership after a drop.
export function publishRestoreUnrefined(repo: ReadinessRepo): string {
  return publishOpenDoughMembership(
    repo,
    planReadyPath,
    "Restore unrefined story to published backlog membership",
  );
}
