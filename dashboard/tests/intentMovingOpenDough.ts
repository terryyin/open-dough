// Open Dough with its Test Optimization Candidates record on a trunk that
// moves while the page is open, for Intent journeys across a new revision
// (`./intent-ci-status-kept.spec.ts`,
// `./intent-test-optimization-candidates-revision.spec.ts`).

import { filesOf } from "./catalogProjectRecords.ts";
import {
  openDoughCandidatesRecord,
  openDoughSources,
  testOptimizationCandidatesPath,
} from "./intentCandidatesFixtures.ts";
import { openDough, openDoughSettings } from "./intentCodeBrowseFixtures.ts";
import { publishMovingFiles, type MovingFiles } from "./publishedFiles.ts";

const openDoughFiles = {
  ...filesOf(openDough),
  ".planning/open-dough.json": `${openDoughSettings}\n`,
  ...openDoughSources,
};

export function publishMovingOpenDough(
  page: Parameters<typeof publishMovingFiles>[0],
) {
  return publishMovingFiles(page, {
    repository: openDough.repository,
    ref: openDough.ref,
    revision: openDough.revision,
    files: openDoughFiles,
  });
}

// Moves that trunk to `revision`, publishing `record` there.
export function moveOpenDoughTrunk(
  origin: MovingFiles,
  revision: string,
  record: string = openDoughCandidatesRecord,
) {
  origin.moveTrunk({
    revision,
    files: { ...openDoughFiles, [testOptimizationCandidatesPath]: record },
  });
}
