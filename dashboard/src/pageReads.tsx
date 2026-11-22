// The page's reads of Intent, its CI, the story review and done records, and
// its calls for a shown session. The app (`./App.tsx`) gives `./ConfiguredDashboard.tsx` the
// authenticated implementations; every consumer reaches them through this
// one entry and fails outside it.

import { createContext, useContext, type ReactNode } from "react";
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
import { pageReviewSource, type ReviewSource } from "./reviewSource.ts";
import {
  authenticatedSessionServices,
  type SessionServices,
} from "./sessionServices.ts";

export type PageReads = {
  readonly intent: IntentReadSource;
  readonly ci: IntentCiReadSource;
  readonly review: ReviewSource;
  readonly sessions: SessionServices;
  readonly done: DoneRecordReadSource;
};

export const authenticatedPageReads: PageReads = {
  intent: authenticatedIntentReads,
  ci: authenticatedIntentCiReads,
  review: pageReviewSource,
  sessions: authenticatedSessionServices,
  done: authenticatedDoneRecordReads,
};

const PageReadsContext = createContext<PageReads | undefined>(undefined);

export function PageReadsOnPage({
  reads,
  children,
}: {
  readonly reads: PageReads;
  readonly children?: ReactNode;
}) {
  return (
    <PageReadsContext.Provider value={reads}>
      {children}
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
