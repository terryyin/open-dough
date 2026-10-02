import { test, expect, stored } from "./support/codexLaunch.ts";
import { launch } from "./agentLaunchBoundary.ts";
const request = { source: "open-dough", host: "codex", workflow: "ad-hoc" };

for (const settings of [
  { model: "native-sol", effort: "ultra" },
  { effort: "low" },
  {},
]) {
  for (const instruction of ["Explain the build", undefined]) {
    test(`independent startup ${JSON.stringify(settings)} ${instruction ?? "blank"} verifies configuration and identity before input`, async ({
      dashboard,
      codexProtocol: fixture,
    }) => {
      if (!fixture) throw new Error("Native fixture missing");
      const native = fixture;
      native.beforeInput = () => {
        expect(stored(dashboard.home)[0]).toMatchObject({
          request: settings,
          session: { sessionId: native.threadId },
          firstInput: { state: "uncertain" },
        });
      };
      const response = await launch(dashboard, {
        ...request,
        ...settings,
        instruction,
      });
      expect(JSON.parse(response.body)).toMatchObject({ kind: "launched" });
      expect(
        native.calls
          .filter((c) => c.method === "thread/start")
          .map((c) => c.params),
      ).toEqual([
        {
          cwd: native.cwd,
          ...("model" in settings ? { model: settings.model } : {}),
          ...("effort" in settings
            ? { config: { model_reasoning_effort: settings.effort } }
            : {}),
        },
      ]);
      expect(stored(dashboard.home)[0]?.request).toMatchObject(settings);
      const turns = native.calls.filter((c) => c.method === "turn/start");
      expect(turns).toEqual(
        instruction === undefined
          ? []
          : [
              {
                method: "turn/start",
                params: {
                  threadId: native.threadId,
                  input: [{ type: "text", text: instruction }],
                },
              },
            ],
      );
      if ("effort" in settings && !("model" in settings))
        expect(
          native.calls
            .filter((c) => c.method === "config/read")
            .map((c) => c.params),
        ).toContainEqual({ cwd: native.cwd, includeLayers: false });
    });
  }
}

for (const instruction of ["Do work", undefined]) {
  test(`effort mismatch retains identity without sendable ${instruction ?? "blank"} evidence`, async ({
    dashboard,
    codexProtocol: fixture,
  }) => {
    if (!fixture) throw new Error("Native fixture missing");
    const native = fixture;
    native.effectiveEffort = "low";
    const response = await launch(dashboard, {
      ...request,
      model: "native-sol",
      effort: "ultra",
      instruction,
    });
    expect(JSON.parse(response.body)).toMatchObject({ kind: "uncertain" });
    expect(response.body).toContain(
      "did not confirm the requested reasoning effort",
    );
    expect(native.calls.filter((c) => c.method === "turn/start")).toEqual([]);
    const record = stored(dashboard.home)[0];
    expect(record).toMatchObject({
      request: { effort: "ultra" },
      session: { sessionId: native.threadId },
      firstInput: { state: "awaiting" },
    });
    expect(record?.firstInput).not.toHaveProperty("instruction");
    expect(record?.firstInput).not.toHaveProperty("intent");
  });
}

test("unsupported or stale effort refuses; unknown configured custom defaults remain usable", async ({
  dashboard,
  codexProtocol: fixture,
}) => {
  if (!fixture) throw new Error("Native fixture missing");
  const native = fixture;
  const unsupported = await launch(dashboard, {
    ...request,
    model: "native-luna",
    effort: "ultra",
  });
  expect(unsupported.status).toBe(400);
  expect(unsupported.body).toContain("no longer supported");
  native.configuredModel = "native-luna";
  const inherited = await launch(dashboard, { ...request, effort: "ultra" });
  expect(JSON.parse(inherited.body)).toMatchObject({
    kind: "failed",
    reason: "refused",
  });
  expect(inherited.body).toContain("launch workspace's model");
  expect(native.calls.filter((c) => c.method === "thread/start")).toEqual([]);
  native.configuredModel = "custom-model";
  native.catalogError = { code: -32000, message: "Unavailable" };
  const defaults = await launch(dashboard, request);
  expect(JSON.parse(defaults.body)).toMatchObject({ kind: "launched" });
  expect(
    native.calls
      .filter((c) => c.method === "thread/start")
      .map((c) => c.params),
  ).toEqual([{ cwd: native.cwd }]);
  expect(stored(dashboard.home)[0]?.request).not.toHaveProperty("effort");
});

test("unset configured model delegates effort-only creation then verifies the effective pair before input", async ({
  dashboard,
  codexProtocol: fixture,
}) => {
  if (!fixture) throw new Error("Native fixture missing");
  const native = fixture;
  native.configuredModel = null;
  native.effectiveModel = "native-sol";
  const response = await launch(dashboard, {
    ...request,
    effort: "ultra",
    instruction: "Work",
  });
  expect(JSON.parse(response.body)).toMatchObject({ kind: "launched" });
  expect(
    native.calls
      .filter((c) => c.method === "thread/start")
      .map((c) => c.params),
  ).toEqual([{ cwd: native.cwd, config: { model_reasoning_effort: "ultra" } }]);
  expect(native.calls.filter((c) => c.method === "turn/start")).toHaveLength(1);
});

test("unreadable configuration refuses effort-only but an explicit pair needs no configured model", async ({
  dashboard,
  codexProtocol: fixture,
}) => {
  if (!fixture) throw new Error("Native fixture missing");
  const native = fixture;
  native.configError = { code: -32000, message: "Config unavailable" };
  const inherited = await launch(dashboard, {
    ...request,
    effort: "ultra",
    instruction: "Do work",
  });
  expect(JSON.parse(inherited.body)).toMatchObject({
    kind: "failed",
    reason: "refused",
  });
  expect(inherited.body).toContain("could not be verified");
  expect(native.calls.filter((c) => c.method === "thread/start")).toEqual([]);
  const since = native.calls.length;
  const pair = await launch(dashboard, {
    ...request,
    model: "native-sol",
    effort: "ultra",
    instruction: "Do work",
  });
  expect(JSON.parse(pair.body)).toMatchObject({ kind: "launched" });
  expect(
    native.calls.slice(since).filter((c) => c.method === "config/read"),
  ).toEqual([]);
  expect(
    native.calls
      .slice(since)
      .filter((c) => c.method === "thread/start")
      .map((c) => c.params),
  ).toEqual([
    {
      cwd: native.cwd,
      model: "native-sol",
      config: { model_reasoning_effort: "ultra" },
    },
  ]);
  expect(stored(dashboard.home)[0]?.request).toMatchObject({
    model: "native-sol",
    effort: "ultra",
    instruction: "Do work",
  });
});
