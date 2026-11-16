// Shared setup for ad hoc session review boundary specs.
import { execFileSync } from "node:child_process";
import path from "node:path";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { materializeLocalCheckout } from "../../../Distribution/tests/support/repository-fixture.mjs";
import {
  storyReviewEndpoint,
  storyReviewSchema,
  type ReviewedFile,
  type StoryReview,
} from "../../src/storyReviewContract.ts";
import { reviewedWorkQuery } from "../../src/reviewedWorkSubject.ts";
import { getReview } from "./completedReviewRequests.ts";
import { keepLaunchRecords, type MachineHome } from "./launchStore.ts";
import { lines } from "./storyReviewWorktree.ts";
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
  reference,
}: {
  sessionId: string;
  title: string;
  workspace: string;
  branch: string;
  repository: string;
  base: string;
  revision: string;
  launchedAt?: string;
  reference?: string;
}) {
  let landing = makeMe.aLaunchLanding
    .capturedFrom({ repository })
    .comparing({ base, revision });
  if (reference !== undefined) landing = landing.forLaunch(reference);
  let builder = makeMe.aLaunchRecord
    .adHoc({ title, instruction: "Landed." })
    .inIsolatedWorkspace({ workspace, branch })
    .inClaudeSession({ sessionId, shortId: sessionId.slice(0, 8) })
    .withLanding(landing.please());
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

// Enough identical lines that a small edit stays a rename under Git -M.
export async function renameRevisionRepo() {
  const body = lines("kept");
  return materializeLocalCheckout(
    undefined,
    makeMe.aRepository
      .withRevision("base", {
        backlog: null,
        files: { "old.txt": body },
      })
      .withRevision("result", {
        backlog: null,
        remove: ["old.txt"],
        files: { "new.txt": `${body}renamed\n` },
      })
      .please(),
  );
}

export const showBlob = (cwd: string, tree: string, file: string) =>
  execFileSync("git", ["show", `${tree}:${file}`], {
    cwd,
    encoding: "utf8",
  });

export function landedFileQuery(
  session: string,
  review: Extract<StoryReview, { kind: "landed" }>,
  file: ReviewedFile,
) {
  return {
    ...sessionQuery(session),
    reference: review.landing.reference,
    baseline: review.baseline,
    tree: review.tree,
    path: file.path,
    ...(file.kind === "renamed" ? { oldPath: file.oldPath } : {}),
  };
}

export function keepLandedAdHocPair(
  home: MachineHome,
  first: Parameters<typeof landedAdHocRecord>[0],
  second: Parameters<typeof landedAdHocRecord>[0],
) {
  keepLaunchRecords(home, [
    landedAdHocRecord(first),
    landedAdHocRecord(second),
  ]);
}

export function retiredWorkspace(home: string, name: string) {
  return path.join(home, name);
}
