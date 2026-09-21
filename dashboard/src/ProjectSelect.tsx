import { catalog, sourceById, type PublishedSource } from "./publishedSource";

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
    <div className="project-select">
      <label htmlFor="project">Project</label>
      <select
        id="project"
        value={source.id}
        onChange={(event) => {
          const next = sourceById(event.target.value);
          if (next) {
            onSelect(next);
          }
        }}
      >
        {catalog.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
