import type { IncomingMessage } from "node:http";
import {
  syntaxStylingEndpoint,
  syntaxStylingSaveEndpoint,
  type SyntaxStylingSetting,
} from "../src/syntaxStylingSetting.ts";
import { isSyntaxStylingId } from "../src/syntaxStylingChoices.ts";
import { RefusedRequest } from "./localOrigin.ts";
import { jsonBody } from "./jsonRequestBody.ts";
import { localJsonEndpoints } from "./localJsonEndpoints.ts";
import {
  readSyntaxStyling,
  saveSyntaxStyling,
  SyntaxStylingProblem,
} from "./syntaxStyling.ts";

async function answer(
  req: IncomingMessage,
  pathname: string,
  signal: AbortSignal,
): Promise<SyntaxStylingSetting> {
  if (pathname === syntaxStylingEndpoint) {
    if (req.method !== "GET")
      throw new RefusedRequest(405, "Only GET is accepted.");
    return { styling: readSyntaxStyling() };
  }
  if (req.method !== "POST")
    throw new RefusedRequest(405, "Only POST is accepted.");
  const input = await jsonBody(req, signal);
  if (
    typeof input !== "object" ||
    input === null ||
    Array.isArray(input) ||
    Object.keys(input).length !== 1 ||
    !("styling" in input)
  )
    throw new RefusedRequest(400, "The syntax styling request is malformed.");
  if (!isSyntaxStylingId(input.styling))
    throw new RefusedRequest(
      400,
      "Choose Off or Default for syntax styling. The previous setting was kept.",
    );
  signal.throwIfAborted();
  saveSyntaxStyling(input.styling);
  return { styling: input.styling };
}

export const installSyntaxStylingMiddleware = localJsonEndpoints(
  [syntaxStylingEndpoint, syntaxStylingSaveEndpoint],
  answer,
  (error) => ({
    status: 503,
    body: {
      error:
        error instanceof SyntaxStylingProblem
          ? error.message
          : "The syntax styling could not be updated. Retry the operation.",
    },
  }),
);
