// Resolve displayed checkout paths without initializing dashboard state.
import { homedir } from "node:os";
import path from "node:path";

export type ProjectFolder = {
  // Where a process runs.
  readonly path: string;
  // How an explanation names it, without this machine's home directory.
  readonly shown: string;
};

export function localFolder(shown: string, home = homedir()): ProjectFolder {
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
