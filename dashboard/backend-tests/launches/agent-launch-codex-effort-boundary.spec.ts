import path from "node:path";
import { afterEach, beforeAll, beforeEach, expect, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { queuedReadyRepository } from "../../../Distribution/tests/support/queued-repository.mjs";
import { AgentLaunches } from "../../server/agentLaunches.ts";
import { NativeDoneMarks } from "../../server/doneMarks.ts";
import { codexHost } from "../../server/codexHost.ts";
import { admitLaunchSettings } from "../../server/launchSettingsAdmission.ts";
import { machineFolder } from "../../server/localFolder.ts";
import { mountProjectConfiguration } from "../../server/projectConfiguration.ts";
import type {
  AgentLaunchRequest,
  LaunchRecord,
} from "../../src/agentLaunch.ts";
import {
  installFakeCodex,
  type FakeCodex,
} from "../../test-support/support/fakeCodex.ts";
import { keptLaunchRecords } from "../../test-support/support/launchStore.ts";
import { expectCodexAdHocInput } from "../../test-support/support/codexLaunch.ts";
import {
  startOrigin,
  type StartOrigin,
} from "../../test-support/support/startOrigin.ts";
import { keepStartedOrigin } from "../../test-support/support/startOriginPreparation.ts";

const repository = queuedReadyRepository().please();
const source = makeMe.aPublishedSource.openDough.please();
const reportingOrigin = "http://127.0.0.1:4173";
const request = makeMe.aLaunchRequest.adHoc({ host: "codex" }).please();

let project: StartOrigin;
let native: FakeCodex;
let home: string;
let marks: NativeDoneMarks;
let launches: AgentLaunches;
let unmount: () => void;

beforeAll(async () => {
  const prepared = await startOrigin(repository, { host: "codex" });
  try {
    keepStartedOrigin("codex", repository, prepared);
  } finally {
    prepared.cleanup();
  }
});

beforeEach(async () => {
  project = await startOrigin(repository, { host: "codex" });
  home = path.join(project.machine, "home");
  native = await installFakeCodex(
    project.machine,
    process.env["PATH"] ?? "",
    true,
  );
  for (const [key, value] of Object.entries(native.env)) vi.stubEnv(key, value);
  vi.stubEnv("HOME", home);
  unmount = mountProjectConfiguration("production");
  marks = new NativeDoneMarks({
    terminals: { withAttachment: vi.fn(), endAttachments: vi.fn() },
    hostFor: () => undefined,
    reportingFolder: machineFolder,
  });
  launches = new AgentLaunches(marks);
});

afterEach(async () => {
  launches.close();
  await launches.drain();
  await marks.close();
  await native.close();
  unmount();
  vi.unstubAllEnvs();
  project.cleanup();
});

async function launch(request: AgentLaunchRequest) {
  await admitLaunchSettings(request, codexHost);
  const accepted = await launches.accept(source, request, reportingOrigin);
  if (accepted.kind !== "accepted") return accepted;
  let seen = accepted.attempt.changes;
  for (;;) {
    const { attempt } = await launches.changed(
      accepted.attempt.id,
      4_500,
      seen,
    );
    if (attempt?.running === false) return attempt.outcome;
    if (attempt === undefined || attempt.changes === seen)
      throw new Error("The Codex attempt did not settle.");
    seen = attempt.changes;
  }
}

const record = () =>
  keptLaunchRecords(home).find((record) => "session" in record);

const paramsFor = (method: string, since = 0) =>
  native.calls
    .slice(since)
    .filter((call) => call.method === method)
    .map(({ params }) => params);

for (const settings of [
  { model: "native-sol", effort: "ultra" },
  { effort: "low" },
  {},
]) {
  for (const instruction of ["Explain the build", undefined]) {
    test(`independent startup ${JSON.stringify(settings)} ${instruction ?? "blank"} verifies configuration and identity before input`, async () => {
      let identityBeforeInput: LaunchRecord | undefined;
      native.beforeInput = () => {
        identityBeforeInput = record();
      };
      const response = await launch({
        ...request,
        ...settings,
        instruction,
      });
      expect(response).toMatchObject({ kind: "launched" });
      if (instruction !== undefined)
        expect(identityBeforeInput).toMatchObject({
          request: settings,
          session: { sessionId: native.threadId },
          firstInput: { state: "uncertain" },
        });
      expect(paramsFor("thread/start")).toEqual([
        {
          cwd: native.cwd,
          ...("model" in settings ? { model: settings.model } : {}),
          ...("effort" in settings
            ? { config: { model_reasoning_effort: settings.effort } }
            : {}),
        },
      ]);
      expect(record()?.request).toMatchObject(settings);
      expectCodexAdHocInput(native, instruction ?? "", record(), {
        home,
        origin: reportingOrigin,
      });
      if ("effort" in settings && !("model" in settings))
        expect(paramsFor("config/read")).toContainEqual({
          cwd: native.cwd,
          includeLayers: false,
        });
    });
  }
}

for (const instruction of ["Do work", undefined]) {
  test(`effort mismatch retains identity without sendable ${instruction ?? "blank"} evidence`, async () => {
    native.effectiveEffort = "low";
    const response = await launch({
      ...request,
      model: "native-sol",
      effort: "ultra",
      instruction,
    });
    expect(response).toMatchObject({
      kind: "uncertain",
      explanation: expect.stringContaining(
        "did not confirm the requested reasoning effort",
      ) as unknown,
    });
    expect(native.calls.filter((c) => c.method === "turn/start")).toEqual([]);
    const saved = record();
    expect(saved).toMatchObject({
      request: { effort: "ultra" },
      session: { sessionId: native.threadId },
      firstInput: { state: "awaiting" },
    });
    expect(saved?.firstInput).not.toHaveProperty("instruction");
    expect(saved?.firstInput).not.toHaveProperty("intent");
  });
}

test("unsupported or stale effort refuses; unknown configured custom defaults remain usable", async () => {
  await expect(
    launch({ ...request, model: "native-luna", effort: "ultra" }),
  ).rejects.toMatchObject({
    status: 400,
    message: expect.stringContaining("no longer supported") as unknown,
  });
  native.configuredModel = "native-luna";
  const inherited = await launch({ ...request, effort: "ultra" });
  expect(inherited).toMatchObject({
    kind: "failed",
    reason: "refused",
    explanation: expect.stringContaining("launch workspace's model") as unknown,
  });
  expect(native.calls.filter((c) => c.method === "thread/start")).toEqual([]);
  native.configuredModel = "custom-model";
  native.catalogError = { code: -32000, message: "Unavailable" };
  const defaults = await launch(request);
  expect(defaults).toMatchObject({ kind: "launched" });
  expect(paramsFor("thread/start")).toEqual([{ cwd: native.cwd }]);
  expect(record()?.request).not.toHaveProperty("effort");
});

test("unset configured model delegates effort-only creation then verifies the effective pair before input", async () => {
  native.configuredModel = null;
  native.effectiveModel = "native-sol";
  const response = await launch({
    ...request,
    effort: "ultra",
    instruction: "Work",
  });
  expect(response).toMatchObject({ kind: "launched" });
  expect(paramsFor("thread/start")).toEqual([
    { cwd: native.cwd, config: { model_reasoning_effort: "ultra" } },
  ]);
  expect(native.calls.filter((c) => c.method === "turn/start")).toHaveLength(1);
});

test("unreadable configuration refuses effort-only but an explicit pair needs no configured model", async () => {
  native.configError = { code: -32000, message: "Config unavailable" };
  const inherited = await launch({
    ...request,
    effort: "ultra",
    instruction: "Do work",
  });
  expect(inherited).toMatchObject({
    kind: "failed",
    reason: "refused",
    explanation: expect.stringContaining("could not be verified") as unknown,
  });
  expect(native.calls.filter((c) => c.method === "thread/start")).toEqual([]);
  const since = native.calls.length;
  const pair = await launch({
    ...request,
    model: "native-sol",
    effort: "ultra",
    instruction: "Do work",
  });
  expect(pair).toMatchObject({ kind: "launched" });
  expect(paramsFor("config/read", since)).toEqual([]);
  expect(paramsFor("thread/start", since)).toEqual([
    {
      cwd: native.cwd,
      model: "native-sol",
      config: { model_reasoning_effort: "ultra" },
    },
  ]);
  expect(record()?.request).toMatchObject({
    model: "native-sol",
    effort: "ultra",
    instruction: "Do work",
  });
});
