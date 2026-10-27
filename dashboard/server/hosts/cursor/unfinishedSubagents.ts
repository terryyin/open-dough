// Machine-local evidence that a held Cursor session still has belonging
// background work: subagent transcripts under the workspace's Cursor
// project directory. A `turn_ended` record proves that subagent finished.
// Missing or unreadable trees supply no Working claim (ADR 0008).
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

// Continuation workspace path → Cursor project slug (non-alphanumeric runs
// become `-`, matching ~/.cursor/projects/<slug>/).
export function cursorProjectWorkspaceSlug(workspace: string): string {
  return workspace.replace(/[^A-Za-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

// Belonging subagent transcripts for one held session:
// ~/.cursor/projects/<slug>/agent-transcripts/<sessionId>/subagents/.
export function cursorBelongingSubagentsDirectory(
  home: string,
  workspace: string,
  sessionId: string,
): string {
  return path.join(
    home,
    ".cursor",
    "projects",
    cursorProjectWorkspaceSlug(workspace),
    "agent-transcripts",
    sessionId,
    "subagents",
  );
}

// True when any belonging `subagents/*.jsonl` lacks a `turn_ended` record.
// False when none exist, every readable sibling ended, or the tree cannot
// be read — missing observation does not invent Working.
export function hasUnfinishedBelongingSubagent(
  home: string,
  workspace: string,
  sessionId: string,
): boolean {
  const directory = cursorBelongingSubagentsDirectory(
    home,
    workspace,
    sessionId,
  );
  let names: string[];
  try {
    names = readdirSync(directory);
  } catch {
    return false;
  }
  for (const name of names) {
    if (!name.endsWith(".jsonl")) continue;
    let text: string;
    try {
      text = readFileSync(path.join(directory, name), "utf8");
    } catch {
      continue;
    }
    if (!subagentTranscriptEnded(text)) return true;
  }
  return false;
}

function subagentTranscriptEnded(text: string): boolean {
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (trimmed === "") continue;
    try {
      const record = JSON.parse(trimmed) as { type?: unknown };
      if (record.type === "turn_ended") return true;
    } catch {
      // Malformed lines do not prove completion.
    }
  }
  return false;
}
