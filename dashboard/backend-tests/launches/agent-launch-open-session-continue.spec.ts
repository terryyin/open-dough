// A continuation of a story attempt is refused with `session-open` while
// another open session of that story remains, and accepted when the only open
// record is that attempt's own launched session.

import { queuedReadyRepository } from "../../../tests/support/queued-repository.mjs";
import { makeMe } from "../../../tests/support/makeMe.mjs";
import { randomUUID } from "node:crypto";
import { expect, test } from "../../tests/support/pageTest.ts";
import { sessionOpen } from "../../server/launchAttemptConflicts.ts";
import { continueAttempt } from "../../tests/agentLaunchBoundary.ts";
import { machineHome } from "../../tests/machineLaunchRecords.ts";
import { keepLaunchRecords } from "../../tests/support/launchStore.ts";
import {
  answerOf,
  nothingStarted,
  openSessionRequest as request,
  seedKeptAttempt,
} from "./openStorySessionAcceptance.ts";
import {
  startDashboardServer,
  type DashboardServer,
} from "../../tests/support/dashboardServer.ts";
import {
  queuedIdentity,
  queuedTitle,
  startOrigin,
  type PushHold,
  type StartOrigin,
} from "../../tests/support/startOrigin.ts";

test.describe("continuing while a story session is open", () => {
  let origin: StartOrigin;
  let server: DashboardServer;
  let push: PushHold;

  test.beforeEach(async () => {
    origin = await startOrigin(queuedReadyRepository().please());
    server = await startDashboardServer({
      mode: "boundary",
      machine: origin.machine,
      projectFolders: ["open-dough"],
      launchTimeoutMs: 30_000,
    });
    push = origin.holdPushes();
    push.release();
  });

  test.afterEach(async () => {
    push.release();
    await server.close();
    origin.cleanup();
  });

  test("refuses a continuation unless the open record is that attempt's own launch", async () => {
    const openId = "dddddddd-0000-4000-8000-000000000004";
    const ownId = "eeeeeeee-0000-4000-8000-000000000005";
    const foreignAttempt = randomUUID();
    const ownAttempt = randomUUID();
    const acceptedAt = new Date().toISOString();
    // An open refinement session blocks continuing an execution attempt of the
    // same story: it is not that attempt's own launch.
    keepLaunchRecords(machineHome(origin.machine), [
      makeMe.aLaunchRecord
        .refining({ identity: queuedIdentity, title: queuedTitle })
        .inClaudeSession({ sessionId: openId })
        .please(),
    ]);
    seedKeptAttempt(server.home, {
      id: foreignAttempt,
      request,
      acceptedAt,
      publication: { kind: "none" },
      outcome: {
        kind: "uncertain",
        reason: "timed-out",
        explanation: "The launch wait expired.",
      },
      settledAt: acceptedAt,
    });
    expect(await answerOf(continueAttempt(server, foreignAttempt))).toEqual(
      sessionOpen,
    );
    await nothingStarted(origin, server, push, false);

    keepLaunchRecords(machineHome(origin.machine), [
      makeMe.aLaunchRecord
        .executing({ identity: queuedIdentity, title: queuedTitle })
        .inClaudeSession({ sessionId: ownId })
        // Launched once the attempt was accepted, as its own launch is.
        .launchedAt(new Date(Date.parse(acceptedAt) + 1).toISOString())
        .please(),
    ]);
    seedKeptAttempt(server.home, {
      id: ownAttempt,
      request,
      acceptedAt,
      publication: { kind: "unknown" },
      outcome: {
        kind: "launched",
        session: { host: "claude", sessionId: ownId },
      },
      settledAt: acceptedAt,
    });
    server.claudeScenario("launched");
    expect(await answerOf(continueAttempt(server, ownAttempt))).toMatchObject({
      kind: "accepted",
      attempt: {
        id: ownAttempt,
        outcome: {
          kind: "launched",
          session: { host: "claude", sessionId: ownId },
        },
        owned: false,
        running: false,
      },
    });
    await nothingStarted(origin, server, push, false);
  });
});
