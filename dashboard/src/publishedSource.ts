// The projects this dashboard can observe, each independently. Terry
// consumes time on all three; this is not a combined or coordinated view of
// them. Metadata is hardcoded on purpose, by explicit human decision: there
// is no project-registration service, config file, or admin UI here.
//
// `access` is this catalog's one recorded fact about how a source's read
// must reach GitHub: "public" through the browser's unauthenticated path
// (`../src/githubSource.ts`), "private" through the local authenticated read
// boundary (`../server/privateRead.ts`, reached from the browser through
// `./privateRead.ts`). This catalog is the one source of that fact; nothing
// downstream re-derives it from the repository name or otherwise.
//
// Pygardon is a private third project, read with existing local GitHub CLI
// authentication rather than this catalog's public browser path. No
// dashboard sign-in and no token-entry UI exist or are needed: reading it
// only requires the launching person's own `gh` already being able to read
// it, the same access already proven from the command line.
export type PublishedSource = {
  readonly id: string;
  readonly label: string;
  readonly repository: string;
  readonly ref: string;
  readonly backlogPath: string;
  readonly access: "public" | "private";
};

const openDough: PublishedSource = {
  id: "open-dough",
  label: "Open Dough",
  repository: "terryyin/open-dough",
  ref: "main",
  backlogPath: ".planning/PRODUCT-BACKLOG.md",
  access: "public",
};

const doughnut: PublishedSource = {
  id: "doughnut",
  label: "Doughnut",
  repository: "nerds-odd-e/doughnut",
  ref: "main",
  backlogPath: ".planning/PRODUCT-BACKLOG.md",
  access: "public",
};

const pygardon: PublishedSource = {
  id: "pygardon",
  label: "Pygardon",
  repository: "terryyin/pygardon",
  ref: "main",
  backlogPath: ".planning/PRODUCT-BACKLOG.md",
  access: "private",
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
