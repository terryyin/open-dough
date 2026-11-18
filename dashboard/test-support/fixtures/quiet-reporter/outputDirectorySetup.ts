import type { FullConfig } from "@playwright/test";
import { mkdirSync } from "node:fs";

// Playwright has already cleared its output directories. Recreate the target
// before onBegin so the alias regression exercises canonical containment.
export default function globalSetup(config: FullConfig): void {
  for (const project of config.projects)
    mkdirSync(project.outputDir, { recursive: true });
}
