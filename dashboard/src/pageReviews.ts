// The page's one opening of a story review (`./StoryReviewPanel.tsx`) in its
// side panel (`./PageFrame.tsx`), which a story's card reaches without
// every component between them passing it along. A review is not a session:
// it has no session mark and no lifecycle action, and showing one detaches
// whatever session the panel showed without ending it.

import { createContext, useContext } from "react";

// A request to review one story of one project: the project and story it
// names, kept while the dashboard's own selection moves on, and the control
// that asked, which gets the keyboard back once the review closes.
export type StoryReviewRequest = {
  readonly source: string;
  readonly identity: string;
  readonly title: string;
  readonly control: HTMLElement;
};

export type OpenStoryReview = (request: StoryReviewRequest) => void;

export const ReviewsOnPage = createContext<OpenStoryReview | undefined>(
  undefined,
);

// Opens a story's review in the page's panel.
export function useOpenStoryReview(): OpenStoryReview {
  const open = useContext(ReviewsOnPage);
  if (open === undefined) {
    throw new Error("A story review is opened outside the page's PageFrame.");
  }
  return open;
}

// Whether two requests name the same story of the same project.
export const sameStory = (
  one: Pick<StoryReviewRequest, "source" | "identity">,
  other: Pick<StoryReviewRequest, "source" | "identity">,
) => one.source === other.source && one.identity === other.identity;
