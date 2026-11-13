import { useState } from "react";
import type { PublishedWork } from "./publishedWork.ts";
import { useDoneDetails } from "./doneDetails.ts";
import type { WorkDependencies } from "./storyDependencies.ts";
import type { SourceLink } from "./sourceLink.ts";
import "./story-dependencies.css";
import { useStoryNavigation } from "./storyNavigation.tsx";

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

function StoryReference({
  sourceId,
  identity,
  title,
  link,
}: {
  sourceId: string;
  identity: string;
  title: string;
  link: SourceLink;
}) {
  const { follow } = useStoryNavigation();
  return (
    <a
      href={link.kind === "unusable" ? "#" : link.url}
      onClick={(event) => {
        event.preventDefault();
        follow({ project: sourceId, identity });
      }}
    >
      {title}
    </a>
  );
}

export function StoryCardDependencies({
  dependencies,
  work,
}: {
  dependencies: WorkDependencies | undefined;
  work: PublishedWork;
}) {
  if (dependencies === undefined || dependencies.status === "not-recorded")
    return null;
  if (dependencies.status === "unavailable")
    return (
      <p className="dependency-problem">
        Dependency facts unavailable: {dependencies.problem}
      </p>
    );
  return <DependencyExplanation dependencies={dependencies} work={work} />;
}

function DependencyExplanation({
  dependencies,
  work,
}: {
  dependencies: Exclude<WorkDependencies, { readonly status: "unavailable" }>;
  work: PublishedWork;
}) {
  const [open, setOpen] = useState(false);
  const active = [...work.taken, ...work.backlog];
  const catalogued = work.done?.status === "catalogued" ? work.done : undefined;
  const suppliers = dependencies.entries.map(
    ({ supplier }) => supplier.identity,
  );
  const needed =
    catalogued?.records.filter(
      ({ identity }) =>
        suppliers.includes(identity) &&
        !active.some((entry) => entry.identity === identity),
    ) ?? [];
  const { detailOf } = useDoneDetails(
    work.source,
    catalogued?.revision ?? "",
    needed,
    open,
  );
  const titleOf = (identity: string) => {
    const entry = active.find((each) => each.identity === identity);
    if (entry !== undefined) return entry.title || identity;
    const record = needed.find((each) => each.identity === identity);
    const detail = record === undefined ? undefined : detailOf(record);
    return detail?.status === "read" ? detail.story.title : identity;
  };
  return (
    <details
      className="story-dependencies"
      onToggle={(event) => {
        setOpen(event.currentTarget.open);
      }}
    >
      <summary>Dependencies · {dependencies.blocking.length} blocking</summary>
      <ul aria-label="Story dependencies">
        {dependencies.entries.map((dependency) => (
          <li key={dependency.supplier.identity}>
            <p>
              <StoryReference
                sourceId={work.source.id}
                identity={dependency.supplier.identity}
                title={titleOf(dependency.supplier.identity)}
                link={dependency.supplierLink}
              />
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
