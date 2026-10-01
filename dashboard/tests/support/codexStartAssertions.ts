// Assertions inspect the actual published claim and forwarded installed handoff.
import path from "node:path";
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
) {
  const start = record?.start;
  if (start === undefined) throw new Error("Missing established start.");
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
  ].join("\n");
  const text = `$dough-execute-plan ${queuedIdentity}\n\n${handoff}\n\nImplement the selected slice.`;
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
