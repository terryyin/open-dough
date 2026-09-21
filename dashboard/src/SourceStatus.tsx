import { Moment } from "./Moment";
import type { PublishedSource } from "./publishedSource";
import type { PublishedWork } from "./publishedWork";

// The current project's Git evidence: which project and ref are configured,
// and, once read, at which revision and when. The manual read control lives
// here too, since it acts on this same evidence, not on the selected project.
export function SourceStatus({
  source,
  work,
  reading,
  failed,
  onRefresh,
}: {
  readonly source: PublishedSource;
  readonly work: PublishedWork | undefined;
  readonly reading: boolean;
  readonly failed: boolean;
  readonly onRefresh: () => void;
}) {
  return (
    <section className="source" aria-label="Published Git state">
      <dl>
        <div>
          <dt>Project</dt>
          <dd>{source.repository}</dd>
        </div>
        <div>
          <dt>Ref</dt>
          <dd>{source.ref}</dd>
        </div>
        {work && (
          <>
            <div>
              <dt>Revision</dt>
              <dd>
                <code>{work.revision}</code>
              </dd>
            </div>
            <div>
              <dt>Retrieved</dt>
              <dd>
                <Moment at={work.retrievedAt} />
              </dd>
            </div>
          </>
        )}
      </dl>
      <p className="source-note">
        Only published changes are visible. Current agent activity is unknown.
      </p>
      {/* Unavailable while reading, yet still focusable: a disabled
          button would drop keyboard focus to the page. After a failed
          attempt the same control is named for what pressing it means,
          so one read action is offered, never two competing ones. */}
      <button
        type="button"
        className="refresh"
        aria-disabled={reading}
        onClick={onRefresh}
      >
        {failed ? "Retry" : "Refresh"}
      </button>
    </section>
  );
}
