// A story launch's session policy reaches its session through one
// established context, over raw HTTP against the project's real installed
// start (`execution-start.mjs start --one-shot`, `preparation-assignment.mjs
// start --one-shot`) and a real bare origin (./support/startOrigin.ts), with
// the synthetic `claude` and Codex protocol boundaries. Every one-shot
// combination of workspace (isolated or default main) and landing (review or
// automatic) is started for both workflows: the session opens where the start
// established it, its instruction names the policy's flags and the
// established one-shot context, the start and launch records keep the policy
// and context, and origin is untouched at start (no profile, Take, branch, or
// push).

import { realpathSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { launch } from "./agentLaunchBoundary.ts";
import type { DashboardServer } from "./support/dashboardServer.ts";
import { installFakeCodex, type FakeCodex } from "./support/fakeCodex.ts";
import {
  expectEstablishedOneShot,
  oneShot,
  originState,
  requestFor,
  startPreview,
} from "./support/oneShotLaunch.ts";
import { startOrigin, type StartOrigin } from "./support/startOrigin.ts";

for (const workflow of ["execution", "refinement"] as const) {
  for (const workspace of ["isolated", "default-checkout"] as const) {
    for (const landing of ["review", "auto-land"] as const) {
      const policy = oneShot(workspace, landing);
      test.describe(`one-shot ${workflow} · ${workspace} · ${landing}`, () => {
        let origin: StartOrigin;
        let server: DashboardServer;

        test.beforeEach(async () => {
          origin = await startOrigin();
          server = await startPreview(origin);
        });

        test.afterEach(async () => {
          await server.close();
          origin.cleanup();
        });

        test("starts with no published assignment, carrying the policy and its established context", async () => {
          const before = await originState(origin);
          server.claudeScenario("launched");
          const response = await launch(server, requestFor(workflow, policy));
          expect(JSON.parse(response.body), response.body).toMatchObject({
            kind: "launched",
          });
          const [call] = server.claudeLaunchCalls();
          await expectEstablishedOneShot({
            origin,
            server,
            workflow,
            policy,
            before,
            host: "claude",
            cwd: call?.cwd,
            instruction: call?.argv.at(-1) ?? "",
          });
        });
      });
    }
  }
}

// Codex carries the same established context as Claude Code, from its own
// installation, through its native first input.
for (const [workflow, policy] of [
  ["execution", oneShot("default-checkout", "auto-land")],
  ["refinement", oneShot("isolated", "review")],
] as const) {
  test.describe(`one-shot ${workflow} in Codex`, () => {
    let origin: StartOrigin;
    let native: FakeCodex;
    let server: DashboardServer;

    test.beforeEach(async () => {
      origin = await startOrigin("terryyin/open-dough", "open-dough", "codex");
      native = await installFakeCodex(
        origin.machine,
        process.env["PATH"] ?? "",
        true,
      );
      server = await startPreview(origin, native);
    });

    test.afterEach(async () => {
      await server.close();
      await native.close();
      origin.cleanup();
    });

    test("carries the same policy and context in its first input", async () => {
      const before = await originState(origin);
      const response = await launch(server, {
        ...requestFor(workflow, policy),
        host: "codex",
      });
      expect(JSON.parse(response.body), response.body).toMatchObject({
        kind: "launched",
      });
      const thread = native.calls.find(
        ({ method }) => method === "thread/start",
      );
      const turn = native.calls.find(({ method }) => method === "turn/start");
      const [text] = (turn?.params["input"] ?? []) as { text?: string }[];
      await expectEstablishedOneShot({
        origin,
        server,
        workflow,
        policy,
        before,
        host: "codex",
        cwd: realpathSync(String(thread?.params["cwd"])),
        instruction: text?.text ?? "",
      });
    });
  });
}
