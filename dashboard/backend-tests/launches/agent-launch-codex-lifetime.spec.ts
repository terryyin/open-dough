// Native connection ownership survives caller detachment and handles racing endings.
import { agentAcceptEndpoint } from "../../src/agentLaunch.ts";
import {
  test,
  expect,
  stored,
  expectCodexAdHocInput,
} from "../../test-support/support/codexLaunch.ts";
import {
  accept,
  attempts,
  launch,
  machineSessions,
  deleteRecord,
} from "../../test-support/agentLaunchBoundary.ts";
import { startDashboardServer } from "../../test-support/support/dashboardServer.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";

// No page: the local boundaries alone answer these requests.
test.use({
  serverMode: "boundary",
  projectFolders: ["open-dough"],
});

const shutdownTest = test.extend({ liveServer: "separate process" });

const codexLaunch = makeMe.aLaunchRequest
  .adHoc({ host: "codex" })
  .withInstruction("Preserve this exact intent.")
  .please();

test("an active detached caller still records acknowledgment and a later connection failure retains recovery/disposes resources", async ({
  dashboard,
  codexProtocol: protocol,
}) => {
  const native = protocol;
  if (native === undefined) throw new Error("Missing native fixture.");
  native.hold = true;
  const response = fetch(`${dashboard.baseURL}${agentAcceptEndpoint}`, {
    method: "POST",
    headers: { Origin: dashboard.origin, "Content-Type": "application/json" },
    body: JSON.stringify(codexLaunch),
    signal: AbortSignal.timeout(1000),
  }).catch(() => undefined);
  await expect
    .poll(
      () => native.calls.filter((call) => call.method === "turn/start").length,
    )
    .toBe(1);
  await response;
  expect(stored(dashboard.home)[0]?.firstInput?.state).toBe("uncertain");
  native.release();
  await expect
    .poll(() => stored(dashboard.home)[0]?.firstInput?.state)
    .toBe("confirmed");
  native.failConnection();
  await expect
    .poll(() => {
      const session = stored(dashboard.home)[0]?.session;
      return session?.host === "codex"
        ? session.continuation?.notice
        : undefined;
    })
    .toContain("native connection ended");
  await expect.poll(() => native.sockets.size).toBe(0);
  const saved = stored(dashboard.home)[0];
  if (saved?.session.host !== "codex")
    throw new Error("Missing saved Codex record.");
  expect(saved.session.continuation?.args.at(-1)).toBe(native.threadId);
  expect(
    native.calls.filter((call) => call.method === "turn/start"),
  ).toHaveLength(1);
});

shutdownTest(
  "an accepted launch outlives its caller; server shutdown keeps it unsettled for reconciliation and disposes native connections without interrupting the turn",
  async ({ dashboard, codexProtocol: protocol, machine, github }) => {
    const native = protocol;
    if (native === undefined) throw new Error("Missing native fixture.");
    native.hold = true;
    const request = codexLaunch;
    const answered = JSON.parse((await accept(dashboard, request)).body) as {
      kind: string;
      attempt?: { id: string; acceptedAt: string };
    };
    expect(answered).toMatchObject({ kind: "accepted", attempt: { request } });
    // The caller has its answer; the owner goes on to submit the input.
    await expect
      .poll(
        () =>
          native.calls.filter((call) => call.method === "turn/start").length,
      )
      .toBe(1);
    const record = stored(dashboard.home)[0];
    expectCodexAdHocInput(
      native,
      "Preserve this exact intent.",
      record,
      dashboard,
    );
    const reporting = record?.request.reporting;
    expect(reporting).toMatchObject({
      origin: dashboard.origin,
      reference: answered.attempt?.id,
      command: expect.any(String),
    });
    expect(await attempts(dashboard)).toEqual([
      {
        id: answered.attempt?.id,
        request,
        acceptedAt: answered.attempt?.acceptedAt,
        reportingOrigin: dashboard.origin,
        reporting,
        publication: { kind: "none" },
        owned: true,
        running: true,
        changes: expect.any(Number) as unknown,
        worker: {
          pid: dashboard.pid,
          serverPid: dashboard.pid,
          step: "launch",
          notedAt: expect.any(String),
        },
      },
    ]);

    await dashboard.close();
    await expect.poll(() => native.sockets.size).toBe(0);
    expect(native.calls.map((call) => call.method)).not.toContain(
      "turn/interrupt",
    );
    expect(stored(dashboard.home)[0]?.session.sessionId).toBe(native.threadId);
    const restarted = await startDashboardServer({
      mode: "boundary",
      liveServer: "separate process",
      machine,
      github,
      codexProtocol: protocol,
      projectFolders: ["open-dough"],
    });
    try {
      // No server owns it now and nothing settled it: it needs reconciliation.
      expect(await attempts(restarted)).toEqual([
        {
          id: answered.attempt?.id,
          request,
          acceptedAt: answered.attempt?.acceptedAt,
          reportingOrigin: dashboard.origin,
          reporting,
          publication: { kind: "none" },
          owned: false,
          running: false,
          worker: {
            pid: dashboard.pid,
            serverPid: dashboard.pid,
            step: "launch",
            notedAt: expect.any(String),
          },
        },
      ]);
      expect(
        native.calls.filter((call) => call.method === "turn/start"),
      ).toHaveLength(1);
    } finally {
      native.release();
      await restarted.close();
    }
  },
);

for (const ending of ["complete", "disconnect"] as const) {
  test(`a ${ending} notification racing confirmation is accounted for and disposes the connection`, async ({
    dashboard,
    codexProtocol: protocol,
  }) => {
    const native = protocol;
    if (native === undefined) throw new Error("Missing native fixture.");
    native.afterAcceptance = ending;
    const response = await launch(dashboard, codexLaunch);
    expect(JSON.parse(response.body)).toMatchObject({ kind: "launched" });
    await expect.poll(() => native.sockets.size).toBe(0);
    expect(stored(dashboard.home)[0]?.firstInput?.state).toBe("confirmed");
    if (ending === "disconnect")
      await expect
        .poll(() => {
          const session = stored(dashboard.home)[0]?.session;
          return session?.host === "codex"
            ? session.continuation?.notice
            : undefined;
        })
        .toContain("native connection ended");
  });
}

test("deleting an unreadable Codex record remains deleted after a later native connection failure", async ({
  dashboard,
  codexProtocol: protocol,
}) => {
  const native = protocol;
  if (native === undefined) throw new Error("Missing native fixture.");
  expect(
    (
      JSON.parse((await launch(dashboard, codexLaunch)).body) as {
        kind: unknown;
      }
    ).kind,
  ).toBe("launched");
  expect(native.sockets.size).toBe(1);
  native.readError = true; // Observation must be unreadable before established deletion is eligible.
  expect(
    (
      await deleteRecord(dashboard, {
        source: "open-dough",
        session: native.threadId,
        host: "codex",
      })
    ).status,
  ).toBe(200);
  expect(stored(dashboard.home)).toEqual([]);
  native.failConnection();
  await expect.poll(() => native.sockets.size).toBe(0);
  expect(stored(dashboard.home)).toEqual([]);
  expect(await machineSessions(dashboard)).toEqual([]);
});
