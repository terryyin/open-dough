// Follow up on an entry in Recently done whose earlier conversation can no
// longer be continued (`offersFollowUp`): a standalone Done session, or a
// done story's card with the sessions it holds. Each opens the project's
// Start session dialog, naming the entry and listing the context the server
// will send with the request (`./followUpContext.ts`). The source stays as it
// is: only a new ad hoc session is started.

import type { MachineSessions } from "./agentLaunches.ts";
import type { LaunchWithState } from "./agentLaunch.ts";
import type { DoneStory } from "./doneRecord.ts";
import { sessionContext, storyContext, storyName } from "./followUpContext.ts";
import type { FollowUpSource } from "./followUpRequest.ts";
import { usePageSessions } from "./pageSessions.ts";
import { useReadRetainedHistory } from "./retainedHistory.ts";
import { offersFollowUp } from "./sessionAccess.ts";
import { StartSession } from "./StartSession.tsx";

type Launching = {
  // The project's name.
  readonly project: string;
  readonly sourceId: string;
  readonly launches: MachineSessions;
};

export function SessionFollowUp({
  record,
  project,
  sourceId,
  launches,
}: Launching & { readonly record: LaunchWithState }) {
  const { hostOperations } = usePageSessions();
  if (!offersFollowUp([record], hostOperations)) return null;
  const source: FollowUpSource = {
    session: { host: record.session.host, sessionId: record.session.sessionId },
  };
  const context = sessionContext(record);
  return (
    <StartSession
      project={project}
      sourceId={sourceId}
      launches={launches}
      followUp={{
        source,
        name: context.label,
        context: { sessions: [context] },
      }}
    />
  );
}

// A done story's Follow up, once its record at `revision` is read. Its
// sessions' listings lack what only the sessions history carries, such as
// the revision their work landed at, so opening it asks for that history.
export function StoryFollowUp({
  story,
  revision,
  sessions,
  project,
  sourceId,
  launches,
}: Launching & {
  readonly story: DoneStory;
  // The revision the story's done record was read at.
  readonly revision: string;
  // The sessions its card holds, oldest first.
  readonly sessions: readonly LaunchWithState[];
}) {
  const { hostOperations } = usePageSessions();
  const readHistory = useReadRetainedHistory();
  if (!offersFollowUp(sessions, hostOperations)) return null;
  const source: FollowUpSource = {
    story: { identity: story.identity, revision },
  };
  return (
    <StartSession
      project={project}
      sourceId={sourceId}
      launches={launches}
      onOpen={readHistory}
      followUp={{
        source,
        name: storyName(story),
        context: storyContext(story, sessions),
      }}
    />
  );
}
