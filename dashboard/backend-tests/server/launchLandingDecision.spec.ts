// Attempt-reported landings decide over composed attempts and records.
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  aBoundRecord,
  aReportingAttempt,
  aSubmission,
  aVerifiedLandingWorktree,
  aWorktreeAuthority,
  baseSha,
  landingDelivery,
  landingReceipt,
  origin,
  otherSha,
  receiptTime,
  refuse,
  reportingReference,
  revisionSha,
} from "../support/attemptLandingDecisionCase.ts";
import { decideAttemptLanding } from "../../server/launchLandingDecision.ts";

test("a deleted reporting session refuses a landing from composed values", async () => {
  const authority = aWorktreeAuthority();
  const attempt = aReportingAttempt({ authority, withOutcome: true });
  const record = aBoundRecord({
    authority,
    deletedAt: "2026-11-20T11:00:00.000Z",
  });

  await expect(
    refuse(() =>
      decideAttemptLanding(
        aSubmission({ base: baseSha, revision: revisionSha }),
        origin,
        "prepare",
        [attempt],
        [record],
        landingReceipt,
        receiptTime,
      ),
    ),
  ).resolves.toEqual({
    status: 409,
    message: "The reporting session was deleted.",
  });
});

test("a launch with an outcome but no bound record refuses", async () => {
  const attempt = aReportingAttempt({
    authority: aWorktreeAuthority(),
    withOutcome: true,
  });

  await expect(
    refuse(() =>
      decideAttemptLanding(
        aSubmission({ base: baseSha, revision: revisionSha }),
        origin,
        "prepare",
        [attempt],
        [],
        landingReceipt,
        receiptTime,
      ),
    ),
  ).resolves.toEqual({
    status: 409,
    message: "This launch has no retained reporting session.",
  });
});

test("another story's identity refuses", async () => {
  const attempt = aReportingAttempt({
    identity: "SEED-413#owned",
    authority: aWorktreeAuthority({ identity: "SEED-413#owned" }),
  });

  await expect(
    refuse(() =>
      decideAttemptLanding(
        aSubmission({ base: baseSha, revision: revisionSha }, "SEED-413#other"),
        origin,
        "prepare",
        [attempt],
        [],
        landingReceipt,
        receiptTime,
      ),
    ),
  ).resolves.toEqual({
    status: 409,
    message: "This is not the established launch's authorized landing.",
  });
});

test("recording a comparison that was never prepared is refused as plain values", async () => {
  const attempt = aReportingAttempt({ authority: aWorktreeAuthority() });

  await expect(
    refuse(() =>
      decideAttemptLanding(
        aSubmission({ base: baseSha, revision: revisionSha }),
        origin,
        "record",
        [attempt],
        [],
        landingReceipt,
        receiptTime,
      ),
    ),
  ).resolves.toEqual({
    status: 409,
    message:
      "This comparison was not retained for this launch before publication.",
  });
});

test("a second prepare of the same delivery answers the first receipt as plain values", async () => {
  const authority = aWorktreeAuthority();
  const prepared = makeMe.aLaunchLanding
    .capturedFrom(authority)
    .forLaunch(reportingReference)
    .comparing({ base: baseSha, revision: revisionSha })
    .deliveredAs({ delivery: landingDelivery, receipt: landingReceipt })
    .receivedAt(receiptTime)
    .please();
  const attempts = [aReportingAttempt({ authority, preparations: [prepared] })];

  const decision = await decideAttemptLanding(
    aSubmission({ base: baseSha, revision: revisionSha }),
    origin,
    "prepare",
    attempts,
    [],
    "55555555-5555-4555-8555-555555555555",
    "2026-11-20T13:00:00.000Z",
  );

  expect(decision.isNew).toBe(false);
  expect(decision.state).toBe("prepared");
  expect(decision.landing).toEqual(prepared);
  expect(decision.nextAttempts).toBe(attempts);
  expect(decision.nextAttempts[0]?.landingPreparations).toEqual([prepared]);
});

test("a different comparison after acceptance refuses", async () => {
  const authority = aWorktreeAuthority();
  const accepted = makeMe.aLaunchLanding
    .capturedFrom(authority)
    .forLaunch(reportingReference)
    .comparing({ base: baseSha, revision: revisionSha })
    .deliveredAs({ delivery: landingDelivery, receipt: landingReceipt })
    .receivedAt(receiptTime)
    .please();
  const attempt = aReportingAttempt({ authority, landing: accepted });

  await expect(
    refuse(() =>
      decideAttemptLanding(
        aSubmission({ base: baseSha, revision: otherSha }),
        origin,
        "record",
        [attempt],
        [],
        landingReceipt,
        receiptTime,
      ),
    ),
  ).resolves.toEqual({
    status: 409,
    message: "This launch already retained a different landing comparison.",
  });
});

test("a new prepare answers prepared with next attempts holding the pair", async () => {
  const { authority, repository, base, revision } = aVerifiedLandingWorktree();
  const attempt = aReportingAttempt({ authority });
  const report = aSubmission({ base, revision });

  const decision = await decideAttemptLanding(
    report,
    origin,
    "prepare",
    [attempt],
    [],
    landingReceipt,
    receiptTime,
  );

  expect(decision.isNew).toBe(true);
  expect(decision.state).toBe("prepared");
  expect(decision.landing).toMatchObject({
    repository,
    remote: report.remote,
    target: report.target,
    reference: reportingReference,
    delivery: landingDelivery,
    base,
    revision,
    receipt: landingReceipt,
    receivedAt: receiptTime,
  });
  expect(decision.nextAttempts).toHaveLength(1);
  expect(decision.nextAttempts[0]?.landingPreparations).toEqual([
    decision.landing,
  ]);
});
