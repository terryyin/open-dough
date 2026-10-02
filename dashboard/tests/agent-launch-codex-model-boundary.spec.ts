import { test, expect, stored } from "./support/codexLaunch.ts";
import { launch, machineSessions } from "./agentLaunchBoundary.ts";
import { rawRequest } from "./support/rawHttp.ts";
import { launchHostOptionsEndpoint } from "../src/launchHostOptions.ts";
import { launchSubject, keptStartSchema } from "../src/agentLaunch.ts";
import { startRecordSchema } from "../server/startStore.ts";
const request = { source: "open-dough", host: "codex", workflow: "ad-hoc" };
test.use({ projectFolders: ["open-dough"] });

test("catalog read enforces same origin, project and method, and reads every native page", async ({
  dashboard,
  codexProtocol: fixture,
}) => {
  if (!fixture) throw new Error("Native fixture missing");
  const codexProtocol = fixture;
  const url = `${dashboard.baseURL}${launchHostOptionsEndpoint}?source=open-dough&host=codex`;
  for (const options of [
    { headers: { Origin: "http://another.example" } },
    { method: "POST", headers: { Origin: dashboard.origin } },
    {
      url: url.replace("source=open-dough", "source=doughnut"),
      headers: { Origin: dashboard.origin },
    },
    {
      url: url.replace("source=open-dough", "source=unknown"),
      headers: { Origin: dashboard.origin },
    },
  ]) {
    expect(
      (await rawRequest({ url, ...options })).status,
    ).toBeGreaterThanOrEqual(400);
    expect(codexProtocol.calls).toEqual([]);
  }
  codexProtocol.catalogError = { code: -32000, message: "Unavailable" };
  const unavailable = await rawRequest({
    url,
    headers: { Origin: dashboard.origin },
  });
  expect(unavailable.status).toBe(503);
  expect(JSON.parse(unavailable.body)).toEqual({
    error:
      "Codex model choices could not be read. Retry, or use the Codex setting.",
  });
  codexProtocol.catalogError = undefined;
  const since = codexProtocol.calls.length;
  codexProtocol.modelPageSize = 1;
  const response = await rawRequest({
    url,
    headers: { Origin: dashboard.origin },
  });
  expect(response.status).toBe(200);
  const catalog: unknown = JSON.parse(response.body);
  expect(catalog).toMatchObject({
    models: codexProtocol.models.map((model) => ({ model: model.model })),
  });
  expect(
    codexProtocol.calls
      .slice(since)
      .filter((c) => c.method === "model/list")
      .map((c) => c.params),
  ).toEqual([
    { limit: 100, includeHidden: false },
    { limit: 100, includeHidden: false, cursor: "1" },
  ]);
});

test("model-only reaches creation and first input after durable identity; records survive catalog changes", async ({
  dashboard,
  codexProtocol: fixture,
}) => {
  if (!fixture) throw new Error("Native fixture missing");
  const codexProtocol = fixture;
  codexProtocol.beforeInput = () => {
    expect(stored(dashboard.home)[0]).toMatchObject({
      request: { model: "native-sol" },
      session: { sessionId: codexProtocol.threadId },
      firstInput: { state: "uncertain" },
    });
  };
  const response = await launch(dashboard, {
    ...request,
    model: "native-sol",
    instruction: "Explain the build",
  });
  expect(JSON.parse(response.body)).toMatchObject({ kind: "launched" });
  expect(
    codexProtocol.calls.filter((c) => c.method === "thread/start")[0]?.params,
  ).toEqual({ cwd: codexProtocol.cwd, model: "native-sol" });
  expect(
    codexProtocol.calls.filter((c) => c.method === "turn/start")[0]?.params,
  ).toEqual({
    threadId: codexProtocol.threadId,
    input: [{ type: "text", text: "Explain the build" }],
  });
  codexProtocol.models = [];
  expect(await machineSessions(dashboard)).toContainEqual(
    expect.objectContaining({
      request: expect.objectContaining({ model: "native-sol" }),
    }),
  );
  const record = stored(dashboard.home)[0];
  if (record === undefined) throw new Error("Missing launch record");
  expect(launchSubject(record.request).modelWords).toBe(
    "Model: native-sol (requested)",
  );
});

test("unavailable discovery still permits configured default, blank input and predecessor records", async ({
  dashboard,
  codexProtocol: fixture,
}) => {
  if (!fixture) throw new Error("Native fixture missing");
  const codexProtocol = fixture;
  codexProtocol.catalogError = { code: -32000, message: "Unavailable" };
  expect(JSON.parse((await launch(dashboard, request)).body)).toMatchObject({
    kind: "launched",
  });
  expect(
    codexProtocol.calls.filter((c) => c.method === "thread/start")[0]?.params,
  ).toEqual({ cwd: codexProtocol.cwd });
  expect(codexProtocol.calls.filter((c) => c.method === "turn/start")).toEqual(
    [],
  );
  expect(stored(dashboard.home)[0]?.request).not.toHaveProperty("model");
  expect(await machineSessions(dashboard)).toHaveLength(1);
  expect(
    keptStartSchema.parse({
      workflow: "execution",
      source: "open-dough",
      identity: "A",
      workspace: "/workspace",
    }),
  ).not.toHaveProperty("model");
  expect(
    startRecordSchema.parse({
      identity: "A",
      workspace: "/workspace",
      branch: "main",
      startedAt: new Date().toISOString(),
      model: "future-model",
    }).model,
  ).toBe("future-model");
});

for (const instruction of ["Do work", undefined] as const) {
  test(`disappeared model is refused before creation; contradictory native model keeps identity without ${instruction === undefined ? "blank" : "nonblank"} input intent`, async ({
    dashboard,
    codexProtocol: fixture,
  }) => {
    if (!fixture) throw new Error("Native fixture missing");
    const codexProtocol = fixture;
    const models = codexProtocol.models;
    codexProtocol.models = [];
    const stale = await launch(dashboard, {
      ...request,
      model: "native-sol",
      instruction,
    });
    expect(stale.status).toBe(400);
    expect(stale.body).toContain("no longer available");
    expect(
      codexProtocol.calls.filter((c) => c.method === "thread/start"),
    ).toEqual([]);
    codexProtocol.models = models;
    codexProtocol.effectiveModel = "substituted-model";
    const mismatch = await launch(dashboard, {
      ...request,
      model: "native-sol",
      instruction,
    });
    expect(JSON.parse(mismatch.body)).toMatchObject({ kind: "uncertain" });
    expect(mismatch.body).toContain("did not confirm the requested model");
    expect(
      codexProtocol.calls.filter((c) => c.method === "turn/start"),
    ).toEqual([]);
    expect(stored(dashboard.home)[0]).toMatchObject({
      request: { model: "native-sol" },
      session: { sessionId: codexProtocol.threadId },
      firstInput: { state: "awaiting" },
    });
    expect(stored(dashboard.home)[0]?.firstInput).not.toHaveProperty(
      "instruction",
    );
    expect(stored(dashboard.home)[0]?.firstInput).not.toHaveProperty("intent");
    expect(stored(dashboard.home)[0]?.firstInput?.explanation).toContain(
      "did not confirm the requested model",
    );
    expect(stored(dashboard.home)[0]?.request.instruction).toBe(instruction);
  });
}
