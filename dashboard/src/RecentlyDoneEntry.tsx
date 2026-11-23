// One entry Recently done lists (`./RecentlyDone.tsx`): a session outside
// any done story, a published session this machine never launched, or a done
// story's card (`./DoneStoryCard.tsx`) with what the
// card holds beside its record's facts -- its own sessions, closed story
// follow-ups, its CI follow-up, its Follow up, and its review state -- or,
// until its record is read, what it says instead.

import type { CataloguedDoneRecord } from "../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-done-catalog.mjs";
import type { MachineSessions } from "./agentLaunches.ts";
import { CiFollowUpCard } from "./CiFollowUpViews.tsx";
import type { CiFollowUpAnswer } from "./ciFollowUp.ts";
import { readingDoneStory, type DoneDetail } from "./doneDetails.ts";
import { unreadableDoneRecord } from "./doneRecord.ts";
import { DoneStoryCard } from "./DoneStoryCard.tsx";
import { AdHocSessionReviewAction } from "./AdHocSessionReviewAction.tsx";
import { SessionFollowUp, StoryFollowUp } from "./FollowUp.tsx";
import { PublishedSessionEntry } from "./PublishedSessionEntry.tsx";
import type { Listed } from "./recentlyDoneView.ts";
import { SessionEntry } from "./SessionEntry.tsx";
import { StoryReviewStateAction } from "./StoryReviewStateAction.tsx";
import type { StoryReviewStates } from "./storyReviewStates.ts";

// What an entry's story card says until its record is read.
function unreadWords(
  detail: DoneDetail,
  file: string,
): { readonly words: string; readonly gap: boolean } | undefined {
  switch (detail.status) {
    case "read":
      return undefined;
    case "reading":
      return { words: readingDoneStory, gap: false };
    case "failed":
      return { words: "This done story could not be read.", gap: true };
    case "unreadable":
      return { words: unreadableDoneRecord(file, detail.problem), gap: true };
  }
}

export function ListedEntry({
  each,
  detailOf,
  revision,
  sourceId,
  project,
  launches,
  selectedIdentity,
  onSelect,
  ciFollowUps,
  reviewStates,
}: {
  readonly ciFollowUps: CiFollowUpAnswer | undefined;
  readonly reviewStates: StoryReviewStates;
  readonly each: Listed;
  readonly detailOf: (record: CataloguedDoneRecord) => DoneDetail;
  // The revision the shown done records are read at.
  readonly revision: string;
  readonly sourceId: string;
  readonly project: string;
  readonly launches: MachineSessions;
  readonly selectedIdentity: string | undefined;
  readonly onSelect: (identity: string) => void;
}) {
  if ("published" in each) {
    return (
      <PublishedSessionEntry record={each.published} sourceId={sourceId} />
    );
  }
  if (!("record" in each)) {
    return (
      <SessionEntry
        record={each.session}
        onStoryCard={false}
        followUp={
          <>
            <AdHocSessionReviewAction
              record={each.session}
              sourceId={sourceId}
            />
            <SessionFollowUp
              record={each.session}
              project={project}
              sourceId={sourceId}
              launches={launches}
            />
          </>
        }
      />
    );
  }
  const { record, sessions, followUps } = each;
  const detail = detailOf(record);
  return (
    <DoneStoryCard
      identity={record.identity}
      completedAt={record.completedAt}
      story={detail.status === "read" ? detail.story : undefined}
      said={unreadWords(detail, record.fileName)}
      sessions={sessions}
      followUps={followUps}
      sourceId={sourceId}
      launchRecords={launches.records}
      selected={selectedIdentity === record.identity}
      onSelect={onSelect}
      ciFollowUp={
        <CiFollowUpCard
          answer={ciFollowUps}
          identity={record.identity}
          project={sourceId}
        />
      }
      reviewState={
        <StoryReviewStateAction
          identity={record.identity}
          states={reviewStates}
        />
      }
      followUp={
        detail.status === "read" && (
          <StoryFollowUp
            story={detail.story}
            revision={revision}
            sessions={sessions}
            project={project}
            sourceId={sourceId}
            launches={launches}
          />
        )
      }
    />
  );
}
