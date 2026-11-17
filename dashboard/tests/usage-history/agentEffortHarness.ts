// Shared fixture helpers for agent-effort specs: the CLI path, Cursor
// transcript files and a byte snapshot proving reads stay read-only.
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { CursorTranscriptBuilder } from "../../../Distribution/tests/support/cursorTranscriptTestData.mjs";

export const command = path.resolve("dashboard/server/compareAgentEffort.ts");
export function writeCursorTranscript(
  file: string,
  rows: ReturnType<CursorTranscriptBuilder["please"]>,
) {
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, `${rows.map((row) => JSON.stringify(row)).join("\n")}\n`);
}
export const bytes = (home: string) =>
  Object.fromEntries(
    readdirSync(home, { recursive: true, withFileTypes: true })
      .filter((entry) => entry.isFile())
      .map((entry) => {
        const file = path.join(entry.parentPath, entry.name);
        return [file, readFileSync(file, "utf8")];
      }),
  );
