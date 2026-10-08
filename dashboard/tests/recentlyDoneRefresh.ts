// Refreshes of the progressive Recently done publication
// (./recentlyDoneProgressive.ts): the project's `main` moves to each newly
// published list, as the project's own push would move it, and the page
// finds it through its usual revision check, which the journey lets come at
// once by moving the page clock on by the check interval. Each published
// revision keeps answering for itself, as commits do. Nothing here chooses
// which entries show or which records are read.

import { expect, type Page } from "@playwright/test";
import { doneRecordFileName } from "../../src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs";
import { checkIntervalMs } from "../src/revisionCheckSchedule.ts";
import { parts } from "./dashboardPage.ts";
import {
  doneDirectory,
  entryName,
  publishedWithCatalog,
  revision as firstRevision,
  type ProgressiveEntry,
} from "./recentlyDoneProgressive.ts";
import {
  publishes,
  type FakeGitHub,
  type RepositoryAnswerer,
} from "./support/fakeGitHub.ts";

// A done story outside the first publication, placed `place` hours and a
// half before the list was published.
export const laterStory = (
  place: number,
  label: string,
  title: string,
): Extract<ProgressiveEntry, { kind: "story" }> => {
  const identity = `SEED-3${label}#progressive-later-${label}`;
  return {
    place,
    kind: "story",
    identity,
    title,
    path: `${doneDirectory}/${doneRecordFileName(identity)}`,
  };
};

// The same done story, its record saying a new title.
export const retitled = (entry: ProgressiveEntry): ProgressiveEntry => ({
  ...entry,
  title: `${entry.title}, retitled`,
});

// The newest `count` entries of `list` by the names Recently done gives them.
export const namesOf = (list: readonly ProgressiveEntry[], count: number) =>
  list
    .toSorted((one, other) => one.place - other.place)
    .slice(0, count)
    .map(entryName);

// The record of a story entry.
export const pathOf = (entry: ProgressiveEntry) =>
  entry.kind === "story" ? entry.path : "";

// A done story newer than every first published entry.
export const newest = laterStory(
  0,
  "00",
  "Finish the newest progressive story",
);

// `main` names the first publication until `publish` moves it; `answering`
// wraps the first publication's answers (`opened`'s option of that name).
// Each later publication keeps the files `beside` names beside its list
// (`publishedWithCatalog`), as the first does when opened with them.
export function movingMain(beside: Readonly<Record<string, string>> = {}) {
  const published = new Map<string, RepositoryAnswerer>();
  let head = firstRevision;
  let count = 0;
  const route: RepositoryAnswerer = (call) => {
    const { request } = call;
    const at =
      "revision" in request ? published.get(request.revision) : undefined;
    const answerer = at ?? published.get(head);
    if (answerer === undefined) throw new Error("Nothing is published.");
    return answerer(call);
  };
  return {
    answering: (first: RepositoryAnswerer) => {
      published.set(firstRevision, first);
      return route;
    },
    // Publishes `list` at a revision of its own, which `main` then names,
    // and says that revision.
    publish: (now: number, list: readonly ProgressiveEntry[]) => {
      count += 1;
      head = String(count).padStart(2, "0").repeat(20);
      published.set(
        head,
        publishes({
          revision: head,
          files: publishedWithCatalog(now, list, beside),
        }),
      );
      return head;
    },
  };
}

// Lets the page's next revision check come, until the page shows `revision`.
export async function refreshedTo(page: Page, revision: string) {
  const { source } = parts(page);
  await expect(async () => {
    await page.clock.fastForward(checkIntervalMs);
    await expect(source).toContainText(revision, { timeout: 3_000 });
  }).toPass({ timeout: 45_000 });
}

// The done records whose reads reached GitHub at `revision`, by path, in
// order; the catalog is not a record.
export const recordsAskedAt = (github: FakeGitHub, revision: string) =>
  github.calls.flatMap(({ request }) =>
    request.kind === "content" &&
    request.revision === revision &&
    request.path.startsWith(`${doneDirectory}/`) &&
    !request.path.endsWith("/.catalog.json")
      ? [request.path]
      : [],
  );
