import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { launch } from "../../test-support/agentLaunchBoundary.ts";
import {
  expect,
  keptRecord,
  test,
} from "../../test-support/support/cursorStart.ts";
import { landingHandoff } from "../../test-support/support/startSessionLandingContext.ts";
import { launchStoryIdentity } from "../../test-support/support/unattachedLaunchAssertions.ts";

test("a blank Cursor Start gives the handoff only to its native Shell hook", async ({
  dashboard,
  cursor,
}) => {
  await launch(
    dashboard,
    makeMe.aLaunchRequest
      .adHoc({ host: "cursor" })
      .withPolicy({ workspace: "isolated", landing: "auto-land" })
      .please(),
  );
  const record = keptRecord(dashboard.home);
  const { session, file, reporting } = landingHandoff(record);
  const script =
    ".agents/skills/dough-execute-plan/scripts/session-landing-handoff.mjs";
  const hook = (conversationId: string) =>
    JSON.parse(
      execFileSync(
        process.execPath,
        [join(session.workspace, script), "--cursor-hook"],
        {
          cwd: session.workspace,
          env: { ...process.env, HOME: dashboard.home },
          encoding: "utf8",
          input: JSON.stringify({
            cursor_version: "test",
            hook_event_name: "postToolUse",
            tool_name: "Shell",
            tool_input: { command: `node ${script}` },
            conversation_id: conversationId,
            cwd: session.workspace,
          }),
        },
      ),
    ) as { additional_context?: string };
  const saved = hook(cursor.sessionId);
  expect(saved.additional_context).toContain("- landing: auto-land");
  expect(saved.additional_context).toContain(
    `Taken story: ${launchStoryIdentity(record)}`,
  );
  expect(saved.additional_context).toContain(`Landing context: ${file}`);
  expect(saved.additional_context).toContain(
    `- reporting command: ${reporting.command}`,
  );
  expect(hook("another-conversation")).toEqual({});
});
