import { useEffect, useRef } from "react";
import { revealRow } from "./StoryReviewFileMoves.tsx";
import type { TreeReveal } from "./useIntentOpenFolders.ts";

export function useIntentRowReveal(request: TreeReveal | undefined) {
  const section = useRef<HTMLElement>(null);
  useEffect(() => {
    if (request === undefined) return;
    const group = section.current;
    if (group === null) return;
    const row = group.querySelector('[aria-pressed="true"]');
    if (row === null) return;
    revealRow(group, row);
    const column = group.closest(".intent-locations");
    if (column instanceof HTMLElement) revealRow(column, row);
  }, [request]);
  return section;
}
