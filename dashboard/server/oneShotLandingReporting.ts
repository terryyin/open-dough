// One launch, write-ahead acceptance, then its record, under the shared lock order.
import type { IncomingMessage } from "node:http";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import {
  oneShotLandingSchema,
  landingReceiptSchema,
  type OneShotLanding,
  type LandingReceipt,
} from "../src/oneShotLanding.ts";
import { sessionHostSchema } from "../src/sessionReference.ts";
import { reportingAttempt } from "./completionAdmission.ts";
import { replaceAttempts, withKeptAttempts } from "./launchAttemptStore.ts";
import { keptRecords } from "./launchRecordStore.ts";
import { replaceRecords } from "./launchRecordDocument.ts";
import { verifyLanding, pinLanding } from "./oneShotLandingGit.ts";
import { RefusedRequest, verifyLocalOrigin } from "./localOrigin.ts";
import { jsonBody } from "./jsonRequestBody.ts";
import { knownSource } from "./sessionAdmission.ts";
export const landingEndpoint = "/__agent-launch/landing";
export const landingPrepareEndpoint = `${landingEndpoint}/prepare`;
const submissionSchema = oneShotLandingSchema
  .omit({ repository: true, receipt: true, receivedAt: true })
  .extend({
    source: z.string().min(1),
    host: sessionHostSchema,
  })
  .strict();
type LandingSubmission = z.infer<typeof submissionSchema>;
function sameComparison(landing: OneShotLanding, report: LandingSubmission) {
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
export async function submitLanding(
  req: IncomingMessage,
  prepare = false,
): Promise<LandingReceipt> {
  verifyLocalOrigin(req);
  if (req.method !== "POST")
    throw new RefusedRequest(405, "Only POST is accepted here.");
  const parsed = submissionSchema.safeParse(
    await jsonBody(req, undefined, 128 * 1024),
  );
  if (!parsed.success)
    throw new RefusedRequest(400, "The landing request is malformed.");
  const report = parsed.data;
  knownSource(report.source);
  const origin = `http://${req.headers.host}`;
  try {
    let saved: OneShotLanding | undefined;
    await replaceAttempts(async (kept) => {
      const attempt = reportingAttempt(
        Object.values(kept).flat(),
        report,
        origin,
      );
      const authority = attempt.landingRepository;
      if (
        authority === undefined ||
        attempt.request.workflow === "ad-hoc" ||
        attempt.request.identity !== report.identity ||
        authority.identity !== report.identity ||
        authority.remote !== report.remote ||
        authority.target !== report.target
      )
        throw new RefusedRequest(
          409,
          "This is not the established one-shot launch's authorized landing.",
        );
      const bound = (await keptRecords(report.source)).find(
        (record) => record.request.reporting?.reference === report.reference,
      );
      if (bound === undefined && attempt.outcome !== undefined)
        throw new RefusedRequest(
          409,
          "This launch has no retained reporting session.",
        );
      const prepared = attempt.landingPreparations?.find(
        (entry) => entry.delivery === report.delivery,
      );
      if (attempt.landing !== undefined) {
        sameComparison(attempt.landing, report);
        saved = prepare ? (prepared ?? attempt.landing) : attempt.landing;
        return kept;
      }
      if (prepared !== undefined) {
        sameComparison(prepared, report);
        if (prepare) {
          saved = prepared;
          return kept;
        }
      }
      const landing: OneShotLanding = {
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
      if (!prepare && prepared === undefined)
        throw new RefusedRequest(
          409,
          "This comparison was not retained for this launch before publication.",
        );
      await verifyLanding(landing, prepare ? authority : undefined);
      await pinLanding(landing); // Both ends survive before any accepted metadata is saved.
      saved = landing;
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
    if (prepare) return { ...receipt, state: "prepared" };
    const state = await withKeptAttempts(async (attempts) => {
      const attempt = reportingAttempt(attempts, report, origin);
      if (attempt.landing === undefined)
        throw new Error("Landing reservation is missing.");
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
          return { ...entry, landing };
        }),
      }));
      if (!binding.found && attempt.outcome !== undefined)
        throw new RefusedRequest(409, "The reporting session was deleted.");
      return binding.found
        ? ("recorded" as const)
        : ("pending-native-session" as const);
    });
    return { ...receipt, state };
  } catch (error) {
    if (error instanceof RefusedRequest) throw error;
    throw new RefusedRequest(
      500,
      "Landing capture was not acknowledged. Retry reporting only; accepted Git publication stays accepted.",
    );
  }
}
