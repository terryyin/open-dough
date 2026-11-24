import {
  admittedStory,
  isolatedAdmissionFlags,
} from "../../test-support/support/isolatedSessionAdmissionProof.ts";
// The launch boundary honors an unattached Codex request's isolated
// workspace, with a real bare origin (../../test-support/support/startOrigin.ts) and
// the installed start recorded as it runs
// (../../test-support/support/startSessionLanding.ts): Codex starts with the
// worktree as its working directory and the same established block, its
// reporting context and the developer's text. Slug variations and collisions
// belong to ./launch-workspace.spec.ts; the dialog's journeys to
// ../../../e2e/launches/agent-launch-start-session-isolated.spec.ts.
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import { launch } from "../../test-support/agentLaunchBoundary.ts";
import type { DashboardServer } from "../../test-support/support/dashboardServer.ts";
import { expect, test } from "../../test-support/support/preparationPage.ts";
import { expectReportingBlock } from "../../test-support/support/reportingInputAssertions.ts";
import { originMain } from "../../test-support/support/sessionDialog.ts";
import {
  established,
  isolatedSession,
  recordStarts,
  sessionBlock,
  worktree,
} from "../../test-support/support/startSessionLanding.ts";

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
    const answer = await launched(dashboard, {
      ...request,
      host: "codex",
      instruction: text,
      policy: isolated("review"),
    });
    expect(answer.kind, JSON.stringify(answer)).toBe("launched");
    const admitted = await admittedStory(origin, text);
    expect(admitted.revision).not.toBe(before);
    expect(answer.record?.request).toMatchObject({
      storyIdentity: admitted.identity,
    });
    const session = isolatedSession(
      origin.project,
      slug,
      "review",
      admitted.revision,
      "codex",
    );
    expect(answer.record?.establishedSession).toEqual(session);
    expect(starts().map(({ argv }) => argv)).toEqual([
      expect.arrayContaining(
        isolatedAdmissionFlags(origin.project, slug, "codex"),
      ),
    ]);
    expect(established(origin.project, slug)).toEqual({
      branch: `codex/${slug}`,
      revision: admitted.revision,
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
    expect(developer).toEqual([`Taken story: ${admitted.identity}`, text]);
    expect(await originMain(origin)).toBe(admitted.revision);
  });
});
