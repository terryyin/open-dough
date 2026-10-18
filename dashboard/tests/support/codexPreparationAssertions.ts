// The actual refinement input forwards its established preparation and options.
import path from "node:path";
import { expect } from "./preparationPage.ts";
import { stored } from "./codexLaunch.ts";
import { expectReportingBlock } from "./reportingInputAssertions.ts";
import { queuedIdentity, type StartOrigin } from "./startOrigin.ts";
import type { EstablishedPreparation } from "../../src/agentLaunch.ts";
import type { DashboardServer } from "./dashboardServer.ts";
import type { FakeCodex } from "./fakeCodex.ts";

export function expectPreparationInput(
  native: FakeCodex,
  preparation: Exclude<EstablishedPreparation, { tracking: "one-shot" }>,
  restarted: DashboardServer,
  origin: StartOrigin,
) {
  const { workspace, publishedSha } = preparation;
  const inputs = native.calls.filter(({ method }) => method === "turn/start");
  expect(inputs).toHaveLength(1);
  const input = inputs[0]?.params["input"] as Array<{
    type: string;
    text?: string;
    path?: string;
  }>;
  const text = input[0]?.text ?? "";
  const [command, block, reporting, instruction, ...extra] = text.split("\n\n");
  expect(extra).toEqual([]);
  expectReportingBlock(
    reporting,
    stored(restarted.home)[0]?.request,
    restarted,
  );
  expect(command).toBe(`$dough-story-refinement ${queuedIdentity} --explore`);
  expect(instruction).toBe("Focus on the examples.");
  expect(text.match(/Established preparation:/g)).toHaveLength(1);
  for (const line of [
    `- workspace: ${workspace}`,
    "- branch: codex/story-a",
    `- agent: ${String(preparation.agent)}`,
    `- publishedSha: ${publishedSha}`,
    `- integration checkout: ${origin.project}`,
  ])
    expect(block).toContain(line);
  expect(input[1]).toMatchObject({
    type: "skill",
    path: path.join(
      workspace,
      ".agents/skills/dough-story-refinement/SKILL.md",
    ),
  });
}
