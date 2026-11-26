// Unreadable creation evidence prevents a new Codex conversation. Claude can
// still launch, with the original unreadable document kept beside its record.
import { readFileSync } from "node:fs";
import path from "node:path";
import { afterEach, beforeAll, beforeEach, expect, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { queuedReadyRepository } from "../../../Distribution/tests/support/queued-repository.mjs";
import { AgentLaunches } from "../../server/agentLaunches.ts";
import { NativeDoneMarks } from "../../server/doneMarks.ts";
import { keptRecords } from "../../server/launchRecordStore.ts";
import { machineFolder } from "../../server/localFolder.ts";
import { mountProjectConfiguration } from "../../server/projectConfiguration.ts";
import {
  installFakeClaude,
  type FakeClaudeControls,
} from "../../test-support/support/fakeClaude.ts";
import {
  installFakeCodex,
  type FakeCodex,
} from "../../test-support/support/fakeCodex.ts";
import {
  keepLaunchStoreText,
  launchStoreFile,
} from "../../test-support/support/launchStore.ts";
import {
  startOrigin,
  type StartOrigin,
} from "../../test-support/support/startOrigin.ts";
import { keepStartedOrigin } from "../../test-support/support/startOriginPreparation.ts";

const repository = queuedReadyRepository().please();
const source = makeMe.aPublishedSource.openDough.please();
const reportingOrigin = "http://127.0.0.1:4173";

let origin: StartOrigin;
let codex: FakeCodex;
let claude: FakeClaudeControls;
let marks: NativeDoneMarks;
let launches: AgentLaunches;
let unmount: () => void;
let home: string;

beforeAll(async () => {
  const prepared = await startOrigin(repository);
  try {
    keepStartedOrigin("claude", repository, prepared);
  } finally {
    prepared.cleanup();
  }
});

beforeEach(async () => {
  origin = await startOrigin(repository);
  home = path.join(origin.machine, "home");
  const fixture = installFakeClaude(
    origin.machine,
    { binDir: origin.machine, path: process.env["PATH"] ?? "" },
    {},
  );
  claude = fixture.controls;
  codex = await installFakeCodex(
    origin.machine,
    fixture.env["PATH"] ?? "",
    true,
  );
  for (const [key, value] of Object.entries({ ...fixture.env, ...codex.env }))
    vi.stubEnv(key, value);
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
  await codex.close();
  unmount();
  vi.unstubAllEnvs();
  origin.cleanup();
});

test("unreadable evidence refuses Codex before native creation but admits Claude and preserves the file", async () => {
  const unreadable = "{ unreadable launch evidence";
  const store = launchStoreFile(home);
  keepLaunchStoreText(home, unreadable);
  const instruction = "Inspect safely.";
  const codexRequest = makeMe.aLaunchRequest
    .adHoc({ host: "codex", instruction })
    .please();
  const refused = await launches.accept(source, codexRequest, reportingOrigin);

  if (refused.kind !== "uncertain")
    throw new Error(
      `Expected unreadable evidence to block Codex, got ${refused.kind}.`,
    );
  expect(refused.reason).toBe("unconfirmed");
  expect(refused.explanation).toContain("Codex");
  expect(refused.explanation).toContain("native Codex history");
  expect(refused.explanation).not.toContain("--remote");
  expect(codex.calls.filter(({ method }) => method === "thread/start")).toEqual(
    [],
  );
  expect(readFileSync(store, "utf8")).toBe(unreadable);

  claude.claudeScenario("launched");
  const claudeRequest = makeMe.aLaunchRequest
    .adHoc({ host: "claude", instruction })
    .please();
  const accepted = await launches.accept(
    source,
    claudeRequest,
    reportingOrigin,
  );
  if (accepted.kind !== "accepted")
    throw new Error(`Expected Claude acceptance, got ${accepted.kind}.`);
  await launches.drain();
  const { attempts } = await launches.attempts();
  expect(
    attempts.find(({ id }) => id === accepted.attempt.id)?.outcome,
  ).toMatchObject({
    kind: "launched",
  });
  expect(claude.claudeLaunchCalls()).toHaveLength(1);
  expect(await keptRecords(source.id)).toMatchObject([
    { request: { host: "claude", instruction }, session: { host: "claude" } },
  ]);
  expect(readFileSync(`${store}.unreadable`, "utf8")).toBe(unreadable);
});
