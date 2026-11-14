// Run with the repository's locked Node: node dashboard/server/importUsageHistory.ts.
import { parseArgs } from "node:util";
import { homedir } from "node:os";
import path from "node:path";
import { importUsageHistory } from "./usageImport.ts";
import { readUsageHistory, usageHistoryFile } from "./usageHistory.ts";

try {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      home: { type: "string" },
      store: { type: "string" },
      since: { type: "string" },
      "claude-root": { type: "string", multiple: true },
      "codex-root": { type: "string", multiple: true },
    },
  });
  if (
    positionals.length !== 1 ||
    !["import", "read"].includes(positionals[0] ?? "")
  )
    throw new Error(
      "Choose import or read; options: --home --store --since --codex-root --claude-root (repeatable)",
    );
  const home = path.resolve(values.home ?? homedir());
  const store = path.resolve(values.store ?? usageHistoryFile(home));
  const result =
    positionals[0] === "read"
      ? await readUsageHistory(store)
      : await importUsageHistory({
          home,
          store,
          since: values.since ?? "2026-09-16T00:00:00+08:00",
          claudeRoots: (
            values["claude-root"] ?? [path.join(home, ".claude/projects")]
          ).map((root) => path.resolve(root)),
          codexRoots: (
            values["codex-root"] ?? [
              path.join(home, ".codex/sessions"),
              path.join(home, ".codex/archived_sessions"),
            ]
          ).map((root) => path.resolve(root)),
        });
  console.log(JSON.stringify(result));
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
