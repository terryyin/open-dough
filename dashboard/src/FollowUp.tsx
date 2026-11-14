// Follow up on an entry in Recently done whose earlier conversation can no
// longer be continued (`offersFollowUp`): a standalone Done session, or a
// done story's card with the sessions it holds. Each opens the project's
// Start session dialog, naming the entry and listing the context the server
// will send with the request (`./followUpContext.ts`). The source stays as it
// is: only a new ad hoc session is started. A Done story's file diff also
// offers Follow up for the whole file or a line
// (`./StoryAnchoredFollowUp.tsx`).

import type { MachineSessions } from "./agentLaunches.ts";
import type { LaunchWithState } from "./agentLaunch.ts";
import type { DoneStory } from "./doneRecord.ts";
import {
  sessionContext,
  storyContext,
  storyName,
  type FollowUpFileFacts,
} from "./followUpContext.ts";
import type { FollowUpFile, FollowUpSource } from "./followUpRequest.ts";
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

type StoryLaunch = Launching & {
  readonly story: DoneStory;
  // The revision the story's done record was read at.
  readonly revision: string;
  // The sessions its card holds, oldest first.
  readonly sessions: readonly LaunchWithState[];
};

// The Start session dialog for a done story, with an optional file anchor.
export function StoryFollowUpSession({
  story,
  revision,
  sessions,
  project,
  sourceId,
  launches,
  file,
  autoOpen = false,
  showTrigger = true,
  onClosed,
}: StoryLaunch & {
  readonly file?: {
    readonly anchor: FollowUpFile;
    readonly facts: FollowUpFileFacts;
  };
  readonly autoOpen?: boolean;
  readonly showTrigger?: boolean;
  readonly onClosed?: () => void;
}) {
  const readHistory = useReadRetainedHistory();
  const source: FollowUpSource = {
    story: {
      identity: story.identity,
      revision,
      ...(file === undefined ? {} : { file: file.anchor }),
    },
  };
  return (
    <StartSession
      project={project}
      sourceId={sourceId}
      launches={launches}
      onOpen={readHistory}
      autoOpen={autoOpen}
      showTrigger={showTrigger}
      {...(onClosed === undefined ? {} : { onClosed })}
      followUp={{
        source,
        name: storyName(story),
        context: storyContext(story, sessions, file?.facts),
      }}
    />
  );
}

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
export function StoryFollowUp(props: StoryLaunch) {
  const { hostOperations } = usePageSessions();
  if (!offersFollowUp(props.sessions, hostOperations)) return null;
  return <StoryFollowUpSession {...props} />;
}
