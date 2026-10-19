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

    // An application commit (with documentation) then a documentation-only
    // commit reach main together: the whole range qualifies and builds the
    // latest commit once.
    const application = await fixture.commit(
      { ...fixture.markerChanges("MAIN E"), "docs/e.md": "# E\n" },
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

    // F changes the published push exclusions within a mixed update.
    const policy = state.workflow.replace(
      pushExclusions,
      '    paths-ignore:\n      - ".planning/**"\n      - "extra/**"\n',
    );
    const f = await fixture.publish(
      {
        [ciWorkflowPath]: policy,
        "docs/policy.md": "# Policy\n",
        ...fixture.markerChanges("MAIN F"),
      },
      "Policy F",
    );
    await journey.replacedBy(f);
    await page.reload();
    await expect(page).toHaveTitle("MAIN F");
    // The development checkout keeps a different, uncommitted workflow.
    await writeFile(
      path.join(fixture.development, ciWorkflowPath),
      state.workflow,
    );

    const beforeG = await journey.work();
    const g = await fixture.publish({ "extra/g.md": "# G\n" }, "Extra G");
    await settledSkip(watcher, g);
    expect(watcher.output()).toContain(
      `every change since ${f} is excluded by its CI push policy.`,
    );
    expect(await journey.work()).toEqual(beforeG);
    expect(processRunning(state.served.pid)).toBe(true);

    // F's published policy no longer excludes docs/, so H qualifies.
    const h = await fixture.publish({ "docs/h.md": "# H\n" }, "Document H");
    await journey.replacedBy(h);
    expect(watcher.output()).not.toContain(`Skipping production update ${h}`);
    expect(await builtCommitPrefixes(fixture.home)).toEqual(
      prefixesOf(state.built),
    );
    await page.reload();
    await expect(page).toHaveTitle("MAIN F");
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
        [ciWorkflowPath]: state.workflow.replace(
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
    await expect(page).toHaveTitle("MAIN F");

    // A valid Q appears: the range to Q still holds P's application change.
    const q = await fixture.publish(
      { [ciWorkflowPath]: state.workflow, "docs/q.md": "# Q\n" },
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
  });
}
