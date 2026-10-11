// What the unattached landing-capture specs assert on a real start origin
// (./startOrigin.ts) with the synthetic `claude`: a raw launch with its first
// message, the landing handoff that message and the launch's attempt carry,
// a raw landing request, and a landing made through the installed
// publication (./startSessionLandingContext.ts) as the launch record keeps it.

import { expect } from "@playwright/test";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import { keptAttempts } from "../acceptedAttempts.ts";
import { launch, recordsOf } from "../agentLaunchBoundary.ts";
import type { DashboardServer } from "./dashboardServer.ts";
import { commit } from "./launchLanding.ts";
import { rawRequest } from "./rawHttp.ts";
import { expectReportingBlock } from "./reportingInputAssertions.ts";
import { originMain } from "./sessionDialog.ts";
import type { StartOrigin } from "./startOrigin.ts";
import { sessionBlock } from "./startSessionLanding.ts";
import {
  land,
  landingHandoff,
  repositoryOf,
} from "./startSessionLandingContext.ts";

export type UnattachedPolicy = {
  workspace: "isolated" | "default-checkout";
  landing: "review" | "auto-land";
};
export const adHocRequest = {
  source: "open-dough",
  workflow: "ad-hoc",
  host: "claude",
};

// Launches over raw HTTP and answers the record kept and the first message.
export async function launched(dashboard: DashboardServer, body: object) {
  dashboard.claudeScenario("launched");
  const calls = dashboard.claudeLaunchCalls().length;
  const answer = JSON.parse(
    (await launch(dashboard, { ...adHocRequest, ...body })).body,
  ) as { kind: string; record?: LaunchRecord };
  expect(answer.kind).toBe("launched");
  if (answer.record === undefined) throw new Error("Missing launch record.");
  return {
    record: answer.record,
    sent: dashboard.claudeLaunchCalls()[calls]?.argv.at(-1) ?? "",
  };
}

// The first message's reporting context names the launch's landing context,
// whose file names the launch and its trunk target and no identity, and the
// attempt holds the capture authority for the session's workspace.
export function expectLandingHandoff(
  record: LaunchRecord,
  sent: string,
  dashboard: DashboardServer,
  project: string,
) {
  const { session, reporting, file, context } = landingHandoff(record);
  const [block, reportingBlock, ...extra] = sent.split("\n\n");
  expect(block).toBe(sessionBlock(session));
  expect(extra).toEqual([]);
  expectReportingBlock(reportingBlock, record.request, dashboard);
  expect(reportingBlock).toContain(`--landing-context '${file}'`);
  expect(context).toEqual({
    origin: dashboard.origin,
    source: "open-dough",
    host: "claude",
    reference: reporting.reference,
    remote: "origin",
    target: "refs/heads/main",
  });
  expect(
    keptAttempts(dashboard).find((entry) => entry.id === reporting.reference)
      ?.landingRepository,
  ).toEqual({
    repository: repositoryOf(project),
    workspace: session.workspace,
    branch: session.branch,
    remote: "origin",
    target: "refs/heads/main",
  });
  return { session, reporting };
}

// A raw landing request: a preparation unless told otherwise.
export const postLanding = (
  dashboard: DashboardServer,
  payload: unknown,
  prepare = true,
) =>
  rawRequest({
    url: `${dashboard.origin}/__agent-launch/landing${prepare ? "/prepare" : ""}`,
    method: "POST",
    headers: { Origin: dashboard.origin, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

export const keptRecord = async (
  dashboard: DashboardServer,
  reference: string,
) =>
  ((await recordsOf(dashboard, "open-dough")) as LaunchRecord[]).find(
    (entry) => entry.request.reporting?.reference === reference,
  );

// Commits a result in the session's workspace, lands it with the installed
// publication given the launch's context, and expects the launch to keep
// that comparison, prepared before the push, with no identity.
export async function expectCapturedLanding(
  dashboard: DashboardServer,
  origin: StartOrigin,
  record: LaunchRecord,
  name: string,
) {
  const { session, reporting } = landingHandoff(record);
  const base = await originMain(origin);
  expect(session.startingRevision).toBe(base);
  const revision = commit(session.workspace, name);
  const { result: delivered, before } = land(record, origin, dashboard.home);
  expect(delivered).toMatchObject({
    ok: true,
    publication: "accepted",
    suffixBase: base,
    receipt: { sha: revision },
    landing: { state: "recorded" },
  });
  expect(delivered.landing.receipt).not.toHaveProperty("identity");
  // The dashboard held the prepared comparison while trunk was still behind.
  expect(before.trunk).toBe(base);
  expect(before.preparations).toMatchObject([{ base, revision }]);
  expect(before.preparations[0]).not.toHaveProperty("identity");
  expect(await originMain(origin)).toBe(revision);

  const kept = await keptRecord(dashboard, reporting.reference);
  expect(kept?.landing).toEqual({
    repository: repositoryOf(origin.project),
    remote: "origin",
    target: "refs/heads/main",
    reference: reporting.reference,
    delivery: delivered.landing.receipt.delivery,
    base,
    revision,
    receipt: delivered.landing.receipt.receipt,
    receivedAt: delivered.landing.receipt.receivedAt,
  });
  // The accepted comparison is the one prepared before the push.
  expect(
    keptAttempts(dashboard).find((entry) => entry.id === reporting.reference)
      ?.landingPreparations,
  ).toEqual([kept?.landing]);
  // Capture is neither completion nor Done.
  expect(kept?.completion).toBeUndefined();
  expect(kept?.doneAt).toBeUndefined();
  return { base, revision };
}
