// A presentation journey starts with a known Done comparison and raw proof
// observations. Real CLI publication and endpoint resolution have their own
// wiring journeys; they are not prerequisites for inspecting relative marks.
import type { Page } from "@playwright/test";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import type { CiProof, CiProofEntry } from "../../src/ciProof.ts";
import type { StoryCiComparisonSlot } from "../../src/storyCiComparison.ts";
import { describedFiles } from "../describedRevisions.ts";
import { openDough } from "../intentCodeBrowseFixtures.ts";
import { publishProject } from "../intentCiStatusPage.ts";

type Endpoint = "baseline" | "branch" | "landed";

export async function prepareRelativeComparisonReading(
  page: Page,
  entries: Readonly<Record<Endpoint, readonly CiProofEntry[]>>,
  wallTimes: Readonly<Record<Endpoint, number>>,
) {
  const identity = "SEED-1#relative-reading";
  const revision = {
    baseline: "a1".repeat(20),
    branch: "b1".repeat(20),
    landed: "c1".repeat(20),
  };
  publishProject(
    page,
    openDough,
    describedFiles({
      doneRecords: [
        makeMe.aDoneRecord
          .completed({
            identity,
            title: "Story A",
            completedAt: new Date().toISOString(),
          })
          .please(),
      ],
    }),
  );
  const slots = new Map<Endpoint, StoryCiComparisonSlot>();
  const proofByRun = new Map<
    string,
    {
      runId: number;
      runAttempt: number;
      revision: string;
      checkedAt: string;
      proof: CiProof;
    }
  >();
  for (const [index, endpoint] of (
    ["baseline", "branch", "landed"] as const
  ).entries()) {
    const runId = index + 101;
    const startedAt = `2026-11-05T${12 + index}:00:00Z`;
    slots.set(
      endpoint,
      makeMe.aStoryCiComparisonSlot
        .with({
          kind: "build" as const,
          revision: revision[endpoint],
          subject: `${endpoint} build`,
          state: "pass" as const,
          selection: "exact" as const,
          laterWithoutResult: 0,
          runId,
          runAttempt: 1,
          runUrl: `https://ci.invalid/runs/${runId}`,
          startedAt,
          completedAt: new Date(
            Date.parse(startedAt) + wallTimes[endpoint],
          ).toISOString(),
          timeWithoutRunnerWaits: { reason: "Runner waits not recorded" },
        })
        .please(),
    );
    proofByRun.set(
      String(runId),
      makeMe.anIntentCiProofAnswer
        .with({
          runId,
          runAttempt: 1 as const,
          revision: revision[endpoint],
          checkedAt: "2026-11-05T15:00:00Z",
          proof: makeMe.aCiProof
            .forRun({ runId, revision: revision[endpoint] })
            .entries([...entries[endpoint]])
            .please(),
        })
        .please(),
    );
  }
  const baseline = slots.get("baseline");
  const branch = slots.get("branch");
  const landed = slots.get("landed");
  if (baseline === undefined || branch === undefined || landed === undefined)
    throw new Error(
      "Relative comparison reading requires all three build slots",
    );
  const comparison = makeMe.aStoryCiComparison
    .with({
      kind: "comparison",
      identity,
      phase: "done",
      mode: "story-branch",
      completion: revision.landed,
      storyStart: revision.baseline,
      checkedAt: "2026-11-05T15:00:00Z",
      baseline,
      branch,
      landed,
    })
    .please();
  await page.route(/\/__authenticated-read\?/, async (route) => {
    const query = new URL(route.request().url()).searchParams;
    const run = query.get("run");
    if (query.get("intent") === "ci-comparison") {
      await route.fulfill({ json: comparison });
    } else if (
      query.get("intent") === "ci-proof" &&
      run !== null &&
      proofByRun.has(run)
    ) {
      await route.fulfill({ json: proofByRun.get(run) });
    } else {
      await route.fallback();
    }
  });
}
