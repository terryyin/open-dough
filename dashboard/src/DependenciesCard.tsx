import type { WorkDependencies } from "./storyDependencies.ts";
import type { SourceLink } from "./sourceLink.ts";
import "./story-dependencies.css";

function DependencyLink({
  link,
  children,
}: {
  link: SourceLink;
  children: React.ReactNode;
}) {
  return link.kind === "unusable" ? (
    <span>
      {children} ({link.reason})
    </span>
  ) : (
    <a href={link.url}>{children}</a>
  );
}

export function DependenciesCard({
  dependencies,
}: {
  dependencies: WorkDependencies | undefined;
}) {
  if (dependencies === undefined || dependencies.status === "not-recorded")
    return null;
  if (dependencies.status === "unavailable")
    return (
      <p className="dependency-problem">
        Dependency facts unavailable: {dependencies.problem}
      </p>
    );
  return (
    <details className="story-dependencies">
      <summary>Dependencies · {dependencies.blocking} blocking</summary>
      <ul aria-label="Story dependencies">
        {dependencies.entries.map((dependency) => (
          <li key={dependency.supplier.identity}>
            <p>
              <DependencyLink link={dependency.supplierLink}>
                {dependency.supplier.identity}
              </DependencyLink>
            </p>
            <p>
              <strong>State:</strong>{" "}
              {dependency.state === "decision-needed"
                ? "Decision needed"
                : dependency.state === "satisfied"
                  ? "Satisfied"
                  : "Waiting"}
            </p>
            <p>
              <strong>Shared implementation:</strong>{" "}
              {dependency.implementation}
            </p>
            <p>
              <strong>Why this must finish first:</strong>{" "}
              {dependency.rationale}
            </p>
            <p>
              <strong>Completion condition:</strong> {dependency.condition}
            </p>
            {dependency.decision !== undefined && (
              <p>
                <strong>Decision:</strong> {dependency.decision}
              </p>
            )}
            {dependency.resolution !== undefined &&
              dependency.evidenceLink !== undefined && (
                <p>
                  <strong>Evidence:</strong> {dependency.resolution.summary}{" "}
                  <DependencyLink link={dependency.evidenceLink}>
                    Revision {dependency.resolution.revision}
                  </DependencyLink>
                </p>
              )}
          </li>
        ))}
      </ul>
    </details>
  );
}
