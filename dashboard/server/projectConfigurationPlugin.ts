import type { IncomingMessage } from "node:http";
import type { Plugin } from "vite";
import {
  projectAddEndpoint,
  projectListEndpoint,
  projectSettingsEndpoint,
  projectRemoveEndpoint,
} from "../src/projectConfiguration.ts";
import { ProjectInputProblem } from "../src/projectInput.ts";
import { localBoundaryPlugin } from "./localBoundaryPlugin.ts";
import { RefusedRequest, verifyLocalOrigin } from "./localOrigin.ts";
import {
  configuredProject,
  projectSettings,
  publishedProjects,
  removeConfiguredProject,
} from "./projectConfiguration.ts";
import { addProject } from "./projectAddition.ts";
import { jsonBody } from "./jsonRequestBody.ts";
import { withResponseSignal } from "./responseSignal.ts";
import { readTimeoutMs } from "./ghRead.ts";

async function answer(
  req: IncomingMessage,
  pathname: string,
  signal: AbortSignal,
) {
  verifyLocalOrigin(req);
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
  return localBoundaryPlugin("dough-project-configuration", (middlewares) => {
    const pending = new Set<AbortController>();
    middlewares.use((req, res, next) => {
      const url = new URL(req.url ?? "", "http://placeholder");
      if (
        url.pathname !== projectListEndpoint &&
        url.pathname !== projectSettingsEndpoint &&
        url.pathname !== projectAddEndpoint &&
        url.pathname !== projectRemoveEndpoint
      ) {
        next();
        return;
      }
      const controller = new AbortController();
      pending.add(controller);
      const respond = (status: number, body: unknown) => {
        if (res.destroyed || res.writableEnded) return;
        res.writeHead(status, {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        });
        res.end(JSON.stringify(body));
      };
      void withResponseSignal(
        res,
        (signal) =>
          answer(
            req,
            url.pathname,
            AbortSignal.any([signal, controller.signal]),
          ),
        readTimeoutMs(),
      )
        .then(
          (body) => {
            respond(200, body);
          },
          (error: unknown) => {
            respond(
              error instanceof RefusedRequest
                ? error.status
                : error instanceof ProjectInputProblem
                  ? 400
                  : 503,
              {
                error: error instanceof Error ? error.message : String(error),
                ...(error instanceof ProjectInputProblem
                  ? { field: error.field }
                  : {}),
              },
            );
          },
        )
        .finally(() => {
          pending.delete(controller);
        });
    });
    return () => {
      for (const controller of pending) controller.abort();
      pending.clear();
    };
  });
}
