// Continued Codex starts need evidence from the original native conversation.
// The E2E journey covers an explicit refusal that permits the saved input once.
import path from "node:path";
import { afterEach, beforeAll, beforeEach, expect, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { queuedReadyRepository } from "../../../Distribution/tests/support/queued-repository.mjs";
import { AgentLaunches } from "../../server/agentLaunches.ts";
import { NativeDoneMarks } from "../../server/doneMarks.ts";
import { keptRecords } from "../../server/launchRecordStore.ts";
import { machineFolder } from "../../server/localFolder.ts";
import { mountProjectConfiguration } from "../../server/projectConfiguration.ts";
import type { Acceptance } from "../../src/agentLaunch.ts";
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

async function outcome(accepted: Acceptance) {
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

test("unreadable, missing, empty, unrelated and wrong-workspace history never authorize an uncertain resend", async () => {
  native.hold = true;
  native.beforeInput = () => {
    native.failConnection();
  };
  const accepted = await launches.accept(
    source,
    request,
    "http://127.0.0.1:4173",
  );
  if (accepted.kind !== "accepted")
    throw new Error("Expected a retained attempt.");

  expect(await outcome(accepted)).toMatchObject({ kind: "uncertain" });
  expect(native.history).toHaveLength(1);
  const [initial] = await keptRecords(source.id);
  if (initial === undefined || initial.session.host !== "codex")
    throw new Error("Expected the original Codex conversation.");
  expect(initial).toMatchObject({
    firstInput: { state: "uncertain" },
    session: { sessionId: native.threadId },
  });

  // A fresh owner must Continue the durable attempt without the first owner's memory.
  await launches.drain();
  launches.close();
  launches = new AgentLaunches(marks);
  expect((await launches.attempts()).attempts).toMatchObject([
    {
      id: accepted.attempt.id,
      publication: { kind: "published" },
      owned: false,
      running: false,
    },
  ]);
  const resume = async () =>
    outcome(await launches.continueAttempt(source, accepted.attempt.id));

  native.failRead = true;
  expect(await resume()).toMatchObject({ kind: "uncertain" });
  native.failRead = false;
  native.readError = true;
  expect(await resume()).toMatchObject({ kind: "uncertain" });
  native.readError = false;
  native.history = [];
  expect(await resume()).toMatchObject({ kind: "uncertain" });
  native.history = [
    {
      id: "later-turn",
      items: [
        {
          type: "userMessage",
          content: [{ type: "text", text: "An unrelated later instruction." }],
        },
      ],
    },
  ];
  expect(await resume()).toMatchObject({ kind: "uncertain" });
  native.cwd += "-moved";
  expect(await resume()).toMatchObject({ kind: "uncertain" });

  expect(await keptRecords(source.id)).toEqual([initial]);
  expect((await launches.machineObservation()).records).toHaveLength(1);
  const threadId = initial.session.sessionId;
  expect(
    native.calls.filter(({ method }) => method === "thread/start"),
  ).toHaveLength(1);
  expect(
    native.calls.filter(({ method }) => method === "turn/start"),
  ).toHaveLength(1);
  expect(
    native.calls.filter(
      ({ method, params }) =>
        method === "thread/read" && params["includeTurns"] === true,
    ),
  ).toEqual(
    Array.from({ length: 5 }, () => ({
      method: "thread/read",
      params: { threadId, includeTurns: true },
    })),
  );
  expect(
    native.calls.filter(({ method }) => method === "thread/resume"),
  ).toEqual(
    Array.from({ length: 2 }, () => ({
      method: "thread/resume",
      params: { threadId },
    })),
  );
  await expect.poll(() => native.sockets.size).toBe(0);
});
