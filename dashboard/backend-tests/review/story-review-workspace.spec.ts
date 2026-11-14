// The review workspace rule (../../src/storyReviewWorkspace.ts `reviewWorkspaceOf`),
// which both the card and the launch boundary use: of one project's kept
// launch records for one work identity, the most recent by `launchedAt` whose
// start or preparation names a workspace, preparation and start alike.
// Records naming no workspace, another identity, or another project are
// passed over. Without such a record, the one worktree local Git found
// holding the story's claim is reviewed; a kept launch workspace keeps
// precedence over it, several found worktrees are not chosen between but
// answered together as an ambiguity, whose explanation names them, and none
// at all leaves the story with nothing to review.

import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { expect, test } from "../../tests/support/pageTest.ts";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import type { LocalWorkspace } from "../../src/localWorkspace.ts";
import {
  reviewWorkspaceOf,
  severalWorktreesExplanation,
} from "../../src/storyReviewWorkspace.ts";

// Story A's launch by `workflow` in the `open-dough` project, unless another
// story or project is named, launched at `launchedAt`; its start or
// preparation is stated by the case.
function launched(
  launchedAt: string,
  {
    workflow = "execution",
    identity = "SEED-A#a",
    source = "open-dough",
  }: {
    workflow?: "execution" | "refinement";
    identity?: string;
    source?: string;
  } = {},
) {
  return makeMe.aLaunchRecord
    .ofWorkflow(workflow, { identity, title: "Story A", source })
    .inClaudeSession({ sessionId: `session-${launchedAt}`, shortId: "story-a" })
    .launchedAt(launchedAt);
}

// The story branch a start or preparation established in `workspace`.
const on = (workspace: string) => ({ workspace, branch: "claude/story-a" });

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
      launched("2026-10-02T09:00:00.000Z").onStoryBranch(on("/later")).please(),
      launched("2026-10-01T09:00:00.000Z")
        .onStoryBranch(on("/earlier"))
        .please(),
    ]),
  ).toBe("/later");
  expect(
    workspaceOf([
      launched("2026-10-01T09:00:00.000Z")
        .onStoryBranch(on("/earlier"))
        .please(),
      launched("2026-10-02T09:00:00.000Z").onStoryBranch(on("/later")).please(),
    ]),
  ).toBe("/later");
});

test("a preparation's workspace counts like a start's", () => {
  const records = [
    launched("2026-10-01T09:00:00.000Z").onStoryBranch(on("/started")).please(),
    launched("2026-10-02T09:00:00.000Z", { workflow: "refinement" })
      .onStoryBranch(on("/prepared"))
      .please(),
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
      launched("2026-10-01T09:00:00.000Z")
        .onStoryBranch(on("/reviewed"))
        .please(),
      launched("2026-10-04T09:00:00.000Z").please(),
      launched("2026-10-05T09:00:00.000Z", { identity: "SEED-B#b" })
        .onStoryBranch(on("/other-story"))
        .please(),
      launched("2026-10-06T09:00:00.000Z", { source: "elsewhere" })
        .onStoryBranch(on("/other-project"))
        .please(),
    ]),
  ).toBe("/reviewed");
});

test("a story with no launch record naming a workspace has nothing to review", () => {
  expect(workspaceOf([launched("2026-10-01T09:00:00.000Z").please()])).toBe(
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
      [launched("2026-10-01T09:00:00.000Z").please()],
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
  const records = [
    launched("2026-10-01T09:00:00.000Z")
      .onStoryBranch(on("/launched"))
      .please(),
  ];
  expect(workspaceOf(records, [found("/found")])).toBe("/launched");
  expect(
    reviewWorkspaceOf(records, [found("/found")], "open-dough", "SEED-A#a")
      ?.kind,
  ).toBe("launched");
  // A preparation's workspace too, and whatever the found worktrees number.
  expect(
    workspaceOf(
      [
        launched("2026-10-02T09:00:00.000Z", { workflow: "refinement" })
          .onStoryBranch(on("/prepared"))
          .please(),
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
    [launched("2026-10-01T09:00:00.000Z").please()],
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
