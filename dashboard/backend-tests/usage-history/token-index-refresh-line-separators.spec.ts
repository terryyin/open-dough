// Refresh reads native rows as import does: a raw U+2028 or U+2029 inside a
// Claude Code row keeps the row whole, so its response and the response
// climbing through it reach their launch.
import path from "node:path";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { taskUsage } from "../../server/usageHistory.ts";
import { keepLaunchStore } from "../../tests/support/launchStore.ts";
import {
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

const sessionId = "claude-separated";
const reference = "ca7430bd-0d52-499d-a1bd-000000000001";

test("a Refresh counts a Claude Code row whose text holds line separators and the response climbing through it", async ({
  machine,
}) => {
  const { home } = machine;
  const projects = path.join(home, ".claude/projects");
  runImport(home, path.join(home, ".codex/sessions"), [
    "--claude-root",
    projects,
  ]);
  const usage = await usageServer(machine);
  keepLaunchStore(home, {
    "open-dough": [
      makeMe.aLaunchRecord
        .executing({ identity: "SEED-7#separated", title: "Separated rows" })
        .inClaudeSession({ sessionId })
        .reportingThrough({
          origin: "http://localhost:4318",
          reference,
          command: "report",
        })
        .completedWith({ receivedAt: day(1) })
        .please(),
    ],
  });
  writeClaudeSession(
    path.join(projects, "open-dough"),
    makeMe.aClaudeTranscript
      .forSession(sessionId)
      .withLaunchInput({ reference, command: "report" })
      .withAssistantHoldingLineSeparators()
      .withCountedAssistant()
      .please(),
  );

  await usage.refresh();

  const history = readImported(home);
  const task = Object.values(history.tasks).find(
    (item) => item.kind === "launch",
  );
  expect(task && taskUsage(history, task.id).requests).toBe(2);
});
