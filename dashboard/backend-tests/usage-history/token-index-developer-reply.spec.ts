// A dashboard launch's Token index includes the turns after a developer reply
// in its Claude Code session, until an input starts another task. Responses run
// Claude Opus 5.5 (list prices read 2026-11-15: input $4, cache read $0.20,
// output $20 per 1M tokens), so 1,000 uncached, 9,000 read and O output tokens
// weigh (1,000×4 + 9,000×0.20 + O×20) / 4 = 1,450 + 5×O input tokens.
import path from "node:path";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { taskUsage } from "../../server/usageHistory.ts";
import { keepLaunchStore } from "../../tests/support/launchStore.ts";
import {
  nativeFile,
  readImported,
  runImport,
  writeClaudeSession,
} from "../../tests/usage-history/importHarness.ts";
import {
  day,
  expect,
  test,
  usageServer,
} from "../../tests/usage-history/tokenIndexHarness.ts";

const reference = "ca7430bd-0d52-499d-a1bd-000000000001";
// A finished launch of story `identity` in session `claude` at `launchedAt`,
// reporting through `launchReference`.
const launchIn = (
  identity: string,
  launchReference: string,
  launchedAt = "2026-11-14T09:00:00.000Z",
) =>
  makeMe.aLaunchRecord
    .executing({ identity, title: `Story ${identity}` })
    .inClaudeSession({ sessionId: "claude" })
    .launchedAt(launchedAt)
    .reportingThrough({
      origin: "http://localhost:4318",
      reference: launchReference,
      command: "report",
    })
    .completedWith({ message: "", receivedAt: day(15) })
    .please();
const claudeLaunch = launchIn("SEED-7#claude", reference);
const response = (uuid: string, output: number) => ({
  uuid,
  messageId: `msg-${uuid}`,
  model: "claude-opus-5-5",
  usage: {
    input_tokens: 1_000,
    cache_read_input_tokens: 9_000,
    cache_creation_input_tokens: 0,
    output_tokens: output,
    speed: "standard",
  },
});
// The launch's session: its launch input answered with 100 output tokens.
const claudeSession = () =>
  makeMe.aClaudeTranscript
    .forSession("claude")
    .withLaunchInput({ reference, command: "report" })
    .withAssistant(response("first", 100));

// Imports the Claude Code session `rows` beside `launches`.
function importClaude(home: string, rows: object[], launches = [claudeLaunch]) {
  const projects = path.join(home, ".claude/projects");
  keepLaunchStore(home, { "open-dough": launches });
  writeClaudeSession(path.join(projects, "open-dough"), rows);
  runImport(home, path.join(home, ".codex/sessions"), [
    "--claude-root",
    projects,
  ]);
  return readImported(home);
}
// Each imported task's output tokens, keyed by `key`.
function outputs(
  stored: ReturnType<typeof readImported>,
  key: (task: (typeof stored.tasks)[string]) => string,
) {
  return Object.fromEntries(
    Object.values(stored.tasks).map((task) => [
      key(task),
      taskUsage(stored, task.id).tokens.output,
    ]),
  );
}

async function claudeIndex(
  machine: Parameters<typeof usageServer>[0],
  rows: object[],
) {
  importClaude(machine.home, rows);
  const usage = await usageServer(machine);
  await usage.refresh();
  const chart = await usage.chart("?tool=claude");
  return chart.tasks.map(({ identity, index }) => [identity, index]);
}

test("a Claude Code reply's root response and the worker it starts count in the launch", async ({
  machine,
}) => {
  const transcripts = path.join(machine.home, ".claude/projects/open-dough");
  nativeFile(path.join(transcripts, "claude", "subagents"), "agent-worker", [
    ...makeMe.aClaudeTranscript
      .forSession("claude")
      .asSidechain({ agentId: "worker" })
      .withUser({ uuid: "worker-input", parentUuid: null, content: "work" })
      .withAssistant(response("worker", 100))
      .please(),
  ]);
  const index = await claudeIndex(
    machine,
    claudeSession()
      .withUser({ uuid: "reply", content: "1" })
      .withAssistant(response("after-reply", 300))
      .withUser({
        uuid: "worker-result",
        toolUseResult: { agentId: "worker" },
        content: [{ type: "tool_result", tool_use_id: "tool-1", content: "" }],
      })
      .please(),
  );
  // Launch response 1,950, reply response 2,950 and worker 1,950.
  expect(index).toEqual([["SEED-7#claude", 6_850]]);
});

test("a Claude Code reply after the launch's completion report still counts in the launch", async ({
  machine,
}) => {
  const index = await claudeIndex(
    machine,
    claudeSession()
      .withUser({
        uuid: "receipt",
        content: [
          {
            type: "tool_result",
            tool_use_id: "report",
            content: JSON.stringify({
              state: "recorded",
              reference,
              outcome: "completed",
              message: "",
              receivedAt: day(14),
            }),
          },
        ],
      })
      .withUser({ uuid: "reply", content: "thanks, also rename it" })
      .withAssistant(response("after-reply", 300))
      .please(),
  );
  // Launch response 1,950 and reply response 2,950.
  expect(index).toEqual([["SEED-7#claude", 4_900]]);
});

// The workflow is typed as text or as a slash command, which Claude Code wraps
// without a <command-args> element when given no arguments.
for (const [form, typeLanding] of [
  [
    "workflow typed",
    (session: ReturnType<typeof claudeSession>) =>
      session.withUser({ uuid: "land", content: "/dough-land" }),
  ],
  [
    "slash workflow without arguments",
    (session: ReturnType<typeof claudeSession>) =>
      session.withSlashCommand({ uuid: "land", name: "dough-land" }),
  ],
] as const) {
  test(`a Claude Code ${form} after an execution takes its own turns and later replies; no response counts twice`, ({
    machine,
  }) => {
    const stored = importClaude(
      machine.home,
      typeLanding(
        claudeSession()
          .withUser({ uuid: "reply", content: "1" })
          .withAssistant(response("after-reply", 300)),
      )
        .withAssistant(response("landing", 700))
        .withUser({ uuid: "ok", content: "ok" })
        .withAssistant(response("after-ok", 900))
        .please(),
    );
    expect(outputs(stored, (task) => task.workflow ?? "none")).toEqual({
      execution: 400,
      "dough-land": 1_600,
    });
    expect(Object.keys(stored.associations)).toHaveLength(4);
  });
}

test("another dashboard launch's reporting context after a Claude Code reply takes its own turns and later replies; no response counts twice", ({
  machine,
}) => {
  const second = "ca7430bd-0d52-499d-a1bd-000000000002";
  const stored = importClaude(
    machine.home,
    claudeSession()
      .withUser({ uuid: "reply", content: "1" })
      .withAssistant(response("after-reply", 300))
      .withLaunchInput({ uuid: "second-launch", reference: second })
      .withAssistant(response("second-first", 700))
      .withUser({ uuid: "ok", content: "ok" })
      .withAssistant(response("after-ok", 900))
      .please(),
    [
      claudeLaunch,
      launchIn("SEED-7#second", second, "2026-11-14T09:30:00.000Z"),
    ],
  );
  // Launch input and reply in the first launch; the second's input and "ok".
  expect(outputs(stored, (task) => task.launchReference ?? "none")).toEqual({
    [reference]: 400,
    [second]: 1_600,
  });
  expect(Object.keys(stored.associations)).toHaveLength(4);
});
