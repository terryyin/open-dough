import { SessionEntry } from "./SessionEntry.tsx";
import { sessionKey } from "./sessionReference.ts";
import type { LaunchWithState } from "./agentLaunch.ts";
import { useLayoutEffect } from "react";
import { type PublishedWork, type WorkEntry } from "./publishedWork.ts";
import {
  UnreadableProfiles,
  type OpenRoster,
} from "./AgentAssignmentFacts.tsx";
import type { UnreadableProfile } from "./agentAssignments.ts";
import { revealStory } from "./pageEntries.ts";
import { useStorySelection } from "./pageStorySelection.tsx";
import { useStoryInspection } from "./pageStoryInspection.tsx";
import { useStoryNavigation } from "./storyNavigation.tsx";
import { columnMark } from "./columnPaging.ts";
import type { MachineSessions } from "./agentLaunches.ts";
import { StoryCard } from "./StoryCard.tsx";
import { entryCount, type ColumnSummary } from "./columnSummary.ts";

type ColumnView = {
  readonly column: ColumnSummary;
  readonly entries: readonly WorkEntry[];
  readonly localSessions: readonly LaunchWithState[] | undefined;
};

// Each column's stories, standalone sessions, and completeness feed both its
// rendered list and the heading/paging-control summary. Published order stays intact.
export function columnsOf(
  work: PublishedWork,
  localTaken: readonly LaunchWithState[] | undefined,
) {
  const column = (
    name: string,
    entries: readonly WorkEntry[],
    localSessions: readonly LaunchWithState[] | undefined,
  ): ColumnView => ({
    column: {
      name,
      entries:
        localSessions === undefined
          ? undefined
          : entries.length + localSessions.length,
    },
    entries,
    localSessions,
  });
  return [
    column("Backlog", work.backlog, []),
    column("Taken", work.taken, localTaken),
  ] as const;
}

function Column({
  sourceId,
  view,
  prioritized,
  showsSliceProgress,
  launches,
  offersStart,
  selectedIdentity,
  onSelect,
  inspected,
  onInspect,
  onOpenRoster,
  unreadableProfiles,
}: {
  sourceId: string;
  view: ColumnView;
  prioritized: boolean;
  showsSliceProgress: boolean;
  launches: MachineSessions;
  offersStart: boolean;
  selectedIdentity: string | undefined;
  onSelect: (identity: string) => void;
  inspected: readonly string[];
  onInspect: (identity: string) => void;
  onOpenRoster: OpenRoster;
  unreadableProfiles?: readonly UnreadableProfile[] | undefined;
}) {
  const {
    column: { name, entries: count },
    entries,
    localSessions,
  } = view;
  const headingId = `column-${name.toLowerCase()}`;
  return (
    <section
      className="column"
      aria-labelledby={headingId}
      tabIndex={-1}
      {...columnMark}
    >
      <header className="column-header">
        <h2 id={headingId}>{name}</h2>
        <p className="column-count">{entryCount(count)}</p>
      </header>
      <UnreadableProfiles profiles={unreadableProfiles} />
      {localSessions === undefined && (
        <p className="quiet">Reading sessions…</p>
      )}
      {count === 0 ? (
        <p className="quiet column-empty">No {name} entries are recorded.</p>
      ) : (
        <ol className="story-cards">
          {entries.map((entry, index) => (
            <li key={entry.identity}>
              <StoryCard
                sourceId={sourceId}
                entry={entry}
                priority={prioritized ? index + 1 : undefined}
                showsSliceProgress={showsSliceProgress}
                launches={launches}
                offersStart={offersStart}
                selected={selectedIdentity === entry.identity}
                onSelect={onSelect}
                inspected={inspected.includes(entry.identity)}
                onInspect={onInspect}
                onOpenRoster={onOpenRoster}
              />
            </li>
          ))}
          {localSessions?.map((record) => (
            <li key={sessionKey(record.session)}>
              <SessionEntry record={record} onStoryCard={false} />
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

// The projected columns keep published story membership/order separate from
// machine-local sessions. Cards retain work identity and storyCardFocus marks.
// Selection is the page's per-project owner (`./pageStorySelection.tsx`), and
// inspection its own page-level owner (`./pageStoryInspection.tsx`).
export function Columns({
  work,
  columns,
  launches,
  onOpenRoster,
}: {
  work: PublishedWork;
  columns: ReturnType<typeof columnsOf>;
  launches: MachineSessions;
  onOpenRoster: OpenRoster;
}) {
  const [backlog, taken] = columns;
  const { selectedIdentity, toggle } = useStorySelection(work.source.id);
  const {
    inspected,
    toggle: toggleInspection,
    open: inspect,
  } = useStoryInspection(work.source.id);
  const { opening } = useStoryNavigation();
  useLayoutEffect(() => {
    if (opening?.project !== work.source.id) return;
    const stop = revealStory(opening.identity);
    if (stop === undefined) return;
    // Startup protection still owns whether inspection is available. Revealing
    // its card must not invoke its disabled inspection or any launch action.
    // Revealing opens the target's detail and leaves the selection alone.
    if (launches.storyStartupOf(work.source.id, opening.identity) === undefined)
      inspect(opening.identity);
    return stop;
  }, [opening, work.source.id, inspect]);
  return (
    <>
      <div className="columns">
        <Column
          sourceId={work.source.id}
          view={backlog}
          prioritized
          showsSliceProgress={false}
          launches={launches}
          offersStart
          selectedIdentity={selectedIdentity}
          onSelect={toggle}
          inspected={inspected}
          onInspect={toggleInspection}
          onOpenRoster={onOpenRoster}
        />
        <Column
          sourceId={work.source.id}
          view={taken}
          prioritized={false}
          showsSliceProgress
          launches={launches}
          offersStart={false}
          selectedIdentity={selectedIdentity}
          onSelect={toggle}
          inspected={inspected}
          onInspect={toggleInspection}
          onOpenRoster={onOpenRoster}
          unreadableProfiles={work.unreadableProfiles}
        />
      </div>
    </>
  );
}
