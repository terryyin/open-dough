// A kept one-shot start is continued as it was. The admitted policy
// (../../server/launchSessionPolicy.ts) runs through the attempt run
// (../../server/launchRun.ts): the project's real installed start against a
// real bare origin (../../test-support/support/startOrigin.ts), then the real
// Claude host adapter with the synthetic `claude` boundary. When the native
// launch refuses, the start is kept; a later Start, whatever it asks, goes on
// with the kept start's own policy and workspace rather than changing or
// duplicating it.

import { execFileSync } from "node:child_process";
import { readFileSync, realpathSync } from "node:fs";
import path from "node:path";
import { beforeAll, expect, onTestFinished, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { queuedReadyRepository } from "../../../Distribution/tests/support/queued-repository.mjs";
import { executionCheckout } from "../../server/executionCheckout.ts";
import { keptStarts } from "../../server/launchCatalog.ts";
import { launchHost } from "../../server/launchHosts.ts";
import { keptRecords } from "../../server/launchRecordStore.ts";
import { attemptRun } from "../../server/launchRun.ts";
import { withSessionPolicy } from "../../server/launchSessionPolicy.ts";
import { OwnedAttempts } from "../../server/ownedAttempts.ts";
import { mountProjectConfiguration } from "../../server/projectConfiguration.ts";
import { StartProgress } from "../../server/startProgress.ts";
import type { SessionPolicy } from "../../src/agentLaunch.ts";
import { installFakeClaude } from "../../test-support/support/fakeClaude.ts";
import { oneShot } from "../../test-support/support/oneShotLaunch.ts";
import {
  originState,
  queuedIdentity,
  queuedTitle,
  startOrigin,
} from "../../test-support/support/startOrigin.ts";
import { keepStartedOrigin } from "../../test-support/support/startOriginPreparation.ts";

type Workflow = "execution" | "refinement";

const repository = queuedReadyRepository().please();
const source = makeMe.aPublishedSource.openDough.please();
const slug = "prepare-the-queued-start";

beforeAll(async () => {
  const prepared = await startOrigin(repository, { host: "claude" });
  try {
    keepStartedOrigin("claude", repository, prepared);
  } finally {
    prepared.cleanup();
  }
});

// This case's machine: its installed origin and the synthetic `claude` first
// on PATH, with its controls.
async function machine() {
  const origin = await startOrigin(repository, { host: "claude" });
  const claude = installFakeClaude(
    origin.machine,
    { binDir: origin.machine, path: process.env["PATH"] ?? "" },
    {},
  );
  for (const [key, value] of Object.entries(claude.env)) vi.stubEnv(key, value);
  vi.stubEnv("HOME", path.join(origin.machine, "home"));
  const unmount = mountProjectConfiguration("production");
  onTestFinished(() => {
    unmount();
    vi.unstubAllEnvs();
    origin.cleanup();
  });
  return { origin, claude: claude.controls };
}

// One Start of the queued story through the admitted policy and attempt run.
async function start(workflow: Workflow, policy?: SessionPolicy) {
  const request = makeMe.aLaunchRequest.ofWorkflow(workflow, {
    identity: queuedIdentity,
    title: queuedTitle,
    host: "claude",
  });
  const admitted = await withSessionPolicy(
    (policy === undefined ? request : request.withPolicy(policy))
      .withInstruction("Keep it small.")
      .please(),
    executionCheckout(source),
  );
  const attempt = makeMe.anAcceptedAttempt.requesting(admitted).please();
  return attemptRun(source, new OwnedAttempts().own(admitted, attempt), {
    progress: new StartProgress(),
    doneMarks: { reported: vi.fn() },
    native: launchHost,
  });
}

test.each(["execution", "refinement"] as const)(
  "%s: is continued with its own policy and workspace, not changed or duplicated",
  async (workflow) => {
    const { origin, claude } = await machine();
    const established = workflow === "execution" ? "start" : "preparation";
    const before = await originState(origin);
    const policy = oneShot("isolated", "review");

    claude.claudeScenario("refused");
    const refused = await start(workflow, policy);
    expect(refused).toMatchObject({ kind: "failed" });
    const { explanation } = refused as { explanation: string };
    expect(explanation).toContain("No session started; nothing was published.");
    expect(explanation).not.toMatch(/Taken|Preparing/);
    expect(await keptStarts()).toMatchObject([
      {
        workflow,
        host: "claude",
        source: "open-dough",
        identity: queuedIdentity,
        workspace: `~/git/open-dough/.worktrees/${slug}`,
        branch: `claude/${slug}`,
        policy,
      },
    ]);
    const keptRecord = (
      JSON.parse(
        readFileSync(
          path.join(
            origin.machine,
            "home",
            `.open-dough/dashboard/${workflow}-starts.json`,
          ),
          "utf8",
        ),
      ) as Record<string, Record<string, Record<string, unknown>>>
    )["open-dough"]?.[queuedIdentity];
    expect(keptRecord?.["policy"]).toEqual(policy);
    expect(keptRecord?.[established]).toMatchObject({ tracking: "one-shot" });

    // A later Start asking for standard tracking continues the kept one-shot
    // start as it was: no Take, no second workspace.
    claude.claudeScenario("launched");
    expect(await start(workflow)).toMatchObject({ kind: "launched" });
    const last = claude.claudeLaunchCalls().at(-1);
    expect(last?.cwd).toBe(
      realpathSync(path.join(origin.project, ".worktrees", slug)),
    );
    expect(last?.argv.at(-1)).toContain("- tracking: one-shot");
    expect(await originState(origin)).toEqual(before);
    // One owned worktree beside the execution checkout, as before.
    const worktrees = execFileSync(
      "git",
      ["-C", origin.project, "worktree", "list", "--porcelain"],
      { encoding: "utf8" },
    )
      .split("\n")
      .filter((line) => line.startsWith("worktree "));
    expect(worktrees).toHaveLength(2);
    const [record] = await keptRecords(source.id);
    if (record === undefined || record.request.workflow === "ad-hoc")
      throw new Error("Missing story launch record.");
    expect(record.request.policy).toEqual(policy);
    expect(record[established]).toEqual(keptRecord?.[established]);
    expect(await keptStarts()).toEqual([]);
  },
);
