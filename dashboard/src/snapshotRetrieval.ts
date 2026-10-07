// What the published observation (`./publishedObservation.ts`) shows of its
// last snapshot, apart from the latest attempt (`./observationAttempt.ts`):
// the snapshot, whether every detail of it is read, whether GitHub's rate
// limit withheld any of that detail (`./readingLimit.ts`), and a notice said
// once when a new snapshot no longer lists the work that held focus.

import { useState } from "react";
import type { PublishedWork } from "./publishedWork.ts";

type Retrieval = {
  // The last snapshot read, whole or with its unread detail labeled; a later
  // read replaces it whole.
  readonly work: PublishedWork | undefined;
  readonly notice: string;
  readonly complete: boolean;
  readonly withheld: boolean;
};

const noRetrieval: Retrieval = {
  work: undefined,
  notice: "",
  complete: false,
  withheld: false,
};

export function useSnapshotRetrieval() {
  const [retrieval, setRetrieval] = useState<Retrieval>(noRetrieval);
  return {
    retrieval,
    // A read's newly read membership starts a new snapshot, saying `notice`;
    // its later progress, or moved progress, replaces the shown work only.
    show: (work: PublishedWork, notice?: string) => {
      setRetrieval((last) =>
        notice === undefined
          ? { ...last, work }
          : { ...noRetrieval, work, notice },
      );
    },
    completeDetail: () => {
      setRetrieval((last) => ({ ...last, complete: true }));
    },
    withholdDetail: () => {
      setRetrieval((last) => ({ ...last, withheld: true }));
    },
    clearNotice: () => {
      setRetrieval((last) => ({ ...last, notice: "" }));
    },
    // Selecting another project shows nothing of the previous one.
    clear: () => {
      setRetrieval(noRetrieval);
    },
  };
}
