// Shared machine project document validation. Offline reads neither initialize
// server state nor seed a missing configuration file.
import { readFileSync } from "node:fs";
import path from "node:path";
import { z } from "zod";
import { machineDashboardDirectory } from "./machineHome.ts";
import type { ConfiguredProject } from "./projectConfiguration.ts";

export const projectsSchema = z.array(
  z.object({
    id: z.string().min(1),
    label: z.string().min(1),
    repository: z.string().min(1),
    ref: z.string().min(1),
    backlogPath: z.string().min(1),
    localPath: z.string().min(1),
    hidden: z.boolean().optional(),
  }),
);
export function readConfiguredUsageProjects(
  home: string,
): readonly ConfiguredProject[] {
  const file = path.join(
    machineDashboardDirectory(home),
    "projects-production.json",
  );
  try {
    return projectsSchema
      .parse(JSON.parse(readFileSync(file, "utf8")))
      .map(({ hidden, ...project }) =>
        hidden ? { ...project, hidden: true } : project,
      );
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}
