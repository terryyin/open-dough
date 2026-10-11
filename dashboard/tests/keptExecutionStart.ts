// Fixtures for ./agent-launch-start-resume.spec.ts: the queued story's execution
// launch request against a real bare origin (./support/startOrigin.ts), its
// workspace, the origin's `pre-receive` hook that makes a push slow or
// refuses it, what this machine keeps of the start, the launch answers as read,
// and the server interruption used to exercise recovery.

import {
  chmodSync,
  existsSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { expect } from "@playwright/test";
import { attempts, launch, launchRequest } from "./agentLaunchBoundary.ts";
import type { DashboardServer } from "./support/dashboardServer.ts";
import type { RawResponse } from "./support/rawHttp.ts";
import {
  queuedIdentity,
  queuedTitle,
  type StartOrigin,
} from "./support/startOrigin.ts";

export const request = {
  ...launchRequest,
  identity: queuedIdentity,
  title: queuedTitle,
};
export const slug = "prepare-the-queued-start";
export const keptFacts = `~/git/open-dough/.worktrees/${slug}`;

// A launch answered without a session, and a launched one with its start.
export type Problem = { kind: string; reason: string; explanation: string };
export type Launched = {
  kind: string;
  record: {
    start?: { candidateSha?: string; workspace: string; publishedSha?: string };
  };
};
export const answerOf = async <T>(response: Promise<RawResponse>) =>
  JSON.parse((await response).body) as T;

export const workspaceOf = (origin: StartOrigin) =>
  path.join(origin.project, ".worktrees", slug);

const hookOf = (origin: StartOrigin) =>
  path.join(origin.origin, "hooks", "pre-receive");

export function installHook(origin: StartOrigin, body: string): void {
  writeFileSync(hookOf(origin), `#!/bin/sh\n${body}`);
  chmodSync(hookOf(origin), 0o755);
}

export function removeHook(origin: StartOrigin): void {
  rmSync(hookOf(origin));
}

// What this machine keeps of the queued story's start, if anything.
export function keptStartOf(
  origin: StartOrigin,
): Record<string, unknown> | undefined {
  const kept = JSON.parse(
    readFileSync(
      path.join(
        origin.machine,
        "home/.open-dough/dashboard/execution-starts.json",
      ),
      "utf8",
    ),
  ) as { "open-dough"?: Record<string, Record<string, unknown>> };
  return kept["open-dough"]?.[queuedIdentity];
}

// One claim on origin, made from the one workspace.
export async function expectOneClaim(origin: StartOrigin): Promise<void> {
  expect(await origin.takenProfiles()).toHaveLength(1);
  expect(readdirSync(path.join(origin.project, ".worktrees"))).toEqual([slug]);
}

// The server dies with the start's push held after the claim commit, so no
// result or recovery was recorded; a new server reads the same machine state.
export async function loseServerAfterClaimCommit(
  origin: StartOrigin,
  serve: () => Promise<DashboardServer>,
): Promise<string> {
  const held = path.join(origin.machine, "push-held");
  let server = await serve();
  installHook(
    origin,
    `touch ${held}\nwhile [ -e ${held} ]; do sleep 0.2; done\nexit 1\n`,
  );
  void launch(server, request).catch(() => undefined);
  await expect.poll(() => existsSync(held), { timeout: 20_000 }).toBe(true);
  // End the server and script while their push has not answered.
  const closing = server.close();
  try {
    execFileSync("pkill", ["-f", origin.machine]);
  } catch {
    // Nothing of the start was left running.
  }
  rmSync(held);
  await closing;
  removeHook(origin);
  expect(keptStartOf(origin)?.["start"]).toBeUndefined();
  expect(keptStartOf(origin)?.["candidateSha"]).toBeUndefined();
  expect(await origin.takenProfiles()).toEqual([]);
  server = await serve();
  // No server runs the unsettled attempt now; only its continuation resumes it.
  const [interrupted] = await attempts(server);
  expect(interrupted).toMatchObject({ owned: false });
  expect(interrupted?.outcome).toBeUndefined();
  expect(await answerOf<Problem>(launch(server, request))).toMatchObject({
    kind: "failed",
    reason: "already-starting",
  });
  return interrupted?.id ?? "";
}
