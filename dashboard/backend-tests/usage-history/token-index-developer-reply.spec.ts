// A launch's usage includes its Claude Code replies and their workers.
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, onTestFinished, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { retainedLaunchEnds } from "../../server/retainedUsageTasks.ts";
import { tokenIndexAnswer } from "../../server/tokenIndexRead.ts";
import {
  readUsageHistory,
  taskUsage,
  type UsageHistory,
} from "../../server/usageHistory.ts";
import {
  importUsageHistory,
  usageHistorySince,
} from "../../server/usageImport.ts";
import type { UsageResponses } from "../../server/usageResponsesFile.ts";
import { deriveUsageTaskSummary } from "../../server/usageTaskSummary.ts";
import { usageTariffs } from "../../server/usageTariffs.ts";
import { defaultCohort } from "../../src/usageTokenIndex.ts";
import { keepLaunchRecords } from "../../test-support/support/launchStore.ts";
import {
  claudeIdentity,
  claudeReplyThenLaterLaunch,
  claudeReplyWorker,
  claudeSession,
  launchIn,
  reference,
} from "../../test-support/usage-history/claudeReplyLaunch.ts";
import {
  nativeFile,
  writeClaudeSession,
} from "../../test-support/usage-history/importHarness.ts";

const cohort = { ...defaultCohort, tool: "claude" as const };
const project = makeMe.aPublishedSource.openDough.please();

async function keptLaunch() {
  const home = await mkdtemp(path.join(tmpdir(), "token-index-claude-reply-"));
  onTestFinished(() => rm(home, { recursive: true, force: true }));
  const claudeRoot = path.join(home, "claude");
  const launch = launchIn(claudeIdentity, reference);
  keepLaunchRecords(home, [launch]);
  return {
    launch,
    claudeRoot,
    sources: {
      home,
      store: path.join(home, "usage.json"),
      codexRoots: [],
      claudeRoots: [claudeRoot],
      since: usageHistorySince,
    },
  };
}

async function chartReading({ home, store }: { home: string; store: string }) {
  return {
    projects: [project],
    tariff: usageTariffs.claude,
    summary: await deriveUsageTaskSummary(store),
    launches: await retainedLaunchEnds(home),
    checkedAt: null,
  };
}

type StoredTask = UsageHistory["tasks"][string];

function outputByTask(
  stored: UsageHistory,
  label: (task: StoredTask) => string | null | undefined,
) {
  return Object.fromEntries(
    Object.values(stored.tasks).map((task) => [
      label(task) ?? "none",
      taskUsage(stored, task.id).tokens.output,
    ]),
  );
}

async function responseOwners(
  file: string,
  stored: UsageHistory,
  label: (task: StoredTask) => string | null | undefined,
) {
  const { observations, associations } = JSON.parse(
    await readFile(file, "utf8"),
  ) as UsageResponses;
  return Object.values(associations)
    .map(({ observationId, taskId }) => {
      const task = taskId === null ? undefined : stored.tasks[taskId];
      return [
        observations[observationId]?.responseId,
        task === undefined ? undefined : label(task),
      ];
    })
    .toSorted(([left], [right]) => (left ?? "").localeCompare(right ?? ""));
}

test("a Claude Code reply's root response and the worker it starts count in the launch", async () => {
  const { claudeRoot, sources } = await keptLaunch();
  writeClaudeSession(
    claudeRoot,
    claudeSession()
      .withDeveloperReply()
      .withWorkerResult({ agentId: "worker" })
      .please(),
  );
  nativeFile(
    path.join(claudeRoot, "claude", "subagents"),
    "agent-worker",
    claudeReplyWorker(),
  );

  await importUsageHistory(sources);
  const answer = tokenIndexAnswer(await chartReading(sources), cohort);

  // Launch response 1,950, reply response 2,950 and worker 1,950.
  expect(answer.tasks.map(({ identity, index }) => [identity, index])).toEqual([
    [claudeIdentity, 6_850],
  ]);
});

test("a Claude Code reply after the launch's completion report still counts in the launch", async () => {
  const { claudeRoot, sources } = await keptLaunch();
  writeClaudeSession(
    claudeRoot,
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
              receivedAt: "2026-11-14T12:00:00.000Z",
            }),
          },
        ],
      })
      .withUser({ uuid: "reply", content: "thanks, also rename it" })
      .withCountedOpusResponse({ uuid: "after-reply", outputTokens: 300 })
      .please(),
  );

  await importUsageHistory(sources);
  const answer = tokenIndexAnswer(await chartReading(sources), cohort);

  expect(answer.tasks.map(({ identity, index }) => [identity, index])).toEqual([
    [claudeIdentity, 4_900],
  ]);
});

test.each([
  {
    form: "workflow typed",
    typeLanding: (session: ReturnType<typeof claudeSession>) =>
      session.withUser({ uuid: "land", content: "/dough-land" }),
  },
  {
    form: "slash workflow without arguments",
    typeLanding: (session: ReturnType<typeof claudeSession>) =>
      session.withSlashCommand({ uuid: "land", name: "dough-land" }),
  },
])(
  "a Claude Code $form starts its own attribution that survives repeated import",
  async ({ typeLanding }) => {
    const { claudeRoot, sources } = await keptLaunch();
    const options = {
      ...sources,
      responses: path.join(sources.home, "responses.json"),
    };
    writeClaudeSession(
      claudeRoot,
      typeLanding(claudeSession().withDeveloperReply())
        .withCountedOpusResponse({ uuid: "landing", outputTokens: 700 })
        .withUser({ uuid: "ok", content: "ok" })
        .withCountedOpusResponse({ uuid: "after-ok", outputTokens: 900 })
        .please(),
    );

    await importUsageHistory(options);
    const first = await readUsageHistory(sources.store);
    await importUsageHistory(options);
    const repeated = await readUsageHistory(sources.store);

    const workflow = (task: StoredTask) => task.workflow;
    expect(outputByTask(first, workflow)).toEqual({
      execution: 400,
      "dough-land": 1_600,
    });
    expect(outputByTask(repeated, workflow)).toEqual(
      outputByTask(first, workflow),
    );
    expect(await responseOwners(options.responses, repeated, workflow)).toEqual(
      [
        ["msg-after-ok", "dough-land"],
        ["msg-after-reply", "execution"],
        ["msg-first", "execution"],
        ["msg-landing", "dough-land"],
      ],
    );
  },
);

test("another dashboard launch's reporting context starts its own attribution after a Claude Code reply", async () => {
  const { launch, claudeRoot, sources } = await keptLaunch();
  const later = claudeReplyThenLaterLaunch();
  keepLaunchRecords(sources.home, [launch, later.launch]);
  writeClaudeSession(claudeRoot, later.rows);
  const responses = path.join(sources.home, "responses.json");

  await importUsageHistory({ ...sources, responses });
  const stored = await readUsageHistory(sources.store);

  const launchReference = (task: StoredTask) => task.launchReference;
  expect(outputByTask(stored, launchReference)).toEqual({
    [reference]: 400,
    [later.reference]: 1_600,
  });
  expect(await responseOwners(responses, stored, launchReference)).toEqual([
    ["msg-after-ok", later.reference],
    ["msg-after-reply", reference],
    ["msg-first", reference],
    ["msg-second-first", later.reference],
  ]);
});
