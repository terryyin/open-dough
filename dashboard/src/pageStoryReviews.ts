// The page's one opening of a story review (`./StoryReview.tsx`) in its
// side panel (`./PageFrame.tsx`), which a story's card reaches without
// every component between them passing it along. A review is not a session:
// it has no session mark and no lifecycle action, and showing one detaches
// whatever session the panel showed without ending it. The request names
// reviewed work: a story identity or an ad hoc session of a project.

import { createContext, useContext } from "react";
import type { ShownComparison } from "./StoryReviewComparison.tsx";
import {
  reviewedWorkKey,
  sameReviewedWorkSubject,
  type ReviewedWorkSubject,
} from "./reviewedWorkSubject.ts";

// A workspace comparison a request asks the review to show.
export type RequestedComparison = {
  readonly chosen: ShownComparison;
  readonly includeUncommitted: boolean;
};

// A request to review one story or ad hoc session of one project: the
// reviewed-work subject it names, kept while the dashboard's own selection
// moves on, and the control that asked, which gets the keyboard back once
// the review closes. A view showing its own comparison of the story, as
// Intent does, asks for it, so the review it opens shows the same; without
// one the review opens on its own default.
export type StoryReviewRequest = {
  readonly subject: ReviewedWorkSubject;
  readonly title: string;
  readonly control: HTMLElement;
  readonly completed?: boolean;
  // Read the completed result even when its workspace remains readable.
  readonly historical?: boolean;
  readonly comparison?: RequestedComparison;
};

export type OpenStoryReview = (request: StoryReviewRequest) => void;

export const StoryReviewsOnPage = createContext<OpenStoryReview | undefined>(
  undefined,
);

// Opens a story's review in the page's panel.
export function useOpenStoryReview(): OpenStoryReview {
  const open = useContext(StoryReviewsOnPage);
  if (open === undefined) {
    throw new Error("A story review is opened outside the page's PageFrame.");
  }
  return open;
}

// Whether two requests name the same reviewed work of the same project.
export const sameReviewedWork = (
  one: Pick<StoryReviewRequest, "subject">,
  other: Pick<StoryReviewRequest, "subject">,
) => sameReviewedWorkSubject(one.subject, other.subject);

// Remount key for the panel's review: the subject, and historical reading.
export const storyReviewPanelKey = (request: StoryReviewRequest) =>
  `${reviewedWorkKey(request.subject)}\n${String(request.historical === true)}`;
