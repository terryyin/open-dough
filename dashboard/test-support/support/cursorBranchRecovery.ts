import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import type { APIRequestContext } from "@playwright/test";
import { launchResultSchema } from "../../src/launchOutcome.ts";
import { sessionBranchEntryEndpoint } from "../../src/sessionBranchResult.ts";
import {
  runningCursorSessionsSchema,
  cursorRunnerSessionsEndpoint,
} from "../../src/cursorRunnerSessions.ts";
import type { CursorSession } from "../../src/hostSession.ts";
import {
  storyReviewEndpoint,
  storyReviewSchema,
} from "../../src/storyReviewContract.ts";
import { hangupCursorClient } from "../../server/hosts/cursor/runnerClient.ts";
import { launch } from "../agentLaunchBoundary.ts";
import { expect } from "./cursorStart.ts";
import { getReview } from "./completedReviewRequests.ts";
import type { DashboardServer } from "./dashboardServer.ts";
import { rawRequest } from "./rawHttp.ts";
import { git } from "./storyReviewWorktree.ts";

export const cursorSessionQuery = (session: string) => ({
  source: "open-dough",
  host: "cursor",
  session,
});

export const postCursorSession = (
  dashboard: DashboardServer,
  endpoint: string,
  body: unknown,
) =>
  rawRequest({
    url: `${dashboard.baseURL}${endpoint}`,
    method: "POST",
    headers: { Origin: dashboard.origin, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

export function cursorBranchPins(project: string, session: string): string[] {
  return git(
    project,
    "for-each-ref",
    "--format=%(refname) %(objectname)",
    `refs/open-dough/session-branch/cursor/${session}/`,
  )
    .split("\n")
    .filter(Boolean);
}

export async function launchCursorReview(
  dashboard: DashboardServer,
  instruction: string,
  isolated = false,
) {
  const asked = makeMe.aLaunchRequest.adHoc({ host: "cursor", instruction });
  if (isolated) asked.withPolicy({ workspace: "isolated", landing: "review" });
  const response = await launch(dashboard, asked.please());
  const answer = launchResultSchema.parse(JSON.parse(response.body));
  if (answer.kind !== "launched" || answer.record.session.host !== "cursor")
    throw new Error(`Cursor launch did not settle: ${response.body}`);
  return { ...answer.record, session: answer.record.session };
}

export async function identifyCursorBranch(
  dashboard: DashboardServer,
  session: string,
  workspace: string,
  branch: string,
) {
  const response = await postCursorSession(
    dashboard,
    sessionBranchEntryEndpoint,
    {
      ...cursorSessionQuery(session),
      workspace,
      branch,
    },
  );
  expect(response.status, response.body).toBe(200);
  return response;
}

export async function readCursorBranch(
  request: APIRequestContext,
  dashboard: DashboardServer,
  session: string,
) {
  const response = await getReview(
    request,
    dashboard,
    storyReviewEndpoint,
    cursorSessionQuery(session),
  );
  expect(response.status()).toBe(200);
  return storyReviewSchema.parse(await response.json());
}

export function cursorReport(reference: string, session: string) {
  return makeMe.aCompletionSubmission
    .reportingFor({ host: "cursor", reference })
    .fromSession(session);
}

export async function detachCursor(
  dashboard: DashboardServer,
  session: CursorSession,
) {
  await hangupCursorClient(session, dashboard.home);
  await expect
    .poll(async () => {
      const answer = await rawRequest({
        url: `${dashboard.baseURL}${cursorRunnerSessionsEndpoint}`,
        headers: { Origin: dashboard.origin },
      });
      return runningCursorSessionsSchema
        .parse(JSON.parse(answer.body))
        .sessions.map(({ record }) => record.session.sessionId);
    })
    .not.toContain(session.sessionId);
}
