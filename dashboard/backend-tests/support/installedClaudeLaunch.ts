import { realpathSync } from "node:fs";
import path from "node:path";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  queuedRepositoryWithRoughStory,
  roughStoryC,
  storyA,
  storyB,
} from "../../../Distribution/tests/support/queued-repository.mjs";
import type { RevisionFacts } from "../../../Distribution/tests/support/repositoryTestData.mjs";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import type { StoryLaunchRequest } from "../../src/launchRequest.ts";
import {
  launch,
  machineSessions,
  openDoughFolder,
} from "../../test-support/agentLaunchBoundary.ts";
import { expect, test as base } from "../../test-support/support/pageTest.ts";
import {
  startDashboardServer,
  type DashboardServer,
  type DashboardServerOptions,
} from "../../test-support/support/dashboardServer.ts";
import { expectReportingBlock } from "../../test-support/support/reportingInputAssertions.ts";
import { startOrigin } from "../../test-support/support/startOrigin.ts";

export const queuedExecution = makeMe.aLaunchRequest
  .executing(storyA)
  .please() as StoryLaunchRequest;
export const otherExecution = makeMe.aLaunchRequest
  .executing(storyB)
  .please() as StoryLaunchRequest;
export const roughRefinement = makeMe.aLaunchRequest
  .refining(roughStoryC)
  .please() as StoryLaunchRequest;
// Used when a case launches a second preparation after the rough story's Preparing assignment.
export const otherRefinement = makeMe.aLaunchRequest
  .refining(storyB)
  .please() as StoryLaunchRequest;
export const refinementSkill = "dough-story-refinement";
export const refinementSkillFolder = `.claude/skills/${refinementSkill}`;
export const refinementDefinition = `${refinementSkillFolder}/references/refinement-options.json`;

type Settings = Omit<
  DashboardServerOptions,
  "machine" | "mode" | "projectFolders"
>;

export const test = base.extend<{
  installedClaude: (
    settings?: Settings,
    revision?: RevisionFacts,
  ) => Promise<DashboardServer>;
}>({
  // eslint-disable-next-line no-empty-pattern
  installedClaude: async ({}, use) => {
    const disposers: Array<() => Promise<void>> = [];
    try {
      await use(async (settings = {}, revision) => {
        const queued = queuedRepositoryWithRoughStory(roughStoryC);
        const description =
          revision === undefined
            ? queued.please()
            : queued.withRevision("installed-variant", revision).please();
        const origin = await startOrigin(description);
        try {
          const server = await startDashboardServer({
            ...settings,
            mode: "boundary",
            machine: origin.machine,
            projectFolders: ["open-dough"],
          });
          disposers.push(async () => {
            try {
              await server.close();
            } finally {
              origin.cleanup();
            }
          });
          return server;
        } catch (error) {
          origin.cleanup();
          throw error;
        }
      });
    } finally {
      await Promise.all(disposers.map((dispose) => dispose()));
    }
  },
});

export async function launchClaude(server: DashboardServer, body: unknown) {
  server.claudeScenario("launched");
  const before = server.claudeLaunchCalls().length;
  const response = await launch(server, body);
  expect(response.status, response.body).toBe(200);
  const answer = JSON.parse(response.body) as {
    kind: string;
    record: LaunchRecord;
  };
  expect(answer.kind, response.body).toBe("launched");
  const launches = server.claudeLaunches();
  expect(launches).toHaveLength(before + 1);
  const started = launches[before];
  if (started === undefined) throw new Error("Missing native launch");
  return { record: answer.record, started };
}

export function expectStoryCommand(
  started: ReturnType<DashboardServer["claudeLaunches"]>[number],
  expectedCommand: string,
  expectedInstruction = "",
) {
  const [command, handoff, reporting, ...developer] = (
    started.instruction ?? ""
  ).split("\n\n");
  expect(command).toBe(expectedCommand);
  expect(developer.join("\n\n")).toBe(expectedInstruction);
  return { handoff, reporting };
}

export function expectStoryInput(
  server: DashboardServer,
  { record, started }: Awaited<ReturnType<typeof launchClaude>>,
  {
    command,
    identity,
    instruction = "",
  }: { command: string; identity: string; instruction?: string },
) {
  const execution = record.request.workflow === "execution";
  const receipt = execution ? record.start : record.preparation;
  if (receipt === undefined || "tracking" in receipt)
    throw new Error("Missing installed workflow publication receipt");
  expect(receipt).toMatchObject({
    identity,
    remote: "origin",
    target: "main",
    publishedSha: expect.stringMatching(/^[a-f0-9]{40}$/),
  });
  const checkout = realpathSync(receipt.workspace);
  expect(path.dirname(checkout)).toBe(
    path.join(openDoughFolder(server), ".worktrees"),
  );
  expect(started.cwd).toBe(checkout);
  const { handoff, reporting } = expectStoryCommand(
    started,
    command,
    instruction,
  );
  const block = (handoff ?? "").split("\n");
  expect(block.slice(0, 2)).toEqual([
    execution ? "Established start:" : "Established preparation:",
    `- identity: ${identity}`,
  ]);
  expect(block).toContain(`- workspace: ${receipt.workspace}`);
  expect(block).toContain(`- branch: ${receipt.branch}`);
  expect(block).toContain(`- publishedSha: ${receipt.publishedSha ?? ""}`);
  expectReportingBlock(reporting, record.request, server);
}

export async function refuseOptions(server: DashboardServer, body: unknown) {
  server.claudeScenario("launched");
  const recordsBefore = (await machineSessions(server)).length;
  const callsBefore = server.claudeCalls().length;
  const response = await launch(server, body);
  expect(response.status).toBe(400);
  expect(server.claudeCalls()).toHaveLength(callsBefore);
  expect(await machineSessions(server)).toHaveLength(recordsBefore);
  return (JSON.parse(response.body) as { error: string }).error;
}
