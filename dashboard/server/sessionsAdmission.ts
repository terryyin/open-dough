// Sessions read admission: held revision and whether the ask must be answered
// by an observation begun after it arrived.
import type { IncomingMessage } from "node:http";
import {
  sessionsFreshHeader,
  sessionsRevisionHeader,
} from "../src/machineSessionsRevision.ts";

export type AdmittedSessions = {
  readonly kind: "sessions";
  // The revision of the sessions answer the viewer holds, if any.
  readonly held: string | undefined;
  // The read must be answered by an observation begun after it arrived.
  readonly fresh: boolean;
};

export function sessionsRequest(req: IncomingMessage): AdmittedSessions {
  const held = req.headers[sessionsRevisionHeader];
  const fresh = req.headers[sessionsFreshHeader];
  return {
    kind: "sessions",
    held: typeof held === "string" ? held : undefined,
    fresh: typeof fresh === "string",
  };
}
