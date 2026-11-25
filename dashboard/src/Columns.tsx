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
import type { DoneOnCard } from "./columnSessions.ts";
import { StoryCard } from "./StoryCard.tsx";
import { entryCount, type ColumnSummary } from "./columnSummary.ts";

type ColumnView = {
  readonly column: ColumnSummary;
  readonly entries: readonly WorkEntry[];
};

// Published story counts feed both the headings and the paging controls.
export function columnsOf(work: PublishedWork) {
  const column = (name: string, entries: readonly WorkEntry[]): ColumnView => ({
    column: { name, entries: entries.length },
    entries,
  });
  return [
    column("Backlog", work.backlog),
    column("Taken", work.taken),
  ] as const;
}

function Column({
  work,
  view,
  prioritized,
  showsSliceProgress,
  launches,
  doneOnCard,
  offersStart,
  selectedIdentity,
  onSelect,
  inspected,
  onInspect,
  onOpenRoster,
  unreadableProfiles,
}: {
  work: PublishedWork;
  view: ColumnView;
  prioritized: boolean;
  showsSliceProgress: boolean;
  launches: MachineSessions;
  doneOnCard: DoneOnCard;
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
      {count === 0 ? (
        <p className="quiet column-empty">No {name} entries are recorded.</p>
      ) : (
        <ol className="story-cards">
          {entries.map((entry, index) => (
            <li key={entry.identity}>
              <StoryCard
                work={work}
                entry={entry}
                priority={prioritized ? index + 1 : undefined}
                showsSliceProgress={showsSliceProgress}
                launches={launches}
                doneSessions={doneOnCard(entry.identity)}
                offersStart={offersStart}
                selected={selectedIdentity === entry.identity}
                onSelect={onSelect}
                inspected={inspected.includes(entry.identity)}
                onInspect={onInspect}
                onOpenRoster={onOpenRoster}
              />
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
  doneOnCard,
  onOpenRoster,
}: {
  work: PublishedWork;
  columns: ReturnType<typeof columnsOf>;
  launches: MachineSessions;
  // Each unfinished card's own Done sessions (`./columnSessions.ts`).
  doneOnCard: DoneOnCard;
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
          work={work}
          view={backlog}
          prioritized
          showsSliceProgress={false}
          launches={launches}
          doneOnCard={doneOnCard}
          offersStart
          selectedIdentity={selectedIdentity}
          onSelect={toggle}
          inspected={inspected}
          onInspect={toggleInspection}
          onOpenRoster={onOpenRoster}
        />
        <Column
          work={work}
          view={taken}
          prioritized={false}
          showsSliceProgress
          launches={launches}
          doneOnCard={doneOnCard}
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
