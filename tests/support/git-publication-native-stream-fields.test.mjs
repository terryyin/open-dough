// Publication stream fields beyond what the substitute journeys exercise: a
// startup conflict receipt is recognized from the start command's own output
// on every host, and a journey without stream fields is refused.
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { publicationStreamFields } from "./git-publication-native-stream-fields.mjs";

const start = "node execution-start.mjs start --identity SEED-A#a";
const conflict = '{"ok":false,"status":"conflict","owner":"rival"}';

// One started and completed command in each host's stream shape.
const streams = {
  claude: (command, output) => [
    {
      type: "assistant",
      message: {
        content: [
          { type: "tool_use", id: "t1", name: "Bash", input: { command } },
        ],
      },
    },
    {
      type: "user",
      message: {
        content: [{ type: "tool_result", tool_use_id: "t1", content: output }],
      },
    },
    { type: "result", result: "done" },
  ],
  codex: (command, output) => [
    {
      type: "item.started",
      item: { id: "i1", type: "command_execution", command },
    },
    {
      type: "item.completed",
      item: {
        id: "i1",
        type: "command_execution",
        command,
        aggregated_output: output,
      },
    },
    { type: "turn.completed" },
  ],
  cursor: (command, output) => [
    {
      type: "tool_call",
      subtype: "started",
      call_id: "c1",
      tool_call: { shellToolCall: { args: { command } } },
    },
    {
      type: "tool_call",
      subtype: "completed",
      call_id: "c1",
      tool_call: {
        shellToolCall: {
          args: { command },
          result: { success: { stdout: output } },
        },
      },
    },
    { type: "result", result: "done" },
  ],
};

function startupFields(host, command, output) {
  const dir = mkdtempSync(join(tmpdir(), "stream-fields-"));
  try {
    const stream = join(dir, "events.jsonl");
    writeFileSync(
      stream,
      streams[host](command, output)
        .map((event) => `${JSON.stringify(event)}\n`)
        .join(""),
    );
    return Object.fromEntries(
      publicationStreamFields("startup-claim-race", host, stream),
    );
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

test("a start command's conflict receipt is observed on every host", () => {
  for (const host of Object.keys(streams)) {
    assert.deepEqual(
      startupFields(host, start, conflict),
      {
        "startup-cli-count": 1,
        "startup-conflict-observed": "true",
      },
      host,
    );
    assert.equal(
      startupFields(host, "cat receipt.json", conflict)[
        "startup-conflict-observed"
      ],
      "false",
      `${host}: another command's output is no startup receipt`,
    );
  }
});

test("a journey without stream fields is refused", () => {
  assert.throws(
    () => publicationStreamFields("publish-boundary", "codex", "/dev/null"),
    /no stream fields for publication journey: publish-boundary/,
  );
});
