// Corroborating tool results supply facts, never copied command/output bodies.
// Only a matched read command or structured completion receipt is recognized.
import { completionReceiptSchema } from "../src/completionReport.ts";
import {
  nativeText,
  type NativeTaskFact,
  type NativeTaskSink,
} from "./nativeTaskFacts.ts";
import { objectOf, stringOf } from "./nativeUsageFiles.ts";
import type { UsageSource } from "./usageRecords.ts";

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
    task(fact: NativeTaskFact | undefined) {
      active = fact;
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
