// One launch, write-ahead acceptance, then its record, under the shared lock order.
import type { IncomingMessage } from "node:http";
import {
  landingReceiptSchema,
  type LaunchLanding,
  type LandingReceipt,
} from "../src/launchLanding.ts";
import {
  landingSubmissionSchema,
  expiredAttemptRecord,
} from "./launchLandingAdmission.ts";
import {
  authorizedLanding,
  reserveLandingComparison,
  sameComparison,
} from "./launchLandingReservation.ts";
import { submitRetainedLanding } from "./launchLandingRetained.ts";
import { boundLandingReporting } from "./launchLandingRecord.ts";
import { reportingAttempt } from "./completionAdmission.ts";
import { replaceAttempts, withKeptAttempts } from "./launchAttemptStore.ts";
import { keptRecords } from "./launchRecordStore.ts";
import { replaceRecords } from "./launchRecordDocument.ts";
import { RefusedRequest, verifyLocalOrigin } from "./localOrigin.ts";
import { jsonBody } from "./jsonRequestBody.ts";
import { knownSource } from "./sessionAdmission.ts";
export const landingEndpoint = "/__agent-launch/landing";
export const landingPrepareEndpoint = `${landingEndpoint}/prepare`;
export async function submitLanding(
  req: IncomingMessage,
  prepare = false,
): Promise<LandingReceipt> {
  verifyLocalOrigin(req);
  if (req.method !== "POST")
    throw new RefusedRequest(405, "Only POST is accepted here.");
  const parsed = landingSubmissionSchema.safeParse(
    await jsonBody(req, undefined, 128 * 1024),
  );
  if (!parsed.success)
    throw new RefusedRequest(400, "The landing request is malformed.");
  const report = parsed.data;
  knownSource(report.source);
  const origin = `http://${req.headers.host}`;
  try {
    const retained = await withKeptAttempts(async (attempts) => {
      const record = await expiredAttemptRecord(attempts, report, origin);
      return record === undefined
        ? undefined
        : submitRetainedLanding(record, report, prepare);
    });
    if (retained !== undefined) return retained;
    let saved: LaunchLanding | undefined;
    await replaceAttempts(async (kept) => {
      const attempt = reportingAttempt(
        Object.values(kept).flat(),
        report,
        origin,
      );
      const authority = authorizedLanding(attempt.landingRepository, report);
      if (
        attempt.request.workflow === "ad-hoc" ||
        attempt.request.identity !== report.identity
      )
        throw new RefusedRequest(
          409,
          "This is not the established one-shot launch's authorized landing.",
        );
      const bound = (await keptRecords(report.source)).find(
        (record) => record.request.reporting?.reference === report.reference,
      );
      if (bound?.landingReporting?.deletedAt !== undefined)
        throw new RefusedRequest(409, "The reporting session was deleted.");
      if (bound === undefined && attempt.outcome !== undefined)
        throw new RefusedRequest(
          409,
          "This launch has no retained reporting session.",
        );
      const { landing, needsSave } = await reserveLandingComparison(
        authority,
        report,
        prepare,
        attempt.landing,
        attempt.landingPreparations,
      );
      saved = landing;
      if (!needsSave) return kept;
      return {
        ...kept,
        [report.source]: (kept[report.source] ?? []).map((entry) =>
          entry.id === report.reference
            ? prepare
              ? {
                  ...entry,
                  landingPreparations: [
                    ...(entry.landingPreparations ?? []),
                    landing,
                  ],
                }
              : { ...entry, landing }
            : entry,
        ),
      };
    });
    if (saved === undefined) throw new Error("No stored landing receipt.");
    const landing = saved;
    const receipt = landingReceiptSchema.omit({ state: true }).parse(landing);
    const state = await withKeptAttempts(async (attempts) => {
      const attempt = reportingAttempt(attempts, report, origin);
      if (!prepare && attempt.landing === undefined)
        throw new Error("Landing reservation is missing.");
      if (attempt.landing !== undefined)
        sameComparison(attempt.landing, report);
      const binding = { found: false };
      await replaceRecords((kept) => ({
        ...kept,
        [report.source]: (kept[report.source] ?? []).map((entry) => {
          if (
            !("session" in entry) ||
            entry.request.reporting?.reference !== report.reference
          )
            return entry;
          binding.found = true;
          const reporting = boundLandingReporting(attempt, entry);
          return {
            ...entry,
            ...(prepare ? {} : { landing }),
            landingReporting:
              reporting === undefined
                ? undefined
                : {
                    ...reporting,
                    preparations:
                      attempt.landingPreparations ?? reporting.preparations,
                  },
          };
        }),
      }));
      if (!binding.found && attempt.outcome !== undefined)
        throw new RefusedRequest(409, "The reporting session was deleted.");
      return binding.found
        ? ("recorded" as const)
        : ("pending-native-session" as const);
    });
    return { ...receipt, state: prepare ? "prepared" : state };
  } catch (error) {
    if (error instanceof RefusedRequest) throw error;
    throw new RefusedRequest(
      500,
      "Landing capture was not acknowledged. Retry reporting only; accepted Git publication stays accepted.",
    );
  }
}
