// Published projects, settings, and source texts for Intent code-kind browse
// journeys (`./intent-code-browse.spec.ts`); its projects and publisher also
// serve the Cucumber proof journey (`./intent-cucumber-proof.spec.ts`).

import { filesOf, type Project } from "./catalogProjectRecords.ts";
import { publishFiles } from "./publishedOrigin.ts";

export const openDough: Project = {
  label: "Open Dough",
  ref: "main",
  repository: "terryyin/open-dough",
  revision: "b2".repeat(20),
  taken: "Open Dough's own taken story",
  queued: "Open Dough's own queued story",
  direction: "Show Open Dough's own published direction through local gh.",
  purpose: "Read Open Dough's queued purpose at its own revision.",
  takenPath: ".planning/slice-plans/301-taken/PLAN.md",
  queuedPath: ".planning/seeds/SEED-301-queued.md",
};

export const doughnut: Project = {
  label: "Doughnut",
  ref: "main",
  repository: "nerds-odd-e/doughnut",
  revision: "c3".repeat(20),
  taken: "Doughnut's own taken story",
  queued: "Doughnut's own queued story",
  direction: "Show Doughnut's own published direction through local gh.",
  purpose: "Read Doughnut's queued purpose at its own revision.",
  takenPath: ".planning/slice-plans/302-taken/PLAN.md",
  queuedPath: ".planning/seeds/SEED-302-queued.md",
};

export const pygardon: Project = {
  label: "Pygardon",
  ref: "main",
  repository: "terryyin/pygardon",
  revision: "d4".repeat(20),
  taken: "Pygardon's own taken story",
  queued: "Pygardon's own queued story",
  direction: "Show Pygardon's own published direction through local gh.",
  purpose: "Read Pygardon's queued purpose at its own revision.",
  takenPath: ".planning/slice-plans/303-taken/PLAN.md",
  queuedPath: ".planning/seeds/SEED-303-queued.md",
};

export const openDoughSettings = JSON.stringify(
  {
    intent: {
      locations: [
        {
          path: "dashboard/tests",
          kind: "typescript",
          include: ["**/*.spec.ts"],
        },
        { path: "tests", kind: "shell", include: ["*.sh"] },
      ],
    },
  },
  null,
  2,
);

export const doughnutSettings = JSON.stringify(
  {
    intent: {
      locations: [
        {
          path: "scripts",
          kind: "javascript",
          include: ["**/*.test.mjs"],
        },
      ],
    },
  },
  null,
  2,
);

export const pygardonSettings = JSON.stringify(
  {
    intent: {
      locations: [
        {
          path: "frontend/src",
          kind: "typescript",
          include: [
            "**/*.spec.ts",
            "**/*.spec.tsx",
            "**/*.test.ts",
            "**/*.test.tsx",
          ],
        },
        {
          path: "tests",
          kind: "python",
          include: ["**/test_*.py"],
        },
      ],
    },
  },
  null,
  2,
);

export const browseSpec = `import { test } from "@playwright/test";
test("browses", async () => {});
`;

export const devicesSpec = `export function devices() {
  return "devices";
}
`;

export const aspyPage = `export function AspyPage() {
  return null;
}
`;

export const pythonTest = `def test_example():
    assert "ok"
`;

export const shellCheck = `#!/usr/bin/env bash
echo ok
`;

export const nodeTest = `import assert from "node:assert/strict";
assert.equal(1, 1);
`;

export function publishIntentProject(
  page: Parameters<typeof publishFiles>[0],
  published: Project,
  settings: string,
  sources: Readonly<Record<string, string>>,
) {
  return publishFiles(page, {
    repository: published.repository,
    ref: published.ref,
    revision: published.revision,
    files: {
      ...filesOf(published),
      ".planning/open-dough.json": `${settings}\n`,
      ...sources,
    },
  });
}

// How many times the page read `path`'s content from a project published by
// `publishIntentProject`.
export function contentReadsOf(
  requests: Awaited<ReturnType<typeof publishIntentProject>>,
  path: string,
) {
  return requests.filter(
    ({ request }) => request.kind === "content" && request.path === path,
  ).length;
}
