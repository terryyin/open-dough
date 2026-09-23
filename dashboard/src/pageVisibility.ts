// Whether the person can see the page, as the document reports it, for the
// published observation's revision-check schedule
// (`./publishedObservation.ts`).

import { useCallback, useEffect, useState } from "react";

// Hidden pages make no revision checks, and a page seen again is `revealed`
// until its first check or read settles, so that check is asked at once
// rather than after a whole interval.
export type Visibility = "visible" | "hidden" | "revealed";

function documentVisibility(): Visibility {
  return document.visibilityState === "hidden" ? "hidden" : "visible";
}

// The page's visibility, and a way to say that a read or check has settled:
// a settled one is as fresh as the prompt check a page seen again would ask
// for, so the steady pace resumes from it.
export function usePageVisibility(): {
  visibility: Visibility;
  settleRevealed: () => void;
} {
  const [visibility, setVisibility] = useState<Visibility>(documentVisibility);
  useEffect(() => {
    const noteVisibility = () => {
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
  const settleRevealed = useCallback(() => {
    setVisibility((last) => (last === "revealed" ? "visible" : last));
  }, []);
  return { visibility, settleRevealed };
}
