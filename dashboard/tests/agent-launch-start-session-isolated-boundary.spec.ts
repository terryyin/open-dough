// The launch boundary honors an unattached request's isolated workspace,
// with a real bare origin (./support/startOrigin.ts), the installed start
// recorded as it runs (./support/startSessionLanding.ts): slug variations
// and collisions belong to ./boundary/launch-workspace.spec.ts. A host
// whose installation cannot establish a session offers only the default
// choices in the dialog, and Codex starts with the worktree as its working
// directory. The dialog's journeys are in
// ./agent-launch-start-session-isolated.spec.ts.

import { realpathSync } from "node:fs";
import type { LaunchRecord } from "../src/launchRecord.ts";
import { launch, recordsOf } from "./agentLaunchBoundary.ts";
import { startSession, startSessionDialog } from "./launchStoryCardPage.ts";
import type { DashboardServer } from "./support/dashboardServer.ts";
import { expect, test } from "./support/preparationPage.ts";
import { expectReportingBlock } from "./support/reportingInputAssertions.ts";
import { openBacklog, originMain, radio } from "./support/sessionDialog.ts";
import {
  established,
  isolatedSession,
  isolatedStart,
  originHeads,
  recordStarts,
  sessionBlock,
  withoutSessionFormatter,
  worktree,
  worktrees,
} from "./support/startSessionLanding.ts";

const text = "Tidy the README wording";
const slug = "tidy-the-readme-wording";

const launched = async (dashboard: DashboardServer, body: unknown) =>
  JSON.parse((await launch(dashboard, body)).body) as {
    kind: string;
    record?: LaunchRecord;
  };

const request = { source: "open-dough", workflow: "ad-hoc", host: "claude" };
const isolated = (landing: "review" | "auto-land") => ({
  workspace: "isolated",
  landing,
});

test("a host whose installation cannot establish a session offers only the default choices, and says why", async ({
  page,
  dashboard,
  origin,
}) => {
  withoutSessionFormatter(origin);
  await openBacklog(page, origin);
  await startSession(page, "Open Dough").click();
  const dialog = startSessionDialog(page, "Open Dough");
  const why = dialog.getByText(
    "Isolated workspace and Automatically land are not offered: the installed skills in this project do not establish a session without a story for this host.",
  );
  await expect(why).toBeVisible();
  await expect(
    dialog.getByRole("group", { name: "Workspace" }),
  ).toHaveAccessibleDescription(await why.innerText());
  for (const [group, name] of [
    ["Workspace", "Isolated workspace"],
    ["After checks", "Automatically land"],
  ] as const)
    await expect(radio(dialog, group, name)).toBeDisabled();
  for (const [group, name] of [
    ["Workspace", "Default main"],
    ["After checks", "Wait for review"],
  ] as const) {
    await expect(radio(dialog, group, name)).toBeEnabled();
    await expect(radio(dialog, group, name)).toBeChecked();
  }

  // The default choices still start, needing nothing of the installation.
  dashboard.claudeScenario("launched");
  await dialog.getByRole("button", { name: "Start", exact: true }).click();
  await expect(dialog).toBeHidden();
  await expect.poll(() => recordsOf(dashboard, "open-dough")).toHaveLength(1);
  const [record] = await recordsOf(dashboard, "open-dough");
  expect(record).not.toHaveProperty("establishedSession");
  expect(dashboard.claudeLaunchCalls()[0]?.cwd).toBe(
    realpathSync(origin.project),
  );
  expect(worktrees(origin.project)).toEqual([]);
});

test.describe("Codex", () => {
  test.use({ preparationHost: "codex" });

  test("starts with the worktree as its working directory and the same block", async ({
    dashboard,
    codexProtocol,
    origin,
  }) => {
    const native = codexProtocol;
    if (native === undefined) throw new Error("Missing native fixture.");
    const starts = recordStarts(origin, "codex");
    const before = await originMain(origin);
    const heads = await originHeads(origin);
    const answer = await launched(dashboard, {
      ...request,
      host: "codex",
      instruction: text,
      policy: isolated("review"),
    });
    expect(answer.kind).toBe("launched");
    const session = isolatedSession(
      origin.project,
      slug,
      "review",
      before,
      "codex",
    );
    expect(answer.record?.establishedSession).toEqual(session);
    expect(starts().map(({ argv }) => argv)).toEqual([
      isolatedStart(origin.project, slug, "review", "codex"),
    ]);
    expect(established(origin.project, slug)).toEqual({
      branch: `codex/${slug}`,
      revision: before,
    });
    expect(
      native.calls.find((call) => call.method === "thread/start")?.params,
    ).toMatchObject({ cwd: worktree(origin.project, slug) });
    const turns = native.calls.filter((call) => call.method === "turn/start");
    expect(turns).toHaveLength(1);
    const input = (turns[0]?.params as { input: { text: string }[] }).input;
    const [block, reporting, ...developer] = (input[0]?.text ?? "").split(
      "\n\n",
    );
    expect(block).toBe(sessionBlock(session));
    expectReportingBlock(reporting, answer.record?.request, dashboard);
    expect(developer).toEqual([text]);
    expect(await originHeads(origin)).toBe(heads);
  });
});
