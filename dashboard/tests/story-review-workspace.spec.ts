// The review workspace rule (../src/storyReviewWorkspace.ts `reviewWorkspaceOf`),
// which both the card and the launch boundary use: of one project's kept
// launch records for one work identity, the most recent by `launchedAt` whose
// start or preparation names a workspace, preparation and start alike.
// Records naming no workspace, another identity, or another project are
// passed over. Without such a record, the one worktree local Git found
// holding the story's claim is reviewed; a kept launch workspace keeps
// precedence over it, several found worktrees are not chosen between but
// answered together as an ambiguity, whose explanation names them, and none
// at all leaves the story with nothing to review.

import { expect, test } from "./support/pageTest.ts";
import type { LaunchRecord } from "../src/launchRecord.ts";
import type { LocalWorkspace } from "../src/localWorkspace.ts";
import {
  reviewWorkspaceOf,
  severalWorktreesExplanation,
} from "../src/storyReviewWorkspace.ts";

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

const found = (
  workspace: string,
  holding: Partial<LocalWorkspace> = {},
): LocalWorkspace => ({
  source: "open-dough",
  identity: "SEED-A#a",
  agent: "Yui-chan",
  workspace,
  branch: "exec/trunk-a",
  ...holding,
});

// The workspace the rule picks, whichever kind of evidence names it; none
// when it picks none.
function workspaceOf(
  records: readonly LaunchRecord[],
  workspaces: readonly LocalWorkspace[] = [],
) {
  const reviewed = reviewWorkspaceOf(
    records,
    workspaces,
    "open-dough",
    "SEED-A#a",
  );
  if (reviewed?.kind === "launched") return reviewed.established.workspace;
  return reviewed?.kind === "found" ? reviewed.found.workspace : undefined;
}

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
  expect(
    reviewWorkspaceOf(records, [], "open-dough", "SEED-A#a"),
  ).toStrictEqual({
    kind: "launched",
    record: records[1],
    established: records[1]?.preparation,
  });
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
  expect(
    reviewWorkspaceOf(undefined, undefined, "open-dough", "SEED-A#a"),
  ).toBe(undefined);
});

test("without a launch workspace, the one worktree found holding the story's claim is reviewed", () => {
  const holding = found("~/git/open-dough/.worktrees/trunk-a");
  expect(
    reviewWorkspaceOf(
      [launched("2026-10-01T09:00:00.000Z", {})],
      [
        found("/other-story", { identity: "SEED-B#b" }),
        holding,
        found("/other-project", { source: "elsewhere" }),
      ],
      "open-dough",
      "SEED-A#a",
    ),
  ).toStrictEqual({ kind: "found", found: holding });
  expect(
    reviewWorkspaceOf(undefined, [holding], "open-dough", "SEED-A#a"),
  ).toStrictEqual({ kind: "found", found: holding });
});

test("a kept launch workspace keeps precedence over a found worktree", () => {
  const records = [launched("2026-10-01T09:00:00.000Z", started("/launched"))];
  expect(workspaceOf(records, [found("/found")])).toBe("/launched");
  expect(
    reviewWorkspaceOf(records, [found("/found")], "open-dough", "SEED-A#a")
      ?.kind,
  ).toBe("launched");
  // A preparation's workspace too, and whatever the found worktrees number.
  expect(
    workspaceOf(
      [
        launched("2026-10-02T09:00:00.000Z", prepared("/prepared"), {
          workflow: "refinement",
        }),
      ],
      [found("/one"), found("/another")],
    ),
  ).toBe("/prepared");
});

test("several found worktrees holding the story's claim are not chosen between: they are an ambiguity naming each", () => {
  const holding = [
    found("~/git/open-dough/.worktrees/trunk-b", { branch: "exec/trunk-b" }),
    found("~/git/open-dough/.worktrees/trunk-a"),
  ];
  const reviewed = reviewWorkspaceOf(
    [launched("2026-10-01T09:00:00.000Z", {})],
    [found("/other-story", { identity: "SEED-B#b" }), ...holding],
    "open-dough",
    "SEED-A#a",
  );
  expect(reviewed).toStrictEqual({ kind: "ambiguous", found: holding });
  expect(workspaceOf([], holding)).toBe(undefined);
  expect(severalWorktreesExplanation(holding)).toBe(
    "Several worktrees on this machine hold this story's claim for Yui-chan: ~/git/open-dough/.worktrees/trunk-a, ~/git/open-dough/.worktrees/trunk-b. The review cannot choose one.",
  );
});
