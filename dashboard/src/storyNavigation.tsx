// Semantic references navigate through the page's published observation. Source
// evidence links keep their own policy in RecordedLink and StoryCardDependencies.
import { createContext, useContext, type ReactNode } from "react";
import {
  useStoryReferenceJourney,
  type StoryNavigation,
} from "./storyReferenceJourney.tsx";
import "./story-navigation.css";

export type {
  FollowOptions,
  StoryNavigation,
} from "./storyReferenceJourney.tsx";

export const StoryNavigationOnPage = createContext<StoryNavigation | undefined>(
  undefined,
);

export function useStoryNavigation() {
  const navigation = useContext(StoryNavigationOnPage);
  if (navigation === undefined)
    throw new Error("Story references need the dashboard page.");
  return navigation;
}

// Runs inside PageFrame so semantic references and session journeys share its
// one Recently done range. The caller places the persistent notice by read status.
export function StoryReferenceNavigation({
  children,
  ...props
}: Parameters<typeof useStoryReferenceJourney>[0] & {
  readonly children: (notice: ReactNode) => ReactNode;
}) {
  const journey = useStoryReferenceJourney(props);
  return (
    <StoryNavigationOnPage value={journey.navigation}>
      {children(journey.notice)}
    </StoryNavigationOnPage>
  );
}
