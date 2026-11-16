// Shared setup for ad hoc session review boundary specs.
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { materializeLocalCheckout } from "../../../Distribution/tests/support/repository-fixture.mjs";
import {
  storyReviewEndpoint,
  storyReviewSchema,
} from "../../src/storyReviewContract.ts";
import { reviewedWorkQuery } from "../../src/reviewedWorkSubject.ts";
import { getReview } from "./completedReviewRequests.ts";
import { keepLaunchRecords, type MachineHome } from "./launchStore.ts";
import type { APIRequestContext } from "@playwright/test";
import type { DashboardServer } from "./dashboardServer.ts";
import { expect } from "@playwright/test";

export const sessionQuery = (session: string) =>
  reviewedWorkQuery({ source: "open-dough", host: "claude", session });

export async function adHocReview(
  request: APIRequestContext,
  dashboard: DashboardServer,
  session: string,
) {
  const response = await getReview(
    request,
    dashboard,
    storyReviewEndpoint,
    sessionQuery(session),
  );
  expect(response.status()).toBe(200);
  return storyReviewSchema.parse(await response.json());
}

export function landedAdHocRecord({
  sessionId,
  title,
  workspace,
  branch,
  repository,
  base,
  revision,
  launchedAt,
}: {
  sessionId: string;
  title: string;
  workspace: string;
  branch: string;
  repository: string;
  base: string;
  revision: string;
  launchedAt?: string;
}) {
  let builder = makeMe.aLaunchRecord
    .adHoc({ title, instruction: "Landed." })
    .inIsolatedWorkspace({ workspace, branch })
    .inClaudeSession({ sessionId, shortId: sessionId.slice(0, 8) })
    .withLanding(
      makeMe.aLaunchLanding
        .capturedFrom({ repository })
        .comparing({ base, revision })
        .please(),
    );
  if (launchedAt !== undefined) builder = builder.launchedAt(launchedAt);
  return builder.markedDone().please();
}

export function keepLandedAdHoc(
  home: MachineHome,
  facts: Parameters<typeof landedAdHocRecord>[0],
) {
  keepLaunchRecords(home, [landedAdHocRecord(facts)]);
}

export async function twoRevisionRepo(
  file: string,
  before: string,
  after: string,
) {
  return materializeLocalCheckout(
    undefined,
    makeMe.aRepository
      .withRevision("base", { backlog: null, files: { [file]: before } })
      .withRevision("result", { backlog: null, files: { [file]: after } })
      .please(),
  );
}
