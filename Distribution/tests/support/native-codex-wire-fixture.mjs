// Low-level codec inputs: exact native envelopes and their observation bounds.
// These rows arrange wire facts; they do not fabricate product/model behavior.
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

export function captureCodexWaitSession(
  t,
  change = () => {},
  { waits = 4 } = {},
) {
  const directory = mkdtempSync(join(tmpdir(), "codex-receipts-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const rows = [];
  const at = (ms) => new Date(ms).toISOString();
  const row = (type, payload, ms = 1000) =>
    rows.push({ type, payload, timestamp: at(ms) });
  row("session_meta", { id: "owner" });
  row("event_msg", { type: "task_started", turn_id: "hold" });
  row("event_msg", { type: "task_complete", turn_id: "hold" });
  row("event_msg", { type: "task_started", turn_id: "watch" });
  row("turn_context", { turn_id: "watch", cwd: "/workspace" });
  const response = (number, ms) =>
    row(
      "token_usage_record",
      {
        thread_id: "owner",
        turn_id: "watch",
        root_turn_id: "watch",
        response_id: `response-${number}`,
        usage: {
          input_tokens: 2,
          cached_input_tokens: 1,
          output_tokens: 1,
          total_tokens: 3,
        },
      },
      ms,
    );
  const call = (number, kind, args, receipt, direct = false) => {
    const ms = 2000 + number * 1000;
    row(
      "response_item",
      direct
        ? {
            type: "function_call",
            name: `functions.${kind}`,
            call_id: `call-${number}`,
            arguments: JSON.stringify(args),
          }
        : {
            type: "custom_tool_call",
            name: "exec",
            call_id: `call-${number}`,
            input: `// @exec: {"yield_time_ms": 1000}\ntext(await tools.${kind}(${JSON.stringify(args)}));\n`,
          },
      ms,
    );
    response(number, ms + 1);
    row(
      "response_item",
      {
        type: direct ? "function_call_output" : "custom_tool_call_output",
        call_id: `call-${number}`,
        id: `receipt-${number}`,
        output: [
          { type: "input_text", text: "Script completed\nOutput:\n" },
          { type: "input_text", text: JSON.stringify(receipt) },
        ],
      },
      ms + 100,
    );
  };
  call(
    0,
    "exec_command",
    { cmd: "node supplier-publication-watch.mjs" },
    { session_id: 41, output: "watching", original_token_count: 1 },
  );
  for (let n = 1; n <= waits; n++)
    call(
      n,
      "write_stdin",
      { session_id: 41, chars: "" },
      { session_id: 41, output: "", original_token_count: 0 },
      n === 2,
    );
  response(5, 7100);
  row("event_msg", { type: "task_complete", turn_id: "watch" }, 21000);
  change(rows);
  const file = join(directory, "session.jsonl");
  writeFileSync(file, `${rows.map(JSON.stringify).join("\n")}\n`);
  const observations = new Map([
    ["turn-2-watch-start-ms", "1000"],
    ["turn-2-publication-1-ms", "10000"],
    ["turn-2-publication-2-ms", "20000"],
    ["turn-2-publication-1-begin-ms", "9000"],
    ["turn-2-publication-2-begin-ms", "19000"],
  ]);
  return { file, observations };
}

export const codexReceiptRows = (rows) =>
  rows.filter((row) => row.payload.type?.endsWith("_output"));

export function replaceCodexReceipt(rows, index, receipt) {
  codexReceiptRows(rows)[index].payload.output = [
    { type: "input_text", text: JSON.stringify(receipt) },
  ];
}

// Arrange a second genuine launch in the same literal wrapper. Session routing
// stays in the codec owner rather than introducing another native wire writer.
export function addSecondCodexWatch(rows, waitNumbers) {
  const launch = rows.find((row) => row.payload.call_id === "call-0");
  launch.payload.input +=
    'text(await tools.exec_command({cmd:"node second-watch.mjs"}));';
  codexReceiptRows(rows)[0].payload.output.push({
    type: "input_text",
    text: JSON.stringify({
      session_id: 42,
      output: "watching second",
      original_token_count: 2,
    }),
  });
  for (const number of waitNumbers) {
    const call = rows.find((row) => row.payload.call_id === `call-${number}`);
    if (call.payload.arguments)
      call.payload.arguments = JSON.stringify({ session_id: 42, chars: "" });
    else
      call.payload.input = call.payload.input.replace(
        '"session_id":41',
        '"session_id":42',
      );
    replaceCodexReceipt(rows, number, {
      session_id: 42,
      output: "",
      original_token_count: 0,
    });
  }
}
