// Continuing a kept launch attempt that needs reconciliation
// (../../server/launchAttemptOwner.ts), over raw HTTP: an attempt left unsettled
// by a server that closed blocks a fresh start of its story on the restarted
// server, and only its own continuation resumes it -- under the same attempt
// identity and the existing recovery rules, here Codex's recovery of an
// unconfirmed first input, which resumes the recorded conversation without
// submitting it again. A continuation the service cannot match to a kept
// attempt that needs it is refused with nothing started; such an attempt, or
// one this machine does not keep, is never noted reconciled. Unreadable kept
// attempts: ../../tests/launches/agent-launch-continuation.spec.ts. A story
// whose latest attempt settled uncertain blocks a fresh start the same way
// (./agent-launch-uncertain-continuation.spec.ts).

import { randomUUID } from "node:crypto";
import type { AttemptObservation } from "../../src/agentLaunch.ts";
import {
  accept,
  attempts,
  continueAttempt,
  noteReconciled,
  identity,
  title,
} from "../../tests/agentLaunchBoundary.ts";
import { keptAttempts, settledOutcome } from "../../tests/acceptedAttempts.ts";
import { test, expect, stored } from "../../tests/support/codexLaunch.ts";
import {
  sharedDashboardBuild,
  startDashboardServer,
} from "../../tests/support/dashboardServer.ts";
import { makeMe } from "../../../tests/support/makeMe.mjs";

test.use({ projectFolders: ["open-dough"] });

type Answer = {
  kind: string;
  reason?: string;
  explanation?: string;
  attempt?: AttemptObservation;
};

const answerOf = (response: { body: string }) =>
  JSON.parse(response.body) as Answer;

test("an attempt a closed server left unsettled blocks a fresh start of its story and is resumed only by its own continuation, without a second input", async ({
  dashboard,
  codexProtocol,
  machine,
  github,
}) => {
  const native = codexProtocol;
  if (native === undefined) throw new Error("Missing native fixture.");
  native.hold = true;
  const request = makeMe.aLaunchRequest
    .refining({ identity, title, host: "codex" })
    .please();
  const accepted = answerOf(await accept(dashboard, request)).attempt;
  if (accepted === undefined) throw new Error("The launch was not accepted.");
  const inputs = () =>
    native.calls.filter((call) => call.method === "turn/start");
  await expect.poll(() => inputs().length).toBe(1);
  // This project's refinement has no installed start to publish.
  const [running] = await attempts(dashboard);
  expect(running).toMatchObject({ publication: { kind: "none" }, owned: true });
  await dashboard.close();
  await expect.poll(() => native.sockets.size).toBe(0);
  native.release();
  native.resumeStatus = "completed";

  const restarted = await startDashboardServer({
    mode: "preview",
    prebuilt: sharedDashboardBuild,
    machine,
    github,
    codexProtocol,
    projectFolders: ["open-dough"],
  });
  try {
    // No server runs it now, so it has no next change to count.
    const interrupted = {
      ...running,
      owned: false,
      running: false,
      changes: undefined,
    };
    expect(await attempts(restarted)).toEqual([interrupted]);
    // No workflow's fresh start of the story is accepted.
    for (const workflow of ["refinement", "execution"]) {
      expect(
        answerOf(await accept(restarted, { ...request, workflow })),
      ).toMatchObject({
        kind: "failed",
        reason: "already-starting",
        explanation: expect.stringContaining(
          "An earlier start of this story on this machine was interrupted and needs reconciliation",
        ),
      });
    }
    expect(
      answerOf(await continueAttempt(restarted, randomUUID())),
    ).toMatchObject({ kind: "failed", reason: "refused" });
    expect(
      answerOf(await continueAttempt(restarted, accepted.id, "doughnut")),
    ).toMatchObject({ kind: "failed", reason: "refused" });
    // Nor is it, or an attempt this machine does not keep, noted reconciled.
    for (const [attempt, source] of [
      [randomUUID(), "open-dough"],
      [accepted.id, "doughnut"],
      [accepted.id, "open-dough"],
    ] as const) {
      expect(
        answerOf(await noteReconciled(restarted, attempt, source)),
      ).toMatchObject({ kind: "refused" });
    }
    expect(await attempts(restarted)).toEqual([interrupted]);

    const continued = answerOf(await continueAttempt(restarted, accepted.id));
    expect(continued).toMatchObject({
      kind: "accepted",
      attempt: {
        id: accepted.id,
        request,
        acceptedAt: accepted.acceptedAt,
        owned: true,
      },
    });
    const outcome = await settledOutcome(restarted, accepted.id);
    expect(outcome).toEqual({
      kind: "launched",
      session: { host: "codex", sessionId: native.threadId },
    });
    expect(keptAttempts(restarted)).toEqual([
      expect.objectContaining({
        id: accepted.id,
        acceptedAt: accepted.acceptedAt,
        request,
        outcome,
      }),
    ]);
    // A settled attempt is no longer continued.
    expect(
      answerOf(await continueAttempt(restarted, accepted.id)),
    ).toMatchObject({ kind: "failed", reason: "refused" });
    // Settled, it is noted reconciled once; noting it again changes nothing.
    const noted = answerOf(await noteReconciled(restarted, accepted.id));
    expect(noted).toMatchObject({
      kind: "reconciled",
      attempt: { id: accepted.id, outcome, reconciledAt: expect.any(String) },
    });
    expect(answerOf(await noteReconciled(restarted, accepted.id))).toEqual(
      noted,
    );
    expect(keptAttempts(restarted)).toEqual([
      expect.objectContaining({
        id: accepted.id,
        reconciledAt: noted.attempt?.reconciledAt,
      }),
    ]);
    expect(inputs()).toHaveLength(1);
    expect(stored(restarted.home)).toHaveLength(1);
    expect(stored(restarted.home)[0]?.session.sessionId).toBe(native.threadId);
  } finally {
    await restarted.close();
  }
});
