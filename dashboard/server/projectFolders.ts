// Where a catalog project (`../src/publishedSource.ts`) lives on this
// machine: `~/git/<id>`, fixed per project, and the machine's own home folder,
// where a read that belongs to no one project runs. Machine-local, and read
// only by the local launch boundary (`./agentLaunches.ts`), which checks a
// project folder exists before any host process starts in it.

import { stat } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";
import type { PublishedSource } from "../src/publishedSource.ts";

export type ProjectFolder = {
  // Where a process runs.
  readonly path: string;
  // How an explanation names it, without this machine's home directory.
  readonly shown: string;
};

export function projectFolder(source: PublishedSource): ProjectFolder {
  return {
    path: path.join(homedir(), "git", source.id),
    shown: `~/git/${source.id}`,
  };
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
