// A session launched in Claude through the real start, a story's execution or
// an ad-hoc session with an instruction, able to report, as often as asked,
// through the installed reporting command its launch input names.

import { execFile } from "node:child_process";
import { randomUUID } from "node:crypto";
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

// The message a report carries unless the test chooses another.
export const reportedMessage = "Published. Reminder: check the migration.";

// A launched session: its native session id, and a report the store records,
// completed with `reportedMessage` unless asked otherwise. Each report is a
// new one, with its own receipt.
export type ReportedLaunch = {
  readonly sessionId: string;
  report(report?: {
    readonly outcome?: "completed" | "unfinished";
    readonly message?: string;
  }): Promise<void>;
};

// Launches the story's execution.
export function launchedStory(
  dashboard: DashboardServer,
  origin: StartOrigin,
  identity: string,
  title: string,
): Promise<ReportedLaunch> {
  return reportedLaunch(dashboard, origin, {
    workflow: "execution",
    identity,
    title,
  });
}

// Launches an ad-hoc session, which has no story card, with the instruction
// that gives it the reporting channel.
export function launchedAdHoc(
  dashboard: DashboardServer,
  origin: StartOrigin,
  instruction: string,
): Promise<ReportedLaunch> {
  return reportedLaunch(dashboard, origin, {
    workflow: "ad-hoc",
    instruction,
  });
}

async function reportedLaunch(
  dashboard: DashboardServer,
  origin: StartOrigin,
  request: Record<string, string>,
): Promise<ReportedLaunch> {
  dashboard.claudeScenario("launched");
  const before = dashboard.claudeLaunchCalls().length;
  const answer = launchResultSchema.parse(
    JSON.parse(
      (
        await launch(dashboard, {
          source: "open-dough",
          host: "claude",
          ...request,
        })
      ).body,
    ),
  );
  if (answer.kind !== "launched") throw new Error("The launch did not launch.");
  const input = dashboard.claudeLaunchCalls()[before]?.argv.at(-1) ?? "";
  const command = /^- reporting command: (.+)$/m.exec(input)?.[1];
  if (command === undefined) throw new Error("No reporting command");
  return {
    sessionId: answer.record.session.sessionId,
    async report({ outcome = "completed", message = reportedMessage } = {}) {
      const file = path.join(origin.machine, `report-${randomUUID()}.txt`);
      writeFileSync(file, message);
      const reported = await exec(
        "bash",
        ["-c", `${command} --outcome ${outcome} --message-file '${file}'`],
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
