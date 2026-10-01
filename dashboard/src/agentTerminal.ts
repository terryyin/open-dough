// The terminal boundary's contract, shared by the page and the local server
// (`../server/agentTerminals.ts`): one WebSocket per open terminal at
// `/__agent-terminal?source=<project id>&host=<host>&session=<session id>`,
// attached through the recorded session's host. An omitted host addresses
// predecessor Claude Code records. The server sends the session's terminal
// output as text frames and readiness controls as binary JSON frames.
// Rendered screen evidence observes completed native synchronized updates.
// The page sends only the messages below. The server
// closes the socket with `terminalEndedCode` when the attach process exits on
// its own, so the page can tell a terminal that ended from a lost connection.

import { z } from "zod";

export const agentTerminalEndpoint = "/__agent-terminal";

// A WebSocket close code in the range RFC 6455 leaves to applications.
export const terminalEndedCode = 4000;
// Native attachment failed before readiness; the existing done intent remains.
export const terminalAttachFailedCode = 1011;
export const terminalWorkspaceUnavailableCode = 4001;
export const terminalWorkspaceUnavailableSchema = z.strictObject({
  workspaceUnavailable: z.discriminatedUnion("kind", [
    z.strictObject({ kind: z.literal("missing") }),
    z.strictObject({ kind: z.literal("unknown") }),
  ]),
});
export type TerminalWorkspaceUnavailable = z.infer<
  typeof terminalWorkspaceUnavailableSchema
>["workspaceUnavailable"];

// Binary control frames never become native terminal output.
export const terminalReadinessSchema = z.strictObject({
  readiness: z.enum(["observe", "attached"]),
});

// A terminal's size in character cells, bounded well past any real window.
const cells = z.int().min(1).max(1_000);

export const terminalMessageSchema = z.union([
  z.strictObject({ input: z.string() }),
  z.strictObject({
    screen: z.array(z.string().max(1_000)).max(1_000),
    cursorVisible: z.boolean(),
  }),
  z.strictObject({ resize: z.strictObject({ cols: cells, rows: cells }) }),
]);

export type TerminalMessage = z.infer<typeof terminalMessageSchema>;
