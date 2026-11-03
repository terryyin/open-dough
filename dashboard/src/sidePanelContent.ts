// What the page's one Side panel shows (`./pageSidePanel.ts`): a session's
// terminal or final report, or a story's review, and the story it shows.
import {
  launchSubject,
  type LaunchRecord,
  type LaunchWithState,
} from "./agentLaunch.ts";
import type { SessionAccess } from "./sessionAccess.ts";
import { sessionKey } from "./sessionReference.ts";
import type { SessionRequest } from "./pageSessions.ts";
import type { StoryReviewRequest } from "./pageStoryReviews.ts";
import type { SelectedStory } from "./pageStorySelection.tsx";

// What the panel shows, and whether it takes the page column's room too.
// Maximization belongs to the shown content, so new content starts split.
export type SidePanel = (
  | { readonly kind: SessionAccess; readonly request: SessionRequest }
  | { readonly kind: "story-review"; readonly request: StoryReviewRequest }
) & { readonly maximized?: boolean };
export type Shown = SidePanel["request"];

export const shownSessionOf = (sidePanel: SidePanel | undefined) =>
  sidePanel === undefined || sidePanel.kind === "story-review"
    ? undefined
    : sidePanel.request;

// The story the shown content belongs to; none for a session attached to no
// story.
export function shownStory(shown: Shown): SelectedStory | undefined {
  if (!("record" in shown))
    return { project: shown.source, identity: shown.identity };
  const { request } = shown.record;
  const identity = launchSubject(request).identity;
  return identity === undefined
    ? undefined
    : { project: request.source, identity };
}

// The session a panel shows as the page reads it now, from the machine's
// sessions of every project, since the panel keeps the record it was opened
// with; until the page has read it, the opened record, with its reading
// unknown if it was opened without one.
export function shownRecord(
  records: readonly LaunchWithState[] | undefined,
  { record }: SessionRequest,
): LaunchWithState {
  const opened: LaunchRecord & Partial<LaunchWithState> = record;
  return (
    records?.find(
      (known) => sessionKey(known.session) === sessionKey(record.session),
    ) ?? { ...record, sessionState: opened.sessionState ?? { kind: "unknown" } }
  );
}
