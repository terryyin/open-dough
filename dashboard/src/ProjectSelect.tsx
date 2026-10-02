import type { PublishedSource } from "./publishedSource.ts";
import { useProjects } from "./projectList.tsx";

// Shared with page-wide project arrow navigation so native radios and the
// shortcut recognize the same control group.
export const projectRadioName = "project";

// Which project this dashboard observes, chosen from the configured list.
// Selecting one is the only effect this control has: what happens when the
// selection changes belongs to the caller, not here.
export function ProjectSelect({
  source,
  onSelect,
}: {
  readonly source: PublishedSource;
  readonly onSelect: (next: PublishedSource) => void;
}) {
  const projects = useProjects();
  return (
    <div className="project-select" role="radiogroup" aria-label="Project">
      {projects.map((option) => (
        <label key={option.id} className="project-choice">
          <input
            type="radio"
            name={projectRadioName}
            value={option.id}
            checked={source.id === option.id}
            onChange={() => {
              onSelect(option);
            }}
          />
          <span>{option.label}</span>
        </label>
      ))}
    </div>
  );
}
