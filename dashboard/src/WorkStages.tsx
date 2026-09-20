import type { PublishedWork, WorkEntry } from "./publishedWork";

function count(entries: readonly WorkEntry[]): string {
  return entries.length === 1 ? "1 entry" : `${entries.length} entries`;
}

function Stage({
  name,
  entries,
  prioritized,
}: {
  name: string;
  entries: readonly WorkEntry[];
  prioritized: boolean;
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
              <article className="card" aria-label={entry.title}>
                {prioritized && (
                  <p className="card-priority">Priority {index + 1}</p>
                )}
                <h3>{entry.title}</h3>
                <p className="card-identity">{entry.identity}</p>
              </article>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

// Two recorded groups and the one relationship between them. Membership and
// order come straight from the snapshot; nothing here sorts, infers further
// stages, or marks work as active.
export function WorkStages({ work }: { work: PublishedWork }) {
  return (
    <section className="stages" aria-label="Work stages">
      <Stage name="Backlog" entries={work.backlog} prioritized />
      <div className="connector">
        <svg
          className="connector-arrow"
          viewBox="0 0 64 16"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M0 8 H56 M48 2 L56 8 L48 14" />
        </svg>
        <p className="connector-label">Taking work</p>
        <p className="connector-note">
          Work is taken from the Backlog. This is not a dependency between
          entries.
        </p>
      </div>
      <Stage name="Taken" entries={work.taken} prioritized={false} />
    </section>
  );
}
