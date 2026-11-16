// Owns a session's active task: a task-starting fact replaces it and a plain
// developer input extends its turns. Corroborating tool results supply facts,
// never copied command/output bodies. Only a matched read command or
// structured completion receipt is recognized.
import { completionReceiptSchema } from "../src/completionReport.ts";
import { nativeAssignmentContent } from "./nativeAssignmentContent.ts";
import type { NativeTaskFact, NativeTaskSink } from "./nativeTaskFacts.ts";
import { objectOf, stringOf } from "./nativeUsageFiles.ts";
import type { UsageSource } from "./usageRecords.ts";

function nativeText(content: unknown): string {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  return content
    .map((part: unknown) => stringOf(objectOf(part)["text"]) ?? "")
    .join("\n");
}

export function nativeTaskCorroboration(sink?: NativeTaskSink) {
  let active: NativeTaskFact | undefined;
  const reads = new Map<string, UsageSource>();
  const result = (
    id: string | undefined,
    text: string,
    source: UsageSource,
  ) => {
    if (!active || !sink) return;
    if (id && reads.has(id)) {
      const revision = text.match(/(?:^|\n)([a-f0-9]{40,64})(?:\n|$)/i)?.[1];
      if (revision) {
        active = { ...active, revision, revisionSource: source };
        sink(active);
      }
    }
    try {
      const receipt = completionReceiptSchema.safeParse(JSON.parse(text));
      if (receipt.success && receipt.data.reference === active.reference) {
        active = {
          ...active,
          outcome: {
            kind:
              receipt.data.outcome === "completed"
                ? "reported-complete"
                : "reported-incomplete",
            at: receipt.data.receivedAt,
            attention: receipt.data.message.length > 0,
          },
          outcomeSource: source,
        };
        sink(active);
      }
    } catch {
      /* Ordinary tool output is not a reporting receipt. */
    }
  };
  const call = (
    id: string | undefined,
    command: unknown,
    source: UsageSource,
  ) => {
    if (
      id &&
      typeof command === "string" &&
      /^git rev-parse (?:--verify )?HEAD\s*$/.test(command)
    )
      reads.set(id, source);
  };
  return {
    /** Whether a supported assignment has started a task in this session. */
    get started() {
      return active !== undefined;
    },
    /**
     * A developer input: its directive fact, when it has one, is recorded and
     * a supported one becomes the active task; other genuine text continues
     * the active task into `turnId`.
     */
    input(fact: NativeTaskFact | undefined, content: unknown, turnId: string) {
      if (!sink) return;
      if (fact) {
        sink(fact);
        if (
          fact.assignmentEvidence?.some(({ status }) => status === "supported")
        )
          active = fact;
      } else if (
        active &&
        !active.turns.includes(turnId) &&
        nativeAssignmentContent(content).text
      ) {
        active = { ...active, turns: [...active.turns, turnId] };
        sink(active);
      }
    },
    row(row: Record<string, unknown>, source: UsageSource) {
      const payload = objectOf(row["payload"]);
      if (
        row["type"] === "response_item" &&
        payload["type"] === "function_call" &&
        /(?:^|\.)(?:exec_command|shell_command)$/.test(
          stringOf(payload["name"]) ?? "",
        )
      ) {
        try {
          const args = objectOf(
            JSON.parse(stringOf(payload["arguments"]) ?? "{}"),
          );
          call(
            stringOf(payload["call_id"]),
            args["cmd"] ?? args["command"],
            source,
          );
        } catch {
          /* Unsupported invocation. */
        }
      }
      if (
        row["type"] === "response_item" &&
        payload["type"] === "function_call_output"
      )
        result(
          stringOf(payload["call_id"]),
          stringOf(payload["output"]) ?? "",
          source,
        );
      const content = objectOf(row["message"])["content"];
      if (Array.isArray(content))
        for (const item of content) {
          const part = objectOf(item);
          if (part["type"] === "tool_use" && part["name"] === "Bash")
            call(
              stringOf(part["id"]),
              objectOf(part["input"])["command"],
              source,
            );
          if (part["type"] === "tool_result")
            result(
              stringOf(part["tool_use_id"]),
              nativeText(part["content"]),
              source,
            );
        }
    },
  };
}
