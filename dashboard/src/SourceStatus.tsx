import { ChevronRight } from "lucide-react";
import { Icon } from "./Icon.tsx";
import { Moment } from "./Moment.tsx";
import "./frame-controls.css";
import type { PublishedSource } from "./publishedSource.ts";
import type { PublishedWork } from "./publishedWork.ts";

// The current project's Git evidence: which project and ref are configured,
// and, once read, at which revision and when.
export function SourceStatus({
  source,
  work,
}: {
  readonly source: PublishedSource;
  readonly work: PublishedWork | undefined;
}) {
  return (
    <section className="source" aria-label="Published Git state">
      <details className="source-evidence frame-disclosure" key={source.id}>
        <summary aria-label={`Source evidence for ${source.label}`}>
          <Icon icon={ChevronRight} />
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
