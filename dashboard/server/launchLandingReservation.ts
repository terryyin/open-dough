// One immutable comparison is prepared before publication and accepted afterward.
import type { LandingRepository, LaunchLanding } from "../src/launchLanding.ts";
import type { LandingSubmission } from "./launchLandingAdmission.ts";
import { verifyLanding, type HeldPin } from "./launchLandingGit.ts";
import { RefusedRequest } from "./localOrigin.ts";

export function sameComparison(
  landing: LaunchLanding,
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
      "This is not the established launch's authorized landing.",
    );
  return authority;
}

export type LandingReservation = { readonly landing: LaunchLanding } & (
  | { readonly isNew: false }
  | { readonly isNew: true; readonly pinWrites: readonly HeldPin[] }
);

// Resolves the comparison and verifies a new landing. Writes no store or ref.
export async function resolveLandingComparison(
  authority: LandingRepository,
  report: LandingSubmission,
  prepare: boolean,
  accepted: LaunchLanding | undefined,
  preparations: readonly LaunchLanding[] = [],
  receiptId: string,
  receivedAt: string,
): Promise<LandingReservation> {
  const prepared = preparations.find(
    (entry) => entry.delivery === report.delivery,
  );
  if (accepted !== undefined) {
    sameComparison(accepted, report);
    return {
      landing: prepare ? (prepared ?? accepted) : accepted,
      isNew: false,
    };
  }
  if (prepared !== undefined) {
    sameComparison(prepared, report);
    if (prepare) return { landing: prepared, isNew: false };
  }
  if (!prepare && prepared === undefined)
    throw new RefusedRequest(
      409,
      "This comparison was not retained for this launch before publication.",
    );
  const landing: LaunchLanding = prepared ?? {
    repository: authority.repository,
    ...(report.identity === undefined ? {} : { identity: report.identity }),
    remote: report.remote,
    target: report.target,
    reference: report.reference,
    delivery: report.delivery,
    base: report.base,
    revision: report.revision,
    receipt: receiptId,
    receivedAt,
  };
  const pinWrites = await verifyLanding(
    landing,
    prepare ? authority : undefined,
  );
  return { landing, isNew: true, pinWrites };
}
