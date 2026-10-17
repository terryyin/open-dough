// The project environment a test's server keeps its project list in
// (../../server/projectConfiguration.ts), and the file it keeps it in under
// that server's HOME. Existing journeys need their known projects even though
// development starts empty; `configureDevelopmentProjects` writes only a
// missing fixture file, so restarts keep each test's saved configuration.
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { ProjectEnvironment } from "../../server/projectConfiguration.ts";
import { productionSeedProjects } from "../../server/projectConfigurationSeed.ts";
import type { DashboardServerMode } from "./serverAddress.ts";

// Vite's dev server is development and its preview is production
// (../../server/localBoundaryPlugin.ts); the boundary server takes the one
// asked for, production when none is.
export function projectEnvironmentOf(
  mode: DashboardServerMode,
  asked?: ProjectEnvironment,
): ProjectEnvironment {
  if (mode === "dev") return "development";
  if (mode === "preview") return "production";
  return asked ?? "production";
}

// Where a server in `environment` keeps its project list under `home`.
export function projectConfigurationFile(
  home: string,
  environment: ProjectEnvironment,
): string {
  return path.join(
    home,
    ".open-dough/dashboard",
    `projects-${environment}.json`,
  );
}

export function configureDevelopmentProjects(home: string): void {
  const file = projectConfigurationFile(home, "development");
  mkdirSync(path.dirname(file), { recursive: true });
  try {
    writeFileSync(file, JSON.stringify(productionSeedProjects), { flag: "wx" });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
  }
}

// Saved projects unlike the initial catalog, with deliberate order and custom facts.
export const customSavedProjects = [
  {
    id: "zebra",
    label: "Zebra",
    repository: "example/zebra",
    ref: "trunk",
    backlogPath: ".planning/PRODUCT-BACKLOG.md",
    localPath: "~/work/zebra",
  },
  {
    id: "apple",
    label: "Apple",
    repository: "example/apple",
    ref: "default",
    backlogPath: ".planning/PRODUCT-BACKLOG.md",
    localPath: "~/elsewhere/apple",
  },
];
