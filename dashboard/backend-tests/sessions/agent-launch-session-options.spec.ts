// A story launch's session policy reaches its session through one
// established context. The admitted policy (../../server/launchSessionPolicy.ts)
// runs through the attempt run (../../server/launchRun.ts): the project's real
// installed start (`execution-start.mjs start --one-shot`,
// `preparation-assignment.mjs start --one-shot`) against a real bare origin
// (../../test-support/support/startOrigin.ts), then the real host adapters with
// the synthetic `claude` and Codex protocol boundaries. Every one-shot
// combination of workspace (isolated or execution checkout) and landing
// (review or automatic) is started for both workflows: the session opens where
// the start established it, its instruction names the policy's flags and the
// established one-shot context, the launch record keeps the policy and
// context, and origin is untouched at start (no profile, Take, branch, or
// push). The page's choices:
// ../../../e2e/launches/agent-launch-session-choices.spec.ts.

import { existsSync, realpathSync } from "node:fs";
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
import { installFakeCodex } from "../../test-support/support/fakeCodex.ts";
import { oneShot } from "../../test-support/support/oneShotLaunch.ts";
import { expectReportingBlock } from "../../test-support/support/reportingInputAssertions.ts";
import {
  originState,
  queuedIdentity,
  queuedTitle,
  startOrigin,
} from "../../test-support/support/startOrigin.ts";
import { keepStartedOrigin } from "../../test-support/support/startOriginPreparation.ts";

type Host = "claude" | "codex";
type Workflow = "execution" | "refinement";

const repository = queuedReadyRepository().please();
const source = makeMe.aPublishedSource.openDough.please();
const reportingOrigin = "http://127.0.0.1:4173";
const slug = "prepare-the-queued-start";
const skills: Record<Workflow, string> = {
  execution: "dough-execute-plan",
  refinement: "dough-story-refinement",
};

beforeAll(async () => {
  for (const host of ["claude", "codex"] as const) {
    const prepared = await startOrigin(repository, { host });
    try {
      keepStartedOrigin(host, repository, prepared);
    } finally {
      prepared.cleanup();
    }
  }
});

// This case's machine: its installed origin, the synthetic `claude` and
// Codex first on PATH, and the session's cwd and first instruction as the
// host's native boundary received them.
async function machineFor(host: Host) {
  const origin = await startOrigin(repository, { host });
  const claude = installFakeClaude(
    origin.machine,
    { binDir: origin.machine, path: process.env["PATH"] ?? "" },
    {},
  );
  const codex = await installFakeCodex(
    origin.machine,
    claude.env["PATH"] ?? "",
    true,
  );
  for (const [key, value] of Object.entries({ ...claude.env, ...codex.env }))
    vi.stubEnv(key, value);
  vi.stubEnv("HOME", path.join(origin.machine, "home"));
  const unmount = mountProjectConfiguration("production");
  onTestFinished(async () => {
    unmount();
    await codex.close();
    vi.unstubAllEnvs();
    origin.cleanup();
  });
  const received = () => {
    if (host === "claude") {
      const [call] = claude.controls.claudeLaunchCalls();
      return { cwd: call?.cwd, instruction: call?.argv.at(-1) ?? "" };
    }
    const thread = codex.calls.find(({ method }) => method === "thread/start");
    const turn = codex.calls.find(({ method }) => method === "turn/start");
    const [input] = (turn?.params["input"] ?? []) as { text?: string }[];
    return {
      cwd: realpathSync(String(thread?.params["cwd"])),
      instruction: input?.text ?? "",
    };
  };
  return { origin, received };
}

const cases: { workflow: Workflow; host: Host; policy: SessionPolicy }[] = [
  ...(["execution", "refinement"] as const).flatMap((workflow) =>
    (["isolated", "default-checkout"] as const).flatMap((workspace) =>
      (["review", "auto-land"] as const).map((landing) => ({
        workflow,
        host: "claude" as const,
        policy: oneShot(workspace, landing),
      })),
    ),
  ),
  // Codex carries the same established context from its own installation,
  // through its native first input.
  {
    workflow: "execution",
    host: "codex",
    policy: oneShot("default-checkout", "auto-land"),
  },
  {
    workflow: "refinement",
    host: "codex",
    policy: oneShot("isolated", "review"),
  },
];

