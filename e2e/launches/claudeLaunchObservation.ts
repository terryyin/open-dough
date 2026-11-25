// The native call and durable record belonging to an accepted Claude launch.
import { realpathSync } from "node:fs";
import { sessionRecord } from "../../dashboard/server/launchRecordStore.ts";
import type { AttemptOutcome } from "../../dashboard/src/launchOutcome.ts";
import { openDoughFolder } from "../../dashboard/test-support/agentLaunchSessions.ts";
import { expect } from "../../dashboard/test-support/dashboardTest.ts";
import type { DashboardServer } from "../../dashboard/test-support/support/dashboardServer.ts";
import { keptLaunchRecords } from "../../dashboard/test-support/support/launchStore.ts";
import {
  expectAdHocReportingInput,
  expectReportingBlock,
  installedStoryLaunchInput,
} from "../../dashboard/test-support/support/reportingInputAssertions.ts";

export function readClaudeLaunch(
  dashboard: DashboardServer,
  outcome: AttemptOutcome,
  before: number,
) {
  if (outcome.kind !== "launched" || outcome.session.host !== "claude")
    throw new Error(
      `Expected a launched Claude session: ${JSON.stringify(outcome)}`,
    );
  const record = sessionRecord(
    keptLaunchRecords(dashboard).filter((entry) => "session" in entry),
    outcome.session,
  );
  const launches = dashboard.claudeLaunches();
  expect(launches).toHaveLength(before + 1);
  const started = launches[before];
  if (record === undefined || started === undefined)
    throw new Error("Missing settled Claude record or native launch");
  return { record, started };
}

export function expectInstalledClaudeStory(
  dashboard: DashboardServer,
  { record, started }: ReturnType<typeof readClaudeLaunch>,
  expected: {
    invocation: string;
    handoff: "Established start:" | "Established preparation:";
    workspace: string;
    publishedSha: string;
    instruction?: string;
  },
) {
  const input = installedStoryLaunchInput(started.instruction);
  expect(input.invocation).toBe(expected.invocation);
  expect(input.handoff).toContain(expected.handoff);
  expect(input.handoff).toContain(`- workspace: ${expected.workspace}`);
  expect(input.handoff).toContain(`- publishedSha: ${expected.publishedSha}`);
  expect(input.instruction).toBe(expected.instruction ?? "");
  expect(started.cwd).toBe(realpathSync(expected.workspace));
  expectReportingBlock(input.reporting, record.request, dashboard);
}

export function expectClaudeAdHocDraft(
  dashboard: DashboardServer,
  outcome: AttemptOutcome,
  draft: string,
  name: string,
) {
  const { started, record } = readClaudeLaunch(dashboard, outcome, 0);
  expect(started.name).toBe(name);
  expect(started.cwd).toBe(openDoughFolder(dashboard));
  expectAdHocReportingInput(
    started.instruction ?? "",
    draft,
    record.request,
    dashboard,
  );
}
