// Done references (../../frontend-tests/navigation/story-reference-done.spec.ts,
// ../../frontend-tests/navigation/story-reference-done-recovery.spec.ts,
// ../../frontend-tests/navigation/story-reference-done-cancellation.spec.ts):
// 35 retained Done stories and one completed outside the retained window,
// placed before `now`, with Story A waiting on a near, a far, the expired and
// an unlisted story, whose agreements later revisions can replace. Published
// Done facts and semantic references only: the real range decides what is
// shown and read.

import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  queuedSeedWithDependencies,
  storySeed,
} from "../../../Distribution/tests/support/queued-repository.mjs";
import type { RevisionFacts } from "../../../Distribution/tests/support/repositoryTestData.mjs";
import { doneRecordFileName } from "../../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs";
import { backlogApart, describedRevisions } from "../describedRevisions.ts";
import { placedAt, progressiveEntries } from "../recentlyDoneProgressive.ts";
import { agreement, consumer } from "../storyDependencyFixture.ts";
import {
  putFrontendDoneRecords,
  putFrontendPublished,
  type FrontendServiceState,
} from "./frontendServiceState.ts";
import {
  dependenciesRepository,
  dependenciesRevisions,
  putFrontendDependencies,
} from "./frontendStoryDependencies.ts";

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
// Record paths, in path order, of the latest `count` Done stories.
export const donePathsThrough = (count: number) =>
  doneEntries
    .slice(0, count)
    .map(({ path }) => path)
    .toSorted();
// Opening Dependencies also asks for the catalogued suppliers beyond the shown range.
export const donePathsWithSuppliersThrough = (count: number) =>
  [
    ...new Set([...donePathsThrough(count), farDone.path, expiredDone.path]),
  ].toSorted();
export const doneTitlesThrough = (count: number) =>
  doneEntries.slice(0, count).map(({ title }) => title);

type DoneReferenceOptions = { omitDestination?: boolean };

const storyAPath = ".planning/seeds/A.md";

// The backlog entry Story A's agreement names for a referenced story.
const referencedStory = ({
  identity,
  title,
}: {
  readonly identity: string;
  readonly title: string;
}) =>
  makeMe.aBacklogEntry
    .with({ identity, title, href: `seeds/${identity.replace("#", ".md#")}` })
    .please();

// A seed for each referenced story and Story A waiting on each of them.
function doneReferenceSeeds(): RevisionFacts {
  const referenced = [farDone, nearDone, expiredDone, unlisted].map(
    referencedStory,
  );
  return {
    message: "Publish story dependency facts",
    files: {
      ...Object.fromEntries(
        referenced.map((story) => [
          `.planning/${story.href.split("#")[0]}`,
          storySeed(story, "Published completed outcome."),
        ]),
      ),
      [storyAPath]: queuedSeedWithDependencies(
        consumer,
        referenced.map((supplier) => agreement({ supplier, state: "waiting" })),
      ),
    },
  };
}

// Done records for the retained stories and the expired one, placed before
// `now`. With `omitDestination`, the far story's record is not published.
function doneReferenceRecords(
  now: number,
  { omitDestination = false }: DoneReferenceOptions = {},
) {
  return [
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
  );
}

// Publishes Story A's references and the Done records as Open Dough's.
export function putFrontendDoneReferences(
  services: FrontendServiceState,
  options: DoneReferenceOptions = {},
): void {
  putFrontendDependencies(services, doneReferenceSeeds());
  putFrontendDoneRecords(
    services,
    "open-dough",
    doneReferenceRecords(Date.now(), options),
  );
}

// Story A's agreements replaced after the Done references at later
// revisions: first no longer readable, then waiting on the later Done story
// alone. Publish each in turn.
export function replacedStoryAAgreements(services: FrontendServiceState) {
  const laterSupplier = queuedSeedWithDependencies(consumer, [
    agreement({ supplier: referencedStory(laterDone), state: "waiting" }),
  ]);
  const { unreadable, replaced } = describedRevisions(
    dependenciesRepository(doneReferenceSeeds())
      .withRevision("unreadable", {
        message: "Break Story A's agreements",
        files: {
          [storyAPath]: laterSupplier.replace(
            /```json dough-story-dependencies\n[^\n]+/,
            "```json dough-story-dependencies\n{broken",
          ),
        },
      })
      .withRevision("replaced", {
        message: "Wait on the later Done story alone",
        files: { [storyAPath]: laterSupplier },
      })
      .please(),
    {
      ...dependenciesRevisions(services),
      unreadable: "c1".repeat(20),
      replaced: "c2".repeat(20),
    },
  );
  return {
    publishUnreadable: () => {
      putFrontendPublished(services, backlogApart(unreadable));
    },
    publishReplaced: () => {
      putFrontendPublished(services, backlogApart(replaced));
    },
  };
}

// Publishes the Done references again, the far story's record included, at a
// later revision, and returns that revision.
export function putHealedFrontendDoneReferences(
  services: FrontendServiceState,
): string {
  const revision = "c3".repeat(20);
  Object.assign(services, { revision });
  putFrontendDoneReferences(services);
  return revision;
}
