// Cursor's typed settings admission reads the native model list. An admitted
// launch establishes its own scope before asking the real runner to create
// and prompt the chat on the chosen model.
import { realpathSync } from "node:fs";
import path from "node:path";
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { queuedReadyRepository } from "../../../Distribution/tests/support/queued-repository.mjs";
import { AgentLaunches } from "../../server/agentLaunches.ts";
import { cursorHost } from "../../server/cursorHost.ts";
import { NativeDoneMarks } from "../../server/doneMarks.ts";
import { stopCursorRunner } from "../../server/hosts/cursor/runnerClient.ts";
import { keptRecords } from "../../server/launchRecordStore.ts";
import { admitLaunchSettings } from "../../server/launchSettingsAdmission.ts";
import { machineFolder } from "../../server/localFolder.ts";
import { mountProjectConfiguration } from "../../server/projectConfiguration.ts";
import type { AgentLaunchRequest } from "../../src/agentLaunch.ts";
import {
  cursorEffortModels,
  cursorModels,
  cursorOtherEffortModels,
  installFakeCursor,
  type FakeCursor,
} from "../../test-support/support/fakeCursor.ts";
import {
  startOrigin,
  type StartOrigin,
} from "../../test-support/support/startOrigin.ts";
import { keepStartedOrigin } from "../../test-support/support/startOriginPreparation.ts";

const effortListing = [
  ...cursorModels,
  ...cursorEffortModels,
  ...cursorOtherEffortModels,
];
const modelRequest = (model: string) =>
  makeMe.aLaunchRequest
    .adHoc({ host: "cursor" })
    .requestingModel(model)
    .withInstruction("Do work");

let cursor: FakeCursor;

beforeEach(() => {
  cursor = installFakeCursor();
  for (const [key, value] of Object.entries(cursor.env)) vi.stubEnv(key, value);
  vi.stubEnv("PATH", [cursor.binDir, process.env["PATH"]].join(path.delimiter));
});

afterEach(() => {
  vi.unstubAllEnvs();
  cursor.cleanup();
});

test.each([
  {
    label: "an unsupported effort",
    request: modelRequest("fixture-orb").withEffort("medium").please(),
  },
  {
    label: "a missing required effort",
    request: modelRequest("fixture-orb").please(),
  },
])("refuses $label before creating a Cursor chat", async ({ request }) => {
  cursor.listModels(effortListing);

  await expect(admitLaunchSettings(request, cursorHost)).rejects.toMatchObject({
    status: 400,
    message:
      "The selected reasoning effort is no longer supported by this model. Choose a supported effort or use your Cursor setting.",
  });
  expect(cursor.calls()).toEqual([]);
});

test("a launch naming a model Cursor does not list is refused before create-chat", async () => {
  const request = modelRequest("not-a-listed-model").please();

  await expect(admitLaunchSettings(request, cursorHost)).rejects.toMatchObject({
    status: 400,
    message:
      "The selected Cursor model is no longer available. Choose another model or use your Cursor setting.",
  });
  expect(cursor.modelReads()).toHaveLength(1);
  expect(cursor.calls()).toEqual([]);
});

describe("launching on an admitted model", () => {
  const repository = queuedReadyRepository().please();
  const source = makeMe.aPublishedSource.openDough.please();
  let origin: StartOrigin;
  let home: string;
  let unmount: () => void;
  let marks: NativeDoneMarks;
  let launches: AgentLaunches;

  beforeAll(async () => {
    const prepared = await startOrigin(repository, { host: "cursor" });
    try {
      keepStartedOrigin("codex", repository, prepared);
    } finally {
      prepared.cleanup();
    }
  });

  beforeEach(async () => {
    origin = await startOrigin(repository, { host: "cursor" });
    home = path.join(origin.machine, "home");
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
    await stopCursorRunner(home);
    unmount();
    origin.cleanup();
  });

  async function launch(request: AgentLaunchRequest) {
    await admitLaunchSettings(request, cursorHost);
    const result = await launches.accept(
      source,
      request,
      "http://127.0.0.1:4173",
    );
    if (result.kind !== "accepted")
      throw new Error(`Expected Cursor launch acceptance, got ${result.kind}.`);
    await launches.drain();
    const { attempts } = await launches.attempts();
    return attempts.find(({ id }) => id === result.attempt.id)?.outcome;
  }

  test("passes the composed listed model id to the prompted Cursor client", async () => {
    cursor.listModels(effortListing);
    const request = modelRequest("fixture-orb").withEffort("low").please();

    expect(await launch(request)).toMatchObject({ kind: "launched" });
    expect(cursor.calls().map(({ args }) => args)).toEqual([["create-chat"]]);
    const [client] = cursor.attaches();
    if (client === undefined)
      throw new Error("Expected the prompted Cursor client.");
    expect(realpathSync(client.cwd)).toBe(realpathSync(origin.project));
    expect(client.args).toEqual([
      "--workspace",
      expect.any(String),
      "--resume",
      cursor.sessionId,
      "--model",
      "fixture-orb-low",
    ]);
    expect((await keptRecords(source.id))[0]?.request).toMatchObject({
      model: "fixture-orb",
      effort: "low",
    });
  });

  test("a chosen-model launch whose scope cannot be established is refused before create-chat", async () => {
    cursor.breakSharedConfig();
    const request = modelRequest("gpt-5.2").please();

    const result = await launch(request);

    expect(result).toMatchObject({ kind: "failed", reason: "unavailable" });
    if (result?.kind !== "failed")
      throw new Error("Expected a Cursor launch refusal.");
    expect(result.explanation).toContain(
      "could not be copied into a configuration for this session",
    );
    expect(cursor.calls()).toEqual([]);
    expect(cursor.attaches()).toEqual([]);
    expect(await keptRecords(source.id)).toEqual([]);
  });
});
