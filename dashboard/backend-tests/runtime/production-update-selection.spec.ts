// Real published Git trees exercise the selection state used by the watcher.
// Only observed successful activation advances the serving baseline.
import { expect, test } from "../../tests/support/pageTest.ts";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { publishedUpdates } from "../../server/productionUpdates.mjs";
import { ciWorkflowPath } from "../../server/productionQualification.mjs";
import {
  pushExclusions,
  qualificationFixture,
} from "../../tests/support/productionQualificationFixture.ts";

test("excluded ranges keep the last activation as the comparison baseline", async () => {
  const { fixture, workflow, inspectionsRoot } = await qualificationFixture();
  try {
    const a = await fixture.publish(
      { [ciWorkflowPath]: workflow, "app.js": "A" },
      "Working A",
    );
    const baseline = { origin: fixture.origin, commit: a };
    const updates = publishedUpdates({
      developmentRoot: fixture.development,
      baseline,
      inspectionsRoot,
      env: fixture.env,
    });
    const published = (commit: string) => ({ origin: fixture.origin, commit });
    expect(await updates.select(baseline)).toBe("unchanged");
    const d = await fixture.publish({ "docs/d.md": "D" }, "Excluded D");
    expect(await updates.select(published(d))).toBe("excluded");
    expect(await updates.select(published(d))).toBe("already-excluded");
    expect(updates.baseline).toEqual(baseline);
    await fixture.commit({ "app.js": "E" }, "Application E");
    const e = await fixture.publish({ "docs/e.md": "E" }, "Notes E");
    expect(await updates.select(published(e))).toBe("candidate");
    expect(updates.baseline).toEqual(baseline);
    updates.activated(published(e));
    const t = await fixture.publish({ "docs/t.md": "T" }, "Excluded T");
    expect(await updates.select(published(t))).toBe("excluded");
    expect(updates.baseline).toEqual(published(e));
  } finally {
    await fixture.cleanup();
  }
});

test("rejected policies retain application changes until an ignored repair qualifies", async () => {
  const { fixture, workflow, inspectionsRoot } = await qualificationFixture();
  try {
    const policy = workflow.replace(
      pushExclusions,
      `${pushExclusions}      - ".github/**"\n`,
    );
    const a = await fixture.publish(
      { [ciWorkflowPath]: policy, "app.js": "A" },
      "Working A",
    );
    const published = (commit: string) => ({ origin: fixture.origin, commit });
    const updates = publishedUpdates({
      developmentRoot: fixture.development,
      baseline: published(a),
      inspectionsRoot,
      env: fixture.env,
    });
    const p = await fixture.publish(
      {
        [ciWorkflowPath]: policy.replace("  push:\n", "  push:\n    # P\n"),
        "app.js": "P",
      },
      "Rejected P",
    );
    for (let check = 0; check < 2; check += 1) {
      await expect(updates.select(published(p))).rejects.toThrow(
        "has an unsupported CI push path policy",
      );
      expect(updates.baseline).toEqual(published(a));
    }
    const q = await fixture.publish(
      { [ciWorkflowPath]: policy, "docs/q.md": "Q" },
      "Ignored repair Q",
    );
    expect(await updates.select(published(q))).toBe("candidate");
    expect(updates.baseline).toEqual(published(a));
  } finally {
    await fixture.cleanup();
  }
});

test("unactivated candidates retry until successful activation advances the baseline", async () => {
  const { fixture, workflow, inspectionsRoot } = await qualificationFixture();
  try {
    const a = await fixture.publish(
      { [ciWorkflowPath]: workflow, "app.js": "A" },
      "Working A",
    );
    const published = (commit: string) => ({ origin: fixture.origin, commit });
    const updates = publishedUpdates({
      developmentRoot: fixture.development,
      baseline: published(a),
      inspectionsRoot,
      env: fixture.env,
    });
    // Local edits remain outside the published policy and pending range.
    await writeFile(path.join(fixture.development, ciWorkflowPath), "local");
    const r = await fixture.publish({ "app.js": "R" }, "Unactivated R");
    expect(await updates.select(published(r))).toBe("candidate");
    expect(await updates.select(published(r))).toBe("candidate");
    const s = await fixture.publish({ "docs/s.md": "S" }, "Document S");
    expect(await updates.select(published(s))).toBe("candidate");
    expect(updates.baseline).toEqual(published(a));
    updates.activated(published(s));
    const t = await fixture.publish({ "docs/t.md": "T" }, "Document T");
    expect(await updates.select(published(t))).toBe("excluded");
    expect(updates.baseline).toEqual(published(s));
  } finally {
    await fixture.cleanup();
  }
});
