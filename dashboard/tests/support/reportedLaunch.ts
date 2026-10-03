// A story's execution launched in Claude through the real start, able to
// report through the installed reporting command its launch input names.

import { execFile } from "node:child_process";
import { writeFileSync } from "node:fs";
import path from "node:path";
import { promisify } from "node:util";
import { expect } from "@playwright/test";
import type { submitCompletion } from "../../server/completionReporting.ts";
import { launchResultSchema } from "../../src/launchOutcome.ts";
import { launch } from "../agentLaunchBoundary.ts";
import type { DashboardServer } from "./dashboardServer.ts";
import type { StartOrigin } from "./startOrigin.ts";

const exec = promisify(execFile);

// Launches the story and answers its native session id and a completed
// report, with a message, that the store records.
export async function launchedStory(
  dashboard: DashboardServer,
  origin: StartOrigin,
  identity: string,
  title: string,
): Promise<{ sessionId: string; report(): Promise<void> }> {
  dashboard.claudeScenario("launched");
  const before = dashboard.claudeLaunchCalls().length;
  const answer = launchResultSchema.parse(
    JSON.parse(
      (
        await launch(dashboard, {
          source: "open-dough",
          host: "claude",
          workflow: "execution",
          identity,
          title,
        })
      ).body,
    ),
  );
  if (answer.kind !== "launched") throw new Error("The launch did not launch.");
  const input = dashboard.claudeLaunchCalls()[before]?.argv.at(-1) ?? "";
  const command = /^- reporting command: (.+)$/m.exec(input)?.[1];
  if (command === undefined) throw new Error("No reporting command");
  const message = path.join(origin.machine, `${title}.txt`);
  writeFileSync(message, "Published. Reminder: check the migration.");
  return {
    sessionId: answer.record.session.sessionId,
    async report() {
      const reported = await exec(
        "bash",
        ["-c", `${command} --outcome completed --message-file '${message}'`],
        { cwd: origin.machine },
      );
      expect(
        (
          JSON.parse(reported.stdout) as Awaited<
            ReturnType<typeof submitCompletion>
          >
        ).state,
      ).toBe("recorded");
    },
  };
}
