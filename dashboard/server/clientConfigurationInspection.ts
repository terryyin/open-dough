// Read-only inspection of one project's Client configuration file text.
// Does not parse JSON and never writes the file (unlike CI configuration).
import { readFileSync, statSync } from "node:fs";
import path from "node:path";
import type { ClientConfigurationInspection } from "../src/projectConfiguration.ts";
import { localFolder } from "./projectFolders.ts";

const relativeFile = path.join(".planning", "open-dough.json");

export function inspectClientConfiguration(
  localPath: string,
): ClientConfigurationInspection {
  const checkout = localFolder(localPath).path;
  const file = path.join(checkout, relativeFile);
  try {
    return { status: "readable", text: readFileSync(file, "utf8") };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT")
      return { status: "unreadable" };
    try {
      if (!statSync(checkout).isDirectory()) return { status: "unreadable" };
      return { status: "absent" };
    } catch {
      return { status: "unreadable" };
    }
  }
}
