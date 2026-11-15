// Run with the repository's locked Node: node dashboard/server/importUsageHistory.ts.
import { parseArgs } from "node:util";
import { homedir } from "node:os";
import path from "node:path";
import {
  codexUsageRoots,
  importUsageHistory,
  usageHistorySince,
} from "./usageImport.ts";
import { usageHistoryFile } from "./usageHistory.ts";
import { once } from "node:events";
import { exportUsageSnapshot, openUsageSnapshot } from "./usageSnapshot.ts";

try {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      home: { type: "string" },
      store: { type: "string" },
      since: { type: "string" },
      responses: { type: "string" },
      "claude-root": { type: "string", multiple: true },
      "codex-root": { type: "string", multiple: true },
    },
  });
  if (
    positionals.length !== 1 ||
    !["import", "read"].includes(positionals[0] ?? "")
  )
    throw new Error(
      "Choose import or read; options: --home --store --since --responses --codex-root --claude-root (repeatable)",
    );
  const home = path.resolve(values.home ?? homedir());
  const store = path.resolve(values.store ?? usageHistoryFile(home));
  if (positionals[0] === "read") {
    for await (const chunk of exportUsageSnapshot(
      await openUsageSnapshot(store),
    )) {
      if (!process.stdout.write(chunk)) await once(process.stdout, "drain");
    }
  } else {
    const result = await importUsageHistory({
      home,
      store,
      since: values.since ?? usageHistorySince,
      ...(values.responses
        ? { responses: path.resolve(values.responses) }
        : {}),
      claudeRoots: (
        values["claude-root"] ?? [path.join(home, ".claude/projects")]
      ).map((root) => path.resolve(root)),
      codexRoots: (values["codex-root"] ?? codexUsageRoots(home)).map((root) =>
        path.resolve(root),
      ),
    });
    console.log(JSON.stringify(result));
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
