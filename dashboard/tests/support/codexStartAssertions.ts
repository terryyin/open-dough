// Assertions inspect the actual published claim and forwarded installed handoff.
import path from "node:path";
import { expectReportingBlock } from "./reportingInputAssertions.ts";
import type { DashboardServer } from "./dashboardServer.ts";
import { expect } from "./codexStart.ts";
import type { LaunchRecord } from "../../src/agentLaunch.ts";
import type { FakeCodex } from "./fakeCodex.ts";
import { queuedIdentity } from "./startOrigin.ts";

export function expectExecutionInput(
  record: LaunchRecord | undefined,
  native: FakeCodex,
  workspace: string,
  original: string,
  revision: string,
  agent: unknown,
  server: DashboardServer,
  changedSinceReview = false,
) {
  const start = record?.start;
  if (start === undefined) throw new Error("Missing established start.");
  if ("tracking" in start) throw new Error("Unexpected one-shot start.");
  expect(start).toMatchObject({
    identity: queuedIdentity,
    workspace,
    branch: "codex/story-a",
    mode: "story-branch",
    remote: "origin",
    target: "main",
    publishedSha: revision,
    agent,
    plan: "slice-plans/A/PLAN.md",
    startingRevision: original,
    candidateSha: revision,
  });
  expect(Boolean(start.changedSinceReview)).toBe(changedSinceReview);
  expect(start.publisherId).toMatch(/^dashboard-.+-open-dough$/);
  const handoff = [
    "Established start:",
    `- identity: ${queuedIdentity}`,
    `- publisher ID: ${start.publisherId}`,
    `- workspace: ${workspace}`,
    "- branch: codex/story-a",
    "- mode: story-branch",
    "- remote: origin",
    "- target: main",
    `- publishedSha: ${revision}`,
    `- agent: ${start.agent}`,
    "- plan: slice-plans/A/PLAN.md",
    `- startingRevision: ${original}`,
    `- candidateSha: ${revision}`,
    ...(changedSinceReview
      ? ["- readiness: Changed since readiness review"]
      : []),
  ].join("\n");
  const turns = native.calls.filter((call) => call.method === "turn/start");
  const input = turns[0]?.params["input"] as { type: string; text?: string }[];
  const text = input[0]?.text ?? "";
  const [command, block, reporting, developer, ...extra] = text.split("\n\n");
  expect(command).toBe(`$dough-execute-plan ${queuedIdentity}`);
  expect(block).toBe(handoff);
  expectReportingBlock(reporting, record?.request, server);
  expect(developer).toBe("Implement the selected slice.");
  expect(extra).toEqual([]);
  expect(native.calls.filter((call) => call.method === "turn/start")).toEqual([
    {
      method: "turn/start",
      params: {
        threadId: native.threadId,
        input: [
          { type: "text", text },
          {
            type: "skill",
            name: "dough-execute-plan",
            path: path.join(
              workspace,
              ".agents/skills/dough-execute-plan/SKILL.md",
            ),
          },
        ],
      },
    },
  ]);
  expect(record?.request).not.toHaveProperty("model");
  expect(record?.firstInput).toMatchObject({
    state: "confirmed",
    turnId: "native-turn-id",
    instruction: text,
  });
}
