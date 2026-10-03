import type { IncomingMessage } from "node:http";
import type { Plugin } from "vite";
import {
  projectAddEndpoint,
  projectListEndpoint,
  projectSettingsEndpoint,
  projectRemoveEndpoint,
} from "../src/projectConfiguration.ts";
import { ProjectInputProblem } from "../src/projectInput.ts";
import { RefusedRequest } from "./localOrigin.ts";
import { localJsonEndpointsPlugin } from "./localJsonEndpoints.ts";
import {
  configuredProject,
  projectSettings,
  publishedProjects,
  removeConfiguredProject,
} from "./projectConfiguration.ts";
import { addProject } from "./projectAddition.ts";
import { jsonBody } from "./jsonRequestBody.ts";

async function answer(
  req: IncomingMessage,
  pathname: string,
  signal: AbortSignal,
) {
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
  if (pathname === projectRemoveEndpoint) {
    if (
      typeof input !== "object" ||
      input === null ||
      !("id" in input) ||
      typeof input.id !== "string"
    )
      throw new RefusedRequest(400, "The project request is malformed.");
    if (configuredProject(input.id) === undefined)
      throw new RefusedRequest(404, "The project is not configured.");
    signal.throwIfAborted();
    removeConfiguredProject(input.id);
    return { projects: publishedProjects() };
  }
  if (
    typeof input !== "object" ||
    input === null ||
    !("githubUrl" in input) ||
    !("localPath" in input) ||
    typeof input.githubUrl !== "string" ||
    typeof input.localPath !== "string"
  )
    throw new RefusedRequest(400, "The project request is malformed.");
  return addProject(
    { githubUrl: input.githubUrl, localPath: input.localPath },
    signal,
  );
}

export function projectConfigurationPlugin(): Plugin {
  return localJsonEndpointsPlugin(
    "dough-project-configuration",
    [
      projectListEndpoint,
      projectSettingsEndpoint,
      projectAddEndpoint,
      projectRemoveEndpoint,
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
}
