// Compare the saved story launch input with the input sent to Codex.
import type { LaunchRecord } from "../../dashboard/src/launchRecord.ts";
import { expect } from "../../dashboard/test-support/dashboardTest.ts";
import type { DashboardServer } from "../../dashboard/test-support/support/dashboardServer.ts";
import type { FakeCodex } from "../../dashboard/test-support/support/fakeCodex.ts";
import {
  expectReportingBlock,
  installedStoryLaunchInput,
} from "../../dashboard/test-support/support/reportingInputAssertions.ts";

export function expectInstalledCodexStoryInput(
  dashboard: DashboardServer,
  native: FakeCodex,
  record: LaunchRecord | undefined,
  invocation: string,
) {
  const text = record?.firstInput?.instruction;
  const input = installedStoryLaunchInput(text);
  expect(input.invocation).toBe(invocation);
  expectReportingBlock(input.reporting, record?.request, dashboard);
  const turn = native.calls.find(({ method }) => method === "turn/start");
  expect(turn?.params["input"]).toContainEqual({ type: "text", text });
  return input.instruction;
}
