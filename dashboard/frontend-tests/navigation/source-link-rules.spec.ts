// A recorded canonical or plan target leads to a file of the inspected
// revision, to an external web address, or nowhere, by the production rule
// (../../src/sourceLink.ts). Rendering is owned by ./source-links.spec.ts and
// the popup by ../../../e2e/navigation/source-navigation.spec.ts.
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import {
  resolveSourceLink,
  snapshotRepositoryPath,
} from "../../src/sourceLink.ts";

const revision = "9b1d4e6a2c8f0735be19d4c6a7f8e9d0c1b2a3f4";
const source = makeMe.aPublishedSource.openDough.please();
const snapshotRoot = `https://github.com/terryyin/open-dough/blob/${revision}`;
const resolved = (recorded: string) =>
  resolveSourceLink(recorded, source, revision);

test("canonical and plan files open at the inspected revision beside the backlog", () => {
  for (const [recorded, url] of [
    [
      "seeds/SEED-021-observe-published-story-progress.md#see-published-work",
      `${snapshotRoot}/.planning/seeds/SEED-021-observe-published-story-progress.md#see-published-work`,
    ],
    [
      "./slice-plans/061-published-story-dashboard/PLAN.md#ordered-slices",
      `${snapshotRoot}/.planning/slice-plans/061-published-story-dashboard/PLAN.md#ordered-slices`,
    ],
    [
      "slice-plans/059-installer-update-report/PLAN.md",
      `${snapshotRoot}/.planning/slice-plans/059-installer-update-report/PLAN.md`,
    ],
    [
      "../docs/adrs/0001-ubiquitous-language-accepted.md#decision",
      `${snapshotRoot}/docs/adrs/0001-ubiquitous-language-accepted.md#decision`,
    ],
    [
      "/docs/release%20notes/2026.md",
      `${snapshotRoot}/docs/release%20notes/2026.md`,
    ],
  ] as const) {
    expect(resolved(recorded)).toEqual({
      kind: "snapshot",
      recorded,
      url,
      revision,
    });
  }
});

test("web addresses stay external, apart from the snapshot and its revision", () => {
  for (const recorded of [
    "https://status.example.com/notes/2026-09?view=full#api",
    "http://plans.example.org/note-7",
  ]) {
    expect(resolved(recorded)).toEqual({
      kind: "external",
      recorded,
      url: recorded,
    });
  }
});

test("only a snapshot file names a repository path to read, decoded", () => {
  const pathOf = (recorded: string) =>
    snapshotRepositoryPath(resolved(recorded), source.backlogPath);
  expect(pathOf("/docs/release%20notes/2026.md")).toBe(
    "docs/release notes/2026.md",
  );
  expect(pathOf("https://status.example.com/notes/2026-09")).toBe(undefined);
});

test("unsafe, traversing and incomplete targets are refused with their reason", () => {
  const noFile = "This does not name a file inside the observed repository.";
  for (const [recorded, reason] of [
    [
      "javascript:document.title='canonical-ran'",
      "Links that use “javascript:” are not opened from here.",
    ],
    [
      "data:text/html,<script>document.title='plan-ran'</script>",
      "Links that use “data:” are not opened from here.",
    ],
    ["../../elsewhere/secret.md#top", noFile],
    ["seeds/%E0%A4%A.md", noFile],
    ["#see-published-work", noFile],
    ["seeds/..#top", noFile],
    ["https://", "This is not a complete web address."],
  ] as const) {
    expect(resolved(recorded)).toEqual({ kind: "unusable", recorded, reason });
  }
});
