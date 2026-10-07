import { sessionKey } from "./sessionReference.ts";
// Recently done combines published stories by completion time and saved Done
// sessions by launch time. Only closed sessions are nested in done cards;
// unknown or failed published details leave their standalone access intact.

import {
  launchRetentionDays,
  storySessionsOf,
  type LaunchWithState,
} from "./agentLaunch.ts";
import { entryCount, type ColumnSummary } from "./columnSummary.ts";
import { CreationEntry } from "./CreationEntry.tsx";
import { dashboardColumnMark } from "./columnPaging.ts";
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

// Done stories and the selected project's closed sessions use one list for
// rendering and counts. Unresolved creations remain recovery evidence only.
export function recentlyDoneOf(
  sourceId: string,
  creations: readonly CreationView[],
  records: readonly LaunchWithState[] | undefined,
  done: DoneStories | undefined,
  noneKept: boolean,
) {
  return {
    creations: creations.filter((record) => record.request.source === sourceId),
    records,
    none: noneKept
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
    entries:
      listed.records === undefined ||
      listed.done?.status !== "read" ||
      listed.done.unreadable.length > 0
        ? undefined
        : listed.listed.length,
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
      {...dashboardColumnMark}
    >
      <header className="stage-header">
        <h2 id="recently-done-heading">{name}</h2>
        <p className="stage-count">
          {entryCount(recentlyDoneColumn(view).entries)}
        </p>
      </header>
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
