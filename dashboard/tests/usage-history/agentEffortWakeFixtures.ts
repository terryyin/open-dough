import path from "node:path";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { writeClaudeSession, writeCodexSession } from "./importHarness.ts";

// Codex timeout shape: https://github.com/openai/codex/blob/main/codex-rs/core/src/tools/handlers/multi_agents_spec.rs
const usage = {
  input_tokens: 10,
  cached_input_tokens: 0,
  cache_write_input_tokens: 0,
  output_tokens: 1,
};
export function writeWakeEvidence(
  home: string,
  root: string,
  host: string,
  scenario: { name: string; outputs: string[] },
) {
  const duplicate = [
    "duplicate result",
    "conflicting replay",
    "conflicting native uuid",
  ].includes(scenario.name);
  const calls = scenario.outputs.map((output, index) => ({
    id: duplicate ? "tool-0" : `tool-${index}`,
    output,
  }));
  const uniqueCalls = duplicate ? calls.slice(0, 1) : calls;
  if (host === "codex") {
    const builder = makeMe.aCodexRollout.forSession("family");
    for (const call of uniqueCalls)
      builder.withRow({
        type: "response_item",
        payload: {
          type: "function_call",
          name:
            scenario.name === "clock only"
              ? "clock__curr_time"
              : scenario.name === "empty initial launch"
                ? "exec_command"
                : scenario.name === "unsupported wrapper"
                  ? "exec"
                  : scenario.name === "explicit timeout"
                    ? "wait"
                    : scenario.name.includes("cell")
                      ? "functions.wait"
                      : "write_stdin",
          call_id: call.id,
          arguments: JSON.stringify(
            scenario.name === "explicit timeout"
              ? { ids: ["worker"] }
              : scenario.name.includes("cell")
                ? { cell_id: "cell-a" }
                : { session_id: 123 },
          ),
        },
      });
    builder.withResponse(
      "turn",
      "before",
      usage,
      scenario.name === "covered window"
        ? { timestamp: "2026-11-13T00:00:00.000Z" }
        : {},
    );
    for (const call of [
      "incomplete result batch",
      "streamed missing result",
    ].includes(scenario.name)
      ? calls.slice(0, 1)
      : calls)
      builder.withRow({
        type: "response_item",
        payload: {
          type: "function_call_output",
          call_id: scenario.name === "missing pairing" ? "absent" : call.id,
          output:
            scenario.name === "explicit timeout"
              ? JSON.stringify({ status: {}, timed_out: true })
              : scenario.name.includes("cell")
                ? `Script running with cell ID ${scenario.name === "mismatched cell identity" ? "other" : "cell-a"}`
                : scenario.name === "empty continuation"
                  ? "Chunk ID: empty\nWall time: 1 seconds\nProcess running with session ID 123\nOutput:\n"
                  : JSON.stringify({
                      output: call.output,
                      session_id:
                        scenario.name === "mismatched continuation identity"
                          ? 999
                          : 123,
                    }),
        },
      });
    if (scenario.name === "intervening developer input")
      builder.withRow({
        type: "response_item",
        payload: { type: "message", role: "developer", content: [] },
      });
    builder
      .withResponse(
        scenario.name === "turn boundary" ? "new-turn" : "turn",
        "after",
        usage,
      )
      .withResponse("turn", "after", usage);
    writeCodexSession(root, builder.please());
  } else {
    const builder = makeMe.aClaudeTranscript
      .forSession("family")
      .withAssistant({
        uuid: "before",
        messageId: "before",
        usage,
        ...(scenario.name === "covered window"
          ? { timestamp: "2026-11-13T00:00:00.000Z" }
          : {}),
        content: (scenario.name === "streamed missing result"
          ? uniqueCalls.slice(0, 1)
          : uniqueCalls
        ).map((call) => ({
          type: "tool_use",
          id: call.id,
          name:
            scenario.name === "clock only"
              ? "mcp__clock__curr_time"
              : scenario.name === "empty initial launch"
                ? "Bash"
                : scenario.name === "unsupported wrapper"
                  ? "exec"
                  : "TaskOutput",
          input: { task_id: "running" },
        })),
      });
    if (scenario.name === "streamed missing result")
      builder.withAssistant({
        uuid: "before-stream",
        messageId: "before",
        usage,
        content: [
          {
            type: "tool_use",
            id: "tool-1",
            name: "TaskOutput",
            input: { task_id: "running" },
          },
        ],
      });
    const results = [
      "incomplete result batch",
      "streamed missing result",
    ].includes(scenario.name)
      ? calls.slice(0, 1)
      : calls;
    for (const [index, call] of results.entries())
      builder.withUser({
        uuid:
          scenario.name === "conflicting native uuid"
            ? "conflicting-result"
            : `result-${index}`,
        content: [
          {
            type: "tool_result",
            tool_use_id:
              scenario.name === "missing pairing" ? "absent" : call.id,
            content: [
              "mismatched continuation identity",
              "mismatched cell identity",
            ].includes(scenario.name)
              ? "<retrieval_status>timeout</retrieval_status><task_id>other</task_id>"
              : call.output === ""
                ? "<retrieval_status>timeout</retrieval_status>"
                : call.output,
          },
        ],
      });
    if (
      ["intervening developer input", "turn boundary"].includes(scenario.name)
    )
      builder.withUser({ uuid: "developer", content: "new input" });
    builder.withAssistant({ uuid: "after", messageId: "after", usage });
    // Repeated assistant streaming rows retain one shared response identity.
    builder.withAssistant({
      uuid: "after-copy",
      messageId: "after",
      parentUuid: ["intervening developer input", "turn boundary"].includes(
        scenario.name,
      )
        ? "developer"
        : scenario.name === "conflicting native uuid"
          ? "conflicting-result"
          : `result-${results.length - 1}`,
      usage,
    });
    writeClaudeSession(path.join(home, "claude"), builder.please());
  }
}
