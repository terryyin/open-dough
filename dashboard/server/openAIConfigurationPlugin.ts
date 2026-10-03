import type { IncomingMessage } from "node:http";
import type { Plugin } from "vite";
import {
  openAIConfigurationEndpoint,
  openAIRemoveEndpoint,
  openAISaveEndpoint,
} from "../src/openAIConfiguration.ts";
import { RefusedRequest } from "./localOrigin.ts";
import { jsonBody } from "./jsonRequestBody.ts";
import { localJsonEndpointsPlugin } from "./localJsonEndpoints.ts";
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
  return localJsonEndpointsPlugin(
    "dough-openai-configuration",
    [openAIConfigurationEndpoint, openAISaveEndpoint, openAIRemoveEndpoint],
    answer,
    (error) => ({
      status: 503,
      body: {
        error:
          error instanceof OpenAICredentialProblem
            ? error.message
            : "OpenAI configuration could not be updated. Retry the operation.",
      },
    }),
  );
}
