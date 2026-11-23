import { readFileSync } from "node:fs";
import path from "node:path";

export function readLandingSessionTitle(contextFile: string): unknown {
  return JSON.parse(
    readFileSync(
      path.join(path.dirname(contextFile), "session-title.json"),
      "utf8",
    ),
  );
}
