// Ambiguous completed-story association: two independently matching Done
// candidates stay absent. Unique-link cases live in
// ./completed-story-association.spec.ts.
import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  storyA,
  storyB,
  storyPlanPath,
  takeRevision,
} from "../../../Distribution/tests/support/queued-repository.mjs";
import { expect, test } from "../../tests/support/codexStart.ts";
import {
  associationOf,
  queuedIdentity,
} from "../../tests/support/adHocCompletedAssociation.ts";
import { installedBacklogScript } from "../../tests/support/completedStoryPublication.ts";
import { keepLaunchRecords } from "../../tests/support/launchStore.ts";
import { dashboardDeveloper } from "../../tests/support/startOriginPreparation.ts";
import { otherQueuedIdentity } from "../../tests/support/queuedStories.ts";
import {
  commitAll,
  git,
  lines,
  writeAt,
} from "../../tests/support/storyReviewWorktree.ts";
import { pull, push } from "../../tests/support/storyReviewTrunkCommits.ts";

test.use({ serverMode: "boundary" });

test("two independently matching completed-story candidates stay absent", async ({
  request,
  dashboard,
  origin,
}) => {
  writeAt(origin.project, "shared.txt", lines("line"));
  commitAll(origin.project, "initial shared file");
  push(origin.project);
  const reference = randomUUID();
  // Dual-identity facts at the call site: one publisher, Story A and Story B.
  const identityA = queuedIdentity;
  const identityB = otherQueuedIdentity;
  expect(identityA).toBe("SEED-A#a");
  expect(identityB).toBe("SEED-B#b");
  const start = await origin.publishTake({
    agent: "Yui",
    story: storyA,
    queued: [storyB],
    mode: "story-branch",
    publisher: reference,
  });
  const { workspace, branch } = start;
  const base = git(workspace, "rev-parse", "HEAD");
  writeAt(
    workspace,
    "shared.txt",
    lines("line").replace("line 0\n", "dual first\n"),
  );
  commitAll(workspace, "story implementation");
  // Claim B with the same publisher and keep A Taken beside it.
  const takeB = takeRevision({
    story: storyB,
    queued: [],
    agent: "Yui",
    committer: dashboardDeveloper,
    host: "claude",
    publisher: reference,
    branch,
  });
  await origin.publishRevision({
    ...takeB,
    backlog: {
      ...takeB.backlog,
      taken: [
        makeMe.aBacklogEntry
          .with({
            ...storyA,
            plan: { label: "plan", target: storyPlanPath(storyA) },
          })
          .please(),
        ...takeB.backlog.taken,
      ],
    },
  });
  git(workspace, "fetch", "--quiet", "origin", "main");
  git(workspace, "merge", "--quiet", "--no-edit", "origin/main");
  const beforeBoth = git(workspace, "rev-parse", "HEAD");
  const complete = (identity: string) =>
    execFileSync(
      process.execPath,
      [
        installedBacklogScript(workspace, ".agents/skills"),
        "complete",
        "--file",
        ".planning/PRODUCT-BACKLOG.md",
        "--identity",
        identity,
      ],
      { cwd: workspace, stdio: "pipe" },
    );
  complete(identityA);
  complete(identityB);
  // One commit adds both Done records so each recovers the same completion tip.
  git(workspace, "reset", "--soft", beforeBoth);
  commitAll(workspace, "complete Story A and Story B together");
  // Fast-forward main to the single dual-Done commit so both identities
  // recover that same revision as completion (no separate owning merge).
  git(workspace, "push", "--quiet", "origin", `HEAD:refs/heads/${branch}`);
  pull(origin.project);
  git(origin.project, "fetch", "--quiet", "origin", branch);
  git(origin.project, "merge", "--quiet", "--ff-only", `origin/${branch}`);
  push(origin.project);
  const completion = git(origin.project, "rev-parse", "HEAD");
  git(origin.project, "push", "--quiet", "--delete", "origin", branch);
  git(origin.project, "worktree", "remove", "--force", workspace);
  git(origin.project, "branch", "--delete", "--force", branch);
  const landing = makeMe.aLaunchLanding
    .capturedFrom({
      repository: origin.project,
      remote: "origin",
      target: "refs/heads/main",
    })
    .forLaunch(reference)
    .comparing({ base, revision: completion })
    .receivedAt(new Date().toISOString())
    .please();
  const record = makeMe.aLaunchRecord
    .adHoc({
      instruction: "Dual completed candidates",
      title: "Dual completed candidates",
    })
    .reportingThrough({
      origin: dashboard.origin,
      reference,
      command: "report",
    })
    .inIsolatedWorkspace({
      workspace: path.join(origin.machine, "retired-dual"),
      branch: "ad-hoc/dual",
    })
    .withCapturedLanding(landing)
    .completedWith({ message: "Landed dual completions." })
    .markedDoneAt(new Date().toISOString())
    .please();
  keepLaunchRecords(dashboard, [record]);
  const claimed = git(
    origin.project,
    "log",
    "--format=%B",
    "--grep",
    `Claim-Publisher: ${reference}`,
    "--fixed-strings",
    completion,
  );
  expect(claimed).toContain(`Claim-Identity: ${identityA}`);
  expect(claimed).toContain(`Claim-Identity: ${identityB}`);
  const doneAtCompletion = git(
    origin.project,
    "ls-tree",
    "-r",
    "--name-only",
    completion,
    ".planning/done",
  );
  expect(doneAtCompletion).toContain(".planning/done/SEED-A_a.json");
  expect(doneAtCompletion).toContain(".planning/done/SEED-B_b.json");
  expect(await associationOf(request, dashboard, record.session)).toEqual({
    kind: "absent",
  });
});
