// What settles a launch attempt (`settlement` in
// ../../src/launchAttemptSelection.ts): its recorded outcome, or, without one,
// its session's completed report, settled when its outcome was recorded,
// else when that report was received. A snapshot read asked after that time
// reconciles an attempt that published nothing
// (../../src/startupReconciliation.ts), and this machine notes a settled
// attempt reconciled while still refusing one that never settled or needs
// reconciliation (../../server/launchAttemptReconciliation.ts).
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, test } from "../../tests/support/pageTest.ts";
import {
  settled,
  settlement,
  type LaunchAttemptRecord,
} from "../../src/agentLaunch.ts";
import { askedAfterSettling } from "../../src/startupReconciliation.ts";
import { reconcileAttempt } from "../../server/launchAttemptReconciliation.ts";
import { OwnedAttempts } from "../../server/ownedAttempts.ts";
import { makeMe } from "../../../tests/support/makeMe.mjs";

const acceptedAt = "2026-11-04T01:00:00.000Z";
const outcomeAt = "2026-11-04T01:05:00.000Z";
const receivedAt = "2026-11-04T01:10:00.000Z";

// An accepted start of one story that published nothing.
const storyAttempt = () =>
  makeMe.anAcceptedAttempt
    .executing({ identity: "SEED-1#story", title: "Story" })
    .acceptedAt(acceptedAt);

const session = { host: "claude", sessionId: "s" } as const;

// As a server that neither owns nor runs it answers it.
const observed = (attempt: LaunchAttemptRecord) =>
  makeMe.anAttemptObservation.of(attempt).owned(false).running(false).please();

test("an attempt settles by its outcome, else by its session's completed report, at when either was told", () => {
  const unsettled = storyAttempt().please();
  expect(settlement(unsettled)).toBeUndefined();
  expect(
    settlement(storyAttempt().reported("unfinished", receivedAt).please()),
  ).toBeUndefined();
  expect(
    settlement(storyAttempt().reported("completed", receivedAt).please()),
  ).toEqual({ at: receivedAt });
  expect(
    settlement(
      storyAttempt()
        .launched(session)
        .settledAt(outcomeAt)
        .reported("completed", receivedAt)
        .please(),
    ),
  ).toEqual({ at: outcomeAt });
  // An outcome kept without its time.
  expect(settlement(storyAttempt().launched(session).please())).toEqual({});
  expect(settled(unsettled)).toBe(false);
  expect(
    settled(storyAttempt().reported("completed", receivedAt).please()),
  ).toBe(true);
});

test("an attempt that published nothing and whose session completed is reconciled only by a read asked after the report was received", () => {
  const completed = observed(
    storyAttempt().reported("completed", receivedAt).please(),
  );
  const at = Date.parse(receivedAt);
  expect(askedAfterSettling(completed, { askedAt: at - 1 })).toBe(false);
  expect(askedAfterSettling(completed, { askedAt: at })).toBe(false);
  expect(askedAfterSettling(completed, { askedAt: at + 1 })).toBe(true);
  // Never settled: no read is after it.
  expect(
    askedAfterSettling(observed(storyAttempt().please()), {
      askedAt: at + 1,
    }),
  ).toBe(false);
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
    const completed = storyAttempt()
      .withId("00000000-0000-4000-8000-000000000001")
      .published("a".repeat(40))
      .reported("completed", receivedAt)
      .please();
    // Its worker lives, so it runs: never settled, yet needing no
    // reconciliation.
    const running = storyAttempt()
      .withId("00000000-0000-4000-8000-000000000002")
      .workedBy({ pid: process.pid, step: "launch", notedAt: acceptedAt })
      .please();
    const interrupted = storyAttempt()
      .withId("00000000-0000-4000-8000-000000000003")
      .reported("unfinished", receivedAt)
      .please();
    const uncertain = storyAttempt()
      .withId("00000000-0000-4000-8000-000000000004")
      .ended({
        kind: "uncertain",
        reason: "unconfirmed",
        explanation: "Unknown.",
      })
      .settledAt(outcomeAt)
      .please();
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
