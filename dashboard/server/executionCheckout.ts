// Resolves a project's configured execution checkout.
// The shown form retains ~ while the process path expands it on this machine.
import type { PublishedSource } from "../src/publishedSource.ts";
import { localFolder, type LocalFolder } from "./localFolder.ts";
import { configuredProject } from "./projectConfiguration.ts";

export function executionCheckout(source: PublishedSource): LocalFolder {
  const project = configuredProject(source.id);
  if (project === undefined)
    throw new Error(`Unknown configured project: ${source.id}`);
  return localFolder(project.localPath);
}
