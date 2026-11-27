// Admitted ad hoc Codex Starts, each through production `attemptRun`, land
// from one shared checkout through the installed delivery run in process
// (../support/installedPublisher.ts), then close through the installed
// wrap-up children. Each keeps its own accepted comparison, and a claim whose
// accepted evidence is lost is held.
import { randomUUID } from "node:crypto";
import { existsSync, unlinkSync } from "node:fs";
import path from "node:path";
import { afterEach, beforeAll, beforeEach, expect, test, vi } from "vitest";
import { sessionRecordPathBeside } from "../../../Distribution/src/skills/dough-execute-plan/scripts/session-record.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { queuedReadyRepository } from "../../../Distribution/tests/support/queued-repository.mjs";
import { settleAttempt } from "../../server/launchAttemptSettlement.ts";
import { keepAttempt } from "../../server/launchAttemptStore.ts";
import { launchHost } from "../../server/launchHosts.ts";
import { keptRecords } from "../../server/launchRecordStore.ts";
import { attemptRun } from "../../server/launchRun.ts";
import { OwnedAttempts } from "../../server/ownedAttempts.ts";
import { mountProjectConfiguration } from "../../server/projectConfiguration.ts";
import { StartProgress } from "../../server/startProgress.ts";
import {
  admittedCompletion,
  finishAdmittedClaim,
  landNativeWork,
  type AdmittedCompletion,
} from "../../test-support/support/admittedSessionCompletion.ts";
import { countedGit } from "../../test-support/support/completionRecovery.ts";
import {
  installFakeCodex,
  type FakeCodex,
} from "../../test-support/support/fakeCodex.ts";
import {
  startOrigin,
  type StartOrigin,
} from "../../test-support/support/startOrigin.ts";
import { keepStartedOrigin } from "../../test-support/support/startOriginPreparation.ts";
import { trunkCommitFromAnotherWriter } from "../../test-support/support/storyBranchIntegration.ts";
import { git } from "../../test-support/support/storyReviewWorktree.ts";
import {
  deliverInstalled,
  retryInstalledLanding,
} from "../support/installedPublisher.ts";
import { dashboardOrigin } from "../support/publisherDashboardOrigin.ts";

const source = makeMe.aPublishedSource.openDough.please();
const repository = queuedReadyRepository().please();

let origin: StartOrigin;
let native: FakeCodex;
let unmount: () => void;

beforeAll(async () => {
  const prepared = await startOrigin(repository, { host: "codex" });
  try {
    keepStartedOrigin("codex", repository, prepared);
  } finally {
    prepared.cleanup();
  }
});

beforeEach(async () => {
  origin = await startOrigin(repository, { host: "codex" });
  native = await installFakeCodex(
    origin.machine,
    process.env["PATH"] ?? "",
    true,
  );
  for (const [key, value] of Object.entries(native.env)) vi.stubEnv(key, value);
  vi.stubEnv("HOME", path.join(origin.machine, "home"));
  unmount = mountProjectConfiguration("production");
});

afterEach(async () => {
  native.release();
  await native.close();
  unmount();
  vi.unstubAllEnvs();
  origin.cleanup();
});

// Admits an ad hoc Codex Start for `title` and reads its admitted claim.
async function admit(title: string): Promise<AdmittedCompletion> {
  const attempt = makeMe.anAcceptedAttempt
    .adHoc({ host: "codex", instruction: title })
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

async function publishedSession(admitted: AdmittedCompletion) {
  const record = sessionRecordPathBeside(
    ".planning/PRODUCT-BACKLOG.md",
    admitted.reporting.reference,
  );
  return JSON.parse(
    await admitted.origin.originGit("show", `main:${record}`),
  ) as unknown;
}

test("each admitted launch keeps its accepted comparison when another launch lands from the same checkout", async () => {
  const earlier = await admit("Verify earlier work");
  const earlierFile = "earlier-native.txt";
  const earlierLanded = await landNativeWork(
    earlier,
    earlierFile,
    deliverInstalled,
  );
  const receipt = (await keptRecords(source.id)).find(
    ({ request }) =>
      request.reporting?.reference === earlier.reporting.reference,
  )?.landing;
  if (!receipt) throw new Error("The earlier landing has no receipt.");
  expect(receipt).toMatchObject({
    base: earlier.claim.publishedSha,
    revision: earlierLanded,
  });

  native.threadId = "later-native-session";
  const later = await admit("Verify later work");
  expect(later.reporting.reference).not.toBe(earlier.reporting.reference);
  const laterFile = "later-native.txt";
  const laterLanded = await landNativeWork(later, laterFile, deliverInstalled);
  const advanced = trunkCommitFromAnotherWriter(origin, "other-writer.txt");

  const earlierFinal = await finishAdmittedClaim(earlier, advanced);
  expect(existsSync(earlier.claim.workspace)).toBe(false);
  expect(existsSync(later.claim.workspace)).toBe(true);
  expect(await publishedSession(earlier)).toMatchObject({
    sessionId: earlier.reporting.reference,
    story: earlier.identity,
    ranges: [
      { base: earlier.claim.publishedSha, candidate: earlierLanded },
      { base: advanced, candidate: earlierFinal },
    ],
  });
  const beforeLaterClosure = (
    await origin.originGit("rev-parse", "main")
  ).trim();
  const laterFinal = await finishAdmittedClaim(later, beforeLaterClosure);
  expect(existsSync(later.claim.workspace)).toBe(false);
  expect(await publishedSession(later)).toMatchObject({
    sessionId: later.reporting.reference,
    story: later.identity,
    ranges: [
      { base: later.claim.publishedSha, candidate: laterLanded },
      { base: beforeLaterClosure, candidate: laterFinal },
    ],
  });
  for (const [file, candidate] of [
    [earlierFile, earlierLanded],
    [laterFile, laterLanded],
  ] as const) {
    expect(
      (await origin.originGit("rev-list", "main", "--", file)).trim(),
    ).toBe(candidate);
  }

  const tip = await origin.originGit("rev-parse", "main");
  const counted = await countedGit(origin.machine);
  vi.stubEnv("PATH", counted.env.PATH);
  expect(await retryInstalledLanding(earlier.landingContext)).toMatchObject({
    reference: earlier.reporting.reference,
    base: earlier.claim.publishedSha,
    revision: earlierLanded,
    receipt: receipt.receipt,
  });
  expect(existsSync(counted.log)).toBe(false);
  expect(await origin.originGit("rev-parse", "main")).toBe(tip);
  // Two admissions, landings and closures each run real Git children.
}, 30_000);

test("ordinary wrap-up holds the claim when its accepted evidence is lost", async () => {
  const admitted = await admit("Verify retained evidence");
  const landed = await landNativeWork(
    admitted,
    "native-with-lost-evidence.txt",
    deliverInstalled,
  );
  for (const localEvidence of [
    "open-dough/session-record",
    `open-dough/accepted-launches/${admitted.reporting.reference}.json`,
  ]) {
    unlinkSync(
      git(
        origin.project,
        "rev-parse",
        "--path-format=absolute",
        "--git-path",
        localEvidence,
      ),
    );
  }

  await expect(finishAdmittedClaim(admitted, landed)).rejects.toThrow(
    "The native landing has no matching accepted session range.",
  );
  expect(existsSync(admitted.claim.workspace)).toBe(true);
  expect((await origin.originGit("rev-parse", "main")).trim()).toBe(landed);
  // An admission, a landing and a closure each run real Git children.
}, 20_000);
