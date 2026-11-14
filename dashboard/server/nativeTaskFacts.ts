import { nativeTaskCorroboration } from "./nativeTaskCorroboration.ts";
// User directives are parsed transiently into bounded facts. No prompt, tool
// arguments, transcript body or incidental skill-document contents survive.
import { objectOf, stringOf, timestampOf } from "./nativeUsageFiles.ts";
import type { UsageTask, UsageSource } from "./usageRecords.ts";

export type NativeTaskFact = {
  host: "codex" | "claude";
  sessionId: string;
  turnId: string;
  cwd?: string | undefined;
  repository?: string | undefined;
  revision?: string | undefined;
  workflow: string | null;
  reference?: string | undefined;
  storyReference?: string | undefined;
  origin: "dashboard" | "native" | "unknown";
  projectHint?: string | undefined;
  at?: string | undefined;
  requested: UsageTask["requested"];
  source: UsageSource;
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
export function nativeText(content: unknown): string {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  return content
    .map((part: unknown) => stringOf(objectOf(part)["text"]) ?? "")
    .join("\n");
}
function directive(text: string) {
  // Anchored invocations only: AGENTS, injected skills, quotes and transcripts
  // containing a skill name cannot manufacture a task or historical reference.
  const readable = text.replace(/```[^\n]*\n[\s\S]*?(?:```|$)/g, "").trim();
  const command =
    /^(?:<command-message>[^<]*<\/command-message>\s*)?<command-name>\/(dough-[a-z-]+)<\/command-name>[\s\S]*?<command-args>([^<]*)<\/command-args>/.exec(
      readable,
    );
  const workflow = /^(?:\$|\/)(dough-[a-z-]+)\b([^\n]*)/.exec(readable);
  const natural =
    /^(?:Use|Run|Execute|Invoke) (?:the )?(dough-[a-z-]+)\b([^\n]*)/i.exec(
      readable,
    );
  const invocation = workflow ?? natural ?? command;
  const reporting =
    /^Dashboard reporting context:\n- project: ([^\n]+)\n- host: (codex|claude)\n- launch reference: ([0-9a-f-]{36})(?:\n|$)/im.exec(
      readable,
    );
  const referenceText = invocation?.[2] ?? "";
  const storyReference = referenceText.match(
    /SEED-\d+(?:#[a-z0-9-]+)?|(?:\.?\/?[\w.-]+\/)*[^\s`]+\.(?:md|json)(?:#[\w-]+)?/i,
  )?.[0];
  return { invocation, reporting, storyReference };
}
export function nativeTaskDirective(
  text: string,
  context: Omit<NativeTaskFact, "workflow" | "origin" | "requested">,
  first: boolean,
  explicitNative = false,
): NativeTaskFact | undefined {
  if (
    /^\s*(?:# AGENTS\.md|<INSTRUCTIONS>|<environment_context>|<skill>|<system)/i.test(
      text,
    )
  )
    return;
  const { invocation, reporting, storyReference } = directive(text);
  if (!invocation && !reporting && !first) return;
  if (!text.trim()) return;
  const requested: UsageTask["requested"] = {};
  const supported = new Set([
    "--trunk",
    "--one-shot",
    "--auto-land",
    "--skip-retro",
    "--replan",
    "--no-replan",
    "--refine-only",
  ]);
  const options = invocation?.[2]
    ?.match(/--[a-z][a-z-]+/g)
    ?.filter((flag) => supported.has(flag));
  if (options?.length) requested.options = [...new Set(options)];
  // A requested value must be labelled; observed turn settings stay separate.
  for (const [label, key] of [
    ["model", "model"],
    ["effort", "effort"],
    ["approval policy", "approvalPolicy"],
    ["sandbox", "sandbox"],
  ] as const) {
    const value = new RegExp(
      `^Requested ${label}: ([a-zA-Z0-9_.-]+)$`,
      "m",
    ).exec(text)?.[1];
    if (value) requested[key] = value;
  }
  return {
    ...context,
    workflow: invocation?.[1] ?? null,
    ...(storyReference ? { storyReference } : {}),
    ...(reporting?.[3]
      ? { reference: reporting[3], projectHint: reporting[1] }
      : {}),
    origin:
      reporting?.[2] === context.host
        ? "dashboard"
        : explicitNative
          ? "native"
          : "unknown",
    requested,
  };
}
export function codexTaskReader(owner: string, sink?: NativeTaskSink) {
  let context: Pick<
    NativeTaskFact,
    "cwd" | "repository" | "revision" | "contextSource"
  > = {};
  const corroboration = nativeTaskCorroboration(sink);
  let own = false;
  let worker = false;
  let turn: string | undefined;
  let first = true;
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
    const text =
      row["type"] === "response_item" && payload["role"] === "user"
        ? nativeText(payload["content"])
        : row["type"] === "event_msg" && payload["type"] === "user_message"
          ? (stringOf(payload["message"]) ?? "")
          : "";
    const fact = nativeTaskDirective(
      text,
      {
        ...context,
        host: "codex",
        sessionId: owner,
        turnId: turn,
        at: timestampOf(row["timestamp"]),
        source,
      },
      first,
      objectOf(row["origin"])["kind"] === "native",
    );
    if (fact) {
      sink(fact);
      corroboration.task(fact);
      first = false;
    }
  };
}
export function claudeTaskReader(sink?: NativeTaskSink) {
  let first = true;
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
    const fact = nativeTaskDirective(
      nativeText(objectOf(row["message"])["content"]),
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
      first,
      origin === "native",
    );
    if (fact) {
      sink(fact);
      corroboration.task(fact);
      first = false;
    } else if (nativeText(objectOf(row["message"])["content"]).trim())
      corroboration.task(undefined);
  };
}
