import type { IncomingMessage } from "node:http";
import type { Plugin } from "vite";
import {
  terminalThemeEndpoint,
  terminalThemeSaveEndpoint,
  type TerminalThemeSetting,
} from "../src/terminalThemeSetting.ts";
import { isTerminalThemeId } from "../src/terminalThemes.ts";
import { RefusedRequest } from "./localOrigin.ts";
import { jsonBody } from "./jsonRequestBody.ts";
import { localJsonEndpointsPlugin } from "./localJsonEndpoints.ts";
import {
  readTerminalTheme,
  saveTerminalTheme,
  TerminalThemeProblem,
} from "./terminalTheme.ts";

async function answer(
  req: IncomingMessage,
  pathname: string,
  signal: AbortSignal,
): Promise<TerminalThemeSetting> {
  if (pathname === terminalThemeEndpoint) {
    if (req.method !== "GET")
      throw new RefusedRequest(405, "Only GET is accepted.");
    return { theme: readTerminalTheme() };
  }
  if (req.method !== "POST")
    throw new RefusedRequest(405, "Only POST is accepted.");
  const input = await jsonBody(req, signal);
  if (
    typeof input !== "object" ||
    input === null ||
    Array.isArray(input) ||
    Object.keys(input).length !== 1 ||
    !("theme" in input)
  )
    throw new RefusedRequest(400, "The terminal theme request is malformed.");
  if (!isTerminalThemeId(input.theme))
    throw new RefusedRequest(
      400,
      "Choose one of the listed terminal themes. The previous theme was kept.",
    );
  signal.throwIfAborted();
  saveTerminalTheme(input.theme);
  return { theme: input.theme };
}

export function terminalThemePlugin(): Plugin {
  return localJsonEndpointsPlugin(
    "dough-terminal-theme",
    [terminalThemeEndpoint, terminalThemeSaveEndpoint],
    answer,
    (error) => ({
      status: 503,
      body: {
        error:
          error instanceof TerminalThemeProblem
            ? error.message
            : "The terminal theme could not be updated. Retry the operation.",
      },
    }),
  );
}
