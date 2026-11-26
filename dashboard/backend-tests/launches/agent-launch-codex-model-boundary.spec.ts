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
import { keptStartSchema, launchSubject } from "../../src/agentLaunch.ts";
import { startRecordSchema } from "../../server/startStore.ts";

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

test("model-only reaches creation and first input after durable identity; records survive catalog changes", async () => {
  let identityBeforeInput: LaunchRecord | undefined;
  native.beforeInput = () => {
    identityBeforeInput = record();
  };
  const response = await launch({
    ...request,
    model: "native-sol",
    instruction: "Explain the build",
  });
  expect(response).toMatchObject({ kind: "launched" });
  expect(identityBeforeInput).toMatchObject({
    request: { model: "native-sol" },
    session: { sessionId: native.threadId },
    firstInput: { state: "uncertain" },
  });
  expect(
    native.calls.filter((c) => c.method === "thread/start")[0]?.params,
  ).toEqual({ cwd: native.cwd, model: "native-sol" });
  expectCodexAdHocInput(native, "Explain the build", record(), {
    home,
    origin: reportingOrigin,
  });
  native.models = [];
  expect((await launches.machineObservation()).records).toContainEqual(
    expect.objectContaining({
      request: expect.objectContaining({ model: "native-sol" }) as unknown,
    }),
  );
  const saved = record();
  if (saved === undefined) throw new Error("Missing launch record");
  expect(launchSubject(saved.request).modelWords).toBe(
    "Model: native-sol (requested)",
  );
});

test("unavailable discovery still permits configured default, blank input and predecessor records", async () => {
  native.catalogError = { code: -32000, message: "Unavailable" };
  expect(await launch(request)).toMatchObject({
    kind: "launched",
  });
  expect(
    native.calls.filter((c) => c.method === "thread/start")[0]?.params,
  ).toEqual({ cwd: native.cwd });
  expect(native.calls.filter((c) => c.method === "turn/start")).toEqual([]);
  expect(record()?.request).not.toHaveProperty("model");
  expect((await launches.machineObservation()).records).toHaveLength(1);
  expect(
    keptStartSchema.parse({
      workflow: "execution",
      source: "open-dough",
      identity: "A",
      workspace: "/workspace",
      branch: "main",
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
  test(`disappeared model is refused before creation; contradictory native model keeps identity without ${instruction === undefined ? "blank" : "nonblank"} input intent`, async () => {
    const models = native.models;
    native.models = [];
    await expect(
      launch({
        ...request,
        model: "native-sol",
        instruction,
      }),
    ).rejects.toMatchObject({
      status: 400,
      message:
        "The selected Codex model is no longer available. Choose another model or use the Codex setting.",
    });
    expect(native.calls.filter((c) => c.method === "thread/start")).toEqual([]);
    native.models = models;
    native.effectiveModel = "substituted-model";
    const mismatch = await launch({
      ...request,
      model: "native-sol",
      instruction,
    });
    expect(mismatch).toMatchObject({
      kind: "uncertain",
      explanation: expect.stringContaining(
        "did not confirm the requested model",
      ) as unknown,
    });
    expect(native.calls.filter((c) => c.method === "turn/start")).toEqual([]);
    expect(record()).toMatchObject({
      request: { model: "native-sol" },
      session: { sessionId: native.threadId },
      firstInput: { state: "awaiting" },
    });
    expect(record()?.firstInput).not.toHaveProperty("instruction");
    expect(record()?.firstInput).not.toHaveProperty("intent");
    expect(record()?.firstInput?.explanation).toContain(
      "did not confirm the requested model",
    );
    expect(record()?.request.instruction).toBe(instruction);
  });
}
