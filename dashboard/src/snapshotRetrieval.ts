// What the published observation (`./publishedObservation.ts`) shows of its
// last snapshot, apart from the latest attempt (`./observationAttempt.ts`):
// the snapshot, whether every detail of it is read, whether GitHub's rate
// limit (`./readingLimit.ts`) withheld anything its latest read asked -- the
// membership, when nothing is shown, or a detail of what is -- and a notice
// said once when a new snapshot no longer lists the work that held focus.
// Settled question outcomes for the active observation
// (`./observationOutcomes.ts`) live here too: they clear with the project or
// when membership lands at another revision.

import { useRef, useState } from "react";
import { ObservationOutcomes } from "./observationOutcomes.ts";
import type { PublishedWork } from "./publishedWork.ts";

type Retrieval = {
  // The last snapshot read, whole or with its unread detail labeled; a later
  // read replaces it whole.
  readonly work: PublishedWork | undefined;
  readonly notice: string;
  readonly complete: boolean;
  // The limit withheld something the latest read asked, so the page reads
  // again once the limit ends.
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
  const outcomes = useRef(new ObservationOutcomes()).current;
  return {
    retrieval,
    outcomes,
    // A read's newly read membership starts a new snapshot, saying `notice`;
    // its later progress, or moved progress, replaces the shown work only.
    // Outcomes for another revision are abandoned; the same revision keeps
    // them so recovery can retain answered and terminal questions.
    show: (work: PublishedWork, notice?: string) => {
      if (notice !== undefined) {
        outcomes.pinRevision(work.revision);
      }
      setRetrieval((last) =>
        notice === undefined
          ? { ...last, work }
          : { ...noRetrieval, work, notice },
      );
    },
    completeDetail: () => {
      setRetrieval((last) => ({ ...last, complete: true }));
    },
    withhold: () => {
      setRetrieval((last) => ({ ...last, withheld: true }));
    },
    // A new read is asked: it notes again whatever the limit withholds of it.
    readAgain: () => {
      setRetrieval((last) => ({ ...last, withheld: false }));
    },
    clearNotice: () => {
      setRetrieval((last) => ({ ...last, notice: "" }));
    },
    // Selecting another project shows nothing of the previous one.
    clear: () => {
      outcomes.clear();
      setRetrieval(noRetrieval);
    },
  };
}
