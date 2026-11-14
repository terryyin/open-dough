// Resolves each configured local checkout path for launch and workspace use.
// The shown form retains ~ while the process path expands it on this machine.
import { stat } from "node:fs/promises";
import { homedir } from "node:os";
import type { PublishedSource } from "../src/publishedSource.ts";
import { configuredProject } from "./projectConfiguration.ts";

import { localFolder, type ProjectFolder } from "./localFolder.ts";
export { localFolder, type ProjectFolder } from "./localFolder.ts";

export function projectFolder(source: PublishedSource): ProjectFolder {
  const project = configuredProject(source.id);
  if (project === undefined)
    throw new Error(`Unknown configured project: ${source.id}`);
  return localFolder(project.localPath);
}

// The machine's home folder, where the read of every project's sessions runs.
export function machineFolder(): ProjectFolder {
  return { path: homedir(), shown: "~" };
}

export async function folderExists(folder: ProjectFolder): Promise<boolean> {
  try {
    return (await stat(folder.path)).isDirectory();
  } catch {
    return false;
  }
}
