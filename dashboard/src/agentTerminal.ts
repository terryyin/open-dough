// The terminal boundary's contract, shared by the page and the local server
// (`../server/agentTerminals.ts`): one WebSocket per open terminal at
// `/__agent-terminal?source=<project id>&session=<session id>`, attached to a
// session this dashboard launched. The server sends the session's terminal
// output as text frames; the page sends only the messages below.

import { z } from "zod";

export const agentTerminalEndpoint = "/__agent-terminal";

// A terminal's size in character cells, bounded well past any real window.
const cells = z.int().min(1).max(1_000);

export const terminalMessageSchema = z.union([
  z.strictObject({ input: z.string() }),
  z.strictObject({ resize: z.strictObject({ cols: cells, rows: cells }) }),
]);

export type TerminalMessage = z.infer<typeof terminalMessageSchema>;
