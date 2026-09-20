import {
  shortRevision,
  type PublishedWork,
  type WorkEntry,
} from "./publishedWork";
import type { SourceLink } from "./sourceLink";
import { stagesMarks, workCardMarks, workLinkMarks } from "./workFocus";

function count(entries: readonly WorkEntry[]): string {
  return entries.length === 1 ? "1 entry" : `${entries.length} entries`;
}

// One recorded link, shown the same way whatever kind of entry records it. The
// recorded target is always readable as text; it becomes a link only when it
// leads to a file of this snapshot or to an ordinary web address.
function RecordedLink({ role, link }: { role: string; link: SourceLink }) {
  const recorded = (
    <>
      <span className="link-role">{role}</span>{" "}
      <span className="link-target">{link.recorded}</span>
    </>
  );
  switch (link.kind) {
    case "snapshot":
      return (
        <li>
          <a href={link.url} {...workLinkMarks(role)}>
            {recorded}
          </a>
          <p className="link-note">
            File in this snapshot, at revision {shortRevision(link.revision)}.
          </p>
        </li>
      );
    case "external":
      return (
        <li>
          <a href={link.url} rel="noopener noreferrer" {...workLinkMarks(role)}>
            {recorded}
          </a>
          <p className="link-note">
            External reference. It is not a file in this snapshot and is not
            tied to the inspected revision.
          </p>
        </li>
      );
    case "unusable":
      return (
        <li>
          <span>{recorded}</span>
          <p className="link-note">Not offered as a link. {link.reason}</p>
        </li>
      );
  }
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
              <article
                className="card"
                aria-label={entry.title}
                {...workCardMarks(entry.identity)}
              >
                {prioritized && (
                  <p className="card-priority">Priority {index + 1}</p>
                )}
                <h3>{entry.title}</h3>
                <p className="card-identity">{entry.identity}</p>
                <ul className="card-links" aria-label="Source links">
                  <RecordedLink
                    role="Canonical record"
                    link={entry.canonical}
                  />
                  {entry.plan && <RecordedLink role="Plan" link={entry.plan} />}
                </ul>
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
// stages, or marks work as active. Cards are keyed by work identity so the same
// work is one card across snapshots, and carry the marks `workFocus` defines so
// keyboard focus can follow that work.
export function WorkStages({ work }: { work: PublishedWork }) {
  return (
    <section className="stages" aria-label="Work stages" {...stagesMarks}>
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
