// Claude Code coverage from imported transcripts: its own gaps that show usage
// missing make a task partial, while the background work no transcript
// records is no task's gap. Each root response runs Claude Opus 5.5 (Anthropic
// API list prices read 2026-11-15: input $4, cache read $0.20, output $20 per
// 1M tokens), so 1,000 uncached, 9,000 read and O output tokens weigh
// (1,000×4 + 9,000×0.20 + O×20) / 4 = 1,450 + 5×O Opus 5.5 input tokens.
import path from "node:path";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { keepLaunchStore } from "../../tests/support/launchStore.ts";
import {
  nativeFile,
  readImported,
  runImport,
  writeClaudeSession,
} from "../../tests/usage-history/importHarness.ts";
import {
  expect,
  test,
  usageServer,
} from "../../tests/usage-history/tokenIndexHarness.ts";

const usage = (output: number) => ({
  input_tokens: 1_000,
  cache_read_input_tokens: 9_000,
  cache_creation_input_tokens: 0,
  output_tokens: output,
  speed: "standard",
});
const reference = (at: number) =>
  `ca7430bd-0d52-499d-a1bd-${String(at).padStart(12, "0")}`;
// Launch `at` of a Claude story in session `claude-<at>`.
const launch = (at: number) =>
  makeMe.aLaunchRecord
    .executing({ identity: `SEED-7#claude-${at}`, title: `Story ${at}` })
    .inClaudeSession({ sessionId: `claude-${at}` })
    .reportingThrough({
      origin: "http://localhost:4318",
      reference: reference(at),
      command: "report",
    });
// The session's response that ends it on hour `10 + at` of 2026-11-14.
const response = (at: number, output: number) => ({
  uuid: `response-${at}`,
  messageId: `msg-${at}`,
  model: "claude-opus-5-5",
  timestamp: `2026-11-14T${String(10 + at).padStart(2, "0")}:00:00.000Z`,
  usage: usage(output),
});

test("Claude launches whose root or worker transcript is gone are partial with that gap and out of the moving average, while launches with only the background-work limit stay measured", async ({
  machine,
}) => {
  const measured = [...Array<number>(10).keys()].map((at) => at + 1);
  keepLaunchStore(machine.home, {
    "open-dough": [
      ...[...measured, 11].map((at) =>
        launch(at).markedDoneAt("2026-11-14T23:00:00.000Z").please(),
      ),
      // It reported completion at 22:00, ending after every measured launch.
      launch(12)
        .launchedAt("2026-11-14T22:00:00.000Z")
        .completedWith({ message: "" })
        .please(),
    ],
  });
  const claudeRoot = path.join(machine.home, "claude");
  for (const at of measured)
    writeClaudeSession(
      claudeRoot,
      makeMe.aClaudeTranscript
        .forSession(`claude-${at}`)
        .withLaunchInput({ reference: reference(at), command: "report" })
        .withAssistant(response(at, 100 * at))
        .please(),
    );
  // `claude-11`'s root spawned a worker whose transcript is gone.
  writeClaudeSession(
    claudeRoot,
    makeMe.aClaudeTranscript
      .forSession("claude-11")
      .withLaunchInput({ reference: reference(11), command: "report" })
      .withUser({
        uuid: "worker-result",
        toolUseResult: { agentId: "lost" },
        content: [{ type: "tool_result", tool_use_id: "tool-1", content: "" }],
      })
      .withAssistant(response(11, 100))
      .please(),
  );
  // Only the worker's transcript of `claude-12` remains, under `subagents/`.
  nativeFile(path.join(claudeRoot, "claude-12", "subagents"), "agent-worker", [
    ...makeMe.aClaudeTranscript
      .forSession("claude-12")
      .asSidechain({ agentId: "worker" })
      .withUser({ uuid: "worker-input", parentUuid: null, content: "work" })
      .withAssistant(response(12, 1_000_000))
      .please(),
  ]);
  runImport(machine.home, path.join(machine.home, "codex"), [
    "--claude-root",
    claudeRoot,
  ]);
  expect(
    readImported(machine.home)
      .gaps.filter(({ sessionId }) => sessionId === "claude-1")
      .map(({ code }) => code),
  ).toEqual(["auxiliary-usage-not-covered"]);

  const answer = await (await usageServer(machine)).chart("?tool=claude");
  const coverage: Record<string, unknown> = {};
  for (const { identity, coverage: taskCoverage } of answer.tasks)
    if (identity !== null) coverage[identity] = taskCoverage;
  expect(coverage).toMatchObject({
    "SEED-7#claude-1": { kind: "measured" },
    "SEED-7#claude-11": { kind: "partial", gaps: ["missing-worker-evidence"] },
    "SEED-7#claude-12": {
      kind: "partial",
      gaps: ["missing-root-transcript-usage", "no-attributable-response-usage"],
    },
  });
  expect(
    answer.tasks
      .filter(({ coverage }) => coverage.kind === "measured")
      .map(({ identity }) => identity),
  ).toEqual(measured.map((at) => `SEED-7#claude-${at}`));
  // Indices 1,450 + 500×k for k = 1…10: their mean is 4,200, the only
  // average point, at the tenth measured launch's end.
  expect(answer.average).toEqual([
    { at: "2026-11-14T20:00:00.000Z", value: 4_200 },
  ]);
});
