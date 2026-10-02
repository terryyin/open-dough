// Existing journeys need their known projects even though development starts empty.
// Writes only a missing fixture file; restarts keep each test's saved configuration.
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { productionSeedProjects } from "../../server/projectConfigurationSeed.ts";

export function configureDevelopmentProjects(home: string): void {
  const file = path.join(
    home,
    ".open-dough/dashboard/projects-development.json",
  );
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
