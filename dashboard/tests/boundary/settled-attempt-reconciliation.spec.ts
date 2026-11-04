// What settles a launch attempt (`settlement` in
// ../../src/launchAttemptSelection.ts): its recorded outcome, or, without one,
// its session's completed report, settled when its outcome was recorded,
// else when that report was received. A snapshot read asked after that time
// reconciles an attempt that published nothing
// (../../src/startupReconciliation.ts), and this machine notes a settled
// attempt reconciled while still refusing one that never settled or needs
// reconciliation (../../server/launchAttemptReconciliation.ts).
import { randomUUID } from "node:crypto";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, test } from "../support/pageTest.ts";
import {
  settled,
  settlement,
  type AttemptObservation,
  type LaunchAttemptRecord,
} from "../../src/agentLaunch.ts";
import { askedAfterSettling } from "../../src/startupReconciliation.ts";
import { reconcileAttempt } from "../../server/launchAttemptReconciliation.ts";
import { OwnedAttempts } from "../../server/ownedAttempts.ts";

const acceptedAt = "2026-11-04T01:00:00.000Z";
const outcomeAt = "2026-11-04T01:05:00.000Z";
const receivedAt = "2026-11-04T01:10:00.000Z";

const report = (outcome: "completed" | "unfinished") => ({
  receipt: randomUUID(),
  reference: randomUUID(),
  outcome,
  message: "",
  receivedAt,
});

const launched = {
  kind: "launched",
  session: { host: "claude", sessionId: "s" },
} as const;

function attemptWith(
  facts: Partial<LaunchAttemptRecord> = {},
): LaunchAttemptRecord {
  return {
    id: randomUUID(),
    request: {
      source: "open-dough",
      workflow: "execution",
      host: "claude",
      identity: "SEED-1#story",
      title: "Story",
    },
    acceptedAt,
    publication: { kind: "none" },
    ...facts,
  };
}

const observed = (attempt: LaunchAttemptRecord): AttemptObservation => ({
  ...attempt,
  owned: false,
  running: false,
});

test("an attempt settles by its outcome, else by its session's completed report, at when either was told", () => {
  const unsettled = attemptWith();
  expect(settlement(unsettled)).toBeUndefined();
  expect(
    settlement(attemptWith({ completion: report("unfinished") })),
  ).toBeUndefined();
  expect(settlement(attemptWith({ completion: report("completed") }))).toEqual({
    at: receivedAt,
  });
  expect(
    settlement(
      attemptWith({
        outcome: launched,
        settledAt: outcomeAt,
        completion: report("completed"),
      }),
    ),
  ).toEqual({ at: outcomeAt });
  expect(settlement(attemptWith({ outcome: launched }))).toEqual({});
  expect(settled(unsettled)).toBe(false);
  expect(settled(attemptWith({ completion: report("completed") }))).toBe(true);
});

test("an attempt that published nothing and whose session completed is reconciled only by a read asked after the report was received", () => {
  const completed = observed(attemptWith({ completion: report("completed") }));
  const at = Date.parse(receivedAt);
  expect(askedAfterSettling(completed, { askedAt: at - 1 })).toBe(false);
  expect(askedAfterSettling(completed, { askedAt: at })).toBe(false);
  expect(askedAfterSettling(completed, { askedAt: at + 1 })).toBe(true);
  // Never settled: no read is after it.
  expect(askedAfterSettling(observed(attemptWith()), { askedAt: at + 1 })).toBe(
    false,
  );
});

test.describe("noting an attempt reconciled on this machine", () => {
  let home: string;
  let previousHome: string | undefined;
  let file: string;

  test.beforeEach(() => {
    previousHome = process.env["HOME"];
    home = mkdtempSync(path.join(tmpdir(), "dough-settled-reconciliation-"));
    process.env["HOME"] = home;
    const directory = path.join(home, ".open-dough/dashboard");
    mkdirSync(directory, { recursive: true });
    file = path.join(directory, "launch-attempts.json");
  });

  test.afterEach(() => {
    if (previousHome === undefined) delete process.env["HOME"];
    else process.env["HOME"] = previousHome;
    rmSync(home, { recursive: true, force: true });
  });

  const kept = (): LaunchAttemptRecord[] =>
    (
      JSON.parse(readFileSync(file, "utf8")) as Record<
        string,
        LaunchAttemptRecord[]
      >
    )["open-dough"] ?? [];

  test("accepts an attempt settled by its session's completed report and refuses one that never settled or needs reconciliation", async () => {
    const completed = attemptWith({
      publication: { kind: "published", revision: "a".repeat(40) },
      completion: report("completed"),
    });
    // Its worker lives, so it runs: never settled, yet needing no
    // reconciliation.
    const running = attemptWith({
      worker: { pid: process.pid, step: "launch", notedAt: acceptedAt },
    });
    const interrupted = attemptWith({ completion: report("unfinished") });
    const uncertain = attemptWith({
      outcome: {
        kind: "uncertain",
        reason: "unconfirmed",
        explanation: "Unknown.",
      },
      settledAt: outcomeAt,
    });
    writeFileSync(
      file,
      JSON.stringify({
        "open-dough": [completed, running, interrupted, uncertain],
      }),
    );
    const owned = new OwnedAttempts();

    const answer = await reconcileAttempt(owned, "open-dough", completed.id);
    expect(answer).toMatchObject({
      kind: "reconciled",
      attempt: { id: completed.id, reconciledAt: expect.any(String) },
    });
    const noted = kept().find(({ id }) => id === completed.id);
    expect(noted?.reconciledAt).toEqual(expect.any(String));
    // Nothing settles it but its report.
    expect(noted?.outcome).toBeUndefined();
    expect(noted?.settledAt).toBeUndefined();

    for (const { id } of [running, interrupted, uncertain])
      expect(await reconcileAttempt(owned, "open-dough", id)).toEqual({
        kind: "refused",
        explanation:
          "This start has not settled or needs reconciliation, so it was not noted as reconciled.",
      });
    expect(
      kept()
        .filter(({ id }) => id !== completed.id)
        .map(({ reconciledAt }) => reconciledAt),
    ).toEqual([undefined, undefined, undefined]);
  });
});
