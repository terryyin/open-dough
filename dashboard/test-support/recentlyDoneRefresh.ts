// Refreshes of the progressive Recently done publication
// (./recentlyDoneProgressive.ts): the project's `main` moves to each newly
// published list, as the project's own push would move it, and the page
// finds it through its usual revision check, which the journey lets come at
// once by moving the page clock on by the check interval. Each published
// revision keeps answering for itself, as commits do. Nothing here chooses
// which entries show or which records are read.

import { expect, type Page } from "@playwright/test";
import { doneRecordFileName } from "../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import { publishCommittedFileHistory } from "./committedFiles.ts";
import { checkIntervalMs } from "../src/revisionCheckSchedule.ts";
import { shortRevision, parts } from "./dashboardPage.ts";
import {
  doneDirectory,
  entryName,
  publishedWithCatalog,
  repository,
  type ProgressiveEntry,
} from "./recentlyDoneProgressive.ts";
import { githubFor } from "./dashboardTest.ts";
import type { FakeGitHub, RepositoryAnswerer } from "./support/fakeGitHub.ts";
import { expectServedHomesReach } from "./support/fixtureOriginRoute.ts";

// A done story outside the first publication, placed `place` hours and a
// half before the list was published.
export const laterStory = (
  place: number,
  label: string,
  title: string,
): ProgressiveEntry => {
  const identity = `SEED-3${label}#progressive-later-${label}`;
  return {
    place,
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
export const pathOf = (entry: ProgressiveEntry) => entry.path;

// A done story newer than every first published entry.
export const newest = laterStory(
  0,
  "00",
  "Finish the newest progressive story",
);

export type ProgressiveHistory = {
  readonly afterGitHubStops: (cleanup: () => Promise<void>) => void;
  readonly later: Readonly<Record<string, readonly ProgressiveEntry[]>>;
};

// Build the entire history once, removing expired records at their own
// revision. Each published commit keeps answering for its own files.
export async function movingMain(
  page: Page,
  now: number,
  first: readonly ProgressiveEntry[],
  beside: Readonly<Record<string, string>> | undefined,
  { afterGitHubStops, later }: ProgressiveHistory,
  wrapAnswer: (
    answer: RepositoryAnswerer,
    revision: string,
  ) => RepositoryAnswerer,
  workspaceTaken: boolean,
) {
  let previous = publishedWithCatalog(now, first, beside, workspaceTaken);
  let history = makeMe.aRepository.withRevision<string>("A", {
    files: previous,
  });
  for (const [name, list] of Object.entries(later)) {
    const files = publishedWithCatalog(now, list, beside, workspaceTaken);
    const remove = Object.keys(previous).filter(
      (path) => !Object.hasOwn(files, path),
    );
    history = history.withRevision(name, { files, remove });
    previous = files;
  }
  const published = await publishCommittedFileHistory(page, history.please(), {
    repository,
    trunk: "A",
    afterGitHubStops,
    wrapAnswer,
  });
  const github = githubFor(page);
  const firstRevision = published.at("A").revision;
  expectServedHomesReach(github, repository, firstRevision);
  return {
    firstRevision,
    publish: (name: string) => {
      const at = published.at(name);
      published.moveTrunk(at);
      expectServedHomesReach(github, repository, at.revision);
      return at.revision;
    },
  };
}

// Lets the page's next revision check come, until the page shows `revision`.
export async function refreshedTo(page: Page, revision: string) {
  const { readRevision } = parts(page);
  await expect(async () => {
    await page.clock.fastForward(checkIntervalMs);
    await expect(readRevision).toContainText(shortRevision(revision), {
      timeout: 3_000,
    });
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
