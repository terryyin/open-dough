// What the session-policy launch specs share: the queued story's request
// with a policy, what origin holds, a preview dashboard on the real installed
// start, and what every established one-shot launch shows whichever host
// carried it.

import { existsSync, realpathSync } from "node:fs";
import path from "node:path";
import { expect } from "@playwright/test";
import type { SessionPolicy } from "../../src/agentLaunch.ts";
import {
  keptStarts,
  launchRequest,
  recordsOf,
} from "../agentLaunchBoundary.ts";
import {
  builtDashboardDir,
  startDashboardServer,
  type DashboardServer,
} from "./dashboardServer.ts";
import type { FakeCodex } from "./fakeCodex.ts";
import {
  queuedIdentity,
  queuedTitle,
  type StartOrigin,
} from "./startOrigin.ts";

export const slug = "prepare-the-queued-start";
const workflows = {
  execution: "dough-execute-plan",
  refinement: "dough-story-refinement",
} as const;
export type Workflow = keyof typeof workflows;

export const requestFor = (workflow: Workflow, policy?: SessionPolicy) => ({
  ...launchRequest,
  workflow,
  identity: queuedIdentity,
  title: queuedTitle,
  instruction: "Keep it small.",
  ...(policy === undefined ? {} : { policy }),
});

export const oneShot = (
  workspace: SessionPolicy["workspace"],
  landing: SessionPolicy["landing"],
): SessionPolicy => ({ tracking: "one-shot", workspace, landing });

// A preview dashboard on the origin's machine, reading its project folder.
export function startPreview(
  origin: StartOrigin,
  codexProtocol?: FakeCodex,
): Promise<DashboardServer> {
  return startDashboardServer({
    mode: "preview",
    prebuilt: builtDashboardDir,
    machine: origin.machine,
    projectFolders: ["open-dough"],
    launchTimeoutMs: 30_000,
    ...(codexProtocol === undefined ? {} : { codexProtocol }),
  });
}

// What origin holds: every ref and the agent profiles on main.
export async function originState(origin: StartOrigin) {
  return {
    refs: await origin.originGit(
      "for-each-ref",
      "--format=%(refname) %(objectname)",
    ),
    profiles: await origin.takenProfiles(),
  };
}

// The established one-shot context's block lines in the instruction, as the
// installed formatter wrote them.
function blockLines(instruction: string): string[] {
  const [, block] = instruction.split("\n\n");
  return (block ?? "").split("\n");
}

// What every one-shot launch shares, whichever host carried it: where the
// session opened, the instruction's command, block and developer text, the
// launch record's request and context, and origin untouched.
export async function expectEstablishedOneShot({
  origin,
  server,
  workflow,
  policy,
  before,
  host,
  cwd,
  instruction,
}: {
  origin: StartOrigin;
  server: DashboardServer;
  workflow: Workflow;
  policy: SessionPolicy;
  before: Awaited<ReturnType<typeof originState>>;
  host: "claude" | "codex";
  cwd: string | undefined;
  instruction: string;
}) {
  const defaultMain = policy.workspace === "default-checkout";
  const workspace = defaultMain
    ? origin.project
    : path.join(origin.project, ".worktrees", slug);
  const branch = defaultMain ? "main" : `${host}/${slug}`;
  expect(cwd).toBe(realpathSync(workspace));
  const flags = [
    "--one-shot",
    ...(defaultMain ? ["--default-main"] : []),
    ...(policy.landing === "auto-land" ? ["--auto-land"] : []),
  ];
  const [command, , developer] = instruction.split("\n\n");
  expect(command).toBe(
    `${host === "codex" ? "$" : "/"}${workflows[workflow]} ${[queuedIdentity, ...flags].join(" ")}`,
  );
  expect(developer).toBe("Keep it small.");
  const lines = blockLines(instruction);
  expect(lines[0]).toBe(
    workflow === "execution"
      ? "Established start:"
      : "Established preparation:",
  );
  const startingRevision = (await origin.originGit("rev-parse", "main")).trim();
  for (const line of [
    "- tracking: one-shot",
    `- identity: ${queuedIdentity}`,
    `- workspace: ${workspace}`,
    `- workspace role: ${policy.workspace}`,
    `- branch: ${branch}`,
    "- remote: origin",
    "- target: main",
    `- landing: ${policy.landing}`,
    `- startingRevision: ${startingRevision}`,
  ]) {
    expect(lines, instruction).toContain(line);
  }
  expect(instruction).not.toMatch(/agent:|publishedSha|publisher ID/);

  // Nothing was published at start: no profile, Take, branch, or push.
  expect(await originState(origin)).toEqual(before);
  expect(existsSync(path.join(origin.project, ".worktrees", slug))).toBe(
    !defaultMain,
  );

  const [record] = (await recordsOf(server, "open-dough")) as Record<
    string,
    unknown
  >[];
  expect((record?.["request"] as Record<string, unknown>)["policy"]).toEqual(
    policy,
  );
  expect(record?.[workflow === "execution" ? "start" : "preparation"]).toEqual({
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
    // Only the default checkout's start reports the fetched trunk beside its
    // own HEAD.
    ...(workflow === "execution" && defaultMain
      ? { fetched: startingRevision }
      : {}),
  });
  expect(record?.[workflow === "execution" ? "preparation" : "start"]).toBe(
    undefined,
  );
  // The session took the start over: nothing is kept for a later launch.
  expect(await keptStarts(server)).toEqual([]);
}
