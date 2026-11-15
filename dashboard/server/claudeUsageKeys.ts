// Native Claude UUIDs are scoped by session and worker transcript.
import path from "node:path";
import { nativeUsageFileName } from "./nativeUsageFiles.ts";

export const claudeWorkerKey = (session: string, agent: string) =>
  JSON.stringify([session, agent]);
export const claudeNodeKey = (
  session: string,
  agent: string | undefined,
  uuid: string,
) => JSON.stringify([session, agent ?? "", uuid]);
// The session a transcript belongs to: its own name for a root transcript
// `<session>.jsonl`, its session directory's for a worker's
// `<session>/subagents/agent-<id>.jsonl`.
export function containingClaudeSession(file: string): string {
  const directory = path.dirname(file);
  return path.basename(directory) === "subagents"
    ? path.basename(path.dirname(directory))
    : nativeUsageFileName(file);
}
