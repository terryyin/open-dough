// Direct verification leaves an uncertain Codex attempt for continuation.
import path from "node:path";
import { afterEach, beforeAll, beforeEach, expect, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { queuedReadyRepository } from "../../../Distribution/tests/support/queued-repository.mjs";
import { AgentLaunches } from "../../server/agentLaunches.ts";
import { NativeDoneMarks } from "../../server/doneMarks.ts";
import { keptAttempts } from "../../server/launchAttemptStore.ts";
import { machineFolder } from "../../server/localFolder.ts";
import { mountProjectConfiguration } from "../../server/projectConfiguration.ts";
import {
  installFakeCodex,
  type FakeCodex,
} from "../../test-support/support/fakeCodex.ts";
import {
  startOrigin,
  type StartOrigin,
} from "../../test-support/support/startOrigin.ts";
import { keepStartedOrigin } from "../../test-support/support/startOriginPreparation.ts";

const request = makeMe.aLaunchRequest
  .adHoc({ host: "codex" })
  .withInstruction("Preserve this exact intent.")
  .please();

const repository = queuedReadyRepository().please();
const source = makeMe.aPublishedSource.openDough.please();

let origin: StartOrigin;
let native: FakeCodex;
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
  origin = await startOrigin(repository, { host: "codex" });
  native = await installFakeCodex(
    origin.machine,
    process.env["PATH"] ?? "",
    true,
  );
  for (const [key, value] of Object.entries(native.env)) vi.stubEnv(key, value);
  vi.stubEnv("HOME", path.join(origin.machine, "home"));
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
  origin.cleanup();
});

test("direct verification refuses an uncertain Codex start and keeps its attempt", async () => {
  native.refuseInput = true;
  const accepted = await launches.accept(
    source,
    request,
    "http://127.0.0.1:4173",
  );
  if (accepted.kind !== "accepted")
    throw new Error("Expected a retained attempt.");
  await launches.drain();

  const before = await launches.attempts();
  expect(before.attempts).toMatchObject([
    {
      id: accepted.attempt.id,
      publication: { kind: "published" },
      outcome: { kind: "uncertain" },
    },
  ]);
  const kept = await keptAttempts();
  const nativeCalls = native.calls.length;

  expect(await launches.verify(source, accepted.attempt.id)).toEqual({
    kind: "unresolved",
    explanation:
      "This start is not a story launch whose session alone may or may not have started, so its host was not asked.",
  });
  expect(await launches.attempts()).toEqual(before);
  expect(await keptAttempts()).toEqual(kept);
  expect(native.calls.slice(nativeCalls)).toEqual([]);
});
