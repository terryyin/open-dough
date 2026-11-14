// Pygardon-shaped ignored-only merge for completion-recovery proofs: L merges
// trunk tip T with story-side B; M is an older main ancestor. Diffs from both
// M and B to L are ignored-only; B is nearer so the classifier must prefer it.
import { writeFileSync } from "node:fs";
import { delimiter, join } from "node:path";
import { pathToFileURL } from "node:url";
import { hostSessionOwner } from "./ci-host-bridge.mjs";
import { discoverAttempt } from "./ci-command-adapter-test-fixtures.mjs";
import {
  acceptedWorkflow,
  workflowPath,
} from "./ci-path-applicability-test-fixtures.mjs";
import { publishJson } from "./ci-mailbox-json-file.mjs";
import { instrumentedGithubFixture } from "./ci-github-test-fixtures.mjs";
import { apiRun } from "./github-actions-api-test-fixtures.mjs";
import { createManagedFixture } from "./execution-increment-managed-delivery-test-fixtures.mjs";
import { makeMe } from "../../../../tests/support/makeMe.mjs";
import { run } from "./watch-ci-test-fixtures.mjs";
import {
  repo,
  sessionId,
  targetRef,
} from "./execution-completion-recovery-test-fixtures.mjs";

const mergeLandingDescription = makeMe.aRepository
  .withRevision("base", {
    backlog: null,
    files: {
      "app.js": "product\n",
      [workflowPath]: acceptedWorkflow,
    },
  })
  .withRevision("m", {
    files: { ".planning/m.md": "main-attempt\n" },
  })
  .withRevision("t", {
    files: { "docs/trunk.md": "trunk\n" },
  })
  .withRevision("b0", {
    parents: ["base"],
    files: { ".planning/story-base.md": "story-base\n" },
  })
  .withRevision("b", {
    files: { ".planning/story.md": "story\n" },
  })
  .withRevision("l", {
    parents: ["t", "b"],
    files: {
      ".planning/m.md": "main-attempt\n",
      ".planning/story-base.md": "story-base\n",
      ".planning/story.md": "story\n",
      "docs/trunk.md": "trunk\n",
    },
  })
  .please();

export async function mergeRecoveryFixture(t, { provider = "command" } = {}) {
  const fixture = await createManagedFixture({
    description: mergeLandingDescription,
    platforms: [".claude"],
    checkout: "integration",
  });
  t.after(fixture.cleanup);
  const { b: shaB, m: shaM, l: shaL } = fixture.revisions;
  const root = fixture.integration;
  const storage = fixture.storage;
  const session = { session_id: sessionId };
  const env = { ...fixture.env, CLAUDE_CODE_SESSION_ID: sessionId };
  const owner = hostSessionOwner({ host: "claude", session, root });
  const recoveryScript = join(
    fixture.skill,
    "scripts/execution-completion-recovery.mjs",
  );

  function releaseAncestorAttempts(outcome = "success") {
    publishJson(fixture.fixture, "release.json", {
      attempts: [
        discoverAttempt({
          runId: "run:b",
          attemptId: "story",
          sha: shaB,
          outcome,
          time: "2026-09-15T12:00:00Z",
        }),
        discoverAttempt({
          runId: "run:m",
          attemptId: "main",
          sha: shaM,
          outcome: "success",
          branch: "main",
          time: "2026-09-14T12:00:00Z",
        }),
      ],
    });
  }

  async function recoverMerge(request = {}) {
    const { recoverExecutionCompletion } = await import(
      pathToFileURL(recoveryScript).href
    );
    const result = await recoverExecutionCompletion({
      workspace: root,
      acceptedSha: shaL,
      targetRef,
      repo,
      host: "claude",
      session,
      env: request.env ?? env,
      root,
      storage,
      maxDurationMs: 60_000,
      ...request,
    });
    if (
      result.observation?.directory &&
      result.receipt?.shutdown?.status !== "confirmed"
    ) {
      fixture.stopAtTeardown(result.observation.directory);
    }
    return result;
  }

  if (provider === "command") {
    return {
      fixture,
      root,
      storage,
      env,
      owner,
      shaB,
      shaM,
      shaL,
      releaseAncestorAttempts,
      recoverMerge,
    };
  }

  writeFileSync(
    join(root, ".planning/open-dough.json"),
    JSON.stringify(makeMe.projectCiSettings.with({}).please()),
  );
  const github = instrumentedGithubFixture(t, {
    branchRuns: [],
    allBranchRuns: [],
  });
  github.releaseRequests();

  function holdGithub({ bOutcome = "success" } = {}) {
    const bRun = apiRun(
      run({
        databaseId: 501,
        headSha: shaB,
        headBranch: "story",
        status: bOutcome === "pending" ? "in_progress" : "completed",
        conclusion:
          bOutcome === "pending"
            ? null
            : bOutcome === "failure"
              ? "failure"
              : "success",
        url: "https://github.com/owner/project/actions/runs/501",
      }),
    );
    const mRun = apiRun(
      run({
        databaseId: 401,
        headSha: shaM,
        headBranch: "main",
        status: "completed",
        conclusion: "success",
        url: "https://github.com/owner/project/actions/runs/401",
      }),
    );
    github.set({ branchRuns: [mRun], allBranchRuns: [bRun] });
  }

  const githubEnv = {
    ...env,
    ...github.env,
    GH_TOKEN: "secret-fixture",
    PATH: `${github.env.CI_GH_FIXTURE}${delimiter}${env.PATH ?? process.env.PATH}`,
  };

  return {
    fixture,
    root,
    storage,
    env: githubEnv,
    owner,
    shaB,
    shaM,
    shaL,
    github,
    holdGithub,
    recoverMerge: (request = {}) =>
      recoverMerge({ env: githubEnv, ...request }),
  };
}
