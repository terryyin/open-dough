// Browser commands that answer a mounted case's terminal socket on the
// provider's page through the attached-terminal substitute, with an
// application that prints when the case says so. Each attachment belongs to
// one case: `detachTerminal` stops answering and drops its output handle.
// The Playwright provider's declarations, for the context's `page`.
import type {} from "@vitest/browser-playwright";
import type { BrowserCommandContext } from "vitest/node";
import { installAttachedTerminalSubstitute } from "./frontendTerminalSubstitute.ts";
import { directedApplication } from "./terminalSubstituteApplication.ts";

type CaseTerminal = {
  print(output: string): void;
  attaches(): number;
  detach(): void;
};

const terminals = new Map<string, CaseTerminal>();

function caseTerminal(context: BrowserCommandContext) {
  const terminal = terminals.get(context.sessionId);
  if (!terminal) throw new Error("This case attached no terminal.");
  return terminal;
}

async function attachTerminal(
  ...[context, opening]: [BrowserCommandContext, string]
) {
  if (terminals.has(context.sessionId))
    throw new Error("A terminal from an earlier case is still attached.");
  let active = true;
  const program = directedApplication(opening);
  const { attaches } = await installAttachedTerminalSubstitute(context.page, {
    application: program.application,
    active: () => active,
  });
  terminals.set(context.sessionId, {
    print: (output) => {
      program.print(output);
    },
    attaches,
    detach: () => {
      active = false;
    },
  });
}

function printToTerminal(
  ...[context, output]: [BrowserCommandContext, string]
) {
  caseTerminal(context).print(output);
}

function terminalAttaches(context: BrowserCommandContext) {
  return caseTerminal(context).attaches();
}

function detachTerminal(context: BrowserCommandContext) {
  terminals.get(context.sessionId)?.detach();
  terminals.delete(context.sessionId);
}

export const mountedTerminalCommands = {
  attachTerminal,
  printToTerminal,
  terminalAttaches,
  detachTerminal,
};

declare module "vitest/browser" {
  interface BrowserCommands {
    attachTerminal(opening: string): Promise<void>;
    printToTerminal(output: string): Promise<void>;
    terminalAttaches(): Promise<number>;
    detachTerminal(): Promise<void>;
  }
}
