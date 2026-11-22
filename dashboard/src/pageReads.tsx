// The page's reads of Intent, its CI, the story review, done records, story
// notes, CI follow-up and story review states, and its calls for a shown
// session. The app (`./App.tsx`) gives `./ConfiguredDashboard.tsx` the
// authenticated implementations; every consumer reaches them through this
// one entry and fails outside it.

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
export const useSessionServices = (): SessionServices =>
  usePageReads().sessions;
export const useDoneRecordReads = (): DoneRecordReadSource =>
  usePageReads().done;
export const useCiFollowUpReads = (): CiFollowUpReadSource =>
  usePageReads().ciFollowUp;
