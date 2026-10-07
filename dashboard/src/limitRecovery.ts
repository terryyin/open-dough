// How the published observation (`./publishedObservation.ts`) recovers what
// GitHub's rate limit (`./readingLimit.ts`) withheld of its latest read
// (`./snapshotRetrieval.ts`): once the limit ends, a visible page reads the
// ref afresh -- the project when nothing is shown, or again beside the shown
// snapshot, whose content already read is not asked of GitHub again. A
// hidden page waits until it is seen again. Until then no revision check is
// asked in its place.

import { useEffect } from "react";
import type { Visibility } from "./pageVisibility.ts";
import { useStandingLimit } from "./readingLimit.ts";

// Asks `readAfresh` once recovery is due, and says whether revision checks
// may be scheduled.
export function useLimitRecovery({
  withheld,
  readSettled,
  visibility,
  readAfresh,
}: {
  readonly withheld: boolean;
  readonly readSettled: boolean;
  readonly visibility: Visibility;
  readonly readAfresh: () => void;
}): { readonly checksMayRun: boolean } {
  const limitStands = useStandingLimit() !== undefined;
  const recoveryDue =
    withheld && readSettled && !limitStands && visibility !== "hidden";
  useEffect(() => {
    if (recoveryDue) readAfresh();
  }, [recoveryDue]);
  return { checksMayRun: readSettled && !withheld };
}
