// A dashboard launch's Token index includes the turns after a developer reply
// in its Claude Code session, until an input starts another task.
import { taskUsage } from "../../server/usageHistory.ts";
import {
  claudeLaunch,
  claudeSession,
  importClaude,
  launchIn,
  reference,
  refreshedClaudeIndex,
  repliedSession,
  response,
  workerResult,
  writeWorker,
} from "../../test-support/usage-history/claudeReplyLaunch.ts";
import { readImported } from "../../test-support/usage-history/importHarness.ts";
import {
  day,
  expect,
  test,
  usageServer,
} from "../../test-support/usage-history/tokenIndexHarness.ts";

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
  return refreshedClaudeIndex(machine);
}

test("a Claude Code reply's root response and the worker it starts count in the launch", async ({
  machine,
}) => {
  writeWorker(machine.home);
  const index = await claudeIndex(
    machine,
    repliedSession().withUser(workerResult).please(),
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
      typeLanding(repliedSession())
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
    repliedSession()
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
