import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import type { agentEffortReport } from "../../server/agentEffortReport.ts";

type EffortResult = Awaited<ReturnType<typeof agentEffortReport>>;
type EffortCatalog = Extract<EffortResult, { selections: unknown }>;
type EffortReport = Exclude<EffortResult, { selections: unknown }>;

export const command = path.resolve("dashboard/server/compareAgentEffort.ts");
export function report(
  home: string,
  root: string,
  flags: ["--list"],
): EffortCatalog;
export function report(
  home: string,
  root: string,
  flags: string[],
): EffortReport;
export function report(
  home: string,
  root: string,
  flags: string[],
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
      { encoding: "utf8", env: { ...process.env, HOME: home } },
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
