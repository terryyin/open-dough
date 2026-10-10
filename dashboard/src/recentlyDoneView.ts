// What Recently done lists for the project shown. It combines published
// stories by completion time and saved Done sessions by launch time; only
// closed sessions are nested in done cards, and unknown or failed published
// details leave their standalone access intact. The done catalog places every
// done story before its record is read, so the combined list, its count, and
// where each session belongs are known at once. Only the first ten entries
// show until the developer asks for the next ten, or a journey lands on an
// entry beyond them, and the developer can return to the latest ten
// (`./recentlyDoneRange.ts`), and only the records of the
// stories shown are read (`./doneDetails.ts`); a story shown before its
// record answers keeps its place, with its sessions, under its identity.
// The saved sessions decide which stories the first entries hold, so no
// record is read before the page's first read of them ends; a read that ends
// unanswered lets the stories shown without them be read.
// A refresh of the project keeps the list the last revision's catalog placed
// until the new revision's catalog answers, since the snapshot carries it
// (`./carriedFacts.ts`), so the list neither empties nor loses the keyboard
// meanwhile; each record is still read at the revision whose catalog lists
// it. `./RecentlyDone.tsx` presents it.

import { useLayoutEffect } from "react";
import type { CataloguedDoneRecord } from "../../src/skills/dough-product-backlog/scripts/product-backlog-done-catalog.mjs";
import { storySessionsOf, type LaunchWithState } from "./agentLaunch.ts";
import type { ColumnSummary } from "./columnSummary.ts";
import { useDoneDetails } from "./doneDetails.ts";
import { recentDoneRecords } from "./doneStories.ts";
import type { CreationView } from "./launchCreation.ts";
import type { PublishedWork } from "./publishedWork.ts";
import {
  shownPrefix,
  usePageRange,
  type HeldEntry,
  type RecentlyDoneRange,
} from "./recentlyDoneRange.ts";
import { sessionKey } from "./sessionReference.ts";

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

const holds = (each: Listed, session: string) =>
  "record" in each
    ? each.sessions.some((held) => sessionKey(held.session) === session)
    : sessionKey(each.session.session) === session;

// Whether `each` is, or holds, the entry holding the keyboard.
const holdsEntry = (each: Listed, held: HeldEntry) =>
  held.story === undefined
    ? holds(each, held.session)
    : "record" in each && each.record.identity === held.story;

// Answers the page's destination in this project once the list can place it:
// not held here when no saved Done session is it, else, once the done
// catalog has placed it, the range extended exactly through its entry, and
// reached once every entry through it is `settled`.
function useDestinationAnswer(
  range: RecentlyDoneRange,
  sourceId: string,
  records: readonly LaunchWithState[] | undefined,
  done: PublishedWork["done"],
  listed: readonly Listed[],
  settled: (each: Listed) => boolean,
) {
  const wanted = range.wanted(sourceId);
  useLayoutEffect(() => {
    if (wanted === undefined || records === undefined) return;
    const { id, session } = wanted;
    if (!records.some((record) => sessionKey(record.session) === session)) {
      range.settle(id, 0, "absent");
      return;
    }
    if (done === undefined || done.status === "loading") return;
    const at = listed.findIndex((each) => holds(each, session));
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

// Done stories and the selected project's closed sessions use one list for
// rendering and counts, of which the requested first entries show.
// Unresolved creations remain recovery evidence only.
export function useRecentlyDone({
  sourceId,
  work,
  creations,
  records,
  noneKept,
  sessionsSettled,
}: {
  readonly sourceId: string;
  readonly work: PublishedWork;
  readonly creations: readonly CreationView[];
  readonly records: readonly LaunchWithState[] | undefined;
  readonly noneKept: boolean;
  // Whether the page's first read of the machine's sessions has ended,
  // answered or not.
  readonly sessionsSettled: boolean;
}) {
  const range = usePageRange();
  // While a newer revision reads its catalog, the snapshot carries the
  // last one (`./carriedFacts.ts`).
  const { done } = work;
  // Records are read at the revision whose catalog lists them.
  const revision =
    done?.status === "catalogued" ? done.revision : work.revision;
  const listed = newestFirst(
    recentDoneRecords(done, new Date()),
    records ?? [],
    sourceId,
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
  useDestinationAnswer(range, sourceId, records, done, listed, (each) =>
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
    problem: done?.status === "unavailable" ? done.problem : undefined,
    unreadable: unreadable.map((record) => ({
      file: record.fileName,
      detail: details.detailOf(record),
    })),
    shown,
    older,
    details,
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
