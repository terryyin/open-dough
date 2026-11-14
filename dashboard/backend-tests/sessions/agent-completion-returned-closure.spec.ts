// A claimed tracked execution whose landing published its story's return to
// the queue closes on its quiet completed report, at delivery or at binding,
// and keeps that returned outcome with the report; Taken and unfinished stay
// open, and product closure evidence still means published completion only.
import { test, expect } from "../../tests/dashboardTest.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import type { DashboardServer } from "../../tests/support/dashboardServer.ts";
import { machineSessions, markDone } from "../../tests/agentLaunchBoundary.ts";
import {
  deliverReport,
  keepPlanted,
  keptExecution,
  plantedExecution,
} from "../../tests/support/plantedTrackedExecution.ts";
import { recordOperation } from "../../tests/support/completionRecovery.ts";
import { rawRequest } from "../../tests/support/rawHttp.ts";

test.use({ projectFolders: ["open-dough"], serverMode: "boundary" });

const story = makeMe.aBacklogEntry
  .with({ identity: "SEED-R#r", href: "seeds/R.md#r", title: "Story R" })
  .please();
const returned = { queued: [story] };
const taken = { taken: [story] };
const completed = {};
const trackedExecution = (
  dashboard: DashboardServer,
  name: string,
  backlog: Parameters<typeof plantedExecution>[3],
  options?: Parameters<typeof plantedExecution>[4],
) => plantedExecution(dashboard, story, name, backlog, options);

// A launch's Done and returned outcome, as a record shows them.
const closureOf = (record: LaunchRecord | undefined) => ({
  doneAt: record?.doneAt,
  returnedToBacklog: record?.returnedToBacklog,
});
const open = { doneAt: undefined, returnedToBacklog: undefined };

const finalReport = (dashboard: DashboardServer, record: LaunchRecord) =>
  rawRequest({
    url: `${dashboard.baseURL}/__agent-launch/result?${new URLSearchParams({
      source: "open-dough",
      host: "cursor",
      session: record.session.sessionId,
    })}`,
    headers: { Origin: dashboard.origin },
  });

test("a quiet report closes a launch whose story returned to the queue, keeping that outcome with the report", async ({
  dashboard,
}) => {
  const back = trackedExecution(dashboard, "returned", returned);
  const stillTaken = trackedExecution(dashboard, "taken", taken);
  const unfinished = trackedExecution(dashboard, "unfinished", returned);
  const left = trackedExecution(dashboard, "completed", completed);
  const attention = trackedExecution(dashboard, "attention", returned);
  const oneShot = trackedExecution(dashboard, "one-shot", returned, {
    oneShot: true,
  });
  const markedDone = trackedExecution(dashboard, "marked-done", returned);
  // Its story went back to the queue while it works, without its report.
  const working = trackedExecution(dashboard, "working", returned);
  await keepPlanted(dashboard, [
    back,
    stillTaken,
    unfinished,
    left,
    attention,
    oneShot,
    markedDone,
    working,
  ]);

  const backReceipt = await deliverReport(dashboard, back);
  const backClosed = {
    doneAt: backReceipt.receivedAt,
    returnedToBacklog: backReceipt.receipt,
  };
  expect(closureOf(keptExecution(dashboard, back))).toEqual(backClosed);
  await deliverReport(dashboard, stillTaken);
  expect(closureOf(keptExecution(dashboard, stillTaken))).toEqual(open);
  await deliverReport(dashboard, unfinished, "unfinished");
  expect(closureOf(keptExecution(dashboard, unfinished))).toEqual(open);
  const { receivedAt: leftAt } = await deliverReport(dashboard, left);
  expect(closureOf(keptExecution(dashboard, left))).toEqual({ doneAt: leftAt });
  await deliverReport(
    dashboard,
    attention,
    "completed",
    "Check the migration.",
  );
  expect(closureOf(keptExecution(dashboard, attention))).toEqual(open);
  // One-shot execution closes on its quiet report, as before, with no outcome.
  const { receivedAt: oneShotAt } = await deliverReport(dashboard, oneShot);
  expect(closureOf(keptExecution(dashboard, oneShot))).toEqual({
    doneAt: oneShotAt,
  });

  // The developer's explicit Done before the report stays the Done.
  expect(
    (
      await markDone(dashboard, {
        source: "open-dough",
        host: "cursor",
        session: markedDone.record.session.sessionId,
      })
    ).status,
  ).toBe(200);
  const explicitDone = keptExecution(dashboard, markedDone)?.doneAt;
  expect(explicitDone).toBeDefined();
  const { receipt: markedReceipt } = await deliverReport(dashboard, markedDone);
  expect(closureOf(keptExecution(dashboard, markedDone))).toEqual({
    doneAt: explicitDone,
    returnedToBacklog: markedReceipt,
  });

  const answered = (await machineSessions(dashboard)) as LaunchRecord[];
  const answer = (launch: { record: LaunchRecord }) =>
    closureOf(
      answered.find(
        ({ session }) => session.sessionId === launch.record.session.sessionId,
      ),
    );
  expect(answer(back)).toEqual(backClosed);
  expect(answer(stillTaken)).toEqual(open);
  expect(answer(left)).toEqual({ doneAt: leftAt });
  expect(answer(working)).toEqual(open);

  // Product closure evidence still means the story left the backlog.
  const backFinal = await finalReport(dashboard, back.record);
  expect(backFinal.status).toBe(200);
  expect(JSON.parse(backFinal.body)).not.toHaveProperty(
    "productClosureEvidence",
  );
  const leftFinal = await finalReport(dashboard, left.record);
  expect(JSON.parse(leftFinal.body)).toMatchObject({
    productClosureEvidence: true,
  });

  // A newer report replaces the outcome its earlier report kept.
  await deliverReport(dashboard, back, "unfinished");
  expect(closureOf(keptExecution(dashboard, back))).toEqual(open);
});

test("an early quiet report closes its returned launch when the session binds", async ({
  dashboard,
}) => {
  const early = trackedExecution(dashboard, "early", returned, {
    launched: false,
  });
  await keepPlanted(dashboard, [early], []);
  const receipt = await deliverReport(dashboard, early);
  expect(receipt.state).toBe("pending-native-session");
  expect(keptExecution(dashboard, early)).toBeUndefined();

  await recordOperation(dashboard, "bindRecord", ["open-dough", early.record]);
  expect(keptExecution(dashboard, early)).toMatchObject({
    completion: { receipt: receipt.receipt },
    doneAt: receipt.receivedAt,
    returnedToBacklog: receipt.receipt,
  });

  // Later native writers of the bound launch keep the outcome with its report.
  for (const operation of ["updateRecord", "bindRecord"]) {
    await recordOperation(dashboard, operation, ["open-dough", early.record]);
    expect(closureOf(keptExecution(dashboard, early))).toEqual({
      doneAt: receipt.receivedAt,
      returnedToBacklog: receipt.receipt,
    });
  }
});
