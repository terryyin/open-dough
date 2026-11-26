// Fixtures for a queued story's execution start against a real bare origin
// (./support/startOrigin.ts), its workspace, the origin's `pre-receive` hook,
// the kept start, and the launch answer.

import { chmodSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { RawResponse } from "./support/rawHttp.ts";
import {
  queuedIdentity,
  queuedTitle,
  type StartOrigin,
} from "./support/startOrigin.ts";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";

export const request = makeMe.aLaunchRequest
  .executing({ identity: queuedIdentity, title: queuedTitle })
  .please();
export const slug = "prepare-the-queued-start";
export const keptFacts = `~/git/open-dough/.worktrees/${slug}`;

// A launch answered without a session.
export type Problem = { kind: string; reason: string; explanation: string };
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
