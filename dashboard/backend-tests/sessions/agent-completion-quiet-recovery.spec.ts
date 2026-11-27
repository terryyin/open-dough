// A quiet report closes a tracked execution only with its landing and
// readable published closure, and an unacknowledged one recovers as
// reporting only: its retry answers the one durable receipt, which no late
// record writer imports before it is applied. The launch's installed
// reporting script runs in process; its one request reaches production
// completion admission and delivery over a private machine home.
import { randomUUID } from "node:crypto";
import { mkdirSync, readFileSync, rmSync } from "node:fs";
import path from "node:path";
import { expect, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { keptAttempts } from "../../server/launchAttemptStore.ts";
import { bindRecord } from "../../server/launchRecordBinding.ts";
import { keptSession, updateRecord } from "../../server/launchRecordStore.ts";
import { completionReceiptSchema } from "../../src/completionReport.ts";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import { queuedIdentity as identity } from "../../test-support/support/queuedStories.ts";
import { plantTrackedClosureRepository } from "../../test-support/support/retainedReport.ts";
import {
  keptReportingLaunch,
  reportingHome,
  reportInstalled,
} from "../support/installedReporting.ts";

const origin = "http://127.0.0.1:4173";
const title = "Prepare the queued start";
// A kept session that neither a completion nor a Done has closed.
const open = { completion: undefined, doneAt: undefined };

// A kept tracked Codex execution whose workspace was retired after its
// reporting script was installed; with `landed`, its record keeps the
// launch's landing on the closure repository.
async function trackedLaunch(
  home: ReturnType<typeof reportingHome>,
  { landed }: { landed: boolean },
) {
  const reported = vi.fn();
  const accepted = makeMe.anAcceptedAttempt
    .executing({ identity, title, host: "codex" })
    .reportingTo(origin)
    .withId(randomUUID())
    .please();
  // A published backlog that no longer lists the story: readable completed
  // closure.
  const repository = path.join(home.root, "closure-repository");
  const { revision } = plantTrackedClosureRepository(repository);
  const { record, script, argv } = await keptReportingLaunch(
    home.workspace,
    accepted,
    (reporting): LaunchRecord => {
      const claimed = makeMe.aLaunchRecord
        .executing({ identity, title })
        .inCodexSession({ sessionId: "tracked-native-session" })
        .onStoryBranch({ workspace: home.workspace, branch: "codex/tracked" })
        .reportingThrough(reporting)
        .withFirstInput({ state: "awaiting" })
        .please();
      if (!landed) return claimed;
      return {
        ...claimed,
        landing: makeMe.aLaunchLanding
          .capturedFrom({ repository, identity })
          .comparing({ base: revision, revision })
          .forLaunch(reporting.reference)
          .please(),
      };
    },
  );
  rmSync(home.workspace, { recursive: true, force: true });
  const kept = async () => {
    const session = await keptSession("open-dough", record.session);
    if (session === undefined) throw new Error("No kept session");
    return session;
  };
  return {
    record,
    reported,
    kept,
    report: (...more: string[]) =>
      reportInstalled(script, [...argv, ...more], { reported }),
    retry: async (pending: string, lostReceipt = false) =>
      completionReceiptSchema.parse(
        await reportInstalled(
          script,
          ["--retry", pending],
          { reported },
          { lostReceipt },
        ),
      ),
    // The kept session's completion and Done time.
    closing: async () => {
      const { completion, doneAt } = await kept();
      return { completion, doneAt };
    },
    receipts: async () =>
      (await keptAttempts())?.find((entry) => entry.id === accepted.id)
        ?.completionReceipts ?? [],
  };
}

test("an empty completed report without landing records its receipt and stays open", async () => {
  const launch = await trackedLaunch(reportingHome("dough-quiet-recovery"), {
    landed: false,
  });
  const receipt = completionReceiptSchema.parse(
    await launch.report("--outcome", "completed"),
  );
  expect(receipt).toMatchObject({
    outcome: "completed",
    message: "",
    state: "recorded",
  });
  const kept = await launch.kept();
  expect(kept.completion?.receipt).toBe(receipt.receipt);
  expect(kept.doneAt).toBeUndefined();
});

// A landed launch's quiet report whose record write failed unacknowledged:
// the store is held once the report has reserved its receipt, while each
// clock reading passes the writer's ten-second deadline. Answers the
// launch, the sender's message and its retained submission.
async function unacknowledgedReport() {
  const home = reportingHome("dough-quiet-recovery");
  const launch = await trackedLaunch(home, { landed: true });
  const recordsLock = path.join(home.dashboard, "agent-launches.json.lock");
  mkdirSync(recordsLock);
  const refused = launch.report("--outcome", "completed").then(
    () => {
      throw new Error("The failed write was acknowledged");
    },
    (error: unknown) => (error instanceof Error ? error.message : ""),
  );
  await expect.poll(async () => (await launch.receipts()).length).toBe(1);
  let now = Date.now();
  const later = vi.spyOn(Date, "now").mockImplementation(() => {
    now += 11_000;
    return now;
  });
  try {
    const message = await refused;
    const pending = /Retained completion: (.+)/.exec(message)?.[1] ?? "";
    return { launch, message, pending };
  } finally {
    later.mockRestore();
    rmSync(recordsLock, { recursive: true });
  }
}

// The launch's record as a concurrent writer holds it, with its own evidence.
const concurrentRecord = (record: LaunchRecord): LaunchRecord => ({
  ...record,
  firstInput: { state: "confirmed", explanation: "Concurrent evidence" },
});

test("an unacknowledged quiet report keeps its submission for a reporting-only retry", async () => {
  const { launch, message, pending } = await unacknowledgedReport();
  expect(message).toContain("Completion delivery was not acknowledged");
  expect(message).toMatch(/Retry reporting only: .+'--retry' /);
  expect(JSON.parse(readFileSync(pending, "utf8"))).toMatchObject({
    message: "",
    outcome: "completed",
  });
  expect(await launch.closing()).toEqual(open);
});

test("late record writers import no reserved but unapplied receipt", async () => {
  const { launch } = await unacknowledgedReport();
  const stale = concurrentRecord(launch.record);
  await Promise.all([
    bindRecord("open-dough", stale),
    updateRecord("open-dough", stale),
  ]);
  expect(await launch.closing()).toEqual(open);
});

test("a retry whose receipt is lost leaves the durable completion that later retries answer", async () => {
  const { launch, pending } = await unacknowledgedReport();
  const { delivery } = JSON.parse(readFileSync(pending, "utf8")) as {
    delivery: string;
  };
  const [lost] = await Promise.allSettled([
    launch.retry(pending, true),
    updateRecord("open-dough", concurrentRecord(launch.record)),
  ]);
  expect(lost.status).toBe("rejected");
  const durable = await launch.kept();
  expect(durable.completion?.delivery).toBe(delivery);
  expect(durable.doneAt).toBe(durable.completion?.receivedAt);
  expect(durable.firstInput?.explanation).toBe("Concurrent evidence");
  const receipt = await launch.retry(pending);
  expect(receipt).toMatchObject(durable.completion ?? {});
  // The lost delivery and its answered retry each hand on that one receipt.
  expect(launch.reported.mock.calls).toEqual([
    ["open-dough", receipt],
    ["open-dough", receipt],
  ]);
  expect(
    await Promise.all([launch.retry(pending), launch.retry(pending)]),
  ).toEqual([receipt, receipt]);
});
