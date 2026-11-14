// Page-level lookup of a Done story for file-anchored Follow up: the published
// done record, the revision it was read at, and the sessions its card holds.
// Review changes and Intent both reach it here (`./FollowUp.tsx`) instead of
// threading the card's props through the diff.

import { useContext } from "react";
import { storySessionsOf, type LaunchWithState } from "./agentLaunch.ts";
import { useDoneDetails } from "./doneDetails.ts";
import type { DoneStory } from "./doneRecord.ts";
import { usePageLaunches } from "./pageLaunches.ts";
import type { PublishedSource } from "./publishedSource.ts";
import { RecentlyDoneLinkSources } from "./recentlyDoneShownLinks.ts";

export type DoneStoryFollowUpTarget = {
  readonly story: DoneStory;
  // The revision whose done catalog listed the record.
  readonly revision: string;
  // The Done sessions its card holds, oldest first.
  readonly sessions: readonly LaunchWithState[];
  readonly project: string;
  readonly sourceId: string;
};

const unreadSource: PublishedSource = {
  id: "",
  label: "",
  repository: "",
  ref: "",
  backlogPath: "",
};

// The Done story `identity` as Follow up needs it on the selected project, or
// undefined while its record is unread, missing, or not a Done story.
export function useDoneStoryFollowUp(
  identity: string | undefined,
): DoneStoryFollowUpTarget | undefined {
  const { projects, selected, work } = useContext(RecentlyDoneLinkSources);
  const launches = usePageLaunches();
  const source =
    projects.find((each) => each.id === selected) ??
    work?.source ??
    unreadSource;
  const done = work?.done;
  const revision =
    done?.status === "catalogued" ? done.revision : (work?.revision ?? "");
  const record =
    identity === undefined || done?.status !== "catalogued"
      ? undefined
      : done.records.find((each) => each.identity === identity);
  const readable =
    source.id !== "" &&
    work !== undefined &&
    work.source.id === source.id &&
    record !== undefined;
  const { detailOf } = useDoneDetails(
    source,
    revision,
    record === undefined ? [] : [record],
    readable,
  );
  if (!readable) return undefined;
  const detail = detailOf(record);
  if (detail.status !== "read") return undefined;
  return {
    story: detail.story,
    revision,
    sessions: storySessionsOf(launches.records, source.id, record.identity),
    project: source.label,
    sourceId: source.id,
  };
}
