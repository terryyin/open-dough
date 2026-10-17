// Only preconditions for own-record Continue proof: a kept attempt, durable
// records and invocation traps. The service must establish the settlement.
import { randomUUID } from "node:crypto";
import {
  chmodSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { expect } from "@playwright/test";
import type { AttemptObservation } from "../../src/agentLaunch.ts";
import { installedSkillPath } from "../../server/launchHosts.ts";
import { keptAttempts } from "../acceptedAttempts.ts";
import {
  keptStarts,
  launchRequest,
  runningStarts,
} from "../agentLaunchBoundary.ts";
import {
  openStoryRecord,
  seedStore,
  storeFile,
} from "../machineLaunchRecords.ts";
import type { DashboardServer } from "../support/dashboardServer.ts";
import { queuedIdentity, type StartOrigin } from "../support/startOrigin.ts";

export function ownRecordContinuation(
  dashboard: DashboardServer,
  origin: StartOrigin,
  workflow: "execution" | "refinement",
  uncertain: boolean,
) {
  const id = randomUUID();
  const acceptedAt = new Date().toISOString();
  const request = {
    ...launchRequest,
    identity: queuedIdentity,
    title: "Story A",
    workflow,
  };
  const folder = path.join(dashboard.home, ".open-dough/dashboard");
  const file = path.join(folder, "launch-attempts.json");
  mkdirSync(folder, { recursive: true });
  const attempt = {
    id,
    request,
    acceptedAt,
    publication: { kind: "none" },
    worker: { pid: 2147483647, step: "launch", notedAt: acceptedAt },
    slowSince: acceptedAt,
    ...(uncertain
      ? {
          outcome: {
            kind: "uncertain",
            reason: "unconfirmed",
            explanation: "Interrupted handoff.",
          },
          settledAt: acceptedAt,
        }
      : {}),
  };
  const kept = JSON.stringify({ "open-dough": [attempt] });
  writeFileSync(file, kept);
  const latestId = randomUUID();
  const records = [
    {
      ...openStoryRecord("codex", latestId, request),
      launchedAt: new Date(Date.parse(acceptedAt) + 2).toISOString(),
    },
    {
      ...openStoryRecord("claude", randomUUID(), request),
      launchedAt: new Date(Date.parse(acceptedAt) + 1).toISOString(),
    },
    {
      ...openStoryRecord("claude", randomUUID(), {
        ...request,
        workflow: workflow === "execution" ? "refinement" : "execution",
      }),
      launchedAt: new Date(Date.parse(acceptedAt) + 3).toISOString(),
    },
    {
      ...openStoryRecord("claude", randomUUID(), {
        ...request,
        identity: "another-story",
      }),
      launchedAt: new Date(Date.parse(acceptedAt) + 4).toISOString(),
    },
    {
      ...openStoryRecord("claude", randomUUID(), request),
      launchedAt: new Date(Date.parse(acceptedAt) - 1).toISOString(),
    },
  ];
  const stored = JSON.stringify({ "open-dough": records });
  seedStore(origin.machine, stored);
  const marker = path.join(origin.machine, "unexpected-start");
  const skill =
    workflow === "execution" ? "dough-execute-plan" : "dough-story-refinement";
  const script =
    workflow === "execution"
      ? "execution-start.mjs"
      : "preparation-assignment.mjs";
  const installed = installedSkillPath(
    "claude",
    { path: origin.project, shown: origin.project },
    skill,
    "scripts",
    script,
  );
  // Detect a script invocation independently of publication or native calls.
  const original = readFileSync(installed, "utf8");
  const offset = original.startsWith("#!") ? original.indexOf("\n") + 1 : 0;
  writeFileSync(
    installed,
    `${original.slice(0, offset)}import { writeFileSync as markUnexpectedStart } from 'node:fs';
markUnexpectedStart(${JSON.stringify(marker)}, 'called');
${original.slice(offset)}`,
  );
  const outcome = {
    kind: "launched",
    session: { host: "codex", sessionId: latestId },
  };
  return {
    id,
    acceptedAt,
    outcome,
    records: stored,
    restoreScript: () => {
      writeFileSync(installed, original);
    },
    readOnly: (yes: boolean) => {
      chmodSync(folder, yes ? 0o555 : 0o755);
    },
    unchanged: () => {
      expect(readFileSync(file, "utf8")).toBe(kept);
    },
    settled: (answered: AttemptObservation | undefined) => {
      const durable = Object.fromEntries(
        Object.entries(answered ?? {}).filter(
          ([key]) => key !== "owned" && key !== "running",
        ),
      );
      expect(keptAttempts(dashboard)).toEqual([durable]);
      expect(answered?.settledAt).toEqual(expect.any(String));
    },
    nothingStarted: async (expectedRecords = stored) => {
      expect(existsSync(marker)).toBe(false);
      expect(dashboard.claudeLaunchCalls()).toEqual([]);
      expect(dashboard.codex.calls).toEqual([]);
      expect(await runningStarts(dashboard)).toEqual([]);
      expect(await keptStarts(dashboard)).toEqual([]);
      expect(await origin.takenProfiles()).toEqual([]);
      expect(readFileSync(storeFile(origin.machine), "utf8")).toBe(
        expectedRecords,
      );
    },
  };
}
