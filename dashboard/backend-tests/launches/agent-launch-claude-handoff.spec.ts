// Installed execution and refinement reach the confirmed Claude process.
import { realpathSync } from "node:fs";
import path from "node:path";
import { afterEach, beforeAll, beforeEach, expect, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  queuedRepositoryWithRoughStory,
  roughStoryC,
  storyA,
} from "../../../Distribution/tests/support/queued-repository.mjs";
import { AgentLaunches } from "../../server/agentLaunches.ts";
import * as baseCi from "../../server/baseCiJudgment.ts";
import { NativeDoneMarks } from "../../server/doneMarks.ts";
import { keptRecords } from "../../server/launchRecordStore.ts";
import { machineFolder } from "../../server/localFolder.ts";
import { mountProjectConfiguration } from "../../server/projectConfiguration.ts";
import type { AgentLaunchRequest } from "../../src/agentLaunch.ts";
import {
  installFakeClaude,
  type FakeClaudeControls,
} from "../../test-support/support/fakeClaude.ts";
import {
  expectReportingBlock,
  installedStoryLaunchInput,
} from "../../test-support/support/reportingInputAssertions.ts";
import {
  startOrigin,
  type StartOrigin,
} from "../../test-support/support/startOrigin.ts";
import { keepStartedOrigin } from "../../test-support/support/startOriginPreparation.ts";

const repository = queuedRepositoryWithRoughStory(roughStoryC).please();
const source = makeMe.aPublishedSource.openDough.please();
const execution = makeMe.aLaunchRequest.executing(storyA).please();
const refinement = makeMe.aLaunchRequest
  .refining(roughStoryC)
  .withInstruction("Focus on the empty-state wording")
  .please();
const reportingOrigin = "http://127.0.0.1:4173";
let origin: StartOrigin;
let native: FakeClaudeControls;
let home: string;
let launches: AgentLaunches;
let marks: NativeDoneMarks;
let unmount: () => void;

beforeAll(async () => {
  const prepared = await startOrigin(repository);
  try {
    keepStartedOrigin("claude", repository, prepared);
  } finally {
    prepared.cleanup();
  }
});

beforeEach(async () => {
  origin = await startOrigin(repository);
  const fixture = installFakeClaude(
    origin.machine,
    { binDir: origin.machine, path: process.env.PATH ?? "" },
    {},
  );
  native = fixture.controls;
  for (const [key, value] of Object.entries(fixture.env))
    vi.stubEnv(key, value);
  home = path.join(origin.machine, "home");
  vi.spyOn(baseCi, "judgeBranchCi").mockResolvedValue({
    state: "pass",
    revision: (await origin.originGit("rev-parse", "main")).trim(),
    subject: "Fixture base",
    laterWithoutResult: 0,
  });
  unmount = mountProjectConfiguration("production");
  marks = new NativeDoneMarks({
    terminals: { withAttachment: vi.fn(), endAttachments: vi.fn() },
    hostFor: () => undefined,
    reportingFolder: machineFolder,
  });
  launches = new AgentLaunches(marks);
});

afterEach(async () => {
  await launches.drain();
  launches.close();
  await marks.close();
  unmount();
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  origin.cleanup();
});

async function launch(request: AgentLaunchRequest) {
  const accepted = await launches.accept(source, request, reportingOrigin);
  if (accepted.kind !== "accepted") {
    throw new Error(`Expected an accepted launch: ${JSON.stringify(accepted)}`);
  }
  await launches.drain();
  return (await launches.attempts()).attempts.find(
    ({ id }) => id === accepted.attempt.id,
  )?.outcome;
}

test.each([
  {
    label: "Execution",
    request: execution,
    story: storyA,
    claim: "start",
    branch: "claude/story-a",
    block: "Established start:",
    command: "/dough-execute-plan",
  },
  {
    label: "Refinement",
    request: refinement,
    story: roughStoryC,
    claim: "preparation",
    branch: "claude/story-c",
    block: "Established preparation:",
    command: "/dough-story-refinement",
  },
] as const)(
  "keeps the confirmed Claude session from its $label worktree",
  async ({ label, request, story, claim, branch, block, command }) => {
    const answer = await launch(request);
    expect(answer?.kind).toBe("launched");
    const records = await keptRecords(source.id);
    const [record] = records;
    if (record?.session.host !== "claude")
      throw new Error("Expected a kept Claude session.");
    expect(records).toHaveLength(1);
    expect(answer).toMatchObject({
      session: { host: "claude", sessionId: record.session.sessionId },
    });
    expect(record.session.shortId).toMatch(/^[0-9a-f]{8}$/);
    expect(record.session.sessionId.startsWith(record.session.shortId)).toBe(
      true,
    );
    expect(record.request).toMatchObject(request);
    const project = realpathSync(origin.project);
    const workspace = path.join(project, ".worktrees", path.basename(branch));
    const publishedSha = (await origin.originGit("rev-parse", "main")).trim();
    const receipt = record[claim];
    if (receipt === undefined)
      throw new Error("Expected the installed publication receipt.");
    expect(receipt).toMatchObject({
      identity: story.identity,
      branch,
      publishedSha,
      remote: "origin",
      target: "main",
    });
    expect(realpathSync(receipt.workspace)).toBe(workspace);
    if (claim === "start")
      expect(record.start).toMatchObject({ mode: "story-branch" });

    const name = `Open Dough · ${label} · ${story.title}`;
    expect(record.session.name).toBe(name);
    const [started] = native.claudeLaunches();
    const input = installedStoryLaunchInput(started?.instruction);
    expect(input.invocation).toBe(`${command} ${story.identity}`);
    expect(input.instruction).toBe(request.instruction ?? "");
    expect(input.handoff?.split("\n").slice(0, 2)).toEqual([
      block,
      `- identity: ${story.identity}`,
    ]);
    for (const line of [
      `- workspace: ${receipt.workspace}`,
      `- branch: ${branch}`,
      `- publishedSha: ${publishedSha}`,
    ]) {
      expect(input.handoff).toContain(line);
    }
    expectReportingBlock(input.reporting, record.request, {
      home,
      origin: reportingOrigin,
    });
    expect(native.claudeCalls()).toEqual([
      {
        argv: [
          "--bg",
          "--name",
          name,
          "--effort",
          "medium",
          "--disallowedTools",
          "Artifact",
          "--",
          started?.instruction,
        ],
        cwd: workspace,
      },
      { argv: ["agents", "--json", "--all"], cwd: project },
    ]);
    expect(await keptRecords("doughnut")).toEqual([]);
  },
);
