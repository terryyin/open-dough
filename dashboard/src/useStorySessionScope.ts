// A story's sessions as Intent's review scopes and the chosen session's own
// review: a session with a published record reads that record and offers its
// recorded runs; one without reads nothing and says so.

import { storySessionScopes } from "./followUpSessions.ts";
import type { LaunchRecord } from "./launchRecord.ts";
import { useCurrentPublishedSessions } from "./recentlyDoneShownLinks.ts";
import type { ReviewedWorkSubject } from "./reviewedWorkSubject.ts";
import type { UnreadComparison } from "./StoryReviewFeedback.tsx";
import { useStateKeyedBy } from "./stateKeyedBy.ts";
import { useStoryReviewSelection } from "./useStoryReviewSelection.ts";

const unpublished: UnreadComparison = {
  failed: false,
  explanation: "This session published no comparison.",
};

export function useStorySessionScope({
  records,
  source,
  identity,
  round,
  enabled,
  keyedBy,
}: {
  // This machine's retained launches, which name the story's sessions.
  readonly records?: readonly LaunchRecord[] | undefined;
  readonly source: string;
  readonly identity: string;
  readonly round: number;
  readonly enabled: boolean;
  // A changed key returns to the whole story.
  readonly keyedBy: string;
}) {
  // The chosen scope, a session's key or the whole story.
  const { value: session, set: onSession } = useStateKeyedBy<
    string | undefined
  >(undefined, keyedBy);
  const sessions = storySessionScopes(
    records,
    useCurrentPublishedSessions(source),
    source,
    identity,
  );
  const published = sessions.find(({ key }) => key === session)?.published;
  const subject: ReviewedWorkSubject | undefined =
    published === undefined ? undefined : { source, identity, published };
  const scopeKey = JSON.stringify([keyedBy, session]);
  const selection = useStoryReviewSelection({
    subject: subject ?? { source, identity },
    round,
    enabled: enabled && subject !== undefined,
    keyedBy: scopeKey,
  });
  const answer = selection.defaultReview;
  return {
    sessions,
    session,
    onSession,
    // The choice's own key, which changes with the chosen session.
    scopeKey,
    // The published session read, when one is chosen and listed.
    subject,
    // The chosen session's selection; the whole story has none.
    selection: session === undefined ? undefined : selection,
    unreadable:
      session !== undefined && published === undefined
        ? unpublished
        : undefined,
    // The chosen session's recorded runs, from its default answer.
    ranges:
      session !== undefined && answer?.kind === "published-session"
        ? answer.ranges
        : undefined,
  };
}