test.each(cases)(
  "one-shot $workflow in $host · $policy.workspace · $policy.landing starts with no published assignment, carrying the policy and its established context",
  async ({ workflow, host, policy }) => {
    const { origin, received } = await machineFor(host);
    const admitted = await withSessionPolicy(
      makeMe.aLaunchRequest
        .ofWorkflow(workflow, {
          identity: queuedIdentity,
          title: queuedTitle,
          host,
        })
        .withInstruction("Keep it small.")
        .withPolicy(policy)
        .please(),
      executionCheckout(source),
    );
    const attempt = makeMe.anAcceptedAttempt
      .requesting(admitted)
      .reportingTo(reportingOrigin)
      .please();
    const before = await originState(origin);

    expect(
      await attemptRun(source, new OwnedAttempts().own(admitted, attempt), {
        progress: new StartProgress(),
        doneMarks: { reported: vi.fn() },
        native: launchHost,
      }),
    ).toMatchObject({ kind: "launched" });

    const executionCheckoutRole = policy.workspace === "default-checkout";
    const workspace = executionCheckoutRole
      ? origin.project
      : path.join(origin.project, ".worktrees", slug);
    const branch = executionCheckoutRole ? "main" : `${host}/${slug}`;
    const startingRevision = (
      await origin.originGit("rev-parse", "main")
    ).trim();
    const { cwd, instruction } = received();
    expect(cwd).toBe(realpathSync(workspace));

    const [command, block, reporting, developer, ...extra] =
      instruction.split("\n\n");
    expect(extra).toEqual([]);
    const flags = [
      "--one-shot",
      ...(executionCheckoutRole ? ["--default-main"] : []),
      ...(policy.landing === "auto-land" ? ["--auto-land"] : []),
    ];
    expect(command).toBe(
      `${host === "codex" ? "$" : "/"}${skills[workflow]} ${[queuedIdentity, ...flags].join(" ")}`,
    );
    expect(developer).toBe("Keep it small.");
    const lines = (block ?? "").split("\n");
    expect(lines[0]).toBe(
      workflow === "execution"
        ? "Established start:"
        : "Established preparation:",
    );
    expect(lines).toEqual(
      expect.arrayContaining([
        "- tracking: one-shot",
        `- identity: ${queuedIdentity}`,
        `- workspace: ${workspace}`,
        `- workspace role: ${policy.workspace}`,
        `- branch: ${branch}`,
        "- remote: origin",
        "- target: main",
        `- landing: ${policy.landing}`,
        `- startingRevision: ${startingRevision}`,
      ]),
    );
    expect(instruction).not.toMatch(/agent:|publishedSha|publisher ID/);

    // Nothing was published at start: no profile, Take, branch, or push.
    expect(await originState(origin)).toEqual(before);
    expect(existsSync(path.join(origin.project, ".worktrees", slug))).toBe(
      !executionCheckoutRole,
    );

    const [record] = await keptRecords(source.id);
    if (record === undefined || record.request.workflow === "ad-hoc")
      throw new Error("Missing story launch record.");
    expectReportingBlock(reporting, record.request, {
      home: path.join(origin.machine, "home"),
      origin: reportingOrigin,
    });
    expect(record.request.reporting?.reference).toBe(attempt.id);
    expect(record.request.policy).toEqual(policy);
    expect(record[workflow === "execution" ? "start" : "preparation"]).toEqual({
      tracking: "one-shot",
      identity: queuedIdentity,
      workspace,
      role: policy.workspace,
      branch,
      remote: "origin",
      target: "main",
      landing: policy.landing,
      startingRevision,
      ...(workflow === "execution" ? { mode: "story-branch" } : {}),
      // Only the execution checkout's start reports the fetched trunk
      // beside its own HEAD.
      ...(workflow === "execution" && executionCheckoutRole
        ? { fetched: startingRevision }
        : {}),
    });
    expect(
      record[workflow === "execution" ? "preparation" : "start"],
    ).toBeUndefined();
    // The session took the start over: nothing is kept for a later launch.
    expect(await keptStarts()).toEqual([]);
  },
);
