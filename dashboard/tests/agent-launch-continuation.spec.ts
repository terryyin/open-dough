// Continuing a kept launch attempt that needs reconciliation
// (../server/launchAttemptOwner.ts), over raw HTTP: an attempt left unsettled
// by a server that closed blocks a fresh start of its story on the restarted
// server, and only its own continuation resumes it -- under the same attempt
// identity and the existing recovery rules, here Codex's recovery of an
// unconfirmed first input, which resumes the recorded conversation without
// submitting it again. A continuation the service cannot match to a kept
// attempt that needs it is refused with nothing started; such an attempt, or
// one this machine does not keep, is never noted reconciled. When this machine's
// kept attempts cannot be read, nothing tells which startup is unresolved:
// the machine's sessions say so, the file stays as it is, and starts are
// refused. A story whose latest attempt settled uncertain blocks a fresh start
// the same way (./agent-launch-uncertain-continuation.spec.ts).

import { readdirSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { randomUUID } from "node:crypto";
import path from "node:path";
import type { AttemptObservation } from "../src/agentLaunch.ts";
import {
  accept,
  attempts,
  continueAttempt,
  launchRequest,
  noteReconciled,
  refinementRequest,
} from "./agentLaunchBoundary.ts";
import { keptAttempts, settledOutcome } from "./acceptedAttempts.ts";
import { parts } from "./dashboardPage.ts";
import { rawRequest } from "./support/rawHttp.ts";
import { test, expect, stored } from "./support/codexLaunch.ts";
import {
  builtDashboardDir,
  startDashboardServer,
} from "./support/dashboardServer.ts";

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
  test.setTimeout(120_000);
  const native = codexProtocol;
  if (native === undefined) throw new Error("Missing native fixture.");
  native.hold = true;
  const request = { ...refinementRequest, host: "codex" };
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
    prebuilt: builtDashboardDir,
    machine,
    github,
    codexProtocol,
    projectFolders: ["open-dough"],
  });
  try {
    const interrupted = { ...running, owned: false };
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

test("unreadable kept attempts are said on the page and refuse starts, leaving the file as it is", async ({
  page,
  dashboard,
}) => {
  const folder = path.join(dashboard.home, ".open-dough", "dashboard");
  const file = path.join(folder, "launch-attempts.json");
  mkdirSync(folder, { recursive: true });
  writeFileSync(file, "{ not json");

  const sessions = await rawRequest({
    url: `${dashboard.baseURL}/__agent-launch`,
    headers: { Origin: dashboard.origin },
  });
  expect(
    (JSON.parse(sessions.body) as { attemptsReadable: boolean })
      .attemptsReadable,
  ).toBe(false);
  expect(answerOf(await accept(dashboard, launchRequest))).toMatchObject({
    kind: "failed",
    reason: "unrecorded",
    explanation: expect.stringContaining(
      "could not be read, so an earlier start may still need reconciliation",
    ),
  });
  const malformed = await rawRequest({
    url: `${dashboard.baseURL}/__agent-launch/continue`,
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: dashboard.origin },
    body: JSON.stringify({ source: "open-dough", attempt: "not-an-id" }),
  });
  expect(malformed.status).toBe(400);

  await page.goto("/");
  const recovery = page.getByRole("region", { name: "Startup recovery" });
  await expect(recovery).toContainText(
    "This machine's launch evidence (~/.open-dough/dashboard/launch-attempts.json) could not be read",
  );
  await expect(parts(page).project).toBeVisible();
  expect(readFileSync(file, "utf8")).toBe("{ not json");
  expect(readdirSync(folder).sort()).toEqual([
    "launch-attempts.json",
    "projects-production.json",
  ]);
  expect(dashboard.claudeCalls()).toEqual([]);
});
