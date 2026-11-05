// Fixtures for stale-runner replacement and last-held revive journeys.
import { writeFileSync } from "node:fs";
import path from "node:path";
import type { Page } from "@playwright/test";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import { cursorRunnerLastHeldFile } from "../../server/hosts/cursor/runnerPaths.ts";
import { sessionStateOf } from "../dashboardPage.ts";
import { agentNotRunningLabel } from "./cursorSessionRecovery.ts";
import { expect } from "./cursorStart.ts";

export const secondSessionId = "b2c3d4e5-f6a7-489a-bcde-f0123456789a";
export const thirdSessionId = "c3d4e5f6-a7b8-49ab-8def-0123456789ab";
export const doneSessionId = "d4e5f6a7-b8c9-4abc-9def-123456789abc";
export const failSessionId = "e5f6a7b8-c9d0-4bcd-adef-23456789abcd";

export function writeKeptRecords(
  home: string,
  records: readonly LaunchRecord[],
): void {
  writeFileSync(
    path.join(home, ".open-dough", "dashboard", "agent-launches.json"),
    JSON.stringify({ "open-dough": records }),
  );
}

export function writeLastHeld(
  home: string,
  sessionKeys: readonly string[],
): void {
  writeFileSync(
    cursorRunnerLastHeldFile(home),
    JSON.stringify({ sessionKeys: [...sessionKeys].sort() }),
  );
}

export async function expectNotAgentNotRunning(
  entry: ReturnType<Page["locator"]>,
): Promise<void> {
  await expect(sessionStateOf(entry)).not.toHaveText(agentNotRunningLabel);
}
