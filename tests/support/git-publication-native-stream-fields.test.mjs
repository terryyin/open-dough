// Publication stream fields beyond what the substitute journeys exercise: a
// startup conflict receipt is recognized from the start command's own output
// on every host, so are a one-shot start's policy flags, a preparation
// recheck and the CI coverage a landing's delivery reported, and a journey
// without stream fields is refused.
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

// The fields `journey` derives from one command and its output on `host`.
function journeyFields(journey, host, command, output) {
  const dir = mkdtempSync(join(tmpdir(), "stream-fields-"));
  try {
    const stream = join(dir, "events.jsonl");
    writeFileSync(
      stream,
      streams[host](command, output)
        .map((event) => `${JSON.stringify(event)}\n`)
        .join(""),
    );
    return Object.fromEntries(publicationStreamFields(journey, host, stream));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const startupFields = (host, command, output) =>
  journeyFields("startup-claim-race", host, command, output);

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

test("one-shot policy flags and a recheck are observed on every host", () => {
  const oneShot =
    "node execution-start.mjs start --one-shot --auto-land --push-authorized";
  const recheck =
    "node preparation-assignment.mjs start --one-shot --auto-land --push-authorized && node preparation-assignment.mjs recheck --identity SEED-B#b2";
  for (const host of Object.keys(streams)) {
    assert.deepEqual(
      journeyFields("one-shot-auto-land-blocked", host, oneShot, "{}"),
      {
        "one-shot-start-observed": "true",
        "one-shot-push-authorized": "true",
        "one-shot-default-main": "false",
        "one-shot-auto-land": "true",
      },
      host,
    );
    assert.deepEqual(
      journeyFields("one-shot-refinement-auto-land", host, recheck, "{}"),
      {
        "one-shot-preparation-start-observed": "true",
        "one-shot-preparation-auto-land": "true",
        "ownership-recheck-observed": "true",
      },
      host,
    );
  }
});

test("a landing's CI coverage is observed from delivery on every host", () => {
  const landed = "a".repeat(40);
  const deliver = "node execution-increment-delivery.mjs deliver --host cursor";
  const receipt = (state) =>
    `{"ok":true,"receipt":{"sha":"${landed}","target":"refs/heads/main"},"observation":{"state":"${state}"}}`;
  for (const host of Object.keys(streams)) {
    assert.deepEqual(
      journeyFields("one-shot-result", host, deliver, receipt("unobserved")),
      {
        "one-shot-start-observed": "false",
        "ci-observed-shas": "",
        "ci-unobserved-shas": landed,
      },
      host,
    );
    assert.equal(
      journeyFields("one-shot-queued", host, deliver, receipt("attached"))[
        "ci-observed-shas"
      ],
      landed,
      `${host}: an attached receipt is observed coverage`,
    );
    assert.equal(
      journeyFields(
        "one-shot-auto-land",
        host,
        "node ci-mailbox.mjs register-push watch",
        `CI_OBSERVER {"revision":{"sha":"${landed}","state":"undiscovered"}}`,
      )["ci-observed-shas"],
      landed,
      `${host}: an observer's revision entry is observed coverage`,
    );
    assert.equal(
      journeyFields(
        "one-shot-result",
        host,
        "cat receipt.json",
        receipt("unobserved"),
      )["ci-unobserved-shas"],
      "",
      `${host}: another command's output is no delivery receipt`,
    );
  }
});

test("a journey without stream fields is refused", () => {
  assert.throws(
    () => publicationStreamFields("publish-boundary", "codex", "/dev/null"),
    /no stream fields for publication journey: publish-boundary/,
  );
});
