// The page's reads of Intent, its CI and the story review. The composition
// root (`./ConfiguredDashboard.tsx`) supplies the authenticated readers; every
// consumer reads them through this one entry and fails outside it.

import { createContext, useContext, type ReactNode } from "react";
import {
  authenticatedIntentCiReads,
  type IntentCiReadSource,
} from "./intentCiReadSource.ts";
import {
  authenticatedIntentReads,
  type IntentReadSource,
} from "./intentReadSource.ts";
import { pageReviewSource, type ReviewSource } from "./reviewSource.ts";

export type PageReads = {
  readonly intent: IntentReadSource;
  readonly ci: IntentCiReadSource;
  readonly review: ReviewSource;
};

export const authenticatedPageReads: PageReads = {
  intent: authenticatedIntentReads,
  ci: authenticatedIntentCiReads,
  review: pageReviewSource,
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
