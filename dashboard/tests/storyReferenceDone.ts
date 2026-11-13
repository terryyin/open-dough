// Published Done facts and semantic references only: the real range decides
// what is shown and read. No local sessions or pre-expanded range are supplied.
import type { Page } from "@playwright/test";
import { makeMe } from "../../tests/support/makeMe.mjs";
import {
  queuedSeedWithDependencies,
  storySeed,
} from "../../tests/support/queued-repository.mjs";
import type { RevisionFacts } from "../../tests/support/repositoryTestData.mjs";
import { placedAt, progressiveEntries } from "./recentlyDoneProgressive.ts";
import { agreement, consumer } from "./storyDependencyFixture.ts";
import type { StartOrigin } from "./support/startOrigin.ts";
import { publishCommittedOrigin } from "./committedOrigin.ts";
import { doneRecordFileName } from "../../src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs";

const doneEntries = progressiveEntries(35, []).map((entry) => {
  if (entry.kind !== "story") throw new Error("Expected only Done stories");
  return entry;
});
function entryAt(index: number) {
  const entry = doneEntries[index];
  if (entry === undefined) throw new Error("Missing Done fixture entry");
  return entry;
}
export const nearDone = entryAt(2);
export const farDone = entryAt(26);
export const laterDone = entryAt(30);
export const expiredDone = {
  kind: "story" as const,
  place: 31 * 24,
  identity: "SEED-299#expired",
  title: "Completed outside the retained window",
  path: `.planning/done/${doneRecordFileName("SEED-299#expired")}`,
};
export const unlisted = {
  identity: "SEED-298#unlisted",
  title: "An unlisted story",
};
export const donePathsThrough = (count: number) =>
  doneEntries.slice(0, count).map(({ path }) => path);
// Opening Dependencies also asks for the catalogued suppliers beyond the shown range.
export const donePathsWithSuppliersThrough = (count: number) => [
  ...new Set([...donePathsThrough(count), farDone.path, expiredDone.path]),
];
export const doneTitlesThrough = (count: number) =>
  doneEntries.slice(0, count).map(({ title }) => title);

// Done records for the retained stories and one completed outside the
// retained window, placed before `now`; a seed for each referenced story; and
// Story A waiting on each of them. With `omitDestination`, the far story's
// done record is not published.
function doneReferences(
  now: number,
  { omitDestination = false } = {},
): RevisionFacts {
  const referenced = [farDone, nearDone, expiredDone, unlisted].map(
    ({ identity, title }) =>
      makeMe.aBacklogEntry
        .with({
          identity,
          title,
          href: `seeds/${identity.replace("#", ".md#")}`,
        })
        .please(),
  );
  return {
    message: "Publish story dependency facts",
    doneRecords: [
      ...doneEntries.filter((entry) => !omitDestination || entry !== farDone),
      expiredDone,
    ].map(({ identity, title, place }) =>
      makeMe.aDoneRecord
        .with({
          identity,
          title,
          completedAt: placedAt(now, place),
          developer: "Terry Yin",
        })
        .please(),
    ),
    files: {
      ...Object.fromEntries(
        referenced.map((story) => [
          `.planning/${story.href.split("#")[0]}`,
          storySeed(story, "Published completed outcome."),
        ]),
      ),
      ".planning/seeds/A.md": queuedSeedWithDependencies(
        consumer,
        referenced.map((supplier) => agreement({ supplier, state: "waiting" })),
      ),
    },
  };
}

export function publishDoneReferences(
  origin: StartOrigin,
  options: { omitDestination?: boolean } = {},
) {
  return origin.publishRevision(doneReferences(Date.now(), options));
}

// Publishes the Done references and serves them as Open Dough's committed
// origin; holds and substitute answers stay with the caller.
export async function serveDoneReferences(
  page: Page,
  origin: StartOrigin,
  options: { omitDestination?: boolean; follows?: boolean } = {},
) {
  return publishCommittedOrigin(page, {
    repoDir: origin.project,
    revision: await publishDoneReferences(origin, options),
    repository: "terryyin/open-dough",
    follows: options.follows === true,
  });
}
