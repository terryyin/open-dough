import { catalog, type PublishedSource } from "./publishedSource";

// Which project this dashboard observes, chosen from the fixed catalog.
// Selecting one is the only effect this control has: what happens when the
// selection changes belongs to the caller, not here.
export function ProjectSelect({
  source,
  onSelect,
}: {
  readonly source: PublishedSource;
  readonly onSelect: (next: PublishedSource) => void;
}) {
  return (
    <div className="project-select" role="radiogroup" aria-label="Project">
      {catalog.map((option) => (
        <label key={option.id} className="project-choice">
          <input
            type="radio"
            name="project"
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
