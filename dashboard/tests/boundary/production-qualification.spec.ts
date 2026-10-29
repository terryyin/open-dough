// Production qualification compares real published trees in owned inspection
// checkouts; the minimal fixture copies no workflow, so each case publishes
// the repository's actual CI workflow or a variant of it.
import { expect, test } from "../support/pageTest.ts";
import { readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  ciWorkflowPath,
  qualifyPublishedRange,
} from "../../server/productionQualification.mjs";
import {
  backgroundPackWriterGit,
  pushExclusions,
  qualificationFixture,
} from "../support/productionQualificationFixture.ts";

test("qualification spans the whole published range, including deletions and both rename endpoints", async () => {
  const { fixture, workflow, qualify } = await qualificationFixture();
  const tabbed = "old name\twith tab.js";
  try {
    const a = await fixture.publish(
      {
        [ciWorkflowPath]: workflow,
        "app.js": "A",
        "docs/guide.md": "guide",
        "docs/moved.md": "moved",
        [`app/${tabbed}`]: "tabbed",
      },
      "Baseline",
    );
    // An uncommitted local workflow without exclusions is not an input.
    await writeFile(
      path.join(fixture.development, ciWorkflowPath),
      workflow.replace(pushExclusions, ""),
    );
    const excluded = await fixture.publish(
      { "docs/guide.md": "edited", ".planning/notes\nline.md": "plan" },
      "Excluded only",
    );
    expect(await qualify(a, excluded)).toEqual({
      qualifies: false,
      changed: [".planning/notes\nline.md", "docs/guide.md"],
      qualifying: [],
    });

    await fixture.commit({ "app.js": "B" }, "Application");
    const accumulated = await fixture.publish(
      { "docs/guide.md": "later" },
      "Documentation",
    );
    expect((await qualify(excluded, accumulated)).qualifying).toEqual([
      "app.js",
    ]);
    const mixed = await fixture.publish(
      { "app.js": "C", "docs/guide.md": "mixed" },
      "Mixed",
    );
    expect(await qualify(accumulated, mixed)).toMatchObject({
      qualifies: true,
      qualifying: ["app.js"],
    });

    const deletedExcluded = await fixture.publish(
      { "docs/guide.md": null },
      "Delete documentation",
    );
    expect((await qualify(mixed, deletedExcluded)).qualifies).toBe(false);
    const deletedApplication = await fixture.publish(
      { "app.js": null },
      "Delete application",
    );
    expect(await qualify(deletedExcluded, deletedApplication)).toMatchObject({
      qualifies: true,
      changed: ["app.js"],
    });

    const intoApplication = await fixture.publish(
      { "docs/moved.md": null, "src/moved.md": "moved" },
      "Rename into application",
    );
    expect(await qualify(deletedApplication, intoApplication)).toEqual({
      qualifies: true,
      changed: ["docs/moved.md", "src/moved.md"],
      qualifying: ["src/moved.md"],
    });
    const outOfApplication = await fixture.publish(
      { [`app/${tabbed}`]: null, [`docs/${tabbed}`]: "tabbed" },
      "Rename out of application",
    );
    expect(await qualify(intoApplication, outOfApplication)).toEqual({
      qualifies: true,
      changed: [`app/${tabbed}`, `docs/${tabbed}`],
      qualifying: [`app/${tabbed}`],
    });
  } finally {
    await fixture.cleanup();
  }
});

test("qualification removes its inspection without racing Git's background maintenance", async () => {
  const { fixture, workflow, inspectionsRoot } = await qualificationFixture();
  try {
    const a = await fixture.publish(
      { [ciWorkflowPath]: workflow, "app.js": "A" },
      "Baseline",
    );
    const b = await fixture.publish({ "app.js": "B" }, "Application");
    const GIT_EXEC_PATH = await backgroundPackWriterGit(fixture.root);
    expect(
      await qualifyPublishedRange({
        developmentRoot: fixture.development,
        baseline: { origin: fixture.origin, commit: a },
        selected: { origin: fixture.origin, commit: b },
        inspectionsRoot,
        env: { ...fixture.env, GIT_EXEC_PATH },
      }),
    ).toEqual({ qualifies: true, changed: ["app.js"], qualifying: ["app.js"] });
    expect(await readdir(inspectionsRoot)).toEqual([]);
  } finally {
    await fixture.cleanup();
  }
});

