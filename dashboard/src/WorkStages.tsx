import { useRef, useState } from "react";
import { type PublishedWork, type WorkEntry } from "./publishedWork";
import { BadgeLegend, PreparationFacts } from "./PreparationCard";
import { RecordedLink } from "./RecordedLink";
import { StoryDetail } from "./StoryDetail";
import { stagesMarks, workCardMarks } from "./workFocus";

function count(entries: readonly WorkEntry[]): string {
  return entries.length === 1 ? "1 entry" : `${entries.length} entries`;
}

function WorkCard({
  entry,
  priority,
  selected,
  onSelect,
}: {
  entry: WorkEntry;
  priority: number | undefined;
  selected: boolean;
  onSelect: (identity: string) => void;
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
      <PreparationFacts preparation={entry.preparation} />
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
          <RecordedLink role="Canonical record" link={entry.canonical} />
          {entry.plan && <RecordedLink role="Plan" link={entry.plan} />}
        </ul>
      )}
    </article>
  );
}

function Stage({
  name,
  entries,
  prioritized,
  selectedIdentity,
  onSelect,
}: {
  name: string;
  entries: readonly WorkEntry[];
  prioritized: boolean;
  selectedIdentity: string | undefined;
  onSelect: (identity: string) => void;
}) {
  const headingId = `stage-${name.toLowerCase()}`;
  return (
    <section className="stage" aria-labelledby={headingId}>
      <header className="stage-header">
        <h2 id={headingId}>{name}</h2>
        <p className="stage-count">{count(entries)}</p>
      </header>
      {entries.length === 0 ? (
        <p className="quiet">No {name} entries are recorded.</p>
      ) : (
        <ol className="cards">
          {entries.map((entry, index) => (
            <li key={entry.identity}>
              <WorkCard
                entry={entry}
                priority={prioritized ? index + 1 : undefined}
                selected={selectedIdentity === entry.identity}
                onSelect={onSelect}
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
export function WorkStages({ work }: { work: PublishedWork }) {
  const [selectedIdentity, setSelectedIdentity] = useState<string | undefined>(
    undefined,
  );
  const showsPreparation = [...work.taken, ...work.backlog].some(
    (entry) => entry.preparation !== undefined,
  );
  const select = (identity: string) => {
    setSelectedIdentity((current) =>
      current === identity ? undefined : identity,
    );
  };
  return (
    <>
      {showsPreparation && <BadgeLegend />}
      <section className="stages" aria-label="Work stages" {...stagesMarks}>
        <Stage
          name="Backlog"
          entries={work.backlog}
          prioritized
          selectedIdentity={selectedIdentity}
          onSelect={select}
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
          selectedIdentity={selectedIdentity}
          onSelect={select}
        />
      </section>
    </>
  );
}
