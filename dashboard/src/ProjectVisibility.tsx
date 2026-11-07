import { useState } from "react";
import type { PublishedSource } from "./publishedSource.ts";
import { projectVisibilityEndpoint } from "./projectConfiguration.ts";
import {
  selectionAfterProjectChange,
  useReplaceProjects,
  useVisibleProjects,
} from "./projectList.tsx";
import "./frame-controls.css";

export function ProjectVisibility({
  source,
  selectedId,
  onSelect,
  onProblem,
}: {
  readonly source: PublishedSource;
  readonly selectedId: string | undefined;
  readonly onSelect: (source: PublishedSource | undefined) => void;
  readonly onProblem: (problem: string | undefined) => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const visibleProjects = useVisibleProjects();
  const replaceProjects = useReplaceProjects();
  const hidden = source.hidden === true;
  const action = hidden ? "Show" : "Hide";
  const submit = async () => {
    if (submitting) return;
    setSubmitting(true);
    onProblem(undefined);
    try {
      const response = await fetch(projectVisibilityEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: source.id, hidden: !hidden }),
      });
      const answer = (await response.json()) as {
        projects?: readonly PublishedSource[];
        error?: string;
      };
      if (!response.ok || answer.projects === undefined) {
        onProblem(
          answer.error ?? "The project visibility could not be updated.",
        );
        return;
      }
      const saved = answer.projects;
      const next = selectionAfterProjectChange({
        previousVisible: visibleProjects,
        saved,
        changed: source,
        selectedId,
      });
      replaceProjects(saved);
      onSelect(next);
    } catch {
      onProblem(
        "The project visibility could not be updated. Check the local dashboard server and try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <button
      type="button"
      className="frame-button"
      aria-label={`${action} project ${source.label}`}
      onClick={() => {
        void submit();
      }}
    >
      <span>
        {action}
        <span className="project-action-target"> project</span>
      </span>
    </button>
  );
}
