// Retained-record landings decide over composed records.
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { launchRetentionDays } from "../../src/launchRecord.ts";
import {
  aDeclaredRecord,
  aSettledRetainedRecord,
  aSubmission,
  aVerifiedLandingWorktree,
  aWorktreeAuthority,
  baseSha,
  landingDelivery,
  landingReceipt,
  origin,
  receiptTime,
  refuse,
  reportingReference,
  revisionSha,
} from "../support/attemptLandingDecisionCase.ts";
import { decideLanding } from "../../server/launchLandingDecision.ts";

test("a declared branch landing from another origin is refused", async () => {
  const record = aDeclaredRecord({ origin });

  await expect(
    refuse(() =>
      decideLanding({
        report: aSubmission({ base: baseSha, revision: revisionSha }),
        origin: "http://127.0.0.1:9999",
        operation: "prepare",
        attempts: [],
        records: [record],
        receiptId: landingReceipt,
        receivedAt: receiptTime,
      }),
    ),
  ).resolves.toEqual({
    status: 409,
    message: "This is not the session's authorized branch landing.",
  });
});

test("a declared branch landing from another host is refused", async () => {
  const record = aDeclaredRecord({});
  const report = makeMe.aLandingSubmission
    .comparing({ base: baseSha, revision: revisionSha })
    .forLaunch({ host: "codex" })
    .please();

  await expect(
    refuse(() =>
      decideLanding({
        report,
        origin,
        operation: "prepare",
        attempts: [],
        records: [record],
        receiptId: landingReceipt,
        receivedAt: receiptTime,
      }),
    ),
  ).resolves.toEqual({
    status: 409,
    message: "This is not the session's authorized branch landing.",
  });
});

test("a deleted declared landing is refused", async () => {
  const record = aDeclaredRecord({
    deletedAt: "2026-11-20T11:00:00.000Z",
  });

  await expect(
    refuse(() =>
      decideLanding({
        report: aSubmission({ base: baseSha, revision: revisionSha }),
        origin,
        operation: "prepare",
        attempts: [],
        records: [record],
        receiptId: landingReceipt,
        receivedAt: receiptTime,
      }),
    ),
  ).resolves.toEqual({
    status: 409,
    message: "This is not the session's authorized branch landing.",
  });
});

test("a missing attempt inside retention at receipt time is refused", async () => {
  const authority = aWorktreeAuthority();
  const record = aSettledRetainedRecord({
    authority,
    settledAt: "2000-11-20T12:00:00.000Z",
  });

  await expect(
    refuse(() =>
      decideLanding({
        report: aSubmission({ base: baseSha, revision: revisionSha }),
        origin,
        operation: "record",
        attempts: [],
        records: [record],
        receiptId: landingReceipt,
        receivedAt: "2000-11-21T12:00:00.000Z",
      }),
    ),
  ).resolves.toEqual({
    status: 404,
    message: "This dashboard accepted no such reporting launch.",
  });
});

test("an expired attempt beyond retention records against its retained record", async () => {
  const { authority, repository, base, revision } = aVerifiedLandingWorktree();
  // Recording confirms the revision on the authorized remote target.
  const bare = join(dirname(repository), "origin.git");
  execFileSync("git", ["clone", "--bare", "--quiet", repository, bare]);
  execFileSync("git", ["branch", "-f", "main", revision], { cwd: bare });
  execFileSync("git", ["remote", "add", "origin", bare], { cwd: repository });
  const prepared = makeMe.aLaunchLanding
    .capturedFrom({
      repository: authority.repository,
      remote: "origin",
      target: authority.target,
    })
    .forLaunch(reportingReference)
    .comparing({ base, revision })
    .deliveredAs({ delivery: landingDelivery, receipt: landingReceipt })
    .receivedAt(receiptTime)
    .please();
  const settledAt = new Date(
    Date.parse(receiptTime) - (launchRetentionDays + 1) * 86_400_000,
  ).toISOString();
  const records = [
    aSettledRetainedRecord({
      authority,
      settledAt,
      preparations: [prepared],
    }),
  ];

  const decision = await decideLanding({
    report: aSubmission({ base, revision }),
    origin,
    operation: "record",
    attempts: [],
    records,
    receiptId: landingReceipt,
    receivedAt: receiptTime,
  });

  expect(decision.isNew).toBe(true);
  expect(decision.state).toBe("recorded");
  expect(decision.landing).toEqual(prepared);
  expect(decision.nextAttempts).toBeUndefined();
  expect(decision.changeRecords?.(records)[0]).toMatchObject({
    landing: prepared,
  });
});
