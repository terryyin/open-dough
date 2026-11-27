// Production qualification (../../server/productionQualification.mjs)
// decides from the published range's `git diff --name-only --no-renames -z`
// output and the workflow published with the selected commit. Reading both
// from origin is proven by e2e/runtime/production-watcher-updates.spec.ts.
import { expect, test } from "vitest";
import {
  ciWorkflowPath,
  qualifyChangedPaths,
} from "../../server/productionQualification.mjs";

// A published CI workflow whose push trigger ignores the given paths.
const workflowIgnoring = (...ignored: string[]) =>
  [
    "name: CI",
    "on:",
    "  push:",
    ...(ignored.length > 0 ? ["    paths-ignore:"] : []),
    ...ignored.map((pattern) => `      - "${pattern}"`),
    "  pull_request:",
    "jobs: {}",
    "",
  ].join("\n");
const documentationIgnored = workflowIgnoring(".planning/**", "docs/**");
const tabbed = "old name\twith tab.js";
// Git's NUL-separated diff output naming the given paths.
const diffNaming = (...paths: string[]) =>
  paths.map((file) => `${file}\0`).join("");

test("qualification follows the selected commit's push exclusions over every changed path", () => {
  const ranges = [
    {
      range: "excluded paths only",
      workflow: documentationIgnored,
      changed: [".planning/notes\nline.md", "docs/guide.md"],
      qualifying: [] as string[],
    },
    {
      range: "an application change beside documentation",
      workflow: documentationIgnored,
      changed: ["app.js", "docs/guide.md"],
      qualifying: ["app.js"],
    },
    {
      range: "an application deletion",
      workflow: documentationIgnored,
      changed: ["app.js"],
      qualifying: ["app.js"],
    },
    {
      range: "a rename into the application",
      workflow: documentationIgnored,
      changed: ["docs/moved.md", "src/moved.md"],
      qualifying: ["src/moved.md"],
    },
    {
      range: "a rename out of the application",
      workflow: documentationIgnored,
      changed: [`app/${tabbed}`, `docs/${tabbed}`],
      qualifying: [`app/${tabbed}`],
    },
    {
      range: "a workflow edit its own policy ignores",
      workflow: workflowIgnoring("docs/**", "extra/**", ".github/**"),
      changed: [ciWorkflowPath, "extra/g.md"],
      qualifying: [],
    },
    {
      range: "documentation under a policy without exclusions",
      workflow: workflowIgnoring(),
      changed: [ciWorkflowPath, "docs/policy.md"],
      qualifying: [ciWorkflowPath, "docs/policy.md"],
    },
  ];
  for (const { range, workflow, changed, qualifying } of ranges) {
    expect(
      qualifyChangedPaths({
        commit: "S",
        workflow,
        diff: diffNaming(...changed),
      }),
      range,
    ).toEqual({ qualifies: qualifying.length > 0, changed, qualifying });
  }
});

test("qualification refuses an unreadable or unsupported published push policy", () => {
  const diff = diffNaming("app.js");
  const unsupported = documentationIgnored.replace(
    "  push:\n",
    "  push:\n    # generated\n",
  );
  expect(() =>
    qualifyChangedPaths({ commit: "S", workflow: unsupported, diff }),
  ).toThrow(`${ciWorkflowPath} at S has an unsupported CI push path policy.`);
  const unreadable = new Error(
    `fatal: path '${ciWorkflowPath}' does not exist`,
  );
  expect(() =>
    qualifyChangedPaths({ commit: "S", workflow: unreadable, diff }),
  ).toThrow(`Could not read ${ciWorkflowPath} at S.`);
});
