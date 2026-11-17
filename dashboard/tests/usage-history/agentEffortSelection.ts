// Test-side reader for the documented agent-effort selection contract
// (dashboard/AGENT-EFFORT.md#selection-contract). Types describe the public
// output independently of production report types.
import { spawnSync } from "node:child_process";
import path from "node:path";
import { command } from "./agentEffortHarness.ts";

export type ListedTask = {
  id: string;
  host: "codex" | "claude";
  sessionId: string;
  rootTurnId?: string;
  identity?: string;
  launchedAt?: string;
};
export type ListedCursorFamily = {
  host: "cursor";
  id: string;
  root: string;
  directory: string;
};
export type SelectionCatalog<Entry> = {
  format: "agent-effort-v1";
  selections: Entry[];
};
export type ReportedSelection = {
  selection: {
    from: string | null;
    until: string | null;
    boundary: string;
    appliedBoundary?: {
      kind: string;
      from: string | null;
      until: string | null;
      nativeTurnBoundary: string | null;
    };
  };
  gaps: string[];
};

/** Runs the actual CLI against native roots; failures stay observable. */
export function effortCli(home: string, args: string[]) {
  const result = spawnSync(
    process.execPath,
    [
      command,
      "--home",
      home,
      "--codex-root",
      path.join(home, "native"),
      "--claude-root",
      path.join(home, "claude"),
      ...args,
    ],
    { encoding: "utf8", env: { ...process.env, HOME: home } },
  );
  return {
    status: result.status,
    stdout: result.stdout,
    stderr: result.stderr,
  };
}
export function cursorCli(home: string, roots: string[], args: string[]) {
  return effortCli(home, [
    "--host",
    "cursor",
    ...roots.flatMap((root) => ["--cursor-root", root]),
    ...args,
  ]);
}
export function succeeded(run: ReturnType<typeof effortCli>) {
  if (run.status !== 0) throw new Error(`CLI failed: ${run.stderr}`);
  return run.stdout;
}
export const listedTasks = (stdout: string) =>
  JSON.parse(stdout) as SelectionCatalog<ListedTask>;
export const listedCursorFamilies = (stdout: string) =>
  JSON.parse(stdout) as SelectionCatalog<ListedCursorFamily>;
export const readableListing = <Entry>(stdout: string) =>
  JSON.parse(stdout) as Entry[];
export const reportedSelection = (stdout: string) =>
  JSON.parse(stdout) as ReportedSelection;
