import { useRef, useState } from "react";
import { type PublishedWork, type WorkEntry } from "./publishedWork.ts";
import { PreparationFacts } from "./PreparationCard.tsx";
import { SliceProgress } from "./SliceProgress.tsx";
import { WorkSourceLinks } from "./WorkSourceLinks.tsx";
import { StoryDetail } from "./StoryDetail.tsx";
import {
  PreparingFacts,
  TakenOwnerFacts,
  UnreadableProfiles,
  type OpenRoster,
} from "./AgentAssignmentFacts.tsx";
import type { UnreadableProfile } from "./agentAssignments.ts";
import { stagesMarks, workCardMarks } from "./workFocus.ts";
import type { ProjectLaunches } from "./agentLaunches.ts";
import { CardLaunches } from "./CardLaunches.tsx";

function count(entries: readonly WorkEntry[]): string {
  return entries.length === 1 ? "1 entry" : `${entries.length} entries`;
}

function WorkCard({
  entry,
  priority,
  showsSliceProgress,
  launches,
  offersStart,
  selected,
  onSelect,
  onOpenRoster,
}: {
  entry: WorkEntry;
  priority: number | undefined;
  // Taken cards only: queued work shows no progress.
  showsSliceProgress: boolean;
  launches: ProjectLaunches;
  // Backlog cards only: Taken work offers no launch.
  offersStart: boolean;
  selected: boolean;
  onSelect: (identity: string) => void;
  onOpenRoster: OpenRoster;
}) {
  const cardRef = useRef<HTMLElement>(null);
  const detailId = `story-detail-${entry.identity.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
  return (
    <article
      ref={cardRef}
      className={selected ? "card card-selected" : "card"}
      aria-label={entry.title}
      {...workCardMarks(entry.identity)}
    >
      {priority !== undefined && (
        <p className="card-priority">Priority {priority}</p>
      )}
      <h3>{entry.title}</h3>
      <p className="card-identity">{entry.identity}</p>
      <TakenOwnerFacts owner={entry.owner} onOpenRoster={onOpenRoster} />
      <PreparingFacts preparing={entry.preparing} onOpenRoster={onOpenRoster} />
      <PreparationFacts preparation={entry.preparation} />
      {showsSliceProgress && (
        <SliceProgress
          planSlices={entry.planSlices}
          progressSource={entry.progressSource}
          sliceClock={entry.sliceClock}
        />
      )}
      <CardLaunches
        entry={entry}
        launches={launches}
        offersStart={offersStart}
      />
      <p>
        <button
          type="button"
          className="inspect-story"
          aria-expanded={selected}
          aria-controls={detailId}
          onClick={() => {
            const closing = selected;
            onSelect(entry.identity);
            // Closing detail returns focus to this story's card — not to a
            // different card that may have just been selected.
            if (closing) {
              queueMicrotask(() => {
                cardRef.current?.focus();
              });
            }
          }}
        >
          {selected ? "Hide detail" : "Inspect story"}
        </button>
      </p>
      {selected && <StoryDetail entry={entry} detailId={detailId} />}
      {!selected && (
        <ul className="card-links" aria-label="Source links">
          <WorkSourceLinks entry={entry} />
        </ul>
      )}
    </article>
  );
}

function Stage({
  name,
  entries,
  prioritized,
  showsSliceProgress,
  launches,
  offersStart,
  selectedIdentity,
  onSelect,
  onOpenRoster,
  unreadableProfiles,
}: {
  name: string;
  entries: readonly WorkEntry[];
  prioritized: boolean;
  showsSliceProgress: boolean;
  launches: ProjectLaunches;
  offersStart: boolean;
  selectedIdentity: string | undefined;
  onSelect: (identity: string) => void;
  onOpenRoster: OpenRoster;
  unreadableProfiles?: readonly UnreadableProfile[] | undefined;
}) {
  const headingId = `stage-${name.toLowerCase()}`;
  return (
    <section className="stage" aria-labelledby={headingId}>
      <header className="stage-header">
        <h2 id={headingId}>{name}</h2>
        <p className="stage-count">{count(entries)}</p>
      </header>
      <UnreadableProfiles profiles={unreadableProfiles} />
      {entries.length === 0 ? (
        <p className="quiet">No {name} entries are recorded.</p>
      ) : (
        <ol className="cards">
          {entries.map((entry, index) => (
            <li key={entry.identity}>
              <WorkCard
                entry={entry}
                priority={prioritized ? index + 1 : undefined}
                showsSliceProgress={showsSliceProgress}
                launches={launches}
                offersStart={offersStart}
                selected={selectedIdentity === entry.identity}
                onSelect={onSelect}
                onOpenRoster={onOpenRoster}
              />
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

// Two recorded groups and the one relationship between them. Membership and
// order come straight from the snapshot; nothing here sorts, infers further
// stages, or marks work as active. Cards are keyed by work identity so the same
// work is one card across snapshots, and carry the marks `workFocus` defines so
// keyboard focus can follow that work.
export function WorkStages({
  work,
  launches,
  onOpenRoster,
}: {
  work: PublishedWork;
  launches: ProjectLaunches;
  onOpenRoster: OpenRoster;
}) {
  const [selectedIdentity, setSelectedIdentity] = useState<string | undefined>(
    undefined,
  );
  const select = (identity: string) => {
    setSelectedIdentity((current) =>
      current === identity ? undefined : identity,
    );
  };
  return (
    <>
      <section className="stages" aria-label="Work stages" {...stagesMarks}>
        <Stage
          name="Backlog"
          entries={work.backlog}
          prioritized
          showsSliceProgress={false}
          launches={launches}
          offersStart
          selectedIdentity={selectedIdentity}
          onSelect={select}
          onOpenRoster={onOpenRoster}
        />
        <div className="connector">
          {/* No viewBox: the line is as long as the arrow is given room, and
              the head keeps its own size at the line's end. */}
          <svg className="connector-arrow" aria-hidden="true" focusable="false">
            <line x1="0" y1="50%" x2="100%" y2="50%" />
            <svg x="100%" y="50%" overflow="visible">
              <path d="M-8 -6 L0 0 L-8 6" />
            </svg>
          </svg>
          <p className="connector-label">Taking work</p>
          <p className="connector-note">
            Work is taken from the Backlog. This is not a dependency between
            entries.
          </p>
        </div>
        <Stage
          name="Taken"
          entries={work.taken}
          prioritized={false}
          showsSliceProgress
          launches={launches}
          offersStart={false}
          selectedIdentity={selectedIdentity}
          onSelect={select}
          onOpenRoster={onOpenRoster}
          unreadableProfiles={work.unreadableProfiles}
        />
      </section>
    </>
  );
}