test("qualification uses the selected commit's push policy and reports an unreadable or unsupported one", async () => {
  const { fixture, workflow, inspectionsRoot, qualify } =
    await qualificationFixture();
  try {
    const a = await fixture.publish(
      { [ciWorkflowPath]: workflow, "app.js": "A" },
      "Baseline",
    );
    // A's policy would qualify its own workflow edit; the selected one does not.
    const widened = await fixture.publish(
      {
        [ciWorkflowPath]: workflow.replace(
          pushExclusions,
          `${pushExclusions}      - ".github/**"\n`,
        ),
        "docs/policy.md": "policy",
      },
      "Exclude workflows",
    );
    expect(await qualify(a, widened)).toEqual({
      qualifies: false,
      changed: [ciWorkflowPath, "docs/policy.md"],
      qualifying: [],
    });

    const unrestricted = await fixture.publish(
      {
        [ciWorkflowPath]: workflow.replace(pushExclusions, ""),
        "docs/policy.md": "every path builds",
      },
      "No push exclusions",
    );
    expect((await qualify(widened, unrestricted)).qualifying).toEqual([
      ciWorkflowPath,
      "docs/policy.md",
    ]);

    const unsupported = await fixture.publish(
      {
        [ciWorkflowPath]: workflow.replace(
          "  push:\n",
          "  push:\n    # generated\n",
        ),
      },
      "Unsupported policy",
    );
    await expect(qualify(unrestricted, unsupported)).rejects.toThrow(
      `${ciWorkflowPath} at ${unsupported} has an unsupported CI push path policy.`,
    );
    const missing = await fixture.publish(
      { [ciWorkflowPath]: null },
      "Remove policy",
    );
    await expect(qualify(unrestricted, missing)).rejects.toThrow(
      `Could not read ${ciWorkflowPath} at ${missing}.`,
    );
    expect(await readdir(inspectionsRoot)).toEqual([]);
  } finally {
    await fixture.cleanup();
  }
});

test("qualification follows published extra and documentation rules despite a conflicting local workflow", async () => {
  const { fixture, workflow, qualify } = await qualificationFixture();
  try {
    const a = await fixture.publish(
      { [ciWorkflowPath]: workflow, "app.js": "A" },
      "Baseline",
    );
    const policy = workflow.replace(
      pushExclusions,
      '    paths-ignore:\n      - ".planning/**"\n      - "extra/**"\n',
    );
    const published = await fixture.publish(
      { [ciWorkflowPath]: policy, "app.js": "B", "docs/policy.md": "policy" },
      "Mixed published policy",
    );
    expect(await qualify(a, published)).toEqual({
      qualifies: true,
      changed: [ciWorkflowPath, "app.js", "docs/policy.md"],
      qualifying: [ciWorkflowPath, "app.js", "docs/policy.md"],
    });
    await writeFile(path.join(fixture.development, ciWorkflowPath), workflow);
    const extra = await fixture.publish({ "extra/g.md": "extra" }, "Extra");
    expect(await qualify(published, extra)).toEqual({
      qualifies: false,
      changed: ["extra/g.md"],
      qualifying: [],
    });
    const documentation = await fixture.publish(
      { "docs/h.md": "docs" },
      "Docs",
    );
    expect(await qualify(extra, documentation)).toEqual({
      qualifies: true,
      changed: ["docs/h.md"],
      qualifying: ["docs/h.md"],
    });
    expect(await qualify(published, documentation)).toEqual({
      qualifies: true,
      changed: ["docs/h.md", "extra/g.md"],
      qualifying: ["docs/h.md"],
    });
  } finally {
    await fixture.cleanup();
  }
});
