// What Recently done lists for the project shown. It combines published
// and local stories by completion time and the saved Done sessions the Board's
// placement leaves to it (`./columnSessions.ts`) by launch time; listed
// cards nest their own closed sessions and closed story follow-ups
// (`./recentlyDoneListing.ts`), and unknown or failed published details
// leave their standalone access intact. The done catalog places every done
// story before its record is read, so the combined list, its count, and where
// each session belongs are known at once. Only the first ten entries show
// until the developer asks for the next ten, or a journey lands on an entry
// beyond them, and the developer can return to the latest ten
// (`./recentlyDoneRange.ts`), and only the records of the stories shown are
// read (`./doneDetails.ts`); a story shown before its record answers keeps its
// place, with its sessions, under its identity.
// The saved sessions decide which stories the first entries hold, so no
// record is read before the page's first read of them ends; a read that ends
// unanswered lets the stories shown without them be read.
// A refresh of the project keeps the list the last revision's catalog placed
// until the new revision's catalog answers, since the snapshot carries it
// (`./carriedFacts.ts`), so the list neither empties nor loses the keyboard
// meanwhile; each record is still read at the revision whose catalog lists
// it. `./RecentlyDone.tsx` presents it.

import { useLayoutEffect } from "react";
import type { LaunchWithState } from "./agentLaunch.ts";
import type { ColumnSummary } from "./columnSummary.ts";
import { useDoneDetails } from "./doneDetails.ts";
import { recentDoneRecords } from "./doneStories.ts";
import type { CreationView } from "./launchCreation.ts";
import type { PublishedWork } from "./publishedWork.ts";
import {
  currentPublishedSessions,
  holdsEntry,
  newestFirst,
  type Listed,
} from "./recentlyDoneListing.ts";
import {
  shownPrefix,
  usePageRange,
  type HeldEntry,
  type RecentlyDoneRange,
} from "./recentlyDoneRange.ts";
import { sessionKey } from "./sessionReference.ts";

export type { Listed } from "./recentlyDoneListing.ts";

// Answers the page's destination in this project once the list can place it:
// once the sessions and done catalog have placed its story or session, the
// range extended exactly through its entry, and
// reached once every entry through it is `settled`.
function useDestinationAnswer(
  range: RecentlyDoneRange,
  sourceId: string,
  records: readonly LaunchWithState[] | undefined,
  sessionsSettled: boolean,
  done: PublishedWork["done"],
  listed: readonly Listed[],
  settled: (each: Listed) => boolean,
) {
  const wanted = range.wanted(sourceId);
  useLayoutEffect(() => {
    if (wanted === undefined || !sessionsSettled) return;
    const { id, entry } = wanted;
    if (entry.session !== undefined && records === undefined) return;
    if (
      entry.session !== undefined &&
      !records?.some((record) => sessionKey(record.session) === entry.session)
    ) {
      range.settle(id, 0, "absent");
      return;
    }
    const at = listed.findIndex((each) => holdsEntry(each, entry));
    const destination = listed[at];
    if (
      (done === undefined || done.status === "loading") &&
      (destination === undefined || !("localStory" in destination))
    )
      return;
    if (at < 0) {
      range.settle(id, 0, "absent");
      return;
    }
    const through = listed.slice(0, at + 1);
    range.settle(
      id,
      through.length,
      through.every(settled) ? "reached" : undefined,
    );
  });
}

export const recentlyDoneName = "Recently done";

export function recentlyDoneProblems(
  done: PublishedWork["done"],
  publishedSessions: PublishedWork["publishedSessions"],
) {
  return [
    ...(done?.status === "unavailable" ? [done.problem] : []),
    ...(publishedSessions?.status === "unavailable"
      ? [publishedSessions.problem]
      : []),
  ];
}

// Done stories and the selected project's closed sessions use one list for
// rendering and counts, of which the requested first entries show.
// Unresolved creations remain recovery evidence only.
export function useRecentlyDone({
  sourceId,
  work,
  creations,
  records,
  keptLaunches,
  noneKept,
  sessionsSettled,
  // A selected Done story this list must still place, even outside the
  // Board's default recent window (retained ad hoc association). An
  // explicit follow-up source reveal may add another via the page range.
  includeIdentity,
}: {
  readonly sourceId: string;
  readonly work: PublishedWork;
  readonly creations: readonly CreationView[];
  readonly records: readonly LaunchWithState[] | undefined;
  // The machine's kept launches (Done or live). A launch whose reporting
  // reference equals a published record UUID stands for that record.
  readonly keptLaunches: readonly LaunchWithState[];
  readonly noneKept: boolean;
  // Whether a read of the machine's sessions asked after the latest change
  // of the project list has ended, answered or not.
  readonly sessionsSettled: boolean;
  readonly includeIdentity?: string | undefined;
}) {
  const range = usePageRange();
  // While a newer revision reads its catalog, the snapshot carries the
  // last one (`./carriedFacts.ts`).
  const { done } = work;
  // Records are read at the revision whose catalog lists them.
  const revision =
    done?.status === "catalogued" ? done.revision : work.revision;
  const now = new Date();
  const included = recentDoneRecords(done, now, [
    includeIdentity,
    range.includedStory(sourceId),
  ]);
  const { publishedSessions } = work;
  const listed = newestFirst(
    included,
    records ?? [],
    sourceId,
    keptLaunches,
    currentPublishedSessions(publishedSessions, now),
    now,
  );
  // The entry holding the keyboard stays shown wherever it now stands.
  const held = range.heldIn(sourceId);
  const heldAt =
    held === undefined
      ? -1
      : listed.findIndex((each) => holdsEntry(each, held));
  const asked = range.requestedOf(sourceId);
  const requested = Math.max(asked, heldAt + 1);
  useLayoutEffect(() => {
    if (requested > asked) range.include(sourceId, requested);
  });
  const { shown, older } = shownPrefix(listed, requested);
  const unreadable = done?.status === "catalogued" ? done.unreadable : [];
  // The records of the stories shown, and of the record files the catalog
  // could not read, whose problem only their text says, read once the
  // sessions have placed the stories.
  const details = useDoneDetails(
    work.source,
    revision,
    [
      ...shown.flatMap((each) => ("record" in each ? [each.record] : [])),
      ...unreadable,
    ],
    sessionsSettled,
  );
  useDestinationAnswer(
    range,
    sourceId,
    records,
    sessionsSettled,
    done,
    listed,
    (each) =>
      "record" in each
        ? details.detailOf(each.record).status !== "reading"
        : true,
  );
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
    problems: recentlyDoneProblems(done, publishedSessions),
    unreadable: unreadable.map((record) => ({
      file: record.fileName,
      detail: details.detailOf(record),
    })),
    shown,
    older,
    details,
    // The revision the shown done records are read at.
    revision,
    column,
    held,
    // Notes the entry the keyboard went to in this list, or that it left.
    hold: (entry: HeldEntry | undefined) => {
      range.hold(sourceId, entry);
    },
    reveal: () => {
      range.reveal(sourceId, shown.length);
    },
    collapse: () => {
      range.collapse(sourceId);
    },
  };
}

export type RecentlyDoneView = ReturnType<typeof useRecentlyDone>;
