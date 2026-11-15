// Process/filesystem/window boundary for usage-import journeys. Built Codex and
// Claude sessions come from MakeMe; raw nativeFile stays for layout under proof.
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { LaunchRecord } from "../../src/agentLaunch.ts";
import { keepLaunchStore } from "../support/launchStore.ts";
import type { UsageHistory } from "../../server/usageHistory.ts";
import { usageHistoryDefaultAt } from "../../../Distribution/tests/support/codexRolloutTestData.mjs";

const repository = fileURLToPath(new URL("../../../", import.meta.url));
const command = path.join(repository, "dashboard/server/importUsageHistory.ts");

/**
 * Writes a built Codex rollout under the session id from its `session_meta`.
 * Cases under layout proof (for example `.zst` archive paths) keep `nativeFile`.
 */
export function writeCodexSession(root: string, rows: object[]): string {
  const meta = rows.find(
    (row): row is { type: string; payload?: { id?: string } } =>
      (row as { type?: string }).type === "session_meta",
  );
  const session = meta?.payload?.id;
  if (typeof session !== "string" || session.length === 0) {
    throw new Error("writeCodexSession requires session_meta.payload.id");
  }
  return nativeFile(root, session, rows);
}

/**
 * Writes a built Claude transcript under the `sessionId` on its first row.
 * Cases under layout proof (for example `subagents/` worker paths) keep
 * `nativeFile`.
 */
export function writeClaudeSession(root: string, rows: object[]): string {
  const session = (rows[0] as { sessionId?: string } | undefined)?.sessionId;
  if (typeof session !== "string" || session.length === 0) {
    throw new Error("writeClaudeSession requires sessionId on the first row");
  }
  return nativeFile(root, session, rows);
}

/**
 * Raw JSONL path under proof (compressed archives, partial directories, empty
 * broken files, Claude `subagents/` layout). Prefer `writeCodexSession` or
 * `writeClaudeSession` for ordinary built sessions.
 */
export function nativeFile(
  root: string,
  session: string,
  rows: object[],
): string {
  mkdirSync(root, { recursive: true });
  const file = path.join(root, `${session}.jsonl`);
  writeFileSync(file, `${rows.map((row) => JSON.stringify(row)).join("\n")}\n`);
  return file;
}

export function keepRetainedLaunch(home: string, record: LaunchRecord): void {
  const history = path.join(home, ".open-dough/dashboard/launch-history");
  mkdirSync(history, { recursive: true });
  writeFileSync(
    path.join(history, "2026-11.jsonl"),
    `${JSON.stringify({
      project: "open-dough",
      record,
      reason: "removed",
      leftAt: usageHistoryDefaultAt,
    })}\n`,
  );
}

export function keepOperationalLaunch(
  home: string,
  record: LaunchRecord,
): void {
  keepLaunchStore(home, { "open-dough": [record] });
}

export function runImport(
  home: string,
  nativeRoot: string,
  extra: string[] = [],
  nodeOptions: string[] = [],
): unknown {
  return JSON.parse(
    execFileSync(
      process.execPath,
      [
        ...nodeOptions,
        command,
        "import",
        "--home",
        home,
        "--codex-root",
        nativeRoot,
        "--since",
        "2026-09-16T00:00:00+08:00",
        ...extra,
      ],
      {
        cwd: repository,
        env: { ...process.env, HOME: home },
        encoding: "utf8",
        stdio: "pipe",
      },
    ),
  );
}

export function readImported(home: string, extra: string[] = []): UsageHistory {
  return JSON.parse(
    execFileSync(
      process.execPath,
      [command, "read", "--home", home, ...extra],
      {
        maxBuffer: 8 * 1024 * 1024,
        cwd: repository,
        env: { ...process.env, HOME: home },
        encoding: "utf8",
      },
    ),
  ) as UsageHistory;
}

export function nodeProcess(home: string, script: string): string {
  return execFileSync(process.execPath, ["--input-type=module", "-e", script], {
    cwd: repository,
    env: { ...process.env, HOME: home },
    encoding: "utf8",
  });
}
