// The page's reads of Intent, its CI, the story review, done records, story
// notes, CI follow-up, story review states and the published observation, and
// its calls for a shown session. The app (`./App.tsx`) gives
// `./ConfiguredDashboard.tsx` the authenticated implementations. The
// dashboard hands the published observation its reads; every other consumer
// reaches them through this one entry and fails outside it.

import { createContext, useContext, useMemo, type ReactNode } from "react";
import {
  authenticatedDoneRecordReads,
  type DoneRecordReadSource,
} from "./doneRecordReadSource.ts";
import {
  authenticatedIntentCiReads,
  type IntentCiReadSource,
} from "./intentCiReadSource.ts";
import {
  authenticatedIntentReads,
  type IntentReadSource,
} from "./intentReadSource.ts";
import {
  authenticatedPublishedObservationReads,
  type PublishedObservationReadSource,
} from "./publishedObservationReadSource.ts";
import {
  authenticatedCiFollowUpReads,
  type CiFollowUpReadSource,
} from "./ciFollowUpReadSource.ts";
import { pageReviewSource, type ReviewSource } from "./reviewSource.ts";
import {
  authenticatedSessionServices,
  type SessionServices,
} from "./sessionServices.ts";
import {
  authenticatedStoryNotesReads,
  type StoryNotesReadSource,
} from "./storyNotesReadSource.ts";
import { StoryNotesOnPage, type ProjectNotes } from "./storyNotes.ts";
import {
  StoryReviewStatesOnPage,
  type ProjectReviewStates,
} from "./storyReviewStates.ts";
import {
  authenticatedStoryReviewStatesReads,
  type StoryReviewStatesReadSource,
} from "./storyReviewStatesReadSource.ts";

export type PageReads = {
  readonly intent: IntentReadSource;
  readonly ci: IntentCiReadSource;
  readonly review: ReviewSource;
  readonly sessions: SessionServices;
  readonly done: DoneRecordReadSource;
  readonly storyNotes: StoryNotesReadSource;
  readonly ciFollowUp: CiFollowUpReadSource;
  readonly reviewStates: StoryReviewStatesReadSource;
  readonly observation: PublishedObservationReadSource;
};

export const authenticatedPageReads: PageReads = {
  intent: authenticatedIntentReads,
  ci: authenticatedIntentCiReads,
  review: pageReviewSource,
  sessions: authenticatedSessionServices,
  done: authenticatedDoneRecordReads,
  storyNotes: authenticatedStoryNotesReads,
  ciFollowUp: authenticatedCiFollowUpReads,
  reviewStates: authenticatedStoryReviewStatesReads,
  observation: authenticatedPublishedObservationReads,
};

const PageReadsContext = createContext<PageReads | undefined>(undefined);

export function PageReadsOnPage({
  reads,
  children,
}: {
  readonly reads: PageReads;
  readonly children?: ReactNode;
}) {
  // The page holds each project's notes and review states, created from
  // these reads on first use.
  const notes = useMemo(() => new Map<string, ProjectNotes>(), []);
  const reviewStates = useMemo(
    () => new Map<string, ProjectReviewStates>(),
    [],
  );
  return (
    <PageReadsContext.Provider value={reads}>
      <StoryNotesOnPage value={notes}>
        <StoryReviewStatesOnPage value={reviewStates}>
          {children}
        </StoryReviewStatesOnPage>
      </StoryNotesOnPage>
    </PageReadsContext.Provider>
  );
}

function usePageReads(): PageReads {
  const reads = useContext(PageReadsContext);
  if (reads === undefined) {
    throw new Error("The page's reads are outside its PageReadsOnPage.");
  }
  return reads;
}

export const useIntentReads = (): IntentReadSource => usePageReads().intent;
export const useIntentCiReads = (): IntentCiReadSource => usePageReads().ci;
export const useReviewReads = (): ReviewSource => usePageReads().review;
export const useSessionServices = (): SessionServices =>
  usePageReads().sessions;
export const useDoneRecordReads = (): DoneRecordReadSource =>
  usePageReads().done;
export const useStoryNotesReads = (): StoryNotesReadSource =>
  usePageReads().storyNotes;
export const useCiFollowUpReads = (): CiFollowUpReadSource =>
  usePageReads().ciFollowUp;
export const useStoryReviewStatesReads = (): StoryReviewStatesReadSource =>
  usePageReads().reviewStates;
