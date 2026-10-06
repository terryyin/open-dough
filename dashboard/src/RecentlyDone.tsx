import { sessionKey } from "./sessionReference.ts";
// The selected project's Recently done column: one newest-first list of the
// stories done recently by the done records published at the snapshot's
// revision (`./DoneStoryCard.tsx`), placed by when each was done, and every
// native session this dashboard's server launched for the project and still
// keeps on this machine, except open sessions held by active story cards.
// Sessions are placed by launch time, so the developer can reach a session
// whose story is in no list, or one marked done. A session of a shown done
// story that is not held by an active card, open or
// marked done, is listed inside that story's card, newest first, and nowhere
// else in the column; a later launch for the story does not move the card.
// Sessions are listed once the machine's sessions are first read; done
// records that cannot be read are said, and the sessions are still listed.
// Each session entry (`./SessionEntry.tsx`) names its story and shows its
// session's state as its host last observed it, read again at the page's
// steady pace. It takes the keyboard when the last of its entries is deleted
// (see `deletedEntryHome` in `./pageSessions.ts`). Session entries are local
// evidence of launches, not story facts.

import {
  launchRetentionDays,
  cardSessionsOf,
  projectSessionsOf,
  storySessionsOf,
  type LaunchWithState,
} from "./agentLaunch.ts";
import type { ColumnSummary } from "./ColumnEdge.tsx";
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
  | {
      readonly at: number;
      readonly story: DoneStory;
      // The story's sessions, oldest first.
      readonly sessions: readonly LaunchWithState[];
    }
  | { readonly at: number; readonly session: LaunchWithState };

// Done stories by completion, each holding its sessions, and the sessions of
// no shown done story by launch, newest first; sessions launched at one
// moment keep their newest-first order.
function newestFirst(
  stories: readonly DoneStory[],
  sessions: readonly LaunchWithState[],
  sourceId: string,
): readonly Listed[] {
  const cards = stories.map((story) => ({
    at: Date.parse(story.completedAt),
    story,
    sessions: storySessionsOf(sessions, sourceId, story.identity),
  }));
  const held = new Set(cards.flatMap((card) => card.sessions));
  return [
    ...cards,
    ...sessions
      .filter((session) => !held.has(session))
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

// What Recently done lists for the project: its creations under way, its
// kept sessions except open ones held by active cards, and, newest first, its recently
// done stories, each holding its sessions, and the sessions of no shown done
// story.
export function recentlyDoneOf(
  sourceId: string,
  creations: readonly CreationView[],
  machineRecords: readonly LaunchWithState[] | undefined,
  done: DoneStories | undefined,
  activeStoryIdentities: readonly string[],
) {
  const heldByActiveCards = new Set(
    activeStoryIdentities.flatMap((identity) =>
      cardSessionsOf(machineRecords, sourceId, identity),
    ),
  );
  const projectRecords = projectSessionsOf(machineRecords, sourceId);
  const records = projectRecords?.filter(
    (record) => !heldByActiveCards.has(record),
  );
  return {
    creations: creations.filter((record) => record.request.source === sourceId),
    records,
    none:
      projectRecords?.length === 0
        ? "No sessions launched from this dashboard are kept."
        : "No sessions are listed in Recently done.",
    done,
    listed: newestFirst(
      recentDoneStories(done, new Date()),
      records ?? [],
      sourceId,
    ),
  };
}

const name = "Recently done";

// Recently done as the dashboard columns name it: how many entries it lists
// for the project.
export function recentlyDoneColumn(
  listed: ReturnType<typeof recentlyDoneOf>,
): ColumnSummary {
  return {
    name,
    entries: listed.creations.length + listed.listed.length,
  };
}

export function RecentlyDone({
  view,
}: {
  readonly view: ReturnType<typeof recentlyDoneOf>;
}) {
  const { creations: listedCreations, records, none, listed, done } = view;
  return (
    <section
      className="recently-done"
      aria-labelledby="recently-done-heading"
      tabIndex={-1}
    >
      <h2 id="recently-done-heading">{name}</h2>
      <p className="quiet">
        Recently done stories and sessions launched from this dashboard for this
        project, newest first. Sessions are kept on this machine.
      </p>
      <DoneReadGaps done={done} />
      {listedCreations.map((record) => (
        <CreationEntry key={record.launchedAt} record={record} />
      ))}
      <SessionList sessions={records} none={none}>
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
                <DoneStoryCard story={each.story} sessions={each.sessions} />
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
