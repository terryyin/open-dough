// The launch boundary honors an unattached Codex request's isolated
// workspace, with a real bare origin (../../tests/support/startOrigin.ts) and
// the installed start recorded as it runs
// (../../tests/support/startSessionLanding.ts): Codex starts with the
// worktree as its working directory and the same established block, its
// reporting context and the developer's text. Slug variations and collisions
// belong to ./launch-workspace.spec.ts; the dialog's journeys to
// ../../../e2e/launches/agent-launch-start-session-isolated.spec.ts.
import { makeMe } from "../../../tests/support/makeMe.mjs";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import { launch } from "../../tests/agentLaunchBoundary.ts";
import type { DashboardServer } from "../../tests/support/dashboardServer.ts";
import { expect, test } from "../../tests/support/preparationPage.ts";
import { expectReportingBlock } from "../../tests/support/reportingInputAssertions.ts";
import { originMain } from "../../tests/support/sessionDialog.ts";
import {
  established,
  isolatedSession,
  isolatedStart,
  originHeads,
  recordStarts,
  sessionBlock,
  worktree,
} from "../../tests/support/startSessionLanding.ts";

const text = "Tidy the README wording";
const slug = "tidy-the-readme-wording";

const launched = async (dashboard: DashboardServer, body: unknown) =>
  JSON.parse((await launch(dashboard, body)).body) as {
    kind: string;
    record?: LaunchRecord;
  };

const request = makeMe.aLaunchRequest.adHoc().please();
const isolated = (landing: "review" | "auto-land") => ({
  workspace: "isolated",
  landing,
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
