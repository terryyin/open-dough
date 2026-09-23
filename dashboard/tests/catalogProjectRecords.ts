// Distinct published records for each catalog project, and the pinned `gh`
// calls reading them must make, for ./authenticated-project-overview.spec.ts.

import { expect } from "./dashboardTest";
import type { ObservedRequest } from "./publishedOrigin";

const backlogPath = ".planning/PRODUCT-BACKLOG.md";

export type Project = {
  readonly label: string;
  readonly repository: string;
  readonly revision: string;
  readonly taken: string;
  readonly queued: string;
  readonly direction: string;
  readonly purpose: string;
  readonly takenPath: string;
  readonly queuedPath: string;
};

function project(
  label: string,
  repository: string,
  revision: string,
  number: number,
): Project {
  return {
    label,
    repository,
    revision,
    taken: `${label}'s own taken story`,
    queued: `${label}'s own queued story`,
    direction: `Show ${label}'s own published direction through local gh.`,
    purpose: `Read ${label}'s queued purpose at its own revision.`,
    takenPath: `.planning/quick/${String(number)}-taken/PLAN.md`,
    queuedPath: `.planning/seeds/SEED-${String(number)}-queued.md`,
  };
}

// Distinct records and revisions per project, so a rendered view can only
// come from the project actually selected.
export const projects: readonly Project[] = [
  project("Open Dough", "terryyin/open-dough", "0d".repeat(20), 301),
  project("Doughnut", "nerds-odd-e/doughnut", "d7".repeat(20), 302),
  project("Pygardon", "terryyin/pygardon", "c1".repeat(20), 303),
];

export function filesOf(published: Project): Record<string, string> {
  const number = published.takenPath.split("/")[2]?.split("-")[0] ?? "";
  const backlog = `# Product backlog

## Near-future direction

${published.direction}

## Taken

- [${published.taken}](quick/${number}-taken/PLAN.md) — TAKEN-${number}#story

## Backlog list

- [${published.queued}](seeds/SEED-${number}-queued.md#queued) — SEED-${number}#queued
`;
  return {
    [backlogPath]: backlog,
    [published.takenPath]: `# Taken story\n\n**Identity:** TAKEN-${number}#story\n\nWhole-document correction home without a story-state block.\n`,
    [published.queuedPath]: `# Queued seed\n\n<a id="queued"></a>\n\n### Queued story\n\n**Identity:** SEED-${number}#queued\n\n**Goal:** ${published.purpose}\n`,
  };
}

export function expectPinnedGhCalls(
  calls: readonly ObservedRequest[],
  published: Project,
): void {
  expect(calls[0]?.argv).toEqual([
    "api",
    `repos/${published.repository}/commits/main`,
    "--jq",
    ".sha",
  ]);
  const contents = calls.slice(1).map(({ argv, request }) => {
    expect(argv.slice(0, 3)).toEqual([
      "api",
      "-H",
      "Accept: application/vnd.github.raw+json",
    ]);
    expect(argv[3]).toMatch(
      new RegExp(
        `^repos/${published.repository}/contents/[^?]+\\?ref=${published.revision}$`,
      ),
    );
    return request.kind === "content" ? request.path : "";
  });
  expect([...new Set(contents)].sort()).toEqual(
    [backlogPath, published.takenPath, published.queuedPath].sort(),
  );
}
