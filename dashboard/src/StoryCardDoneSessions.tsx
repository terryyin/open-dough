// Done history on an unfinished Backlog or Taken card: collapsed count of
// that story's retained Done sessions, expanded with the shared Session entry
// (`./SessionEntry.tsx`) and the Follow up its card supplies for each. The Board's one
// placement rule (`./columnSessions.ts`) gives this card those sessions ahead
// of a published done card or standalone Recently done entry. Expanding alone does not change story
// selection. Session navigation opens the disclosure to reveal a nested entry
// (`./sessionNavigation.ts`).

import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import type { LaunchWithState } from "./agentLaunch.ts";
import type { AgentAssignment } from "./agentAssignments.ts";
import { Icon } from "./Icon.tsx";
import { sessionKey } from "./sessionReference.ts";
import { SessionEntry } from "./SessionEntry.tsx";
import { storyCardDoneClass } from "./storyCardDone.ts";
import "./story-card-done.css";
import "./frame-controls.css";

export function StoryCardDoneSessions({
  sessions,
  storyCardAssignments,
  followUpOf,
}: {
  // This story's own Done sessions, oldest first.
  readonly sessions: readonly LaunchWithState[];
  readonly storyCardAssignments: readonly AgentAssignment[];
  // The Follow up each Done session's entry offers.
  readonly followUpOf: (record: LaunchWithState) => ReactNode;
}) {
  if (sessions.length === 0) return null;
  return (
    <details className={`frame-disclosure ${storyCardDoneClass}`}>
      <summary>
        <Icon icon={ChevronRight} />
        <span>Done</span>
        <span className="story-card-done-count">{sessions.length}</span>
      </summary>
      <ol className="story-card-done-sessions" aria-label="Done history">
        {sessions.toReversed().map((record) => (
          <li key={sessionKey(record.session)}>
            <SessionEntry
              record={record}
              onStoryCard
              storyCardAssignments={storyCardAssignments}
              additionalActions={followUpOf(record)}
            />
          </li>
        ))}
      </ol>
    </details>
  );
}
