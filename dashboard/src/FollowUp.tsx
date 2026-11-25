// Follow up on an entry in Recently done whose earlier conversation can no
// longer be continued (`offersFollowUp`): a standalone Done session, or a
// done story's card with the sessions it holds. Each opens the project's
// Start session dialog, naming the entry and listing the context the server
// will send with the request (`./followUpContext.ts`). The source stays as it
// is: only a new ad hoc session is started. A Done story's file diff also
// offers Follow up for the whole file or a line
// (`./StoryAnchoredFollowUp.tsx`).

import { useContext } from "react";
import type { LaunchWithState } from "./agentLaunch.ts";
import type { MachineSessions } from "./agentLaunches.ts";
import type { DoneStory } from "./doneRecord.ts";
import {
  sessionContext,
  storyContext,
  storyName,
  takenStoryContext,
} from "./followUpContext.ts";
import type { FollowUpSource, FollowUpTarget } from "./followUpRequest.ts";
import {
  retainedFollowUpReference,
  storyFollowUpSessions,
} from "./followUpSessions.ts";
import { usePageSessions } from "./pageSessions.ts";
import { currentPublishedSessions } from "./recentlyDoneListing.ts";
import { RecentlyDoneLinkSources } from "./recentlyDoneShownLinks.ts";
import { useReadRetainedHistory } from "./retainedHistory.ts";
import { offersFollowUp } from "./sessionAccess.ts";
import { StartSession, type AdHocLaunches } from "./StartSession.tsx";
import type { WorkEntry } from "./publishedWork.ts";

type Launching = {
  // The project's name.
  readonly project: string;
  readonly sourceId: string;
  readonly launches: AdHocLaunches;
};

type StoryLaunch = Launching & {
  readonly story: DoneStory;
  readonly launches: AdHocLaunches & Pick<MachineSessions, "records">;
  // The revision the story's done record was read at.
  readonly revision: string;
  // The sessions its card holds, oldest first.
  readonly sessions: readonly LaunchWithState[];
};

// The Start session dialog for a done story, with an optional reviewed target.
export function StoryFollowUpSession({
  story,
  revision,
  project,
  sourceId,
  launches,
  target,
  autoOpen = false,
  showTrigger = true,
  onClosed,
}: StoryLaunch & {
  readonly target?: FollowUpTarget;
  readonly autoOpen?: boolean;
  readonly showTrigger?: boolean;
  readonly onClosed?: () => void;
}) {
  const readHistory = useReadRetainedHistory();
  const { presentTerminal } = usePageSessions();
  const { work } = useContext(RecentlyDoneLinkSources);
  const candidates = storyFollowUpSessions(
    launches.records,
    currentPublishedSessions(
      work?.source.id === sourceId ? work.publishedSessions : undefined,
      new Date(),
    ),
    sourceId,
    story.identity,
  );
  const source: FollowUpSource = {
    story: {
      identity: story.identity,
      revision,
      ...(target === undefined
        ? {}
        : "path" in target
          ? { file: target }
          : { comparison: target }),
    },
  };
  return (
    <StartSession
      project={project}
      sourceId={sourceId}
      launches={launches}
      presentTerminal={presentTerminal}
      onOpen={readHistory}
      autoOpen={autoOpen}
      showTrigger={showTrigger}
      {...(onClosed === undefined ? {} : { onClosed })}
      followUp={{
        source,
        name: storyName(story),
        context: storyContext(
          story,
          [],
          target,
          candidates.some(({ retained }) => retained !== undefined),
        ),
        sessions: candidates,
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
  const { hostOperations, presentTerminal } = usePageSessions();
  if (!offersFollowUp([record], hostOperations)) return null;
  const source: FollowUpSource = { session: retainedFollowUpReference(record) };
  const context = sessionContext(record);
  return (
    <StartSession
      project={project}
      sourceId={sourceId}
      launches={launches}
      presentTerminal={presentTerminal}
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

export function TakenStoryFollowUp({
  story,
  revision,
  project,
  sourceId,
  launches,
  sessions,
}: Launching & {
  readonly story: Pick<WorkEntry, "identity" | "title">;
  readonly revision: string;
  readonly sessions: readonly LaunchWithState[];
}) {
  const { hostOperations, presentTerminal } = usePageSessions();
  if (!offersFollowUp(sessions, hostOperations)) return null;
  return (
    <StartSession
      project={project}
      sourceId={sourceId}
      launches={launches}
      presentTerminal={presentTerminal}
      followUp={{
        source: {
          story: { identity: story.identity, revision, status: "taken" },
        },
        name: storyName(story),
        context: takenStoryContext(story),
      }}
    />
  );
}
