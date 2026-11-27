// Native calls and retained evidence for an unattached session, whether its
// default choices launch directly or its landing choice establishes a start.

import { realpathSync } from "node:fs";
import path from "node:path";
import { expect } from "@playwright/test";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import type { EstablishedSession } from "../../src/unattachedSession.ts";
import { recordsOf } from "../agentLaunchBoundary.ts";
import type { DashboardServer } from "./dashboardServer.ts";
import {
  adHocDeveloperInput,
  expectAdHocReportingInput,
} from "./reportingInputAssertions.ts";
import {
  executionCheckoutSession,
  executionCheckoutStart,
  sessionBlock,
  type StartCall,
} from "./startSessionLanding.ts";

export function expectNamedAdHocCall(
  dashboard: DashboardServer,
  source: string,
  project: string,
  instruction: string,
) {
  expect(
    dashboard.claudeLaunches().map((launch) => ({
      ...launch,
      instruction: adHocDeveloperInput(launch.instruction ?? ""),
    })),
  ).toMatchObject([
    {
      name: `${project} · Ad hoc · ${instruction}`,
      instruction,
      cwd: realpathSync(path.join(dashboard.home, "git", source)),
    },
  ]);
}

export async function expectBorrowedLaunch(dashboard: DashboardServer) {
  const [record] = (await recordsOf(dashboard, "open-dough")) as LaunchRecord[];
  expect(record).not.toHaveProperty("establishedSession");
  expect(record?.request).not.toHaveProperty("policy");
  expect(realpathSync(record?.defaultStart?.workspace ?? "")).toBe(
    realpathSync(path.join(dashboard.home, "git", "open-dough")),
  );
  return record;
}

export async function expectExecutionCheckoutSessionLaunch(
  dashboard: DashboardServer,
  project: string,
  landing: EstablishedSession["landing"],
  revision: string,
  text: string,
  starts: () => StartCall[],
) {
  await expect.poll(() => dashboard.claudeLaunches()).toHaveLength(1);
  const [started] = dashboard.claudeLaunches();
  expect(started?.cwd).toBe(realpathSync(project));
  await expect.poll(() => recordsOf(dashboard, "open-dough")).toHaveLength(1);
  const [record] = (await recordsOf(dashboard, "open-dough")) as LaunchRecord[];
  const session = executionCheckoutSession(project, landing, revision);
  expect(record?.establishedSession).toEqual(session);
  expect(
    expectAdHocReportingInput(
      started?.instruction ?? "",
      text,
      record?.request,
      dashboard,
      sessionBlock(session),
    ),
  ).toEqual([]);
  expectBorrowedStarts(starts, project, landing, record, dashboard.home);
  return record;
}

export function launchStoryIdentity(record: LaunchRecord | undefined): string {
  const request = record?.request;
  if (request?.workflow !== "ad-hoc" || request.storyIdentity === undefined)
    throw new Error("The ad hoc launch has no admitted story.");
  return request.storyIdentity;
}

export function expectBorrowedStarts(
  starts: () => StartCall[],
  project: string,
  landing: EstablishedSession["landing"],
  record: LaunchRecord | undefined,
  home: string,
) {
  const reference = record?.request.reporting?.reference;
  expect(starts()).toEqual([
    {
      argv: executionCheckoutStart(project, landing),
      cwd: realpathSync(project),
    },
    {
      argv: expect.arrayContaining([
        "--admit",
        "--identity",
        launchStoryIdentity(record),
        "--workspace",
        path.join(
          home,
          ".open-dough/dashboard/admission-worktrees",
          reference ?? "",
        ),
        "--branch",
        `dough/admit-${reference}`,
      ]),
      cwd: realpathSync(project),
    },
  ]);
}
