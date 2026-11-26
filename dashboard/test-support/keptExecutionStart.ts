// Fixtures for a queued story's execution start, its origin's `pre-receive`
// hook, and its launch answer.

import { chmodSync, rmSync, writeFileSync } from "node:fs";
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

// A launch answered without a session.
export type Problem = { kind: string; reason: string; explanation: string };
export const answerOf = async <T>(response: Promise<RawResponse>) =>
  JSON.parse((await response).body) as T;

const hookOf = (origin: StartOrigin) =>
  path.join(origin.origin, "hooks", "pre-receive");

export function installHook(origin: StartOrigin, body: string): void {
  writeFileSync(hookOf(origin), `#!/bin/sh\n${body}`);
  chmodSync(hookOf(origin), 0o755);
}

export function removeHook(origin: StartOrigin): void {
  rmSync(hookOf(origin));
}
