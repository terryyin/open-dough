// One immutable comparison is prepared before publication and accepted afterward.
import { randomUUID } from "node:crypto";
import type {
  LandingRepository,
  OneShotLanding,
} from "../src/oneShotLanding.ts";
import type { LandingSubmission } from "./oneShotLandingAdmission.ts";
import { verifyLanding, pinLanding } from "./oneShotLandingGit.ts";
import { RefusedRequest } from "./localOrigin.ts";

export function sameComparison(
  landing: OneShotLanding,
  report: LandingSubmission,
) {
  for (const key of [
    "delivery",
    "reference",
    "identity",
    "remote",
    "target",
    "base",
    "revision",
  ] as const)
    if (landing[key] !== report[key])
      throw new RefusedRequest(
        409,
        "This launch already retained a different landing comparison.",
      );
}

export function authorizedLanding(
  authority: LandingRepository | undefined,
  report: LandingSubmission,
): LandingRepository {
  if (
    authority === undefined ||
    authority.identity !== report.identity ||
    authority.remote !== report.remote ||
    authority.target !== report.target
  )
    throw new RefusedRequest(
      409,
      "This is not the established one-shot launch's authorized landing.",
    );
  return authority;
}

export async function reserveLandingComparison(
  authority: LandingRepository,
  report: LandingSubmission,
  prepare: boolean,
  accepted: OneShotLanding | undefined,
  preparations: readonly OneShotLanding[] = [],
): Promise<{ landing: OneShotLanding; needsSave: boolean }> {
  const prepared = preparations.find(
    (entry) => entry.delivery === report.delivery,
  );
  if (accepted !== undefined) {
    sameComparison(accepted, report);
    return {
      landing: prepare ? (prepared ?? accepted) : accepted,
      needsSave: false,
    };
  }
  if (prepared !== undefined) {
    sameComparison(prepared, report);
    if (prepare) return { landing: prepared, needsSave: false };
  }
  if (!prepare && prepared === undefined)
    throw new RefusedRequest(
      409,
      "This comparison was not retained for this launch before publication.",
    );
  const landing: OneShotLanding = prepared ?? {
    repository: authority.repository,
    identity: report.identity,
    remote: report.remote,
    target: report.target,
    reference: report.reference,
    delivery: report.delivery,
    base: report.base,
    revision: report.revision,
    receipt: randomUUID(),
    receivedAt: new Date().toISOString(),
  };
  await verifyLanding(landing, prepare ? authority : undefined);
  await pinLanding(landing); // Both ends survive before any metadata is saved.
  return { landing, needsSave: true };
}
