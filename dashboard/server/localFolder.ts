// Resolve displayed local folders without initializing dashboard state.
import { stat } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";

export type LocalFolder = {
  // Where a process runs.
  readonly path: string;
  // How an explanation names it, without this machine's home directory.
  readonly shown: string;
};

export function localFolder(shown: string, home = homedir()): LocalFolder {
  return {
    path:
      shown === "~"
        ? home
        : shown.startsWith("~/")
          ? path.join(home, shown.slice(2))
          : path.resolve(shown),
    shown,
  };
}

// The machine's home folder, where the read of every project's sessions runs.
export function machineFolder(): LocalFolder {
  return { path: homedir(), shown: "~" };
}

export async function folderExists(folder: LocalFolder): Promise<boolean> {
  try {
    return (await stat(folder.path)).isDirectory();
  } catch {
    return false;
  }
}
