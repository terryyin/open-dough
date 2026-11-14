// These real watcher observations protect no-work and repeated rejection.
// Detailed range/baseline variants use the same production selection owner in
// backend-tests/runtime/production-update-selection.spec.ts without deployment staging.
import { expect, test } from "../../dashboard/tests/support/pageTest.ts";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import {
  expectStillServing,
  settledSkip,
} from "../../dashboard/tests/support/productionWatcher.ts";
import { observeWatcherOutput } from "../../dashboard/tests/support/watcherEvents.ts";
import { publishedPolicy } from "../../dashboard/tests/support/productionQualificationFixture.ts";
import { ciWorkflowPath } from "../../dashboard/server/productionQualification.mjs";
import type { ProductionUpdateJourney } from "./productionUpdateJourney.ts";

export function productionUpdatePolicies(journey: ProductionUpdateJourney) {
  test("npm watcher skips an excluded-only main range without install, build or restart", async () => {
    const state = journey.started();
    const { fixture, page, watcher } = state;
    const baseline = state.built.at(-1) ?? "";
    const before = await journey.work();
    const d = await fixture.publish(
      { "docs/d.md": "# D\n", ".planning/d.md": "# D\n" },
      "Document D",
    );
    await settledSkip(watcher, d);
    expect(watcher.output()).toContain(
      `Skipping production update ${d}: every change since ${baseline} is excluded by its CI push policy.`,
    );
    expect(await journey.work()).toEqual(before);
    await expectStillServing(state.served, page, "MAIN C");
  });

  test("npm watcher follows the published CI policy over a different local workflow", async () => {
    const state = journey.started();
    const { fixture, page, watcher } = state;
    const baseline = state.built.at(-1) ?? "";
    await writeFile(
      path.join(fixture.development, ciWorkflowPath),
      state.workflow,
    );
    const before = await journey.work();
    const g = await fixture.publish({ "extra/g.md": "# G\n" }, "Extra G");
    await settledSkip(watcher, g);
    expect(watcher.output()).toContain(
      `Skipping production update ${g}: every change since ${baseline} is excluded by its CI push policy.`,
    );
    expect(await journey.work()).toEqual(before);
    await expectStillServing(state.served, page, "MAIN C");
  });

  test("npm watcher keeps its baseline through an unsupported published policy, reported on each check before any install", async () => {
    const state = journey.started();
    const { fixture, page, watcher } = state;
    const baseline = state.built.at(-1) ?? "";
    const before = await journey.work();
    const p = await fixture.publish(
      {
        [ciWorkflowPath]: publishedPolicy(state.workflow).replace(
          "  push:\n",
          "  push:\n    # P\n",
        ),
        ...fixture.markerChanges("MAIN P"),
      },
      "Unsupported policy P",
    );
    const policyError = `Production update failed for ${p}: ${ciWorkflowPath} at ${p} has an unsupported CI push path policy.\nKeeping ${baseline} at ${state.served.url}; retrying on a later check.`;
    await observeWatcherOutput(watcher, (output) =>
      output.split(policyError).length > 3 ? true : undefined,
    );
    expect(await journey.work()).toEqual(before);
    await expectStillServing(state.served, page, "MAIN C");
  });
}
