// Selected-host defaults and installed option admission before native creation.
import { IncomingMessage } from "node:http";
import { Socket } from "node:net";
import { readFileSync, realpathSync } from "node:fs";
import path from "node:path";
import { afterEach, beforeAll, beforeEach, expect, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { admitted } from "../../server/agentLaunchAdmission.ts";
import { AgentLaunches } from "../../server/agentLaunches.ts";
import { NativeDoneMarks } from "../../server/doneMarks.ts";
import { machineFolder } from "../../server/localFolder.ts";
import { mountProjectConfiguration } from "../../server/projectConfiguration.ts";
import {
  agentAcceptEndpoint,
  type AgentLaunchRequest,
} from "../../src/agentLaunch.ts";
import {
  notRefinedIdentity,
  notRefinedStory,
  queuedDashboardRepository,
} from "../../test-support/launchJourney.ts";
import {
  daemonStarts,
  passive,
} from "../../test-support/support/codexObservation.ts";
import {
  installFakeClaude,
  type FakeClaudeControls,
} from "../../test-support/support/fakeClaude.ts";
import {
  installFakeCodex,
  type FakeCodex,
} from "../../test-support/support/fakeCodex.ts";
import {
  keptLaunchRecords,
  launchStoreFile,
} from "../../test-support/support/launchStore.ts";
import {
  startOrigin,
  type StartOrigin,
} from "../../test-support/support/startOrigin.ts";
import { keepStartedOrigin } from "../../test-support/support/startOriginPreparation.ts";

const repository = queuedDashboardRepository()
  .withRevision("without-options", {
    message: "Remove installed Codex refinement options",
    remove: [
      ".agents/skills/dough-story-refinement/references/refinement-options.json",
    ],
  })
  .please();
const refinement = makeMe.aLaunchRequest
  .refining({
    identity: notRefinedIdentity,
    title: notRefinedStory,
    host: "codex",
  })
  .please();
const reportingOrigin = "http://127.0.0.1:4173";

let project: StartOrigin;
let native: FakeCodex;
let claude: FakeClaudeControls;
let home: string;
let launches: AgentLaunches;
let marks: NativeDoneMarks;
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
  const fakeClaude = installFakeClaude(
    project.machine,
    { binDir: project.machine, path: process.env["PATH"] ?? "" },
    {},
  );
  claude = fakeClaude.controls;
  native = await installFakeCodex(
    project.machine,
    fakeClaude.env["PATH"] ?? "",
    true,
  );
  for (const [key, value] of Object.entries({
    ...fakeClaude.env,
    ...native.env,
  }))
    vi.stubEnv(key, value);
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

async function launch(selection: AgentLaunchRequest) {
  const socket = new Socket();
  Object.defineProperty(socket, "remoteAddress", { value: "127.0.0.1" });
  const request = new IncomingMessage(socket);
  request.method = "POST";
  request.headers = {
    host: new URL(reportingOrigin).host,
    origin: reportingOrigin,
    "content-type": "application/json",
  };
  request.push(Buffer.from(JSON.stringify(selection)));
  request.push(null);
  const input = await admitted(
    request,
    new URL(agentAcceptEndpoint, reportingOrigin),
    launches,
  );
  if (input.kind !== "accept") throw new Error("Expected launch admission.");
  const accepted = await launches.accept(
    input.source,
    input.request,
    reportingOrigin,
  );
  if (accepted.kind !== "accepted") return accepted;
  await launches.drain();
  return (await launches.attempts()).attempts.find(
    ({ id }) => id === accepted.attempt.id,
  )?.outcome;
}

test("missing Codex options allow defaults, selected options/model are refused before native creation", async () => {
  for (const changed of [{ options: ["--explore"] }, { model: "opus" }]) {
    await expect(launch({ ...refinement, ...changed })).rejects.toMatchObject({
      status: 400,
    });
    expect(
      native.calls.filter(({ method }) =>
        ["thread/start", "turn/start"].includes(method),
      ),
    ).toEqual([]);
  }
  expect(await launch(refinement)).toMatchObject({ kind: "launched" });
  await launches.machineObservation();
  expect(daemonStarts(native)).toEqual(
    Array.from({ length: 3 }, () => ({ cwd: realpathSync(home) })),
  );
  expect(keptLaunchRecords(home)[0]).toMatchObject({
    firstInput: { state: "confirmed" },
  });
  expect(
    native.calls.filter(({ method }) => method === "turn/start"),
  ).toHaveLength(1);
  expect(claude.claudeLaunchCalls()).toEqual([]);
  const recordFile = launchStoreFile(home);
  const before = readFileSync(recordFile, "utf8");
  const starts = daemonStarts(native);
  const observedFrom = native.calls.length;
  await launches.machineObservation();
  await launches.machineObservation();
  expect(daemonStarts(native)).toEqual(starts);
  expect(readFileSync(recordFile, "utf8")).toBe(before);
  passive(native.calls.slice(observedFrom));
});

test.each([
  {
    shape: "a bounded string",
    error: {
      code: -32600,
      message:
        "failed to load configuration: No such file or directory (os error 2)",
      data: { credential: "private-native-data" },
    },
    cause:
      "failed to load configuration: No such file or directory (os error 2)",
  },
  {
    shape: "an object",
    error: { code: -32600, message: { credential: "private-native-data" } },
    cause: "Codex refused the native request.",
  },
  {
    shape: "an overlong string",
    error: {
      code: -32600,
      message: "x".repeat(501),
      data: "private-native-data",
    },
    cause: "Codex refused the native request.",
  },
])(
  "native creation refusal exposes a bounded message when the native error is $shape",
  async ({ error, cause }) => {
    native.refuseCreation = true;
    native.creationError = error;
    const request = makeMe.aLaunchRequest
      .adHoc({ host: "codex" })
      .withInstruction("Explain this story.")
      .please();

    const answer = await launch(request);
    expect(answer).toMatchObject({
      kind: "failed",
      reason: "refused",
      explanation: expect.stringContaining(cause) as unknown,
    });
    expect(JSON.stringify(answer)).not.toContain("private-native-data");
    expect(
      native.calls.filter(({ method }) => method === "turn/start"),
    ).toEqual([]);
  },
);
