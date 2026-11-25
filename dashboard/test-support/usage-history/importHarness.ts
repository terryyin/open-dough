// Process/filesystem/window boundary for usage-import journeys. Built Codex and
// Claude sessions come from MakeMe; raw nativeFile stays for layout under proof.
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { LaunchRecord } from "../../src/agentLaunch.ts";
import { keepLaunchStore } from "../support/launchStore.ts";
import { taskUsage, type UsageHistory } from "../../server/usageHistory.ts";
import type { UsageImportOptions } from "../../server/usageImport.ts";
import type { UsageResponses } from "../../server/usageResponsesFile.ts";

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
      leftAt: record.launchedAt,
    })}\n`,
  );
}

export function keepOperationalLaunch(
  home: string,
  record: LaunchRecord,
): void {
  keepLaunchStore(home, { "open-dough": [record] });
}

/**
 * Node options that make the named `node:fs/promises` call fail, in the
 * process they are passed to, on a path ending in `suffix`: the path removed
 * for `rm`, the target for `rename`. The error reads `injected <call> failure`.
 */
export const failing = (call: "rm" | "rename", suffix: string) => [
  "--import",
  `data:text/javascript,${encodeURIComponent(`
    import fs from 'node:fs/promises';
    import { syncBuiltinESMExports } from 'node:module';
    const original = fs.${call};
    fs.${call} = async (...args) => {
      if (String(args.at(${call === "rm" ? "0" : "-1"})).endsWith(${JSON.stringify(suffix)}))
        throw new Error('injected ${call} failure');
      return original(...args);
    };
    syncBuiltinESMExports();
  `)}`,
];

type ImportFailure = { status: number | null; stderr: string };

/** The exit status and error output of an import that fails. */
export function importFailure(
  {
    home,
    since,
    responses,
  }: Required<Pick<UsageImportOptions, "home" | "since" | "responses">>,
  nativeRoot: string,
  nodeOptions: string[],
): ImportFailure {
  try {
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
        since,
        "--responses",
        responses,
      ],
      {
        cwd: repository,
        env: { ...process.env, HOME: home },
        encoding: "utf8",
        stdio: "pipe",
      },
    );
  } catch (error) {
    const { status, stderr } = error as ImportFailure;
    return { status, stderr };
  }
  throw new Error("The import succeeded");
}

/** The stored history with the responses the latest import read. */
export type ImportedHistory = UsageHistory & UsageResponses;

/** Each task's session with its request count and output total, in task order. */
export const sessionTotals = (history: UsageHistory) =>
  Object.values(history.tasks).map((task) => {
    const { requests, tokens } = taskUsage(history, task.id);
    return [task.sessionId, requests, tokens.output];
  });

export function nodeProcess(home: string, script: string): string {
  return execFileSync(process.execPath, ["--input-type=module", "-e", script], {
    cwd: repository,
    env: { ...process.env, HOME: home },
    encoding: "utf8",
  });
}
