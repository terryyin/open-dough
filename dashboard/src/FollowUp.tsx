// Follow up on an entry in Recently done whose earlier conversation can no
// longer be continued (`offersFollowUp`): a standalone Done session, or a
// done story's card with the sessions it holds. Each opens the project's
// Start session dialog, naming the entry and listing the context the server
// will send with the request (`./followUpContext.ts`). The source stays as it
// is: only a new ad hoc session is started. A Done story's file diff also
// offers Follow up for the whole file (`StoryFileFollowUp`), even when the
// card still offers Open terminal; that path skips the card's gate and names
// the file anchor on the same start request.

import type { MachineSessions } from "./agentLaunches.ts";
import type { LaunchWithState } from "./agentLaunch.ts";
import { useDoneStoryFollowUp } from "./doneStoryFollowUp.ts";
import type { DoneStory } from "./doneRecord.ts";
import {
  sessionContext,
  storyContext,
  storyName,
  type FollowUpFileFacts,
} from "./followUpContext.ts";
import type { FollowUpFile, FollowUpSource } from "./followUpRequest.ts";
import { usePageLaunches } from "./pageLaunches.ts";
import { usePageSessions } from "./pageSessions.ts";
import { useReadRetainedHistory } from "./retainedHistory.ts";
import { offersFollowUp } from "./sessionAccess.ts";
import { StartSession } from "./StartSession.tsx";
import type { ReviewedFile } from "./storyReviewFiles.ts";
import type { ReviewedStory } from "./StoryReviewFileDiff.tsx";

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

// Request anchor and dialog facts for one reviewed file on a Published
// completion or landed run; undefined on a workspace snapshot.
function fileFollowUpParts(
  reviewed: ReviewedStory,
  from: string,
  tree: string,
  file: ReviewedFile,
):
  | { readonly anchor: FollowUpFile; readonly facts: FollowUpFileFacts }
  | undefined {
  const comparison =
    reviewed.completion !== undefined
      ? ({ kind: "published", id: reviewed.completion } as const)
      : reviewed.reference !== undefined
        ? ({ kind: "landed", id: reviewed.reference } as const)
        : undefined;
  if (comparison === undefined) return undefined;
  const paths = {
    path: file.path,
    ...(file.kind === "renamed" ? { oldPath: file.oldPath } : {}),
  };
  const range = { baseline: from, tree };
  return {
    anchor: {
      ...paths,
      ...range,
      ...(comparison.kind === "published"
        ? { completion: comparison.id }
        : { reference: comparison.id }),
    },
    facts: { ...paths, ...range, kind: comparison.kind },
  };
}

// The Start session dialog for a done story, with an optional file anchor.
function StoryFollowUpSession({
  story,
  revision,
  sessions,
  project,
  sourceId,
  launches,
  file,
}: StoryLaunch & {
  readonly file?: {
    readonly anchor: FollowUpFile;
    readonly facts: FollowUpFileFacts;
  };
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

// Follow up from a Done story's file header in Review changes or Intent:
// only on a Published completion or landed run comparison, never a workspace
// snapshot. Looks up the done story on the page and opens the same dialog
// with the file's context lines; Start sends the file anchor.
export function StoryFileFollowUp({
  reviewed,
  from,
  tree,
  file,
}: {
  readonly reviewed: ReviewedStory;
  readonly from: string;
  readonly tree: string;
  readonly file: ReviewedFile;
}) {
  const launches = usePageLaunches();
  const target = useDoneStoryFollowUp(reviewed.identity);
  const parts = fileFollowUpParts(reviewed, from, tree, file);
  if (target === undefined || parts === undefined) return null;
  return (
    <StoryFollowUpSession
      story={target.story}
      revision={target.revision}
      sessions={target.sessions}
      project={target.project}
      sourceId={target.sourceId}
      launches={launches}
      file={parts}
    />
  );
}
