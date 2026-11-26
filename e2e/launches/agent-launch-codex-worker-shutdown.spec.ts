// Worker shutdown preserves the accepted attempt and detaches from the native turn.
import path from "node:path";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import {
  accept,
  attempts,
} from "../../dashboard/test-support/agentLaunchBoundary.ts";
import {
  expect,
  expectCodexAdHocInput,
  stored,
  test,
} from "../../dashboard/test-support/support/codexLaunch.ts";
import { startDashboardServer } from "../../dashboard/test-support/support/dashboardServer.ts";
import { git } from "../../dashboard/test-support/support/startOriginObservation.ts";
import { expectedBorrowedLandingAuthority } from "../../dashboard/test-support/support/startSessionLandingCapture.ts";
import { launchStoryIdentity } from "../../dashboard/test-support/support/unattachedLaunchAssertions.ts";

test.use({
  serverMode: "boundary",
  liveServer: "separate process",
  projectFolders: ["open-dough"],
});

const request = makeMe.aLaunchRequest
  .adHoc({ host: "codex" })
  .withInstruction("Preserve this exact intent.")
  .please();

test("server shutdown keeps the original Codex attempt unsettled without interrupting its turn", async ({
  dashboard,
  codexProtocol,
  machine,
  github,
}) => {
  const native =
    await test.step("Given the native Codex service is available", () => {
      if (codexProtocol === undefined)
        throw new Error("Missing native fixture.");
      return codexProtocol;
    });
  await test.step("And the native service will hold first-input acknowledgment", () => {
    native.hold = true;
  });

  const accepted =
    await test.step("When the caller asks the Dashboard to start Codex", async () =>
      JSON.parse((await accept(dashboard, request)).body) as {
        kind: string;
        attempt?: { id: string; acceptedAt: string };
      });
  const attempt =
    await test.step("Then the caller has its attempt without waiting for native acknowledgment", () => {
      expect(accepted).toMatchObject({
        kind: "accepted",
        attempt: { request },
      });
      if (accepted.attempt === undefined)
        throw new Error("Missing accepted attempt.");
      return accepted.attempt;
    });

  const record =
    await test.step("And the owner submits the first input to the native conversation", async () => {
      await expect
        .poll(() =>
          native.calls.filter(({ method }) => method === "turn/start"),
        )
        .toHaveLength(1);
      return stored(dashboard.home)[0];
    });
  await test.step("And the native input carries the exact developer instruction", () =>
    expectCodexAdHocInput(
      native,
      "Preserve this exact intent.",
      record,
      dashboard,
    ));
  await test.step("And the kept reporting context refers to the accepted attempt", () => {
    expect(record?.request.reporting).toMatchObject({
      origin: dashboard.origin,
      reference: attempt.id,
      command: expect.any(String),
    });
  });

  const workspace =
    await test.step("Given the launch runs in the project's execution checkout", () =>
      path.join(dashboard.home, "git", "open-dough"));
  const publication =
    await test.step("And the original story is published to its origin", async () => {
      const origin = await git(workspace, "remote", "get-url", "origin");
      return {
        kind: "published",
        identity: launchStoryIdentity(record),
        revision: await git(origin, "rev-parse", "main"),
      };
    });
  const landingRepository =
    await test.step("And the original launch establishes its landing authority", () =>
      expectedBorrowedLandingAuthority({
        home: dashboard.home,
        workspace,
        reference: attempt.id,
        identity: publication.identity,
        publishedSha: publication.revision,
      }));
  const worker =
    await test.step("And the Dashboard itself owns the launch worker", () => ({
      pid: dashboard.pid,
      serverPid: dashboard.pid,
      step: "launch",
      notedAt: expect.any(String),
    }));
  const kept =
    await test.step("And the accepted attempt has the original reporting and landing facts", () => ({
      id: attempt.id,
      request,
      acceptedAt: attempt.acceptedAt,
      reportingOrigin: dashboard.origin,
      reporting: record?.request.reporting,
      publication,
      landingRepository,
      worker,
    }));
  await test.step("Then the Dashboard exposes those facts for its running attempt", async () => {
    expect(await attempts(dashboard)).toEqual([
      {
        ...kept,
        owned: true,
        running: true,
        changes: expect.any(Number) as unknown,
      },
    ]);
  });

  await test.step("When the Dashboard worker shuts down", () =>
    dashboard.close());
  await test.step("Then the native connection closes without interrupting the turn", async () => {
    await expect.poll(() => native.sockets.size).toBe(0);
    expect(native.calls.map(({ method }) => method)).not.toContain(
      "turn/interrupt",
    );
  });
  await test.step("And the same conversation stays stored", () => {
    expect(stored(dashboard.home)[0]?.session.sessionId).toBe(native.threadId);
  });

  const restarted =
    await test.step("When the Dashboard restarts on the same machine", () =>
      startDashboardServer({
        mode: "boundary",
        liveServer: "separate process",
        machine,
        github,
        codexProtocol: native,
        projectFolders: ["open-dough"],
      }));
  await test
    .step(
      "Then the same attempt needs reconciliation and no input is sent again",
      async () => {
        expect(await attempts(restarted)).toEqual([
          { ...kept, owned: false, running: false },
        ]);
        expect(
          native.calls.filter(({ method }) => method === "turn/start"),
        ).toHaveLength(1);
      },
    )
    .finally(() =>
      test.step("And the replacement worker shuts down after the observation", async () => {
        native.release();
        await restarted.close();
      }),
    );
});
