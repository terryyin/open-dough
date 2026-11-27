// A session policy that cannot be honored is refused at the launch
// admission boundary before any start or native dispatch, against the
// project's real installed start and a real bare origin: an installation
// without the shared policy, or execution checkout or automatic landing
// without one-shot tracking.

import { rmSync } from "node:fs";
import { IncomingMessage, ServerResponse } from "node:http";
import { Socket } from "node:net";
import path from "node:path";
import {
  beforeEach,
  expect,
  onTestFinished,
  test,
  vi,
  type MockInstance,
} from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { queuedReadyRepository } from "../../../Distribution/tests/support/queued-repository.mjs";
import { AgentLaunches } from "../../server/agentLaunches.ts";
import { NativeDoneMarks } from "../../server/doneMarks.ts";
import { executionCheckout } from "../../server/executionCheckout.ts";
import { answer } from "../../server/launchBoundaryAnswer.ts";
import { sessionPolicies } from "../../server/launchCatalog.ts";
import { launchHost } from "../../server/launchHosts.ts";
import { withSessionPolicy } from "../../server/launchSessionPolicy.ts";
import { machineFolder } from "../../server/localFolder.ts";
import { MachineSessionObservation } from "../../server/machineSessionObservation.ts";
import { mountProjectConfiguration } from "../../server/projectConfiguration.ts";
import { ReviewInitialSync } from "../../server/reviewInitialSync.ts";
import {
  agentAcceptEndpoint,
  type SessionPolicy,
} from "../../src/agentLaunch.ts";
import {
  originState,
  queuedIdentity,
  queuedTitle,
  startOrigin,
  type StartOrigin,
} from "../../test-support/support/startOrigin.ts";

const dashboard = "127.0.0.1:4173";
const source = makeMe.aPublishedSource.openDough.please();

let origin: StartOrigin;
let launches: AgentLaunches;
let doneMarks: NativeDoneMarks;
let dispatch: MockInstance;

beforeEach(async () => {
  origin = await startOrigin(queuedReadyRepository().please());
  vi.stubEnv("HOME", path.join(origin.machine, "home"));
  const unmount = mountProjectConfiguration("production");
  doneMarks = new NativeDoneMarks({
    terminals: { withAttachment: vi.fn(), endAttachments: vi.fn() },
    hostFor: launchHost,
    reportingFolder: machineFolder,
  });
  launches = new AgentLaunches(doneMarks);
  dispatch = vi.spyOn(launches, "accept").mockImplementation(() => {
    throw new Error("Unexpected Start dispatch.");
  });
  onTestFinished(async () => {
    launches.close();
    await doneMarks.close();
    await launches.drain();
    unmount();
    vi.unstubAllEnvs();
    origin.cleanup();
  });
});

const request = (workflow: "execution" | "refinement", policy: SessionPolicy) =>
  makeMe.aLaunchRequest
    .ofWorkflow(workflow, { identity: queuedIdentity, title: queuedTitle })
    .withInstruction("Keep it small.")
    .withPolicy(policy)
    .please();

// The production answer to a Start posted from the Dashboard's own page.
async function started(body: unknown) {
  const socket = new Socket();
  Object.defineProperty(socket, "remoteAddress", { value: "127.0.0.1" });
  const req = new IncomingMessage(socket);
  req.method = "POST";
  req.url = agentAcceptEndpoint;
  req.headers = {
    host: dashboard,
    origin: `http://${dashboard}`,
    "content-type": "application/json",
  };
  req.push(Buffer.from(JSON.stringify(body)));
  req.push(null);
  try {
    return await answer(
      req,
      new URL(agentAcceptEndpoint, `http://${dashboard}`),
      new ServerResponse(req),
      launches,
      doneMarks,
      new MachineSessionObservation(
        () => Promise.reject(new Error("Unexpected machine session read.")),
        () => Promise.resolve([]),
        { waitMs: 1, reuseMs: 0 },
      ),
      { nudge: vi.fn() },
      new ReviewInitialSync(),
    );
  } finally {
    socket.destroy();
  }
}

const oneShot: SessionPolicy = {
  tracking: "one-shot",
  workspace: "default-checkout",
  landing: "auto-land",
};

test("an installation without the shared session policy is refused before any start or native dispatch", async () => {
  const project = executionCheckout(source);
  expect(await sessionPolicies()).toEqual(
    expect.arrayContaining([
      { source: "open-dough", workflow: "execution", host: "claude" },
      { source: "open-dough", workflow: "refinement", host: "claude" },
    ]),
  );
  for (const workflow of ["execution", "refinement"] as const) {
    expect(
      await withSessionPolicy(request(workflow, oneShot), project),
    ).toMatchObject({ workflow, policy: oneShot });
  }

  rmSync(
    path.join(
      origin.project,
      ".claude/skills/dough-execute-plan/scripts/session-policy.mjs",
    ),
  );

  expect(await sessionPolicies()).toEqual([]);
  const before = await originState(origin);
  for (const workflow of ["execution", "refinement"] as const) {
    expect(await started(request(workflow, oneShot))).toEqual({
      status: 400,
      body: {
        error: `Execution checkout · One-shot · Automatically land cannot be selected: the installed skills in ~/git/open-dough do not start ${workflow} with a session policy.`,
      },
    });
  }
  expect(dispatch).not.toHaveBeenCalled();
  expect(await launches.keptStarts()).toEqual([]);
  expect(await originState(origin)).toEqual(before);
});

test("execution checkout or automatic landing without one-shot tracking is refused, not ignored", async () => {
  const before = await originState(origin);
  for (const policy of [
    { tracking: "standard", workspace: "default-checkout", landing: "review" },
    { tracking: "standard", workspace: "isolated", landing: "auto-land" },
  ] as const) {
    expect(await started(request("execution", policy))).toEqual({
      status: 400,
      body: {
        error:
          "Execution checkout and Automatically land apply to one-shot sessions; standard tracking publishes through its workflow.",
      },
    });
  }
  expect(dispatch).not.toHaveBeenCalled();
  expect(await launches.keptStarts()).toEqual([]);
  expect(await originState(origin)).toEqual(before);
});
