// A predecessor Claude record and another host's equal opaque ID remain
// distinct across machine reads and host-qualified actions. No Codex runtime
// is substituted: the older Codex record has no saved native endpoint.
import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import type { z } from "zod";
import { AgentLaunches } from "../../server/agentLaunches.ts";
import { claudeHost } from "../../server/claudeHost.ts";
import { NativeDoneMarks } from "../../server/doneMarks.ts";
import { executionCheckout } from "../../server/executionCheckout.ts";
import { launchHost } from "../../server/launchHosts.ts";
import {
  readStoredRecords,
  replaceRecords,
} from "../../server/launchRecordDocument.ts";
import { deleteRecord } from "../../server/launchRecordDeletion.ts";
import { withStates } from "../../server/launchStates.ts";
import { machineDashboardPath } from "../../server/machineHome.ts";
import {
  configuredProject,
  mountProjectConfiguration,
} from "../../server/projectConfiguration.ts";
import { admittedDone } from "../../server/sessionAdmission.ts";
import { attachableSession } from "../../server/terminalAdmission.ts";
import type { LaunchRecord } from "../../src/agentLaunch.ts";
import { agentTerminalEndpoint } from "../../src/agentTerminal.ts";
import { markDoneRequestSchema } from "../../src/doneMark.ts";
import type { SessionReference } from "../../src/sessionReference.ts";
import {
  expectUnchangedMachineRecords,
  snapshotMachineRecords,
} from "../../test-support/support/machineRecordNames.ts";
import {
  installFakeClaude,
  type FakeClaudeControls,
} from "../../test-support/support/fakeClaude.ts";
import {
  installFakeCodex,
  type FakeCodex,
} from "../../test-support/support/fakeCodex.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";

const sessionId = "same-native-conversation-id";
const story = { identity: "SEED-001#first", title: "First story" };

let machine: string;
let native: FakeClaudeControls;
let codex: FakeCodex;
let marks: NativeDoneMarks;
let launches: AgentLaunches;
let unmount: () => void;

beforeEach(async () => {
  machine = mkdtempSync(path.join(tmpdir(), "dough-host-records-"));
  const fixture = installFakeClaude(
    machine,
    { binDir: machine, path: process.env.PATH ?? "" },
    {},
  );
  native = fixture.controls;
  // A Codex that serves nothing, so no installed runtime is reached.
  codex = await installFakeCodex(machine, fixture.env["PATH"] ?? "", false);
  for (const [key, value] of Object.entries({ ...fixture.env, ...codex.env }))
    vi.stubEnv(key, value);
  vi.stubEnv("HOME", path.join(machine, "home"));
  mkdirSync(path.join(machine, "home", "git", "open-dough"), {
    recursive: true,
  });
  unmount = mountProjectConfiguration("production");
  marks = new NativeDoneMarks({
    terminals: { withAttachment: vi.fn(), endAttachments: vi.fn() },
    hostFor: launchHost,
    reportingFolder: () => executionCheckout(openDough()),
  });
  launches = new AgentLaunches(marks);
});

afterEach(async () => {
  launches.close();
  await marks.close();
  unmount();
  await codex.close();
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  rmSync(machine, { recursive: true, force: true });
});

function openDough() {
  const source = configuredProject("open-dough");
  if (source === undefined) throw new Error("Expected open-dough configured.");
  return source;
}

// The developer's Done on the kept session its request names.
async function markDone(body: z.input<typeof markDoneRequestSchema>) {
  const { source, record, folder } = await admittedDone(body, launches);
  return marks.markDone(source, record, folder, launches);
}

// A terminal upgrade naming the session.
function terminalAdmission(session: SessionReference) {
  const url = new URL(agentTerminalEndpoint, "http://127.0.0.1:4173");
  url.search = new URLSearchParams({
    source: "open-dough",
    host: session.host,
    session: session.sessionId,
  }).toString();
  return attachableSession(url, launches);
}

// The machine dashboard directory, beside the launch store.
const machineRecords = () =>
  path.dirname(machineDashboardPath("agent-launches.json"));

async function filed(): Promise<LaunchRecord[] | undefined> {
  const read = await readStoredRecords();
  if (read.kind === "unreadable") throw new Error("Expected a readable store.");
  return read.document["open-dough"] as LaunchRecord[] | undefined;
}

const nativeActions = () =>
  native.claudeCalls().filter((call) => call.argv[0] !== "agents");

test("predecessor Claude evidence and an equal ID from another host retain distinct reads and actions without fallback", async () => {
  // The story's execution kept by Claude, and by Codex under the same ID.
  const oldClaude = makeMe.aLaunchRecord
    .executing(story)
    .inClaudeSession({ sessionId, shortId: "native-alias" })
    .please();
  const other = makeMe.aLaunchRecord
    .executing(story)
    .inCodexSession({ sessionId })
    .please();
  await replaceRecords(() => ({ "open-dough": [oldClaude, other] }));
  const claudeRead = vi.spyOn(claudeHost, "sessions");

  // The predecessor Codex record has no endpoint or saved workspace, so its
  // observation stays unknown; Claude reads only its own record.
  const folder = executionCheckout(openDough());
  expect(
    (await withStates(folder, [oldClaude, other])).map(
      ({ sessionState }) => sessionState,
    ),
  ).toEqual([{ kind: "unavailable" }, { kind: "unknown" }]);
  expect(claudeRead).toHaveBeenCalledExactlyOnceWith(
    [oldClaude],
    folder,
    expect.anything(),
  );
  const machineRecordsBefore = snapshotMachineRecords(machineRecords(), {
    omitContentFor: ["agent-launches.json"],
  });

  const otherMarked = await markDone({
    source: "open-dough",
    session: sessionId,
    host: "codex",
  });
  expect(otherMarked).toMatchObject({
    ...other,
    doneAt: expect.any(String) as unknown,
    doneProblem: expect.stringContaining(
      "Saved native endpoint is missing",
    ) as unknown,
  });
  expect(nativeActions()).toEqual([]);

  const admitted = await terminalAdmission({ host: "codex", sessionId });
  expect(admitted.session).toEqual(other.session);
  expect(nativeActions()).toEqual([]);

  // A predecessor action omitting host addresses Claude only. It writes the
  // valid store without quarantining old records or touching the other.
  await markDone({ source: "open-dough", session: sessionId });
  const marked = await filed();
  expect(marked).toEqual([
    expect.objectContaining({
      ...oldClaude,
      doneAt: expect.any(String) as unknown,
    }),
    otherMarked,
  ]);
  expectUnchangedMachineRecords(machineRecords(), machineRecordsBefore);

  expect(await deleteRecord("open-dough", { host: "codex", sessionId })).toBe(
    true,
  );
  expect(await filed()).toEqual([marked?.[0]]);
});
