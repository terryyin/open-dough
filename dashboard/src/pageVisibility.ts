// Whether the person can see the page, as the document reports it, for the
// revision-check schedule (`./revisionCheckSchedule.ts`).

import { useCallback, useEffect, useRef, useState } from "react";

// Hidden pages make no revision checks, and a page seen again is `revealed`
// until its first check, or a read asked since it was seen again, settles, so
// that check is asked at once rather than after a whole interval.
export type Visibility = "visible" | "hidden" | "revealed";

function documentVisibility(): Visibility {
  return document.visibilityState === "hidden" ? "hidden" : "visible";
}

// The page's visibility, and a way to say that a read or check has settled:
// a settled one is as fresh as the prompt check a page seen again would ask
// for, so the steady pace resumes from it. A read asked before the page was
// last hidden or seen again says `asOf` what `visibilityChanges` said when it
// was asked; it then settles nothing, since what it read may predate what was
// published while the page was hidden.
export function usePageVisibility(): {
  visibility: Visibility;
  visibilityChanges: () => number;
  settleRevealed: (asOf?: number) => void;
} {
  const [visibility, setVisibility] = useState<Visibility>(documentVisibility);
  const changes = useRef(0);
  useEffect(() => {
    const noteVisibility = () => {
      changes.current += 1;
      const now = documentVisibility();
      setVisibility((last) =>
        now === "hidden" ? now : last === "hidden" ? "revealed" : last,
      );
    };
    document.addEventListener("visibilitychange", noteVisibility);
    return () => {
      document.removeEventListener("visibilitychange", noteVisibility);
    };
  }, []);
  const visibilityChanges = useCallback(() => changes.current, []);
  const settleRevealed = useCallback((asOf?: number) => {
    if (asOf !== undefined && asOf !== changes.current) return;
    setVisibility((last) => (last === "revealed" ? "visible" : last));
  }, []);
  return { visibility, visibilityChanges, settleRevealed };
}
