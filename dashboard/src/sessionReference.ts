// A native conversation's identity is its host and opaque ID. The same ID
// reported by two hosts denotes two sessions; native commands keep the actual ID.
import { z } from "zod";
import { agentHosts } from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";

export const sessionHostSchema = z.enum(agentHosts);
export type SessionReference = {
  readonly host: z.infer<typeof sessionHostSchema>;
  readonly sessionId: string;
};

export function sessionKey(session: SessionReference): string {
  return `${session.host}:${session.sessionId}`;
}
