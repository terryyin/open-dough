// What Recently done lists for the project shown. It combines published
// stories by completion time and saved Done sessions by launch time; only
// closed sessions are nested in done cards, and unknown or failed published
// details leave their standalone access intact. The done catalog places every
// done story before its record is read, so the combined list, its count, and
// where each session belongs are known at once. Only the first ten entries
// show until the developer asks for the next ten (`./recentlyDoneRange.ts`),
// and only the records of the stories shown are read (`./doneDetails.ts`); a
// story shown before its record answers keeps its place, with its sessions,
// under its identity. `./RecentlyDone.tsx` presents it.

import type { CataloguedDoneRecord } from "../../src/skills/dough-product-backlog/scripts/product-backlog-done-catalog.mjs";
import { storySessionsOf, type LaunchWithState } from "./agentLaunch.ts";
import type { ColumnSummary } from "./columnSummary.ts";
import { useDoneDetails } from "./doneDetails.ts";
import { recentDoneRecords } from "./doneStories.ts";
import type { CreationView } from "./launchCreation.ts";
import type { PublishedWork } from "./publishedWork.ts";
import { shownPrefix, useRecentlyDoneRange } from "./recentlyDoneRange.ts";

export type Listed =
  | {
      readonly at: number;
      readonly record: CataloguedDoneRecord;
      // The story's sessions, oldest first.
      readonly sessions: readonly LaunchWithState[];
    }
  | { readonly at: number; readonly session: LaunchWithState };

// Done stories by completion, each holding its sessions, and the sessions of
// no listed done story by launch, newest first; sessions launched at one
// moment keep their newest-first order.
function newestFirst(
  records: readonly CataloguedDoneRecord[],
  sessions: readonly LaunchWithState[],
  sourceId: string,
): readonly Listed[] {
  const cards = records.map((record) => ({
    at: Date.parse(record.completedAt),
    record,
    sessions: storySessionsOf(sessions, sourceId, record.identity),
  }));
  const held = new Set(cards.flatMap((card) => card.sessions));
  return [
    ...cards,
    ...sessions
      .filter((session) => !held.has(session))
      .toReversed()
      .map((session) => ({ at: Date.parse(session.launchedAt), session })),
  ].sort((one, other) => other.at - one.at);
}

export const recentlyDoneName = "Recently done";

// Done stories and the selected project's closed sessions use one list for
// rendering and counts, of which the requested first entries show.
// Unresolved creations remain recovery evidence only.
export function useRecentlyDone({
  sourceId,
  work,
  creations,
  records,
  noneKept,
}: {
  readonly sourceId: string;
  readonly work: PublishedWork;
  readonly creations: readonly CreationView[];
  readonly records: readonly LaunchWithState[] | undefined;
  readonly noneKept: boolean;
}) {
  const { done } = work;
  const range = useRecentlyDoneRange(sourceId);
  const listed = newestFirst(
    recentDoneRecords(done, new Date()),
    records ?? [],
    sourceId,
  );
  const { shown, older } = shownPrefix(listed, range.requested);
  const unreadable = done?.status === "catalogued" ? done.unreadable : [];
  // The records of the stories shown, and of the record files the catalog
  // could not read, whose problem only their text says.
  const details = useDoneDetails(work.source, work.revision, [
    ...shown.flatMap((each) => ("record" in each ? [each.record] : [])),
    ...unreadable,
  ]);
  const refused = shown.some(
    (each) =>
      "record" in each && details.detailOf(each.record).status === "unreadable",
  );
  const column: ColumnSummary = {
    name: recentlyDoneName,
    entries:
      records === undefined ||
      done?.status !== "catalogued" ||
      unreadable.length > 0 ||
      refused
        ? undefined
        : listed.length,
  };
  return {
    creations: creations.filter((record) => record.request.source === sourceId),
    records,
    none: noneKept
      ? "No sessions launched from this dashboard are kept."
      : "No sessions are listed in Recently done.",
    problem: done?.status === "unavailable" ? done.problem : undefined,
    unreadable: unreadable.map((record) => ({
      file: record.fileName,
      detail: details.detailOf(record),
    })),
    shown,
    older,
    details,
    column,
    reveal: () => {
      range.reveal(shown.length);
    },
  };
}

export type RecentlyDoneView = ReturnType<typeof useRecentlyDone>;
