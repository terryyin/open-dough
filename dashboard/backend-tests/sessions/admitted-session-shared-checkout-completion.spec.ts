import { existsSync, readFileSync, unlinkSync } from "node:fs";
import path from "node:path";
import { sessionRecordPathBeside } from "../../../Distribution/src/skills/dough-execute-plan/scripts/session-record.mjs";
import {
  admitForCompletion,
  finishAdmittedClaim,
  landNativeWork,
  type AdmittedCompletion,
} from "../../test-support/support/admittedSessionCompletion.ts";
import { expect, stored, test } from "../../test-support/support/codexStart.ts";
import {
  countedGit,
  quote,
  reportingChild,
} from "../../test-support/support/completionRecovery.ts";
import { trunkCommitFromAnotherWriter } from "../../test-support/support/storyBranchIntegration.ts";
import { git } from "../../test-support/support/storyReviewWorktree.ts";

async function publishedSession(admitted: AdmittedCompletion) {
  const record = sessionRecordPathBeside(
    ".planning/PRODUCT-BACKLOG.md",
    admitted.reporting.reference,
  );
  return JSON.parse(
    await admitted.origin.originGit("show", `main:${record}`),
  ) as unknown;
}

test("each admitted launch keeps its accepted comparison when another launch lands from the same checkout", async ({
  dashboard,
  origin,
  codexProtocol,
}) => {
  const earlier = await admitForCompletion(
    dashboard,
    origin,
    "Verify earlier work",
  );
  const earlierFile = "earlier-native.txt";
  const earlierLanded = await landNativeWork(earlier, earlierFile);
  const receipt = stored(dashboard.home).find(
    ({ request }) =>
      request.reporting?.reference === earlier.reporting.reference,
  )?.landing;
  if (!receipt)
    throw new Error("The earlier landing has no Dashboard receipt.");
  expect(receipt).toMatchObject({
    base: earlier.claim.publishedSha,
    revision: earlierLanded,
  });

  const native = codexProtocol;
  if (!native) throw new Error("Codex protocol fixture is unavailable.");
  native.threadId = "later-native-session";
  const later = await admitForCompletion(
    dashboard,
    origin,
    "Verify later work",
  );
  expect(later.reporting.reference).not.toBe(earlier.reporting.reference);
  const laterFile = "later-native.txt";
  const laterLanded = await landNativeWork(later, laterFile);
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

  const { pending } = JSON.parse(
    readFileSync(
      path.join(path.dirname(earlier.landingContext), "landing-current.json"),
      "utf8",
    ),
  ) as { pending: string };
  const counted = await countedGit(origin.machine);
  const tip = await origin.originGit("rev-parse", "main");
  const retry = await reportingChild(
    `${earlier.reporting.command} --operation landing --retry ${quote(pending)}`,
    origin.machine,
    counted.env,
  );
  expect(retry.ok, retry.stderr).toBe(true);
  expect(JSON.parse(retry.stdout)).toMatchObject({
    reference: earlier.reporting.reference,
    base: earlier.claim.publishedSha,
    revision: earlierLanded,
    receipt: receipt.receipt,
  });
  expect(existsSync(counted.log)).toBe(false);
  expect(await origin.originGit("rev-parse", "main")).toBe(tip);
});

test("ordinary wrap-up holds the claim when its accepted evidence is lost", async ({
  dashboard,
  origin,
}) => {
  const admitted = await admitForCompletion(
    dashboard,
    origin,
    "Verify retained evidence",
  );
  const landed = await landNativeWork(
    admitted,
    "native-with-lost-evidence.txt",
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
});
