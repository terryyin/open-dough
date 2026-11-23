// Reading and listing this machine's sessions, with the shared Session entry.
import type { ReactNode } from "react";
import type { LaunchWithState } from "./agentLaunch.ts";
import type { AgentAssignment } from "./agentAssignments.ts";
import { sessionKey } from "./sessionReference.ts";
import { SessionEntry } from "./SessionEntry.tsx";

// A list of the machine's sessions: until they are first read it says it is
// reading them rather than claiming none, and with none it says none are
// kept; otherwise it lists them.
export function SessionList({
  sessions,
  none = "No sessions launched from this dashboard are kept.",
  children,
}: {
  // Undefined until the machine's sessions are first read.
  readonly sessions: readonly LaunchWithState[] | undefined;
  // What the list says once read with no sessions to list.
  readonly none?: string;
  readonly children: (sessions: readonly LaunchWithState[]) => ReactNode;
}) {
  if (sessions === undefined) {
    return <p className="quiet">Reading sessions…</p>;
  }
  if (sessions.length === 0) {
    return <p className="quiet">{none}</p>;
  }
  return children(sessions);
}

// A story's sessions inside its card, newest first, each the entry Recently
// done shows: on a Story card (`./StoryCardSessions.tsx`), without the story the
// card names, or on a done story's card (`./DoneStoryCard.tsx`). With none it
// shows nothing. The entry the developer's own launch from the card just
// listed takes the keyboard.
export function StorySessions({
  sessions,
  className,
  onStoryCard,
  launchedHere,
  storyCardAssignments,
}: {
  // The story's sessions, oldest first.
  readonly sessions: readonly LaunchWithState[];
  readonly className: string;
  readonly onStoryCard: boolean;
  readonly launchedHere?: string | undefined;
  readonly storyCardAssignments?: readonly AgentAssignment[] | undefined;
}) {
  if (sessions.length === 0) return null;
  return (
    <ol className={className} aria-label="Sessions">
      {sessions.toReversed().map((record) => (
        <li key={sessionKey(record.session)}>
          <SessionEntry
            record={record}
            onStoryCard={onStoryCard}
            takesFocus={launchedHere === sessionKey(record.session)}
            storyCardAssignments={storyCardAssignments}
          />
        </li>
      ))}
    </ol>
  );
}
