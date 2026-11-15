// Saved Codex session records supplement the CLI stream with turn ownership,
// lifecycle and commands delegated through literal exec calls. This is part of
// the shared native-host reader; callers apply their own proof policy to facts.
import { readFileSync } from "node:fs";

import {
  toolInvocations,
  toolReceipts,
  codexWaitFacts,
} from "./native-host-stream-codex-tools.mjs";

// Reads one caller-named saved session, never the developer's default home.
// A command has a null exitCode when its paired receipt is absent, unresolved
// or ambiguous. A fork's copied turns retain their recorded context and are
// distinct from ownership established by that session's usage records.
export function readCodexSession(file) {
  const startedTurns = [],
    completedTurns = [],
    ownership = [],
    lifecycle = [],
    calls = [],
    contexts = [],
    usage = [],
    tools = [],
    unresolvedTools = [],
    responseCalls = [];
  const pending = new Map();
  let context = {},
    thread,
    parentThread,
    recordThread,
    order = 0;
  for (const line of readFileSync(file, "utf8").split("\n")) {
    order++;
    if (line.trim() === "") continue;
    const row = JSON.parse(line);
    const value = row.payload ?? {};
    if (row.type === "session_meta") {
      if (thread === undefined) {
        thread = value.id;
        parentThread = value.source?.subagent?.thread_spawn?.parent_thread_id;
      }
      recordThread = value.id;
    } else if (row.type === "turn_context") {
      context = { turn: value.turn_id, cwd: value.cwd };
      contexts.push(context);
    } else if (row.type === "token_usage_record") {
      ownership.push({
        thread: value.thread_id,
        turn: value.turn_id,
        rootTurn: value.root_turn_id,
      });
      const counters = value.usage ?? value.token_usage ?? {};
      usage.push({
        thread: value.thread_id,
        turn: value.turn_id,
        rootTurn: value.root_turn_id,
        responseId: value.response_id,
        at: row.timestamp ?? "",
        order,
        counts: Object.fromEntries(
          [
            "input_tokens",
            "cached_input_tokens",
            "output_tokens",
            "total_tokens",
          ].map((key) => [
            key,
            Number.isSafeInteger(counters[key]) && counters[key] >= 0
              ? counters[key]
              : null,
          ]),
        ),
      });
      for (const call of responseCalls.splice(0)) {
        if (
          call.thread === value.thread_id &&
          call.context.turn === value.turn_id
        )
          call.responseId = value.response_id;
      }
    } else if (row.type === "event_msg") {
      // A fork copies parent metadata and turns after its own first metadata.
      // Preserve that history's contexts/calls, but its lifecycle belongs to
      // the parent until an explicit settings event resumes this thread.
      if (value.type === "thread_settings_applied")
        recordThread = value.thread_id;
      if (recordThread === thread) {
        if (["task_started", "task_complete"].includes(value.type))
          lifecycle.push({
            type: value.type,
            turn: value.turn_id,
            at: row.timestamp ?? "",
            order,
          });
        if (value.type === "task_started") startedTurns.push(value.turn_id);
        if (value.type === "task_complete") completedTurns.push(value.turn_id);
      }
    } else if (row.type === "response_item") {
      if (["custom_tool_call", "function_call"].includes(value.type)) {
        const call = {
          value,
          context,
          thread: recordThread,
          order,
          at: row.timestamp ?? "",
        };
        if (pending.has(value.call_id)) call.ambiguous = true;
        pending.set(value.call_id, call);
        responseCalls.push(call);
      } else if (
        ["custom_tool_call_output", "function_call_output"].includes(value.type)
      ) {
        const call = pending.get(value.call_id);
        if (!call) continue;
        if (call.received) {
          for (const tool of tools.filter((t) => t.callId === value.call_id))
            tool.receipt = undefined;
          unresolvedTools.push({
            callId: value.call_id,
            turn: call.context.turn,
            order: call.order,
          });
          continue;
        }
        call.received = true;
        const invoked = call.ambiguous ? null : toolInvocations(call.value),
          terminal = toolReceipts(value.output);
        if (!invoked) {
          unresolvedTools.push({
            callId: value.call_id,
            turn: call.context.turn,
            order: call.order,
          });
          continue;
        }
        if (terminal.length !== invoked.length)
          unresolvedTools.push({
            callId: value.call_id,
            turn: call.context.turn,
            order: call.order,
          });
        for (const [index, invocation] of invoked.entries()) {
          const { args, kind } = invocation;
          const result =
            terminal.length === invoked.length ? terminal[index] : undefined;
          tools.push({
            kind,
            args,
            receipt: result,
            thread: call.thread,
            receiptThread: recordThread,
            turn: call.context.turn,
            receiptTurn: context.turn,
            responseId: call.responseId,
            callId: value.call_id,
            receiptId: value.id,
            order: call.order,
            receiptOrder: order,
            at: call.at,
            receiptAt: row.timestamp ?? "",
            index,
          });
          if (kind !== "command") continue;
          calls.push({
            command: args.cmd,
            cwd: call.context.cwd,
            workdir: args.workdir ?? call.context.cwd,
            turn: call.context.turn,
            receiptTurn: context.turn,
            exitCode:
              result && !result.session_id && Number.isInteger(result.exit_code)
                ? result.exit_code
                : null,
            at: row.timestamp ?? "",
            id: value.call_id,
          });
        }
      }
    }
  }
  for (const call of pending.values())
    if (!call.received)
      unresolvedTools.push({
        callId: call.value.call_id,
        turn: call.context.turn,
        order: call.order,
      });
  return {
    thread,
    parentThread,
    contexts,
    usage,
    startedTurns,
    completedTurns,
    ownership,
    lifecycle,
    calls,
    tools,
    unresolvedTools,
    ...codexWaitFacts(tools, usage, thread),
  };
}
