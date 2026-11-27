import { randomUUID } from "node:crypto";
import { expect, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { settleAttempt } from "../../server/launchAttemptSettlement.ts";
import { keepAttempt } from "../../server/launchAttemptStore.ts";
import { launchHost } from "../../server/launchHosts.ts";
import { keptRecords } from "../../server/launchRecordStore.ts";
import { attemptRun } from "../../server/launchRun.ts";
import { OwnedAttempts } from "../../server/ownedAttempts.ts";
import { StartProgress } from "../../server/startProgress.ts";
import type { PublishedSource } from "../../src/publishedSource.ts";
import { admittedCompletion } from "../../test-support/support/admittedSessionCompletion.ts";
import type { StartOrigin } from "../../test-support/support/startOrigin.ts";
import { dashboardOrigin } from "./publisherDashboardOrigin.ts";

export async function admitCodexLaunch(
  source: PublishedSource,
  origin: StartOrigin,
  instruction: string,
) {
  const attempt = makeMe.anAcceptedAttempt
    .adHoc({ host: "codex", instruction })
    .withId(randomUUID())
    .acceptedAt(new Date().toISOString())
    .reportingTo(dashboardOrigin)
    .please();
  await keepAttempt(attempt);
  const owned = new OwnedAttempts();
  await settleAttempt(
    owned,
    owned.own(attempt.request, attempt),
    (own, notes) =>
      attemptRun(source, own, {
        progress: new StartProgress(),
        doneMarks: { reported: vi.fn() },
        native: launchHost,
        notes,
      }),
  );
  const record = (await keptRecords(source.id)).find(
    ({ request }) => request.reporting?.reference === attempt.id,
  );
  const admitted = admittedCompletion(record?.request, origin);
  expect((await origin.originGit("rev-parse", "main")).trim()).toBe(
    admitted.claim.publishedSha,
  );
  return admitted;
}
