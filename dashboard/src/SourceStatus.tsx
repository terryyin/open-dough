import { Moment } from "./Moment.tsx";
import type { PublishedSource } from "./publishedSource.ts";
import type { PublishedWork } from "./publishedWork.ts";

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
      {/* Unavailable while reading, yet still focusable: a disabled
          button would drop keyboard focus to the page. After a failed
          attempt the same control is named for what pressing it means,
          so one read action is offered, never two competing ones. */}
      <button
        type="button"
        className="refresh"
        aria-label={failed ? "Retry" : "Refresh"}
        title={failed ? "Retry" : "Refresh"}
        aria-disabled={reading}
        onClick={onRefresh}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M20 7v5h-5M20 12a8 8 0 1 0-2.3 5.7M20 12l-3-5" />
        </svg>
      </button>
      <details className="source-evidence" key={source.id}>
        <summary aria-label={`Source evidence for ${source.label}`}>
          <h1>{source.label}</h1>
        </summary>
        <div className="source-evidence-body">
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
            Retrieval time is when this snapshot was read, not commit time. Only
            published changes are visible. Current agent activity is unknown.
          </p>
        </div>
      </details>
    </section>
  );
}
