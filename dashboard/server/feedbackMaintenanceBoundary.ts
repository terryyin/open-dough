import type { IncomingMessage } from "node:http";
import {
  feedbackMaintenanceChoiceSchema,
  feedbackMaintenanceEndpoint,
  feedbackMaintenanceRemoveEndpoint,
  feedbackMaintenanceSaveEndpoint,
  type FeedbackMaintenanceSetting,
} from "../src/feedbackMaintenanceSetting.ts";
import {
  FeedbackMaintenanceProblem,
  readFeedbackMaintenance,
  removeFeedbackMaintenance,
  saveFeedbackMaintenance,
} from "./feedbackMaintenance.ts";
import { RefusedRequest } from "./localOrigin.ts";
import { jsonBody } from "./jsonRequestBody.ts";
import { localJsonEndpoints } from "./localJsonEndpoints.ts";

async function answer(
  req: IncomingMessage,
  pathname: string,
  signal: AbortSignal,
): Promise<FeedbackMaintenanceSetting> {
  if (pathname === feedbackMaintenanceEndpoint) {
    if (req.method !== "GET")
      throw new RefusedRequest(405, "Only GET is accepted.");
    return readFeedbackMaintenance();
  }
  if (req.method !== "POST")
    throw new RefusedRequest(405, "Only POST is accepted.");
  const input = await jsonBody(req, signal);
  if (typeof input !== "object" || input === null || Array.isArray(input))
    throw new RefusedRequest(
      400,
      "The feedback maintenance request is malformed.",
    );
  signal.throwIfAborted();
  if (pathname === feedbackMaintenanceRemoveEndpoint) {
    if (Object.keys(input).length !== 0)
      throw new RefusedRequest(400, "The turn-off request is malformed.");
    removeFeedbackMaintenance();
    return { enabled: false };
  }
  const choice = feedbackMaintenanceChoiceSchema.safeParse(input);
  if (!choice.success)
    throw new RefusedRequest(
      400,
      "Choose a listed host and model. The previous setting was kept.",
    );
  saveFeedbackMaintenance(choice.data);
  return { enabled: true, choice: choice.data };
}

export const installFeedbackMaintenanceMiddleware = localJsonEndpoints(
  [
    feedbackMaintenanceEndpoint,
    feedbackMaintenanceSaveEndpoint,
    feedbackMaintenanceRemoveEndpoint,
  ],
  answer,
  (error) => ({
    status: 503,
    body: {
      error:
        error instanceof FeedbackMaintenanceProblem
          ? error.message
          : "The feedback maintenance setting could not be updated. Retry the operation.",
    },
  }),
);
