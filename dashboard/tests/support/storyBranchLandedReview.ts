// The story a landed Story Branch review reads: an earlier one-shot
// refinement, then a claimed execution (./storyBranchIntegration.ts) whose
// branch merges trunk while it runs and changes a file trunk also changes, and
// the pair its installed trunk integration delivers.
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { z } from "zod";
import type { DashboardServer } from "./dashboardServer.ts";
import type { FakeCodex } from "./fakeCodex.ts";
import { git, scripts } from "./oneShotLanding.ts";
import { capturedChoice } from "./oneShotReviewChoices.ts";
import { expect } from "./pageTest.ts";
import { queuedIdentity, type StartOrigin } from "./startOrigin.ts";
import {
  claimedLaunchWithStoryCommit,
  trunkCommitFromAnotherWriter,
} from "./storyBranchIntegration.ts";

const sharedLines = [...Array(9).keys()].map((index) => `line ${index + 1}`);

// One line of the file trunk and the story both change.
function changeSharedLine(checkout: string, line: number, text: string) {
  const file = path.join(checkout, "shared.txt");
  const lines = readFileSync(file, "utf8").trimEnd().split("\n");
  lines[line - 1] = text;
  writeFileSync(file, `${lines.join("\n")}\n`);
}

// The story's earlier one-shot refinement, landed and retired, and its claimed
// Story Branch execution with its story tip on the remote branch. During
// execution trunk changes line 5 of the shared file and the branch merges it;
// the story then changes line 1 and completes itself in the backlog. Trunk's
// tip, awaiting integration, also changes line 9.
export async function storyBranchExecutionAfterRefinement(
  dashboard: DashboardServer,
  origin: StartOrigin,
  native: FakeCodex,
) {
  writeFileSync(
    path.join(origin.project, "shared.txt"),
    `${sharedLines.join("\n")}\n`,
  );
  git(origin.project, "add", "shared.txt");
  git(origin.project, "commit", "-m", "A file both will change");
  git(origin.project, "push", "origin", "main");
  const refinement = await capturedChoice(dashboard, origin, native, "refined");
  git(origin.project, "pull", "--quiet", "--ff-only", "origin", "main");

  const execution = native;
  execution.threadId = "story-branch-execution";
  const story = await claimedLaunchWithStoryCommit(origin, dashboard, true, {
    host: "codex",
    storyWork: (workspace) => {
      const earlierTrunk = trunkCommitFromAnotherWriter(
        origin,
        "merged-trunk-only.txt",
        (writer) => {
          changeSharedLine(writer, 5, "trunk's earlier line");
        },
      );
      git(workspace, "fetch", "--quiet", "origin");
      git(workspace, "merge", "--no-ff", "--no-edit", "origin/main");
      expect(git(workspace, "rev-parse", "HEAD^2")).toBe(earlierTrunk);
      git(
        workspace,
        "push",
        "origin",
        `HEAD:refs/heads/${git(workspace, "branch", "--show-current")}`,
      );
      changeSharedLine(workspace, 1, "the story's line");
      execFileSync(
        process.execPath,
        [
          path.join(
            scripts(workspace, "dough-product-backlog"),
            "product-backlog.mjs",
          ),
          "complete",
          "--identity",
          queuedIdentity,
        ],
        { cwd: workspace, encoding: "utf8", stdio: "pipe" },
      );
      git(workspace, "add", "-A");
      git(workspace, "commit", "-m", "Change the shared file and complete");
    },
    trunkWork: (writer) => {
      changeSharedLine(writer, 9, "trunk's line");
    },
  });
  return { refinement, story };
}

// Integrates that execution onto trunk and answers the accepted revision with
// the paths it delivers from the trunk tip it was published onto: the story's
// own, never what only trunk changed, before or during execution.
export async function integratedOntoTrunk(
  origin: StartOrigin,
  story: Awaited<
    ReturnType<typeof storyBranchExecutionAfterRefinement>
  >["story"],
) {
  const { trunkTip, storyTip } = story;
  const integrated = z
    .looseObject({ receipt: z.looseObject({ sha: z.string() }) })
    .parse(await story.integrated());
  expect(integrated).toMatchObject({
    classification: "published",
    landing: { state: "recorded" },
  });
  const accepted = integrated.receipt.sha;
  expect((await origin.originGit("rev-parse", "main")).trim()).toBe(accepted);
  expect(git(origin.origin, "rev-parse", `${accepted}^1`)).toBe(trunkTip);
  expect(git(origin.origin, "rev-parse", `${accepted}^2`)).toBe(storyTip);
  const delivered = git(
    origin.origin,
    "diff",
    "--name-only",
    trunkTip,
    accepted,
  ).split("\n");
  expect(delivered).toEqual(
    expect.arrayContaining(["shared.txt", "story.txt"]),
  );
  expect(delivered).not.toContain("trunk-only.txt");
  expect(delivered).not.toContain("merged-trunk-only.txt");
  // The story tip holds the trunk file its branch merged during execution.
  expect(git(origin.origin, "show", `${storyTip}:merged-trunk-only.txt`)).toBe(
    "merged-trunk-only.txt",
  );
  expect(
    git(origin.origin, "show", `${trunkTip}:shared.txt`).split("\n"),
  ).toEqual(
    sharedLines.map((line, index) =>
      index === 4
        ? "trunk's earlier line"
        : index === 8
          ? "trunk's line"
          : line,
    ),
  );
  return { accepted, delivered };
}
