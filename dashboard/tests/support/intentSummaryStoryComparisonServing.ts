// The CLI and declared-history publishers serve the same three actual Git
// endpoints and file-level CI proofs for Intent Summary comparison journeys.
import type { Page } from "@playwright/test";
import { publishCommittedOrigin } from "../committedOrigin.ts";
import type { StartOrigin } from "./startOrigin.ts";
import { queuedIdentity } from "./startOrigin.ts";
import { git } from "./storyReviewWorktree.ts";
import {
  serveActionsFor,
  wall,
  type StoryCiComparisonSetup,
} from "./storyCiComparisonFixture.ts";
import { breakdownProofs } from "./intentSummaryStoryComparisonProofs.ts";

type Endpoints = Pick<
  StoryCiComparisonSetup,
  | "completion"
  | "baseline"
  | "branchSide"
  | "laterWithoutBuild"
  | "agent"
  | "branch"
>;

export async function serveSummaryComparisonStory(
  page: Page,
  origin: StartOrigin,
  endpoints: Endpoints,
): Promise<StoryCiComparisonSetup> {
  const { baseline, branchSide, completion } = endpoints;
  const committed = await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision: git(origin.origin, "rev-parse", "main"),
    repository: "terryyin/open-dough",
    follows: true,
    realHistory: true,
  });
  const actions = serveActionsFor(
    committed,
    {
      [baseline]: [
        wall(baseline, 101, "2026-11-05T12:00:00Z", "2026-11-05T12:03:00Z"),
      ],
      [branchSide]: [
        wall(branchSide, 102, "2026-11-05T13:00:00Z", "2026-11-05T13:03:20Z"),
      ],
      [completion]: [
        wall(completion, 103, "2026-11-05T14:00:00Z", "2026-11-05T14:04:00Z"),
      ],
    },
    breakdownProofs({ baseline, branchSide, completion }),
  );
  return { identity: queuedIdentity, ...endpoints, ...actions };
}
