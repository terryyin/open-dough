// A claimed tracked execution whose landing published its story's return to
// the queue closes on its quiet completed report, at delivery or at binding,
// and keeps that returned outcome with the report; Taken and unfinished stay
// open, and product closure evidence still means published completion only.
// Production delivery, binding and final report reads run over a private
// machine home, with no Dashboard server.
import { randomUUID } from "node:crypto";
import { mkdtempSync, rmSync } from "node:fs";
import { IncomingMessage, ServerResponse } from "node:http";
import { Socket } from "node:net";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, onTestFinished, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { deliverCompletion } from "../../server/completionDelivery.ts";
import { finalReportRequest } from "../../server/finalReportAdmission.ts";
import { finalReportResponse } from "../../server/finalReportResponse.ts";
import { keepAttempt } from "../../server/launchAttemptStore.ts";
import { bindRecord } from "../../server/launchRecordBinding.ts";
import {
  keptSession,
  setRecordDoneAt,
  updateRecord,
} from "../../server/launchRecordStore.ts";
import { mountProjectConfiguration } from "../../server/projectConfiguration.ts";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import { plantTrackedClosureRepository } from "../../test-support/support/retainedReport.ts";

const origin = "http://127.0.0.1:4173";
const story = makeMe.aBacklogEntry
  .with({ identity: "SEED-R#r", href: "seeds/R.md#r", title: "Story R" })
  .please();
const returned = { queued: [story] };
const taken = { taken: [story] };
const completed = {};
type Backlog = typeof returned | typeof taken | typeof completed;

// A launch's Done and returned outcome, as its kept record shows them.
const closureOf = (record: LaunchRecord | undefined) => ({
  doneAt: record?.doneAt,
  returnedToBacklog: record?.returnedToBacklog,
});
const open = { doneAt: undefined, returnedToBacklog: undefined };
// A returned launch closed by this report, keeping its receipt as the outcome.
const closedBy = (report: { receivedAt: string; receipt: string }) => ({
  doneAt: report.receivedAt,
  returnedToBacklog: report.receipt,
});

function privateHome() {
  const root = mkdtempSync(path.join(tmpdir(), "dough-returned-closure-"));
  vi.stubEnv("HOME", path.join(root, "home"));
  onTestFinished(mountProjectConfiguration("production"));
  onTestFinished(() => {
    vi.unstubAllEnvs();
    rmSync(root, { recursive: true, force: true });
  });
  return root;
}

// The Cursor execution of the story named `name`, claimed unless `oneShot`,
// whose landing is the published head of a repository publishing `backlog`.
// Its accepted attempt is kept; `bound` binds its native session now.
async function trackedExecution(
  root: string,
  name: string,
  backlog: Backlog,
  { bound = true, oneShot = false } = {},
) {
  const repository = path.join(root, `${name}-repository`);
  const { revision } = plantTrackedClosureRepository(repository, backlog);
  const reference = randomUUID();
  const reporting = { origin, reference, command: "dashboard-completion" };
  const record = makeMe.aLaunchRecord
    .executing(story)
    .inCursorSession({
      sessionId: randomUUID(),
      continuation: { workspace: repository },
    })
    .onStoryBranch({
      workspace: repository,
      branch: `cursor/${name}`,
      ...(oneShot && {
        tracking: "one-shot" as const,
        role: "isolated" as const,
        landing: "review" as const,
      }),
    })
    .reportingThrough(reporting)
    .withLanding(
      makeMe.aLaunchLanding
        .capturedFrom({ repository, identity: story.identity })
        .comparing({ base: revision, revision })
        .forLaunch(reference)
        .please(),
    )
    .launchedAt(new Date().toISOString())
    .please();
  await keepAttempt(
    makeMe.anAcceptedAttempt
      .executing({ ...story, host: "cursor" })
      .withId(reference)
      .reportingTo(origin)
      .capturingLanding({ reporting })
      .please(),
  );
  if (bound) await bindRecord("open-dough", record);
  const kept = () => keptSession("open-dough", record.session);
  return {
    record,
    // Its report, quiet unless it carries a message, and the receipt.
    report: (
      outcome: "completed" | "unfinished" = "completed",
      message = outcome === "completed" ? "" : "Resolve the decision first.",
    ) =>
      deliverCompletion(
        makeMe.aCompletionSubmission
          .reportingFor({ host: "cursor", reference })
          .withOutcome(outcome)
          .saying(message)
          .please(),
        origin,
        { reported: vi.fn() },
      ),
    kept,
    closing: async () => closureOf(await kept()),
    // Its passive final report read's answer.
    finalReport: async () => {
      const admitted = await finalReportRequest(
        new URL(
          `/__agent-launch/result?${new URLSearchParams({
            source: "open-dough",
            host: "cursor",
            session: record.session.sessionId,
          })}`,
          origin,
        ),
      );
      const socket = new Socket();
      try {
        return await finalReportResponse(
          admitted,
          new ServerResponse(new IncomingMessage(socket)),
        );
      } finally {
        socket.destroy();
      }
    },
  };
}

