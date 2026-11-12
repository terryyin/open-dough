import { ciFollowUpEndpoint } from "../src/ciFollowUp.ts";
import { answerCiFollowUp } from "./ciFollowUpBoundary.ts";
import { storyReviewStateEndpoint } from "../src/storyReviewState.ts";
import { answerStoryReviewStates } from "./storyReviewStates.ts";
import type { IncomingMessage } from "node:http";
import {
  projectAddEndpoint,
  projectListEndpoint,
  projectSettingsEndpoint,
  projectRemoveEndpoint,
  projectVisibilityEndpoint,
} from "../src/projectConfiguration.ts";
import { ProjectInputProblem } from "../src/projectInput.ts";
import { RefusedRequest } from "./localOrigin.ts";
import { localJsonEndpoints } from "./localJsonEndpoints.ts";
import {
  configuredProject,
  projectSettings,
  publishedProjects,
  removeConfiguredProject,
  setConfiguredProjectHidden,
} from "./projectConfiguration.ts";
import { addProject } from "./projectAddition.ts";
import { jsonBody } from "./jsonRequestBody.ts";

function configuredIdFrom(input: Record<string, unknown>): string {
  if (typeof input["id"] !== "string")
    throw new RefusedRequest(400, "The project request is malformed.");
  if (configuredProject(input["id"]) === undefined)
    throw new RefusedRequest(404, "The project is not configured.");
  return input["id"];
}

async function answer(
  req: IncomingMessage,
  pathname: string,
  signal: AbortSignal,
) {
  if (pathname === ciFollowUpEndpoint) return answerCiFollowUp(req, signal);
  if (pathname === storyReviewStateEndpoint)
    return answerStoryReviewStates(req, signal);
  if (
    pathname === projectListEndpoint ||
    pathname === projectSettingsEndpoint
  ) {
    if (req.method !== "GET")
      throw new RefusedRequest(405, "Only GET is accepted.");
    return pathname === projectSettingsEndpoint
      ? projectSettings()
      : publishedProjects();
  }
  if (req.method !== "POST")
    throw new RefusedRequest(405, "Only POST is accepted.");
  const input = await jsonBody(req, signal);
  if (typeof input !== "object" || input === null)
    throw new RefusedRequest(400, "The project request is malformed.");
  const body = input as Record<string, unknown>;
  if (pathname === projectRemoveEndpoint) {
    const id = configuredIdFrom(body);
    signal.throwIfAborted();
    removeConfiguredProject(id);
    return { projects: publishedProjects() };
  }
  if (pathname === projectVisibilityEndpoint) {
    if (typeof body["hidden"] !== "boolean")
      throw new RefusedRequest(400, "The project request is malformed.");
    const id = configuredIdFrom(body);
    signal.throwIfAborted();
    setConfiguredProjectHidden(id, body["hidden"]);
    return { projects: publishedProjects() };
  }
  if (
    typeof body["githubUrl"] !== "string" ||
    typeof body["localPath"] !== "string"
  )
    throw new RefusedRequest(400, "The project request is malformed.");
  return addProject(
    { githubUrl: body["githubUrl"], localPath: body["localPath"] },
    signal,
  );
}

export const installProjectConfigurationMiddleware = localJsonEndpoints(
  [
    projectListEndpoint,
    ciFollowUpEndpoint,
    storyReviewStateEndpoint,
    projectSettingsEndpoint,
    projectAddEndpoint,
    projectRemoveEndpoint,
    projectVisibilityEndpoint,
  ],
  answer,
  (error) =>
    error instanceof ProjectInputProblem
      ? { status: 400, body: { error: error.message, field: error.field } }
      : {
          status: 503,
          body: {
            error: error instanceof Error ? error.message : String(error),
          },
        },
);
