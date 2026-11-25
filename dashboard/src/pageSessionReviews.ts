// The page's Side panel review opens a story's published session.
import { createContext, useContext } from "react";
import type { SelectedStory } from "./pageStorySelection.tsx";
import {
  reviewedWorkKey,
  type ReviewedPublishedSessionSubject,
} from "./reviewedWorkSubject.ts";

export type SessionReviewSubject = ReviewedPublishedSessionSubject;

// The session and the control that takes focus when its review closes.
export type SessionReviewRequest = {
  readonly subject: SessionReviewSubject;
  readonly title: string;
  readonly story?: SelectedStory;
  readonly control: HTMLElement;
};

export type OpenSessionReview = (request: SessionReviewRequest) => void;

export const SessionReviewsOnPage = createContext<
  OpenSessionReview | undefined
>(undefined);

// Opens a session review in the page's panel.
export function useOpenSessionReview(): OpenSessionReview {
  const open = useContext(SessionReviewsOnPage);
  if (open === undefined) {
    throw new Error("A session review is opened outside the page's PageFrame.");
  }
  return open;
}

// A different session starts a fresh panel review.
export const sessionReviewPanelKey = (request: SessionReviewRequest) =>
  reviewedWorkKey(request.subject);
