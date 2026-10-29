// Policy qualification and failure recovery step the existing serial watcher;
// no additional build chain or server is started for these variants.
import { expect, test } from "./pageTest.ts";
import { rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { processRunning } from "./processGroup.ts";
import { settledSkip } from "./productionWatcher.ts";
import { builtCommitPrefixes } from "./productionBuildGate.ts";
import { ciWorkflowPath } from "../../server/productionQualification.mjs";
import {
  prefixesOf,
  pushExclusions,
  type ProductionUpdateJourney,
} from "./productionUpdateJourney.ts";

// Workflow repairs and docs stay excluded, so recovery must retain the failed
// application's paths. Extra conflicts with the original dirty local policy.
const publishedPolicy = (workflow: string) =>
  workflow.replace(
    pushExclusions,
    `${pushExclusions}      - "extra/**"\n      - ".github/**"\n`,
  );

export function productionUpdatePolicies(journey: ProductionUpdateJourney) {
  test("npm watcher skips excluded-only main ranges, builds accumulated and mixed ranges once at the latest commit, and follows the published CI policy over a different local workflow", async () => {
    test.setTimeout(150_000);
    const state = journey.started();
    const { fixture, page, watcher } = state;
    const baseline = state.built.at(-1) ?? "";

    // Excluded-only D: completed checks keep the served commit without
    // install, build or restart.
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
    expect(processRunning(state.served.pid)).toBe(true);
    await page.reload();
    await expect(page).toHaveTitle("MAIN C");

    // The published policy and application, then documentation alone, reach
    // main together. Their whole range builds the latest commit exactly once.
    const application = await fixture.commit(
      {
        ...fixture.markerChanges("MAIN E"),
        "docs/e.md": "# E\n",
        [ciWorkflowPath]: publishedPolicy(state.workflow),
      },
      "Application E",
    );
    const e = await fixture.commit({ "docs/e-notes.md": "# E\n" }, "Notes E");
    await fixture.push();
    await journey.replacedBy(e);
    await page.reload();
    await expect(page).toHaveTitle("MAIN E");
    expect(watcher.output()).not.toContain(application);
    expect(await builtCommitPrefixes(fixture.home)).toEqual(
      prefixesOf(state.built),
    );
    expect((await journey.work()).preparing).toBe(before.preparing + 1);

    // The development checkout keeps a different, uncommitted workflow.
    await writeFile(
      path.join(fixture.development, ciWorkflowPath),
      state.workflow,
    );

    const beforeG = await journey.work();
    const g = await fixture.publish({ "extra/g.md": "# G\n" }, "Extra G");
    await settledSkip(watcher, g);
    expect(watcher.output()).toContain(
      `every change since ${e} is excluded by its CI push policy.`,
    );
    expect(await journey.work()).toEqual(beforeG);
    expect(processRunning(state.served.pid)).toBe(true);

    await page.reload();
    await expect(page).toHaveTitle("MAIN E");
  });

  test("npm watcher keeps its baseline through an unsupported published policy and failed builds, then compares from the next successful activation", async () => {
    test.setTimeout(150_000);
    const state = journey.started();
    const { fixture, page, watcher } = state;
    const baseline = state.built.at(-1) ?? "";

    // An unsupported policy at P is reported on each check before any install.
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
    await expect
      .poll(() => watcher.output().split(policyError).length - 1, {
        timeout: 60_000,
      })
      .toBeGreaterThan(2);
    expect(await journey.work()).toEqual(before);
    expect(processRunning(state.served.pid)).toBe(true);
    await page.reload();
    await expect(page).toHaveTitle("MAIN E");

    // Q repairs only ignored workflow/docs paths. Only retained P application
    // paths can qualify this range; advancing the baseline on P would skip Q.
    const q = await fixture.publish(
      {
        [ciWorkflowPath]: publishedPolicy(state.workflow),
        "docs/q.md": "# Q\n",
      },
      "Valid policy Q",
    );
    const atQ = await journey.replacedBy(q);
    await page.reload();
    await expect(page).toHaveTitle("MAIN P");
    expect(await builtCommitPrefixes(fixture.home)).toEqual(
      prefixesOf(state.built),
    );

    // R fails its real build; documentation-only S is still compared with Q.
    const buildFault = path.join(fixture.home, "fault-build");
    await writeFile(buildFault, "transient build cause");
    const r = await fixture.publish(fixture.markerChanges("MAIN R"), "Main R");
    await expect
      .poll(() => watcher.output(), { timeout: 120_000 })
      .toContain(`Production update failed for ${r}: `);
    expect(watcher.output()).toContain("TRANSIENT build FAILURE");
    const s = await fixture.publish({ "docs/s.md": "# S\n" }, "Document S");
    await expect
      .poll(() => watcher.output(), { timeout: 120_000 })
      .toContain(`Production update failed for ${s}: `);
    expect(watcher.output()).toContain(`Keeping ${q} at ${state.served.url}`);
    expect(processRunning(atQ.pid)).toBe(true);
    await page.reload();
    await expect(page).toHaveTitle("MAIN P");
    await rm(buildFault);
    await journey.replacedBy(s);
    expect(watcher.output()).not.toContain(`Skipping production update ${s}`);
    expect(watcher.output()).not.toMatch(
      new RegExp(`Production dashboard ${r} at`),
    );
    await page.reload();
    await expect(page).toHaveTitle("MAIN R");
    expect(await builtCommitPrefixes(fixture.home)).toEqual(
      prefixesOf(state.built),
    );

    // The next comparison starts at S, so documentation-only T is skipped.
    const beforeT = await journey.work();
    const t = await fixture.publish({ "docs/t.md": "# T\n" }, "Document T");
    await settledSkip(watcher, t);
    expect(watcher.output()).toContain(
      `Skipping production update ${t}: every change since ${s} is excluded by its CI push policy.`,
    );
    expect(await journey.work()).toEqual(beforeT);
    expect(processRunning(state.served.pid)).toBe(true);
    await page.reload();
    await expect(page).toHaveTitle("MAIN R");
  });
}
