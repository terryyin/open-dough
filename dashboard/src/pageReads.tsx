// The page's reads of Intent, its CI, the story review, done records, story
// notes, CI follow-up, story review states, the published observation, and the
// machine's sessions and agent acceptance; its calls for a shown session and
// instruction transcription; and
// its source highlighter. The app (`./App.tsx`) gives
// `./ConfiguredDashboard.tsx` the authenticated implementations. The dashboard
// hands the published observation and launch owner their reads; Recently
// done's links read another project's snapshot and done catalog through
// `useDoneLinkReads`. Every other consumer
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
  instructionTranscription,
  type InstructionTranscriptionSource,
} from "./instructionTranscriptionSource.ts";
import {
  authenticatedPublishedObservationReads,
  type PublishedObservationReadSource,
} from "./publishedObservationReadSource.ts";
import {
  authenticatedCiFollowUpReads,
  type CiFollowUpReadSource,
} from "./ciFollowUpReadSource.ts";
import {
  authenticatedMachineReads,
  type MachineReadSource,
} from "./machineReadSource.ts";
import {
  highlightSourceLines,
  type SourceHighlighter,
} from "./sourceHighlight.ts";
import type { DoneLinkReads } from "./recentlyDoneLink.ts";
import {
  pageReviewSource,
  readStoryReviewResult,
  type ReviewSource,
} from "./reviewSource.ts";
import {
  authenticatedSessionServices,
  type SessionServices,
} from "./sessionServices.ts";
import {
  authenticatedStoryNotesReads,
  type StoryNotesReadSource,
} from "./storyNotesReadSource.ts";
import {
  authenticatedStoryReviewStatesReads,
  type StoryReviewStatesReadSource,
} from "./storyReviewStatesReadSource.ts";

export type PageReads = {
  readonly intent: IntentReadSource;
  readonly ci: IntentCiReadSource;
  readonly review: ReviewSource;
  readonly storyResult: typeof readStoryReviewResult;
  readonly sessions: SessionServices;
  readonly transcription: InstructionTranscriptionSource;
  readonly done: DoneRecordReadSource;
  readonly storyNotes: StoryNotesReadSource;
  readonly ciFollowUp: CiFollowUpReadSource;
  readonly reviewStates: StoryReviewStatesReadSource;
  readonly observation: PublishedObservationReadSource;
  readonly machine: MachineReadSource;
  readonly highlight: SourceHighlighter;
};

export const authenticatedPageReads: PageReads = {
  intent: authenticatedIntentReads,
  ci: authenticatedIntentCiReads,
  review: pageReviewSource,
  storyResult: readStoryReviewResult,
  sessions: authenticatedSessionServices,
  transcription: instructionTranscription,
  done: authenticatedDoneRecordReads,
  storyNotes: authenticatedStoryNotesReads,
  ciFollowUp: authenticatedCiFollowUpReads,
  reviewStates: authenticatedStoryReviewStatesReads,
  observation: authenticatedPublishedObservationReads,
  machine: authenticatedMachineReads,
  highlight: highlightSourceLines,
};

type OnPage = {
  readonly reads: PageReads;
  // The page's identity for the values it holds, kept for the page's life.
  readonly page: object;
};

const PageReadsContext = createContext<OnPage | undefined>(undefined);

export function PageReadsOnPage({
  reads,
  children,
}: {
  readonly reads: PageReads;
  readonly children?: ReactNode;
}) {
  // The page holds each project's values (notes, review states), created
  // from these reads on first use.
  const page = useMemo(() => ({}), []);
  const onPage = useMemo(() => ({ reads, page }), [reads, page]);
  return (
    <PageReadsContext.Provider value={onPage}>
      {children}
    </PageReadsContext.Provider>
  );
}

function useOnPage(): OnPage {
  const onPage = useContext(PageReadsContext);
  if (onPage === undefined) {
    throw new Error("The page's reads are outside its PageReadsOnPage.");
  }
  return onPage;
}

const usePageReads = (): PageReads => useOnPage().reads;

// One kind of value the page holds per key, such as each project's story
// notes: the returned hook gives the page's value for a key, created from the
// page's reads on first use and kept for the page's life.
export function heldOnPagePerKey<T>(
  create: (reads: PageReads, key: string) => T,
): (key: string) => T {
  const byPage = new WeakMap<object, Map<string, T>>();
  return function useHeldOnPage(key) {
    const { reads, page } = useOnPage();
    const byKey = byPage.get(page) ?? new Map<string, T>();
    byPage.set(page, byKey);
    if (byKey.has(key)) return byKey.get(key) as T;
    const created = create(reads, key);
    byKey.set(key, created);
    return created;
  };
}

// One value the page holds once, created from the page's reads on first use
// and kept for the page's life.
export function heldOnPage<T>(create: (reads: PageReads) => T): () => T {
  const byPage = new WeakMap<object, T>();
  return function useHeldOnPage() {
    const { reads, page } = useOnPage();
    if (byPage.has(page)) return byPage.get(page) as T;
    const created = create(reads);
    byPage.set(page, created);
    return created;
  };
}

export const useIntentReads = (): IntentReadSource => usePageReads().intent;
export const useIntentCiReads = (): IntentCiReadSource => usePageReads().ci;
export const useReviewReads = (): ReviewSource => usePageReads().review;
export const useStoryResultReads = () => usePageReads().storyResult;
export const useSessionServices = (): SessionServices =>
  usePageReads().sessions;
export const useInstructionTranscription = (): InstructionTranscriptionSource =>
  usePageReads().transcription;
export const useDoneRecordReads = (): DoneRecordReadSource =>
  usePageReads().done;
export const useDoneLinkReads = (): DoneLinkReads => usePageReads().observation;
export const useCiFollowUpReads = (): CiFollowUpReadSource =>
  usePageReads().ciFollowUp;
export const useSourceHighlighter = (): SourceHighlighter =>
  usePageReads().highlight;
