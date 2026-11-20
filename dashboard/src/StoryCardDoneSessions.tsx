// Done history on an unfinished Backlog or Taken card: collapsed count of
// that story's retained Done sessions, expanded with the shared Session entry
// (`./SessionEntry.tsx`) and conditional Session Follow up. Placement prefers
// this card over a published done card or standalone Recently done entry
// (`./recentlyDoneListing.ts`). Expanding alone does not change story
// selection. Session navigation opens the disclosure to reveal a nested entry
// (`./sessionNavigation.ts`).

import { ChevronRight } from "lucide-react";
import {
  isOpen,
  storySessionsOf,
  type LaunchWithState,
} from "./agentLaunch.ts";
import type { MachineSessions } from "./agentLaunches.ts";
import type { AgentAssignment } from "./agentAssignments.ts";
import { SessionFollowUp } from "./FollowUp.tsx";
import { Icon } from "./Icon.tsx";
import { sessionKey } from "./sessionReference.ts";
import { SessionEntry } from "./SessionEntry.tsx";
import { storyCardDoneClass } from "./storyCardDone.ts";
import "./story-card-done.css";
import "./frame-controls.css";

// Marked-done dual of `storyCardSessionsOf` for this disclosure.
export function storyDoneSessionsOf(
  records: readonly LaunchWithState[] | undefined,
  sourceId: string,
  identity: string,
): readonly LaunchWithState[] {
  return storySessionsOf(records, sourceId, identity).filter(
    (record) => !isOpen(record),
  );
}

export function StoryCardDoneSessions({
  sourceId,
  project,
  identity,
  launches,
  storyCardAssignments,
}: {
  readonly sourceId: string;
  // The published project label Session Follow up already needs.
  readonly project: string;
  readonly identity: string;
  readonly launches: MachineSessions;
  readonly storyCardAssignments: readonly AgentAssignment[];
}) {
  const sessions = storyDoneSessionsOf(launches.launched, sourceId, identity);
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
              followUp={
                <SessionFollowUp
                  record={record}
                  project={project}
                  sourceId={sourceId}
                  launches={launches}
                />
              }
            />
          </li>
        ))}
      </ol>
    </details>
  );
}
