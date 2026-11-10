// Policy qualification and failure recovery step the existing serial watcher;
// no additional build chain or server is started for these variants.
import { expect, test } from "../support/pageTest.ts";
import { existsSync } from "node:fs";
import { rm, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  expectStillServing,
  preparations,
  settledSkip,
} from "../support/productionWatcher.ts";
import { builtCommitPrefixes } from "../support/productionBuildGate.ts";
import { faultCause, heldOnceFault } from "../support/productionFault.ts";
import { pushExclusions } from "../support/productionQualificationFixture.ts";
import { ciWorkflowPath } from "../../server/productionQualification.mjs";
import {
  prefixesOf,
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
  test("npm watcher skips an excluded-only main range without install, build or restart", async () => {
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
    await expectStillServing(state.served, page, "MAIN C");
  });

  test("npm watcher builds an accumulated and mixed range once at its latest commit", async () => {
    const state = journey.started();
    const { fixture, page, watcher } = state;
    const before = await journey.work();

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
  });

  test("npm watcher follows the published CI policy over a different local workflow", async () => {
    const state = journey.started();
    const { fixture, page, watcher } = state;
    const e = state.built.at(-1) ?? "";

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
    await expectStillServing(state.served, page, "MAIN E");
  });

  // The recovery chain below steps one watcher through rejection, repair,
  // a failed real build and the next comparison. The journey records each
  // activation; R and S, published before they settle, pass to later steps.
  let r: string;
  let s: string;

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
    await expect
      .poll(() => watcher.output().split(policyError).length - 1, {
        timeout: 0,
      })
      .toBeGreaterThan(2);
    expect(await journey.work()).toEqual(before);
    await expectStillServing(state.served, page, "MAIN E");
  });

  test("npm watcher activates a policy repair that qualifies only through the rejected application's retained paths", async () => {
    // This step owns a real npm install, Vite build and preview replacement.
    // CI took 28 s to activate Q, leaving no default-budget time to read it.
    test.setTimeout(60_000);
    const state = journey.started();
    const { fixture, page } = state;

    // Q repairs only ignored workflow/docs paths. Only retained P application
    // paths can qualify this range; advancing the baseline on P would skip Q.
    const q = await fixture.publish(
      {
        [ciWorkflowPath]: publishedPolicy(state.workflow),
        "docs/q.md": "# Q\n",
      },
      "Valid policy Q",
    );
    await journey.replacedBy(q);
    await page.reload();
    await expect(page).toHaveTitle("MAIN P");
    expect(await builtCommitPrefixes(fixture.home)).toEqual(
      prefixesOf(state.built),
    );
  });

  test("npm watcher keeps the repaired preview serving when the next commit fails its real build", async () => {
    const state = journey.started();
    const { fixture, page, watcher } = state;
    const q = state.built.at(-1) ?? "";

    // R fails its real build once. Documentation-only S reaches main while
    // R's held fault gate waits, so the next check compares S with Q, never
    // with R, and R is not retried. R's gate consumes the cause as it fails,
    // so S does not fail first.
    const buildFault = faultCause(fixture.home, "build");
    await writeFile(buildFault, "transient build cause");
    await writeFile(`${buildFault}-held`, "");
    r = await fixture.publish(
      {
        ...fixture.markerChanges("MAIN R"),
        "production-fault.mjs": heldOnceFault,
      },
      "Main R",
    );
    await expect
      .poll(() => watcher.output(), { timeout: 0 })
      .toContain(`Preparing production dashboard ${r}.`);
    s = await fixture.publish({ "docs/s.md": "# S\n" }, "Document S");
    await rm(`${buildFault}-held`);
    await expect
      .poll(() => watcher.output(), { timeout: 0 })
      .toContain(`Production update failed for ${r}: `);
    expect(watcher.output()).toContain("TRANSIENT build FAILURE");
    expect(watcher.output()).toContain(`Keeping ${q} at ${state.served.url}`);
    expect(existsSync(buildFault)).toBe(false);
    await expectStillServing(state.served, page, "MAIN P");
  });

  test("npm watcher activates the next commit, compared with the last successful activation across the failed build", async () => {
    const state = journey.started();
    const { fixture, page, watcher } = state;

    await journey.replacedBy(s);
    expect(watcher.output()).not.toContain(`Skipping production update ${s}`);
    expect(watcher.output()).not.toContain(`Production update failed for ${s}`);
    expect(preparations(watcher, r)).toBe(1);
    expect(watcher.output()).not.toMatch(
      new RegExp(`Production dashboard ${r} at`),
    );
    await page.reload();
    await expect(page).toHaveTitle("MAIN R");
    expect(await builtCommitPrefixes(fixture.home)).toEqual(
      prefixesOf(state.built),
    );
  });

  test("npm watcher compares the next excluded range from its latest successful activation", async () => {
    const state = journey.started();
    const { fixture, page, watcher } = state;

    // The next comparison starts at S, so documentation-only T is skipped.
    const beforeT = await journey.work();
    const t = await fixture.publish({ "docs/t.md": "# T\n" }, "Document T");
    await settledSkip(watcher, t);
    expect(watcher.output()).toContain(
      `Skipping production update ${t}: every change since ${s} is excluded by its CI push policy.`,
    );
    expect(await journey.work()).toEqual(beforeT);
    await expectStillServing(state.served, page, "MAIN R");
  });
}
