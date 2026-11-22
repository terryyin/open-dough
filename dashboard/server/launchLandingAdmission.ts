// Landing request admission: route, method, origin, host and body text to an
// operation and submission, or a refusal. Shared by the HTTP adapter and the
// installed publisher's fetch bridge.
import { z } from "zod";
import { launchLandingSchema } from "../src/launchLanding.ts";
import { sessionHostSchema } from "../src/sessionReference.ts";
import { RefusedRequest, verifySameOrigin } from "./localOrigin.ts";

export const landingEndpoint = "/__agent-launch/landing";
export const landingPrepareEndpoint = `${landingEndpoint}/prepare`;
export type LandingOperation = "prepare" | "record";

const landingOperations = new Map<string, LandingOperation>([
  [landingPrepareEndpoint, "prepare"],
  [landingEndpoint, "record"],
]);

export const landingSubmissionSchema = launchLandingSchema
  .omit({ repository: true, receipt: true, receivedAt: true })
  .extend({ source: z.string().min(1), host: sessionHostSchema })
  .strict();
export type LandingSubmission = z.infer<typeof landingSubmissionSchema>;

export type AdmittedLandingRequest = {
  readonly operation: LandingOperation;
  readonly submission: LandingSubmission;
};

export type LandingRequestAdmission = {
  readonly route: string;
  readonly method: string | undefined;
  readonly origin: string | null | undefined;
  readonly host: string | undefined;
  readonly fetchSite?: string | null;
  readonly bodyText: string;
};

// Admits a landing request from its wire values: the prepare or record route,
// POST, local origin metadata, and a body matching the submission.
export function admitLandingRequest(
  request: LandingRequestAdmission,
): AdmittedLandingRequest {
  const operation = landingRequestOperation(request.route, request.method);
  verifySameOrigin(request.origin, request.host, request.fetchSite);
  return { operation, submission: parseLandingSubmission(request.bodyText) };
}

export function landingRequestOperation(
  route: string,
  method: string | undefined,
): LandingOperation {
  const operation = landingOperations.get(route);
  if (operation === undefined)
    throw new RefusedRequest(404, "This is not a landing route.");
  if (method !== "POST")
    throw new RefusedRequest(405, "Only POST is accepted here.");
  return operation;
}

export function parseLandingSubmission(bodyText: string): LandingSubmission {
  let parsed: unknown;
  try {
    parsed = JSON.parse(bodyText);
  } catch {
    throw new RefusedRequest(400, "The landing request is malformed.");
  }
  const submission = landingSubmissionSchema.safeParse(parsed);
  if (!submission.success)
    throw new RefusedRequest(400, "The landing request is malformed.");
  return submission.data;
}
