// A known native identity must be kept before Codex receives first input.
// Reloading an unresolved creation is also covered by the Codex creation E2E.
import { execFileSync } from "node:child_process";
import { chmodSync, readFileSync } from "node:fs";
import path from "node:path";
import { afterEach, beforeAll, beforeEach, expect, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { queuedReadyRepository } from "../../../Distribution/tests/support/queued-repository.mjs";
import { AgentLaunches } from "../../server/agentLaunches.ts";
import { NativeDoneMarks } from "../../server/doneMarks.ts";
import { keptCreations, keptRecords } from "../../server/launchRecordStore.ts";
import { machineFolder } from "../../server/localFolder.ts";
import { mountProjectConfiguration } from "../../server/projectConfiguration.ts";
import {
  codexEndpoint,
  installFakeCodex,
  type FakeCodex,
} from "../../test-support/support/fakeCodex.ts";
import { launchStoreFile } from "../../test-support/support/launchStore.ts";
import {
  startOrigin,
  type StartOrigin,
} from "../../test-support/support/startOrigin.ts";
import { keepStartedOrigin } from "../../test-support/support/startOriginPreparation.ts";

const repository = queuedReadyRepository().please();
const source = makeMe.aPublishedSource.openDough.please();
const request = makeMe.aLaunchRequest
  .adHoc({ host: "codex" })
  .withInstruction("Preserve this exact intent.")
  .please();

let origin: StartOrigin;
let native: FakeCodex;
let marks: NativeDoneMarks;
let launches: AgentLaunches;
let unmount: () => void;
let home: string;

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
  home = path.join(origin.machine, "home");
  native = await installFakeCodex(
    origin.machine,
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
  origin.cleanup();
});

async function observeSettled(id: string, since?: number) {
  let seen = since;
  for (;;) {
    const { attempt } = await launches.changed(id, 4_500, seen);
    if (attempt?.running === false) return attempt.outcome;
    if (attempt === undefined || attempt.changes === seen)
      throw new Error("The Codex attempt did not settle.");
    seen = attempt.changes;
  }
}

test("failed identity recording prevents first input and explains the exact known continuation", async () => {
  const directory = path.dirname(launchStoreFile(home));
  native.threadId = "known id's identity";
  native.afterCreation = () => {
    chmodSync(directory, 0o555);
  };

  try {
    const accepted = await launches.accept(
      source,
      request,
      "http://127.0.0.1:4173",
    );
    if (accepted.kind !== "accepted")
      throw new Error(`Expected Codex acceptance, got ${accepted.kind}.`);
    // The permission failure also blocks the attempt file. Observe the owner.
    const result = await observeSettled(
      accepted.attempt.id,
      accepted.attempt.changes,
    );
    if (result?.kind !== "uncertain")
      throw new Error(`Expected an uncertain launch, got ${result?.kind}.`);
    expect(result.explanation).toContain(native.threadId);
    expect(result.explanation).toContain("No first input was submitted");
    expect(result.explanation).toContain("could not be saved");
    expect(result.explanation).toContain("'codex' 'resume' '--remote'");
    const command = result.explanation.split("`")[1];
    if (command === undefined)
      throw new Error("Expected a continuation command.");
    execFileSync("/bin/sh", ["-c", command], { stdio: "pipe" });
    expect(
      JSON.parse(
        readFileSync(native.env["FAKE_CODEX_CLI_LOG"] ?? "", "utf8"),
      ) as unknown,
    ).toEqual([
      "resume",
      "--remote",
      codexEndpoint(native),
      "--cd",
      origin.project,
      native.threadId,
    ]);
    expect(
      native.calls.filter(({ method }) => method === "turn/start"),
    ).toEqual([]);
    expect(await keptRecords(source.id)).toEqual([]);
    expect(await keptCreations()).toMatchObject([
      {
        creation: {
          workspace: origin.project,
          endpoint: codexEndpoint(native),
        },
      },
    ]);
    await expect.poll(() => native.sockets.size).toBe(0);
  } finally {
    chmodSync(directory, 0o755);
  }

  expect(
    await launches.accept(source, request, "http://127.0.0.1:4173"),
  ).toMatchObject({
    kind: "uncertain",
  });
  expect(
    native.calls.filter(({ method }) => method === "thread/start"),
  ).toHaveLength(1);
  expect(native.calls.filter(({ method }) => method === "turn/start")).toEqual(
    [],
  );
});
