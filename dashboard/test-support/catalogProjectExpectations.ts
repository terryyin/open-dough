// Expected catalog observations, authored independently of the published files;
// each project's revision is the one its publication commits.

import { expect } from "./dashboardTest.ts";
import { restMembershipAsked } from "./originObservation.ts";
import type { ObservedRequest } from "./publishedOrigin.ts";

export const catalogExpectations = {
  openDough: {
    id: "open-dough",
    label: "Open Dough",
    repository: "terryyin/open-dough",
    ref: "main",
    taken: "Open Dough's own taken story",
    queued: "Open Dough's own queued story",
    direction: "Show Open Dough's own published direction through local gh.",
    purpose: "Read Open Dough's queued purpose at its own revision.",
    takenPath: ".planning/slice-plans/301-taken/PLAN.md",
    queuedPath: ".planning/seeds/SEED-301-queued.md",
  },
  doughnut: {
    id: "doughnut",
    label: "Doughnut",
    repository: "nerds-odd-e/doughnut",
    ref: "main",
    taken: "Doughnut's own taken story",
    queued: "Doughnut's own queued story",
    direction: "Show Doughnut's own published direction through local gh.",
    purpose: "Read Doughnut's queued purpose at its own revision.",
    takenPath: ".planning/slice-plans/302-taken/PLAN.md",
    queuedPath: ".planning/seeds/SEED-302-queued.md",
  },
  pygardon: {
    id: "pygardon",
    label: "Pygardon",
    repository: "terryyin/pygardon",
    ref: "main",
    taken: "Pygardon's own taken story",
    queued: "Pygardon's own queued story",
    direction: "Show Pygardon's own published direction through local gh.",
    purpose: "Read Pygardon's queued purpose at its own revision.",
    takenPath: ".planning/slice-plans/303-taken/PLAN.md",
    queuedPath: ".planning/seeds/SEED-303-queued.md",
  },
  terryTalks: {
    id: "terry-talks",
    label: "Terry Talks",
    repository: "terryyin/terry-talks",
    ref: "master",
    taken: "Terry Talks's own taken story",
    queued: "Terry Talks's own queued story",
    direction: "Show Terry Talks's own published direction through local gh.",
    purpose: "Read Terry Talks's queued purpose at its own revision.",
    takenPath: ".planning/slice-plans/304-taken/PLAN.md",
    queuedPath: ".planning/seeds/SEED-304-queued.md",
  },
};

export type CatalogExpectation =
  (typeof catalogExpectations)[keyof typeof catalogExpectations];

export function expectPinnedGhCalls(
  calls: readonly ObservedRequest[],
  expected: CatalogExpectation & { readonly revision: string },
): void {
  // The Board opens from the verified Git trunk, so GitHub REST is never
  // asked to resolve the ref or read the backlog; every call reads a
  // reachable record at the resolved revision.
  expect(restMembershipAsked(calls)).toEqual([]);
  // Files are read raw; the agent profile directory is read as a listing.
  const contents = calls.map(({ argv, request }) => {
    expect(argv.slice(0, 4)).toEqual([
      "api",
      "--include",
      "-H",
      request.kind === "listing"
        ? "Accept: application/vnd.github+json"
        : "Accept: application/vnd.github.raw",
    ]);
    expect(argv[4]).toMatch(
      new RegExp(
        `^repos/${expected.repository}/contents/[^?]+\\?ref=${expected.revision}$`,
      ),
    );
    return request.kind === "content" || request.kind === "listing"
      ? request.path
      : "";
  });
  expect([...new Set(contents)].sort()).toEqual(
    [
      ".planning/agents",
      // The done-record and session directories are listed for Recently done.
      ".planning/done",
      ".planning/sessions",
      ".planning/open-dough.json",
      expected.takenPath,
      expected.queuedPath,
    ].sort(),
  );
}
