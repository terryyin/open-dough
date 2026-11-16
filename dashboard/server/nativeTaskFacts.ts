import { nativeTaskDirective } from "./nativeTaskDirective.ts";
export { nativeTaskDirective } from "./nativeTaskDirective.ts";
import { nativeTaskCorroboration } from "./nativeTaskCorroboration.ts";
// User directives are parsed transiently into bounded facts. No prompt, tool
// arguments, transcript body or incidental skill-document contents survive.
import { objectOf, stringOf, timestampOf } from "./nativeUsageFiles.ts";
import type { UsageTask, UsageSource } from "./usageRecords.ts";

export type NativeTaskFact = {
  host: "codex" | "claude";
  sessionId: string;
  turnId: string;
  turns: string[];
  cwd?: string | undefined;
  repository?: string | undefined;
  revision?: string | undefined;
  workflow: string | null;
  reference?: string | undefined;
  storyReferences?: string[] | undefined;
  origin: "dashboard" | "native" | "unknown";
  projectHint?: string | undefined;
  at?: string | undefined;
  requested: UsageTask["requested"];
  source: UsageSource;
  assignmentEvidence?: UsageTask["assignmentEvidence"];
  contextSource?: UsageSource | undefined;
  revisionSource?: UsageSource | undefined;
  outcomeSource?: UsageSource | undefined;
  outcome?:
    | {
        kind: "reported-complete" | "reported-incomplete";
        at: string;
        attention?: boolean;
      }
    | undefined;
};
export type NativeTaskSink = (fact: NativeTaskFact) => void;
export function codexTaskReader(owner: string, sink?: NativeTaskSink) {
  let context: Pick<
    NativeTaskFact,
    "cwd" | "repository" | "revision" | "contextSource"
  > = {};
  const corroboration = nativeTaskCorroboration(sink);
  let own = false;
  let worker = false;
  let turn: string | undefined;
  return (row: Record<string, unknown>, source: UsageSource) => {
    if (!sink) return;
    const payload = objectOf(row["payload"]);
    if (row["type"] === "session_meta") {
      if (payload["id"] !== owner) {
        own = false;
        return;
      }
      own = true;
      worker =
        Boolean(payload["parent_thread_id"]) ||
        Boolean(
          objectOf(objectOf(payload["source"])["subagent"])["thread_spawn"],
        );
      const git = objectOf(payload["git"]);
      context = {
        cwd: stringOf(payload["cwd"]),
        repository: stringOf(git["repository_url"]),
        revision: stringOf(git["commit_hash"]),
        contextSource: source,
      };
    }
    if (!own || worker) return;
    corroboration.row(row, source);
    if (
      row["type"] === "turn_context" ||
      (row["type"] === "event_msg" && payload["type"] === "task_started")
    )
      turn = stringOf(payload["turn_id"]) ?? turn;
    if (!turn) return;
    const content =
      row["type"] === "response_item" && payload["role"] === "user"
        ? payload["content"]
        : row["type"] === "event_msg" && payload["type"] === "user_message"
          ? (stringOf(payload["message"]) ?? "")
          : "";
    const fact = nativeTaskDirective(
      content,
      {
        ...context,
        host: "codex",
        sessionId: owner,
        turnId: turn,
        at: timestampOf(row["timestamp"]),
        source,
      },
      !corroboration.started,
      objectOf(row["origin"])["kind"] === "native",
    );
    corroboration.input(fact, content, turn);
  };
}
export function claudeTaskReader(sink?: NativeTaskSink) {
  const corroboration = nativeTaskCorroboration(sink);
  return (row: Record<string, unknown>, source: UsageSource) => {
    if (row["agentId"]) return;
    corroboration.row(row, source);
    if (
      !sink ||
      row["type"] !== "user" ||
      row["agentId"] ||
      row["isMeta"] === true
    )
      return;
    const origin = stringOf(objectOf(row["origin"])["kind"]);
    if (origin && origin !== "human" && origin !== "native") return;
    const sessionId = stringOf(row["sessionId"]);
    const turnId = stringOf(row["uuid"]);
    if (!sessionId || !turnId) return;
    const git = objectOf(row["git"]);
    const content = objectOf(row["message"])["content"];
    const fact = nativeTaskDirective(
      content,
      {
        host: "claude",
        sessionId,
        turnId,
        source,
        cwd: stringOf(row["cwd"]),
        at: timestampOf(row["timestamp"]),
        revision: stringOf(git["commit_hash"]),
        repository: stringOf(git["repository_url"]),
        contextSource: source,
      },
      !corroboration.started,
      origin === "native",
    );
    corroboration.input(fact, content, turnId);
  };
}
