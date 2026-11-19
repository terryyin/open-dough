// Terminal WebSocket substitute for frontend-only journeys: reports attached
// and runs a substitute application in place of a real agent terminal.

import type { Page } from "@playwright/test";
import { agentTerminalEndpoint } from "../../src/agentTerminal.ts";
import {
  echoingApplication,
  type TerminalApplication,
} from "./terminalSubstituteApplication.ts";

type TerminalSize = { readonly cols: number; readonly rows: number };

// Terminal WebSocket that reports attached and runs a substitute application:
// `application`, or one that prints an attached line and echoes input as text.
// `sent` is the input the page sent; `sizes` the terminal sizes it reported.
// `attaches` counts the page's terminal connections.
// With `opens`, the page's socket stays connecting until that settles.
// With `active`, only sockets opened while it holds are answered.
export async function installAttachedTerminalSubstitute(
  page: Page,
  options: {
    readonly application?: TerminalApplication;
    readonly opens?: Promise<void>;
    readonly active?: () => boolean;
  } = {},
): Promise<{
  readonly sent: string[];
  readonly sizes: TerminalSize[];
  readonly attaches: () => number;
}> {
  let connections = 0;
  const sent: string[] = [];
  const sizes: TerminalSize[] = [];
  const application =
    options.application ??
    echoingApplication("attached abcdef12\r\nClaude Code\r\n");
  const { active } = options;
  const endpoint = `**${agentTerminalEndpoint}**`;
  const answered = active
    ? (url: URL) => url.href.includes(agentTerminalEndpoint) && active()
    : endpoint;
  await page.routeWebSocket(answered, async (ws) => {
    connections += 1;
    ws.onMessage((message) => {
      if (typeof message !== "string") return;
      const parsed = JSON.parse(message) as {
        input?: unknown;
        resize?: TerminalSize;
      };
      if (parsed.resize !== undefined) sizes.push(parsed.resize);
      if (typeof parsed.input === "string") {
        sent.push(parsed.input);
        const answer = application.answer(parsed.input);
        if (answer !== "") ws.send(answer);
      }
    });
    // Playwright opens a routed page socket once its handler returns or it
    // first sends to the page.
    await options.opens;
    // Binary readiness frame, then text output the page renders.
    ws.send(Buffer.from(JSON.stringify({ readiness: "attached" }), "utf8"));
    ws.send(application.opening);
    application.attached?.({
      print: (output) => {
        ws.send(output);
      },
      close: (code) => void ws.close({ code }),
    });
  });
  return { sent, sizes, attaches: () => connections };
}
