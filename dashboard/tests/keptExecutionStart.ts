// Shared by ./agent-launch-start-resume.spec.ts: the queued story's execution
// launch request against a real bare origin (./support/startOrigin.ts), its
// workspace, the origin's `pre-receive` hook that makes a push slow or
// refuses it, what this machine keeps of the start, and the launch answers
// as read.

import {
  chmodSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { expect } from "@playwright/test";
import { launchRequest } from "./agentLaunchBoundary.ts";
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
