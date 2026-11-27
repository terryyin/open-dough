// Admitted ad hoc Codex Starts, each through production `attemptRun`, land
// from one shared checkout through the installed delivery run in process
// (../support/installedPublisher.ts), then close through the installed
// wrap-up children. Each keeps its own accepted comparison, and a claim whose
// accepted evidence is lost is held.
import { existsSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import path from "node:path";
import { afterEach, beforeAll, beforeEach, expect, test, vi } from "vitest";
import { readSessionEvidence } from "../../../Distribution/src/skills/dough-execute-plan/scripts/execution-session-evidence.mjs";
import {
  sessionRecordPathBeside,
  sharedCheckoutUncertainty,
} from "../../../Distribution/src/skills/dough-execute-plan/scripts/session-record.mjs";
import { sharedCheckoutNotePathBeside } from "../../../Distribution/src/skills/dough-execute-plan/scripts/shared-checkout-note.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { queuedReadyRepository } from "../../../Distribution/tests/support/queued-repository.mjs";
import { keptRecords } from "../../server/launchRecordStore.ts";
import { mountProjectConfiguration } from "../../server/projectConfiguration.ts";
import {
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
import { admitCodexLaunch } from "../support/admittedCodexLaunch.ts";
import {
  deliverInstalled,
  retryInstalledLanding,
} from "../support/installedPublisher.ts";

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

async function publishedSession(admitted: AdmittedCompletion) {
  const record = sessionRecordPathBeside(
    ".planning/PRODUCT-BACKLOG.md",
    admitted.reporting.reference,
  );
  return JSON.parse(
    await admitted.origin.originGit("show", `main:${record}`),
  ) as { ranges: unknown[] };
}

test("each admitted launch keeps its accepted comparison when another launch lands from the same checkout", async () => {
  const earlier = await admitCodexLaunch(source, origin, "Verify earlier work");
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
  const later = await admitCodexLaunch(source, origin, "Verify later work");
  expect(later.reporting.reference).not.toBe(earlier.reporting.reference);
  expect(existsSync(sharedCheckoutNotePathBeside(earlier.landingContext))).toBe(
    true,
  );
  const laterFile = "later-native.txt";
  const laterLanded = await landNativeWork(later, laterFile, deliverInstalled);
  expect(readSessionEvidence(origin.project)).toMatchObject({
    sessionId: later.reporting.reference,
    ranges: [{ base: later.claim.publishedSha, candidate: laterLanded }],
  });
  expect(
    existsSync(
      git(
        origin.project,
        "rev-parse",
        "--path-format=absolute",
        "--git-path",
        "open-dough/accepted-launches",
      ),
    ),
  ).toBe(false);
  const advanced = trunkCommitFromAnotherWriter(origin, "other-writer.txt");

  const earlierFinal = await finishAdmittedClaim(earlier, advanced);
  expect(existsSync(earlier.claim.workspace)).toBe(false);
  expect(existsSync(later.claim.workspace)).toBe(true);
  const earlierRecord = await publishedSession(earlier);
  expect(earlierRecord).toMatchObject({
    sessionId: earlier.reporting.reference,
    story: earlier.identity,
    ranges: [
      { base: earlier.claim.publishedSha, candidate: earlierLanded },
      { base: advanced, candidate: earlierFinal },
    ],
  });
  expect(earlierRecord.ranges[0]).not.toHaveProperty("uncertainty");
  const beforeLaterClosure = (
    await origin.originGit("rev-parse", "main")
  ).trim();
  const laterFinal = await finishAdmittedClaim(later, beforeLaterClosure);
  expect(existsSync(later.claim.workspace)).toBe(false);
  expect(await publishedSession(later)).toMatchObject({
    sessionId: later.reporting.reference,
    story: later.identity,
    ranges: [
      {
        base: later.claim.publishedSha,
        candidate: laterLanded,
        uncertainty: sharedCheckoutUncertainty,
      },
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

async function landClaimWithRetainedComparison() {
  const admitted = await admitCodexLaunch(
    source,
    origin,
    "Verify retained evidence",
  );
  const landed = await landNativeWork(
    admitted,
    "native-with-lost-evidence.txt",
    deliverInstalled,
  );
  const pointer = path.join(
    path.dirname(admitted.landingContext),
    "landing-current.json",
  );
  const { pending } = JSON.parse(readFileSync(pointer, "utf8")) as {
    pending: string;
  };
  return { admitted, landed, pending };
}

async function expectClaimHeld(admitted: AdmittedCompletion, landed: string) {
  await expect(finishAdmittedClaim(admitted, landed)).rejects.toThrow(
    "The native landing has no matching accepted session range.",
  );
  expect(existsSync(admitted.claim.workspace)).toBe(true);
  expect((await origin.originGit("rev-parse", "main")).trim()).toBe(landed);
}

test("ordinary wrap-up holds the claim when the retained landing is missing", async () => {
  const { admitted, landed, pending } = await landClaimWithRetainedComparison();
  unlinkSync(pending);
  await expectClaimHeld(admitted, landed);
  // An admission, a landing and a closure each run real Git children.
}, 20_000);

test("ordinary wrap-up holds the claim when the retained landing is mismatched", async () => {
  const { admitted, landed, pending } = await landClaimWithRetainedComparison();
  const report = JSON.parse(readFileSync(pending, "utf8")) as Record<
    string,
    unknown
  >;
  const beforeClaim = git(
    origin.project,
    "rev-parse",
    `${admitted.claim.publishedSha}^`,
  );
  writeFileSync(pending, JSON.stringify({ ...report, base: beforeClaim }));
  await expectClaimHeld(admitted, landed);
  // An admission, a landing and a closure each run real Git children.
}, 20_000);
