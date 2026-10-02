// Initial production projects; saved configuration owns every later start.
import type { ConfiguredProject } from "./projectConfiguration.ts";

const openDough: ConfiguredProject = {
  id: "open-dough",
  label: "Open Dough",
  repository: "terryyin/open-dough",
  ref: "main",
  backlogPath: ".planning/PRODUCT-BACKLOG.md",
  localPath: "~/git/open-dough",
};

const doughnut: ConfiguredProject = {
  id: "doughnut",
  label: "Doughnut",
  repository: "nerds-odd-e/doughnut",
  ref: "main",
  backlogPath: ".planning/PRODUCT-BACKLOG.md",
  localPath: "~/git/doughnut",
};

const pygardon: ConfiguredProject = {
  id: "pygardon",
  label: "Pygardon",
  repository: "terryyin/pygardon",
  ref: "main",
  backlogPath: ".planning/PRODUCT-BACKLOG.md",
  localPath: "~/git/pygardon",
};

const terryTalks: ConfiguredProject = {
  id: "terry-talks",
  label: "Terry Talks",
  repository: "terryyin/terry-talks",
  ref: "master",
  backlogPath: ".planning/PRODUCT-BACKLOG.md",
  localPath: "~/git/terry-talks",
};

export const productionSeedProjects: readonly ConfiguredProject[] = [
  openDough,
  doughnut,
  pygardon,
  terryTalks,
];
