// Vendor report payload and privately retired workspace for real dashboard journeys.
import {
  mkdirSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { expect, stored } from "./codexLaunch.ts";
import { launch, refinementRequest } from "../agentLaunchBoundary.ts";
import { notRefinedIdentity, notRefinedStory } from "../launchJourney.ts";
import { codexAttaches } from "./codexTerminal.ts";
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
          text: report,
          memoryCitation: null,
          delivery: null,
          questions: null,
        },
      ],
    },
  ];
  native.observations.set(native.threadId, {
    status: { type: "notLoaded" },
    turns: [{ id: "landing-turn", status: "completed" }],
  });
  save(dashboard.home, records);
  return { record: { ...record, session: record.session }, workspace };
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
