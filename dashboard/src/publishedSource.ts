// The projects this dashboard can observe, each independently. Terry
// consumes time on all three; this is not a combined or coordinated view of
// them. Metadata is hardcoded on purpose, by explicit human decision: there
// is no project-registration service, config file, or admin UI here.
//
// Every source -- public Open Dough and Doughnut as much as private Pygardon
// -- is read the same way: through the local authenticated read boundary
// (`../server/authenticatedRead.ts`, reached from the browser through
// `./authenticatedRead.ts`) with the launching person's existing `gh`
// authentication. No dashboard sign-in and no token-entry UI exist or are
// needed; the boundary answers only for the sources listed here.
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

const pygardon: PublishedSource = {
  id: "pygardon",
  label: "Pygardon",
  repository: "terryyin/pygardon",
  ref: "main",
  backlogPath: ".planning/PRODUCT-BACKLOG.md",
};

// Open Dough is where this dashboard itself is developed; it is the default
// selection so its own published work is the first thing shown.
export const catalog: readonly PublishedSource[] = [
  openDough,
  doughnut,
  pygardon,
];
export const defaultSource: PublishedSource = openDough;

export function sourceById(id: string): PublishedSource | undefined {
  return catalog.find((source) => source.id === id);
}
