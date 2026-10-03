import type { IncomingMessage } from "node:http";
import type { Plugin } from "vite";
import {
  openAIConfigurationEndpoint,
  openAIRemoveEndpoint,
  openAISaveEndpoint,
} from "../src/openAIConfiguration.ts";
import { localBoundaryPlugin } from "./localBoundaryPlugin.ts";
import { RefusedRequest, verifyLocalOrigin } from "./localOrigin.ts";
import { jsonBody } from "./jsonRequestBody.ts";
import { readTimeoutMs } from "./ghRead.ts";
import { withResponseSignal } from "./responseSignal.ts";
import {
  OpenAICredentialProblem,
  readOpenAIAPIKey,
  removeOpenAIAPIKey,
  saveOpenAIAPIKey,
} from "./openAICredential.ts";

async function answer(
  req: IncomingMessage,
  pathname: string,
  signal: AbortSignal,
) {
  verifyLocalOrigin(req);
  if (pathname === openAIConfigurationEndpoint) {
    if (req.method !== "GET")
      throw new RefusedRequest(405, "Only GET is accepted.");
    return { configured: readOpenAIAPIKey() !== undefined };
  }
  if (req.method !== "POST")
    throw new RefusedRequest(405, "Only POST is accepted.");
  const input = await jsonBody(req, signal);
  if (typeof input !== "object" || input === null || Array.isArray(input))
    throw new RefusedRequest(
      400,
      "The OpenAI configuration request is malformed.",
    );
  signal.throwIfAborted();
  if (pathname === openAIRemoveEndpoint) {
    if (Object.keys(input).length !== 0)
      throw new RefusedRequest(400, "The removal request is malformed.");
    removeOpenAIAPIKey();
    return { configured: false };
  }
  if (
    Object.keys(input).length !== 1 ||
    !("apiKey" in input) ||
    typeof input.apiKey !== "string"
  )
    throw new RefusedRequest(400, "The API key request is malformed.");
  const apiKey = input.apiKey.trim();
  if (!apiKey)
    throw new RefusedRequest(
      400,
      "Enter an API key before saving. The previous key was kept.",
    );
  if (/[\r\n]/.test(apiKey))
    throw new RefusedRequest(400, "Enter an API key on a single line.");
  saveOpenAIAPIKey(apiKey);
  return { configured: true };
}

export function openAIConfigurationPlugin(): Plugin {
  return localBoundaryPlugin("dough-openai-configuration", (middlewares) => {
    const pending = new Set<AbortController>();
    middlewares.use((req, res, next) => {
      const pathname = new URL(req.url ?? "", "http://placeholder").pathname;
      if (
        ![
          openAIConfigurationEndpoint,
          openAISaveEndpoint,
          openAIRemoveEndpoint,
        ].includes(pathname)
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
          answer(req, pathname, AbortSignal.any([signal, controller.signal])),
        readTimeoutMs(),
      )
        .then(
          (body) => {
            respond(200, body);
          },
          (error: unknown) => {
            respond(error instanceof RefusedRequest ? error.status : 503, {
              error:
                error instanceof RefusedRequest ||
                error instanceof OpenAICredentialProblem
                  ? error.message
                  : "OpenAI configuration could not be updated. Retry the operation.",
            });
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
