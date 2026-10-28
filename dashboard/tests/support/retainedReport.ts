// Vendor report payload and privately retired workspace for real dashboard journeys.
import { execFileSync } from "node:child_process";
import {
  mkdirSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { expect, stored } from "./codexLaunch.ts";
import { launch, refinementRequest } from "../agentLaunchBoundary.ts";
import { notRefinedIdentity, notRefinedStory } from "../launchJourney.ts";
import { codexAttaches } from "./codexTerminal.ts";
import { completionReport } from "./completionReport.ts";
import type { LaunchRecord } from "../../src/agentLaunch.ts";
import type { FakeCodex } from "./fakeCodex.ts";
import type { DashboardServer } from "./dashboardServer.ts";

export const report =
  "Landed on main at `a5df85d90a`.\n\n- Story 2 remains **not ready**.\n- Removed the worktree and branch.\n\nNo product code changed.\n<script>window.reportExecuted=true</script>";
export const storeFile = (home: string) =>
  path.join(home, ".open-dough", "dashboard", "agent-launches.json");
export function save(home: string, records: LaunchRecord[]) {
  const file = storeFile(home);
  const document = JSON.parse(readFileSync(file, "utf8")) as Record<
    string,
    LaunchRecord[]
  >;
  document["open-dough"] = records;
  writeFileSync(file, JSON.stringify(document));
}
export async function retained(
  dashboard: DashboardServer,
  native: FakeCodex,
  unknown = false,
) {
  await launch(dashboard, {
    ...refinementRequest,
    host: "codex",
    identity: notRefinedIdentity,
    title: notRefinedStory,
  });
  const workspace = path.join(dashboard.home, "private-workspace");
  mkdirSync(workspace);
  rmSync(workspace, { recursive: true });
  if (unknown) symlinkSync(workspace, workspace);
  const records = stored(dashboard.home);
  const record = records[0];
  if (
    record === undefined ||
    record.session.host !== "codex" ||
    record.session.continuation === undefined
  )
    throw new Error("Missing recorded session");
  record.session.continuation.workspace = workspace;
  keepFinalReport(native, workspace, report);
  native.observations.set(native.threadId, {
    status: { type: "notLoaded" },
    turns: [{ id: "landing-turn", status: "completed" }],
  });
  save(dashboard.home, records);
  return { record: { ...record, session: record.session }, workspace };
}
// A launch of the not-refined story recorded with a prepared workspace that
// still exists, for a journey to retire; the host helpers below specialize
// its session and completion report saying `message`.
async function recordedRetired(
  dashboard: DashboardServer,
  workspaceName: string,
  branch: string,
  missing: string,
) {
  await launch(dashboard, {
    ...refinementRequest,
    identity: notRefinedIdentity,
    title: notRefinedStory,
  });
  const record = stored(dashboard.home)[0];
  if (record === undefined) throw new Error(missing);
  const workspace = path.join(dashboard.home, workspaceName);
  mkdirSync(workspace);
  record.preparation = {
    identity: notRefinedIdentity,
    workspace,
    branch,
    remote: "origin",
    target: "main",
  };
  return { record, workspace };
}
// The Claude specialization: its session has exited.
export async function recordedClaude(
  dashboard: DashboardServer,
  message = report,
) {
  const { record, workspace } = await recordedRetired(
    dashboard,
    "retired-claude-workspace",
    "claude/retired",
    "Missing Claude launch",
  );
  record.completion = completionReport({ message });
  dashboard.claudeSessionBecomes(record.session.sessionId, "done-exited");
  save(dashboard.home, [record]);
  return { record, workspace };
}
// The Cursor specialization, seeded from a story launch record. Its
// continuation names that workspace, as a real Cursor record's resume
// command does; no Cursor runner holds the session.
export async function recordedCursor(
  dashboard: DashboardServer,
  message = report,
) {
  const { record, workspace } = await recordedRetired(
    dashboard,
    "retired-cursor-workspace",
    "cursor/retired",
    "Missing Cursor launch",
  );
  const sessionId = "11111111-1111-4111-8111-111111111111";
  record.session = {
    host: "cursor",
    sessionId,
    name: record.session.name,
    continuation: {
      workspace,
      args: ["cursor-agent", "--workspace", workspace, "--resume", sessionId],
    },
  };
  record.completion = completionReport({ message });
  save(dashboard.home, [record]);
  return { record, workspace };
}

// A minimal repository whose remote-tracking target contains a backlog without
// `identity`, so tracked-execution closure readability holds for a planted landing.
export function plantTrackedClosureRepository(repository: string): {
  readonly revision: string;
} {
  mkdirSync(path.join(repository, ".planning"), { recursive: true });
  execFileSync("git", ["init", "-b", "main"], { cwd: repository });
  writeFileSync(
    path.join(repository, ".planning", "PRODUCT-BACKLOG.md"),
    "# Product backlog\n\n## Taken\n\n## Backlog list\n",
  );
  const git = (...args: string[]) =>
    execFileSync("git", args, { cwd: repository }).toString().trim();
  git("add", ".");
  git(
    "-c",
    "user.email=fixture@example",
    "-c",
    "user.name=fixture",
    "commit",
    "-m",
    "closed",
  );
  const revision = git("rev-parse", "HEAD");
  git("update-ref", "refs/remotes/origin/main", revision);
  return { revision };
}

// Retained landing plus claimed start so panel composition and quiet-Done
// admission reuse existing tracked-execution closure-gate facts without inventing
// a parallel owner. Identity stays the launch's own story identity.
export function keepTrackedClosureEvidence(
  record: LaunchRecord,
  repository: string,
  revision: string,
  workspace: string,
): LaunchRecord {
  if (!("identity" in record.request)) {
    throw new Error(
      "Tracked closure fixture requires a story-identity launch request",
    );
  }
  const identity = record.request.identity;
  return {
    ...record,
    request: { ...record.request, workflow: "execution" },
    start: {
      identity,
      publisherId: "closure-fixture",
      workspace,
      branch: "cursor/retired",
      mode: "story-branch",
      remote: "origin",
      target: "main",
      publishedSha: "a".repeat(40),
    },
    landing: {
      reference: randomUUID(),
      delivery: randomUUID(),
      receipt: randomUUID(),
      repository,
      identity,
      remote: "origin",
      target: "refs/heads/main",
      base: revision,
      revision,
      receivedAt: "2026-10-01T10:00:00.000Z",
    },
  };
}
export function passive(native: FakeCodex, since: number) {
  expect(
    native.calls
      .slice(since)
      .every((call) =>
        [
          "initialize",
          "initialized",
          "thread/read",
          "thread/turns/list",
        ].includes(call.method),
      ),
  ).toBe(true);
  expect(codexAttaches(native)).toEqual([]);
}

// The conversation's native history in `workspace`: one completed turn whose
// final answer is `text`, the final report Codex keeps for it.
export function keepFinalReport(
  native: FakeCodex,
  workspace: string,
  text: string,
) {
  const protocol = native;
  protocol.cwd = workspace;
  protocol.history = [
    {
      id: "landing-turn",
      status: "completed",
      items: [
        {
          type: "agentMessage",
          id: "final",
          phase: "final_answer",
          text,
          memoryCitation: null,
          delivery: null,
          questions: null,
        },
      ],
    },
  ];
}
