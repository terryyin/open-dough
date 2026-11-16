import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { agentEffortReport } from "../../server/agentEffortReport.ts";
import type { compareEffort } from "../../server/agentEffortComparison.ts";
import type { cursorEffortReport } from "../../server/agentEffortCursor.ts";
import type { CursorTranscriptBuilder } from "../../../Distribution/tests/support/cursorTranscriptTestData.mjs";

type EffortResult = Awaited<ReturnType<typeof agentEffortReport>>;
type EffortCatalog = Extract<EffortResult, { selections: unknown }>;
type EffortReport = Exclude<EffortResult, { selections: unknown }>;

export const command = path.resolve("dashboard/server/compareAgentEffort.ts");
export function writeCursorTranscript(
  file: string,
  rows: ReturnType<CursorTranscriptBuilder["please"]>,
) {
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, `${rows.map((row) => JSON.stringify(row)).join("\n")}\n`);
}
export function cursorReport(home: string, root: string, flags: string[] = []) {
  return JSON.parse(
    execFileSync(
      process.execPath,
      [
        command,
        "--home",
        home,
        "--host",
        "cursor",
        "--cursor-root",
        root,
        "--family",
        "family",
        "--json",
        ...flags,
      ],
      { encoding: "utf8", env: { ...process.env, HOME: home } },
    ),
  ) as Exclude<ReturnType<typeof cursorEffortReport>, { selections: unknown }>;
}
export function report(
  home: string,
  root: string,
  flags: ["--list"],
  cwd?: string,
): EffortCatalog;
export function report(
  home: string,
  root: string,
  flags: string[],
  cwd?: string,
): EffortReport;
export function report(
  home: string,
  root: string,
  flags: string[],
  cwd?: string,
): EffortResult {
  return JSON.parse(
    execFileSync(
      process.execPath,
      [
        command,
        "--home",
        home,
        "--codex-root",
        root,
        "--claude-root",
        path.join(home, "claude"),
        "--json",
        ...flags,
      ],
      { encoding: "utf8", cwd, env: { ...process.env, HOME: home } },
    ),
  ) as EffortResult;
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

export function comparisonReport(home: string, root: string, manifest: string) {
  return JSON.parse(
    execFileSync(
      process.execPath,
      [
        command,
        "--home",
        home,
        "--codex-root",
        root,
        "--claude-root",
        path.join(home, "claude"),
        "--comparison",
        manifest,
        "--json",
      ],
      { encoding: "utf8", env: { ...process.env, HOME: home } },
    ),
  ) as Awaited<ReturnType<typeof compareEffort>>;
}
