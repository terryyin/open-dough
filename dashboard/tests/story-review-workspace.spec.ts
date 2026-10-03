// The review workspace rule (../src/storyReview.ts `reviewWorkspaceOf`),
// which both the card and the launch boundary use: of one project's kept
// launch records for one work identity, the most recent by `launchedAt` whose
// start or preparation names a workspace, preparation and start alike.
// Records naming no workspace, another identity, or another project are
// passed over, and none at all leaves the story with nothing to review.

import { expect, test } from "@playwright/test";
import type { LaunchRecord } from "../src/launchRecord.ts";
import { reviewWorkspaceOf } from "../src/storyReview.ts";

const established = (workspace: string) => ({
  identity: "SEED-A#a",
  workspace,
  branch: "claude/story-a",
  remote: "origin",
  target: "main",
});

function launched(
  launchedAt: string,
  facts: Pick<LaunchRecord, "start" | "preparation">,
  request: Partial<LaunchRecord["request"]> = {},
): LaunchRecord {
  return {
    request: {
      source: "open-dough",
      identity: "SEED-A#a",
      title: "Story A",
      workflow: "execution",
      host: "claude",
      ...request,
    },
    session: {
      host: "claude",
      sessionId: `session-${launchedAt}`,
      shortId: "story-a",
      name: "Story A",
    },
    ...facts,
    launchedAt,
  };
}

const started = (workspace: string) => ({
  start: {
    ...established(workspace),
    publisherId: "a1b2c3",
    mode: "story-branch" as const,
    publishedSha: "b2".repeat(20),
  },
});
const prepared = (workspace: string) => ({
  preparation: established(workspace),
});

const workspaceOf = (records: readonly LaunchRecord[]) =>
  reviewWorkspaceOf(records, "open-dough", "SEED-A#a")?.established.workspace;

test("the most recent launch by launchedAt is reviewed, whatever order the records are kept in", () => {
  expect(
    workspaceOf([
      launched("2026-10-02T09:00:00.000Z", started("/later")),
      launched("2026-10-01T09:00:00.000Z", started("/earlier")),
    ]),
  ).toBe("/later");
  expect(
    workspaceOf([
      launched("2026-10-01T09:00:00.000Z", started("/earlier")),
      launched("2026-10-02T09:00:00.000Z", started("/later")),
    ]),
  ).toBe("/later");
});

test("a preparation's workspace counts like a start's", () => {
  const records = [
    launched("2026-10-01T09:00:00.000Z", started("/started")),
    launched("2026-10-02T09:00:00.000Z", prepared("/prepared"), {
      workflow: "refinement",
    }),
  ];
  const found = reviewWorkspaceOf(records, "open-dough", "SEED-A#a");
  expect(found?.record).toBe(records[1]);
  expect(found?.established).toBe(records[1]?.preparation);
});

test("records naming no workspace, another identity, or another project are passed over", () => {
  expect(
    workspaceOf([
      launched("2026-10-01T09:00:00.000Z", started("/reviewed")),
      launched("2026-10-04T09:00:00.000Z", {}),
      launched("2026-10-05T09:00:00.000Z", started("/other-story"), {
        identity: "SEED-B#b",
      }),
      launched("2026-10-06T09:00:00.000Z", started("/other-project"), {
        source: "elsewhere",
      }),
    ]),
  ).toBe("/reviewed");
});

test("a story with no launch record naming a workspace has nothing to review", () => {
  expect(workspaceOf([launched("2026-10-01T09:00:00.000Z", {})])).toBe(
    undefined,
  );
  expect(workspaceOf([])).toBe(undefined);
  expect(reviewWorkspaceOf(undefined, "open-dough", "SEED-A#a")).toBe(
    undefined,
  );
});
