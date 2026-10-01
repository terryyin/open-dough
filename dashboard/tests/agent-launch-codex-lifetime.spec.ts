// Native connection ownership survives caller detachment and handles racing endings.
import { test, expect, stored } from "./support/codexLaunch.ts";
import {
  launch,
  refinementRequest,
  machineSessions,
  deleteRecord,
} from "./agentLaunchBoundary.ts";

test.use({ projectFolders: ["open-dough"] });

test("an active detached caller still records acknowledgment and a later connection failure retains recovery/disposes resources", async ({
  dashboard,
  codexProtocol: protocol,
}) => {
  const native = protocol;
  if (native === undefined) throw new Error("Missing native fixture.");
  native.hold = true;
  const response = fetch(`${dashboard.baseURL}/__agent-launch`, {
    method: "POST",
    headers: { Origin: dashboard.origin, "Content-Type": "application/json" },
    body: JSON.stringify({ ...refinementRequest, host: "codex" }),
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
    .poll(() => stored(dashboard.home)[0]?.session.continuation?.notice)
    .toContain("native connection ended");
  await expect.poll(() => native.sockets.size).toBe(0);
  expect(stored(dashboard.home)[0]?.session.continuation?.args.at(-1)).toBe(
    native.threadId,
  );
  expect(
    native.calls.filter((call) => call.method === "turn/start"),
  ).toHaveLength(1);
});

for (const ending of ["complete", "disconnect"] as const) {
  test(`a ${ending} notification racing confirmation is accounted for and disposes the connection`, async ({
    dashboard,
    codexProtocol: protocol,
  }) => {
    const native = protocol;
    if (native === undefined) throw new Error("Missing native fixture.");
    native.afterAcceptance = ending;
    const response = await launch(dashboard, {
      ...refinementRequest,
      host: "codex",
    });
    expect(JSON.parse(response.body)).toMatchObject({ kind: "launched" });
    await expect.poll(() => native.sockets.size).toBe(0);
    expect(stored(dashboard.home)[0]?.firstInput?.state).toBe("confirmed");
    if (ending === "disconnect")
      await expect
        .poll(() => stored(dashboard.home)[0]?.session.continuation?.notice)
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
      JSON.parse(
        (await launch(dashboard, { ...refinementRequest, host: "codex" })).body,
      ) as { kind: unknown }
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
