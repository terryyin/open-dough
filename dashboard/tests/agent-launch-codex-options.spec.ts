// Selected-host defaults and admission are proven before native creation.
import { readFileSync, realpathSync } from "node:fs";
import path from "node:path";
import { installRefinementSkill } from "./launchCardPage.ts";
import { test, expect, codexSkill } from "./support/codexLaunch.ts";
import {
  launch,
  machineSessions,
  refinementRequest,
} from "./agentLaunchBoundary.ts";
import { daemonStarts, passive } from "./support/codexObservation.ts";

test.use({ projectFolders: ["open-dough"] });

test("missing Codex options allow defaults, selected options/model are refused before native creation", async ({
  dashboard,
  codexProtocol: protocol,
}) => {
  const native = protocol;
  if (native === undefined) throw new Error("Missing native fixture.");
  codexSkill(dashboard.home);
  installRefinementSkill(dashboard.home);
  for (const changed of [{ options: ["--explore"] }, { model: "opus" }]) {
    const response = await launch(dashboard, {
      ...refinementRequest,
      host: "codex",
      ...changed,
    });
    expect(response.status).toBe(400);
    expect(
      native.calls.filter((call) =>
        ["thread/start", "turn/start"].includes(call.method),
      ),
    ).toEqual([]);
  }
  const response = await launch(dashboard, {
    ...refinementRequest,
    host: "codex",
  });
  expect(response.status).toBe(200);
  // Settings discovery, explicit launch, then one saved-host preparation.
  expect(daemonStarts(native)).toEqual([
    { cwd: realpathSync(dashboard.home) },
    { cwd: realpathSync(dashboard.home) },
    { cwd: realpathSync(dashboard.home) },
  ]);
  expect(JSON.parse(response.body)).toMatchObject({
    kind: "launched",
    record: { firstInput: { state: "confirmed" } },
  });
  expect(
    native.calls.filter((call) => call.method === "turn/start"),
  ).toHaveLength(1);
  expect(dashboard.claudeLaunchCalls()).toEqual([]);
  const recordFile = path.join(
    dashboard.home,
    ".open-dough",
    "dashboard",
    "agent-launches.json",
  );
  const before = readFileSync(recordFile, "utf8");
  const starts = daemonStarts(native);
  const observedFrom = native.calls.length;
  await machineSessions(dashboard);
  await machineSessions(dashboard);
  expect(daemonStarts(native)).toEqual(starts);
  expect(readFileSync(recordFile, "utf8")).toBe(before);
  passive(native.calls.slice(observedFrom));
});

test("native creation refusal exposes a bounded message, never arbitrary error data", async ({
  dashboard,
  codexProtocol: protocol,
}) => {
  const native = protocol;
  if (native === undefined) throw new Error("Missing native fixture.");
  codexSkill(dashboard.home);
  native.refuseCreation = true;
  for (const [error, cause] of [
    [
      {
        code: -32600,
        message:
          "failed to load configuration: No such file or directory (os error 2)",
        data: { credential: "private-native-data" },
      },
      "failed to load configuration: No such file or directory (os error 2)",
    ],
    [
      { code: -32600, message: { credential: "private-native-data" } },
      "Codex refused the native request.",
    ],
    [
      { code: -32600, message: "x".repeat(501), data: "private-native-data" },
      "Codex refused the native request.",
    ],
  ] as const) {
    native.creationError = error;
    const response = await launch(dashboard, {
      ...refinementRequest,
      host: "codex",
    });
    expect(JSON.parse(response.body)).toMatchObject({
      kind: "failed",
      reason: "refused",
      explanation: expect.stringContaining(cause),
    });
    expect(response.body).not.toContain("private-native-data");
    expect(
      native.calls.filter(({ method }) => method === "turn/start"),
    ).toEqual([]);
  }
});
