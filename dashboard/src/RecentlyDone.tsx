import { sessionKey } from "./sessionReference.ts";
// The selected project's Recently done column: one newest-first list of the
// stories done recently by the done records published at the snapshot's
// revision (`./DoneStoryCard.tsx`), placed by when each was done, and every
// native session this dashboard's server launched for the project and still
// keeps on this machine, placed by when it was launched, whatever origin now
// shows of its story, so the developer can reach a session whose story is in
// no list, or one marked done. Sessions are listed once the machine's
// sessions are first read; done records that cannot be read are said, and
// the sessions are still listed.
// Each session entry (`./SessionEntry.tsx`) names its story and shows its
// session's state as its host last observed it, read again at the page's
// steady pace. It takes the keyboard when the last of its entries is deleted
// (see `deletedEntryHome` in `./pageSessions.ts`). Session entries are local
// evidence of launches, not story facts.

import {
  launchRetentionDays,
  projectSessionsOf,
  type LaunchWithState,
} from "./agentLaunch.ts";
import { CreationEntry } from "./CreationEntry.tsx";
import { DoneStoryCard } from "./DoneStoryCard.tsx";
import {
  recentDoneStories,
  type DoneStories,
  type DoneStory,
} from "./doneStories.ts";
import type { CreationView } from "./launchCreation.ts";
import { SessionEntry, SessionList } from "./SessionEntry.tsx";
import "./agent-launch.css";

type Listed =
  | { readonly at: number; readonly story: DoneStory }
  | { readonly at: number; readonly session: LaunchWithState };

// Done stories by completion and sessions by launch, newest first; sessions
// launched at one moment keep their newest-first order.
function newestFirst(
  stories: readonly DoneStory[],
  sessions: readonly LaunchWithState[],
): readonly Listed[] {
  return [
    ...stories.map((story) => ({ at: Date.parse(story.completedAt), story })),
    ...sessions
      .toReversed()
      .map((session) => ({ at: Date.parse(session.launchedAt), session })),
  ].sort((one, other) => other.at - one.at);
}

function DoneReadGaps({ done }: { readonly done: DoneStories | undefined }) {
  if (done?.status === "unavailable") {
    return <p className="assignment-gap">{done.problem}</p>;
  }
  if (done?.status !== "read" || done.unreadable.length === 0) {
    return null;
  }
  return (
    <ul aria-label="Unreadable done records">
      {done.unreadable.map(({ file, problem }) => (
        <li key={file} className="assignment-gap">
          Done record {file} is unreadable: {problem}.
        </li>
      ))}
    </ul>
  );
}

export function RecentlyDone({
  sourceId,
  creations = [],
  records: machineRecords,
  done,
}: {
  // The selected project.
  readonly sourceId: string;
  readonly creations?: readonly CreationView[];
  // The machine's sessions, oldest first within a project, with their
  // states; undefined until first read.
  readonly records: readonly LaunchWithState[] | undefined;
  // The done records published at the snapshot's revision.
  readonly done?: DoneStories | undefined;
}) {
  const records = projectSessionsOf(machineRecords, sourceId);
  const listed = newestFirst(
    recentDoneStories(done, new Date()),
    records ?? [],
  );
  return (
    <section
      className="recently-done"
      aria-labelledby="recently-done-heading"
      tabIndex={-1}
    >
      <h2 id="recently-done-heading">Recently done</h2>
      <p className="quiet">
        Recently done stories and sessions launched from this dashboard for this
        project, newest first. Sessions are kept on this machine.
      </p>
      <DoneReadGaps done={done} />
      {creations
        .filter((record) => record.request.source === sourceId)
        .map((record) => (
          <CreationEntry key={record.launchedAt} record={record} />
        ))}
      <SessionList sessions={records}>
        {() => (
          <p className="quiet">
            Sessions marked done are kept for {launchRetentionDays} days after
            marking.
          </p>
        )}
      </SessionList>
      {listed.length > 0 && (
        <ol>
          {listed.map((each) =>
            "story" in each ? (
              <li key={`done ${each.story.identity}`}>
                <DoneStoryCard story={each.story} />
              </li>
            ) : (
              <li key={sessionKey(each.session.session)}>
                <SessionEntry record={each.session} onCard={false} />
              </li>
            ),
          )}
        </ol>
      )}
    </section>
  );
}
