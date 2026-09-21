// The projects this dashboard can observe, each independently. Terry
// consumes time on all three; this is not a combined or coordinated view of
// them. Metadata is hardcoded on purpose, by explicit human decision: there
// is no project-registration service, config file, or admin UI here.
//
// Pygardon is a private third project, read with existing local GitHub CLI
// authentication rather than this catalog's public browser path. It is not
// offered as a selectable choice until that read actually works; listing it
// here without a working read would misrepresent what is supported.
export type PublishedSource = {
  readonly id: string;
  readonly label: string;
  readonly repository: string;
  readonly ref: string;
  readonly backlogPath: string;
};

const openDough: PublishedSource = {
  id: "open-dough",
  label: "Open Dough",
  repository: "terryyin/open-dough",
  ref: "main",
  backlogPath: ".planning/PRODUCT-BACKLOG.md",
};

const doughnut: PublishedSource = {
  id: "doughnut",
  label: "Doughnut",
  repository: "nerds-odd-e/doughnut",
  ref: "main",
  backlogPath: ".planning/PRODUCT-BACKLOG.md",
};

// Open Dough is where this dashboard itself is developed; it is the default
// selection so its own published work is the first thing shown.
export const catalog: readonly PublishedSource[] = [openDough, doughnut];
export const defaultSource: PublishedSource = openDough;

export function sourceById(id: string): PublishedSource | undefined {
  return catalog.find((source) => source.id === id);
}
