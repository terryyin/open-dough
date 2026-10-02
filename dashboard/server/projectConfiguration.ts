// The local dashboard server owns the projects all boundaries act on.
// The launch mode selects their environment; both retain today's list until
// saved per-environment configuration supplies it.
import type { PublishedSource } from "../src/publishedSource.ts";

export type ProjectEnvironment = "development" | "production";
export type ConfiguredProject = PublishedSource & {
  readonly localPath: string;
};

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

const projects: readonly ConfiguredProject[] = [
  openDough,
  doughnut,
  pygardon,
  terryTalks,
];
let environment: ProjectEnvironment | undefined;

export function initializeProjectConfiguration(next: ProjectEnvironment): void {
  if (environment !== undefined && environment !== next) {
    throw new Error("A dashboard server cannot use both project environments.");
  }
  environment = next;
}

export function configuredProjects(): readonly ConfiguredProject[] {
  return projects;
}

export function configuredProject(id: string): ConfiguredProject | undefined {
  return configuredProjects().find((project) => project.id === id);
}

// Local paths stay on the server. The browser only receives published-source facts.
export function publishedProjects(): readonly PublishedSource[] {
  return configuredProjects().map(
    ({ id, label, repository, ref, backlogPath }) => ({
      id,
      label,
      repository,
      ref,
      backlogPath,
    }),
  );
}
