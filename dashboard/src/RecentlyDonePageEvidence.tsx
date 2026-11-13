// The page keeps one view of local review states and the published inputs
// needed by shown Recently done rows, above Board and Sessions sidebar.
import type { ReactNode } from "react";
import type { PublishedSource } from "./publishedSource.ts";
import type { PublishedWork } from "./publishedWork.ts";
import { RecentlyDoneLinkSources } from "./recentlyDoneShownLinks.ts";
import {
  StoryReviewStatesOnPage,
  usePageStoryReviewStates,
} from "./storyReviewStates.ts";

export function RecentlyDonePageEvidence({
  projects,
  selected,
  work,
  children,
}: {
  readonly projects: readonly PublishedSource[];
  readonly selected: string;
  readonly work: PublishedWork | undefined;
  readonly children: ReactNode;
}) {
  const states = usePageStoryReviewStates();
  return (
    <StoryReviewStatesOnPage value={states}>
      <RecentlyDoneLinkSources value={{ projects, selected, work }}>
        {children}
      </RecentlyDoneLinkSources>
    </StoryReviewStatesOnPage>
  );
}