test("a quiet report closes a launch whose story returned to the queue, keeping that outcome with the report", async () => {
  const root = privateHome();
  const back = await trackedExecution(root, "returned", returned);
  const stillTaken = await trackedExecution(root, "taken", taken);
  const unfinished = await trackedExecution(root, "unfinished", returned);
  const left = await trackedExecution(root, "completed", completed);
  const attention = await trackedExecution(root, "attention", returned);
  const oneShot = await trackedExecution(root, "one-shot", returned, {
    oneShot: true,
  });
  const markedDone = await trackedExecution(root, "marked-done", returned);
  // Its story went back to the queue while it works, without its report.
  const working = await trackedExecution(root, "working", returned);

  const backReceipt = await back.report();
  expect(await back.closing()).toEqual(closedBy(backReceipt));
  await stillTaken.report();
  expect(await stillTaken.closing()).toEqual(open);
  await unfinished.report("unfinished");
  expect(await unfinished.closing()).toEqual(open);
  const { receivedAt: leftAt } = await left.report();
  expect(await left.closing()).toEqual({ doneAt: leftAt });
  await attention.report("completed", "Check the migration.");
  expect(await attention.closing()).toEqual(open);
  // One-shot execution closes on its quiet report, as before, with no outcome.
  const { receivedAt: oneShotAt } = await oneShot.report();
  expect(await oneShot.closing()).toEqual({ doneAt: oneShotAt });
  expect(await working.closing()).toEqual(open);

  // The developer's explicit Done before the report stays the Done.
  const explicitDone = new Date(Date.now() - 60_000).toISOString();
  await setRecordDoneAt("open-dough", markedDone.record.session, explicitDone);
  const { receipt: markedReceipt } = await markedDone.report();
  expect(await markedDone.closing()).toEqual({
    doneAt: explicitDone,
    returnedToBacklog: markedReceipt,
  });

  // Product closure evidence still means the story left the backlog.
  expect(await back.finalReport()).not.toHaveProperty(
    "body.productClosureEvidence",
  );
  expect(await left.finalReport()).toHaveProperty(
    "body.productClosureEvidence",
    true,
  );

  // A newer report replaces the outcome its earlier report kept.
  await back.report("unfinished");
  expect(await back.closing()).toEqual(open);
});

test("an early quiet report closes its returned launch when the session binds", async () => {
  const early = await trackedExecution(privateHome(), "early", returned, {
    bound: false,
  });
  const receipt = await early.report();
  expect(receipt.state).toBe("pending-native-session");
  expect(await early.kept()).toBeUndefined();

  await bindRecord("open-dough", early.record);
  const closed = closedBy(receipt);
  expect(await early.kept()).toMatchObject({
    completion: { receipt: receipt.receipt },
    ...closed,
  });

  // Later native writers of the bound launch keep the outcome with its report.
  await updateRecord("open-dough", early.record);
  expect(await early.closing()).toEqual(closed);
  await bindRecord("open-dough", early.record);
  expect(await early.closing()).toEqual(closed);
});
