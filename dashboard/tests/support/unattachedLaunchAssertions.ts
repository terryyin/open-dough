// Native calls and retained evidence for an unattached session, whether its
// default choices launch directly or its landing choice establishes a start.

import { existsSync, realpathSync } from "node:fs";
import path from "node:path";
import { expect } from "@playwright/test";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import type { EstablishedSession } from "../../src/unattachedSession.ts";
import { recordsOf } from "../agentLaunchBoundary.ts";
import type { DashboardServer } from "./dashboardServer.ts";
import { expectReportingBlock } from "./reportingInputAssertions.ts";
import {
  defaultMainSession,
  defaultMainStart,
  sessionBlock,
  type StartCall,
} from "./startSessionLanding.ts";

export function expectNamedAdHocCall(
  dashboard: DashboardServer,
  source: string,
  project: string,
  instruction: string,
) {
  expect(dashboard.claudeLaunchCalls()).toEqual([
    {
      argv: [
        "--bg",
        "--name",
        `${project} · Ad hoc · ${instruction}`,
        instruction,
      ],
      cwd: realpathSync(path.join(dashboard.home, "git", source)),
    },
  ]);
}

export async function expectNoSessionEstablishment(dashboard: DashboardServer) {
  // Even successful establishment leaves its write-ahead store on disk, so
  // absence observes that no start ran rather than merely that none is kept.
  expect(
    existsSync(
      path.join(dashboard.home, ".open-dough/dashboard/session-starts.json"),
    ),
  ).toBe(false);
  const [record] = (await recordsOf(dashboard, "open-dough")) as LaunchRecord[];
  expect(record).not.toHaveProperty("establishedSession");
  expect(record?.request).not.toHaveProperty("policy");
  return record;
}

export async function expectDefaultMainSessionLaunch(
  dashboard: DashboardServer,
  project: string,
  landing: EstablishedSession["landing"],
  revision: string,
  text: string,
  starts: () => StartCall[],
) {
  await expect.poll(() => dashboard.claudeLaunchCalls()).toHaveLength(1);
  const [call] = dashboard.claudeLaunchCalls();
  expect(call?.cwd).toBe(realpathSync(project));
  await expect.poll(() => recordsOf(dashboard, "open-dough")).toHaveLength(1);
  const [record] = (await recordsOf(dashboard, "open-dough")) as LaunchRecord[];
  const session = defaultMainSession(project, landing, revision);
  expect(record?.establishedSession).toEqual(session);
  const [block, reporting, ...developer] = (call?.argv.at(-1) ?? "").split(
    "\n\n",
  );
  expect(block).toBe(sessionBlock(session));
  expectReportingBlock(reporting, record?.request, dashboard);
  expect(developer).toEqual([text]);
  expect(starts().map(({ argv }) => argv)).toEqual([
    defaultMainStart(project, landing),
  ]);
  return record;
}
