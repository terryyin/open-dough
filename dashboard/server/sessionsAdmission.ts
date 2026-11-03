// Sessions read admission: which audience asks, the held revision, and
// whether the ask must be answered by an observation begun after it arrived.
import type { IncomingMessage } from "node:http";
import {
  sessionsAudienceParameter,
  sessionsFreshHeader,
  sessionsHistoryAudience,
  sessionsRevisionHeader,
} from "../src/machineSessionsRevision.ts";
import { RefusedRequest } from "./localOrigin.ts";

// The regular answer's viewers, or the retained history's.
type SessionsAudience = "overview" | "history";

export type AdmittedSessions = {
  readonly kind: "sessions";
  readonly audience: SessionsAudience;
  // The revision of the asked answer the viewer holds, if any.
  readonly held: string | undefined;
  // The read must be answered by an observation begun after it arrived.
  readonly fresh: boolean;
};

function audienceOf(url: URL): SessionsAudience {
  const asked = url.searchParams.getAll(sessionsAudienceParameter);
  if (asked.length === 0) return "overview";
  if (asked.length === 1 && asked[0] === sessionsHistoryAudience)
    return "history";
  throw new RefusedRequest(400, "The sessions request is malformed.");
}

export function sessionsRequest(
  req: IncomingMessage,
  url: URL,
): AdmittedSessions {
  const held = req.headers[sessionsRevisionHeader];
  const fresh = req.headers[sessionsFreshHeader];
  return {
    kind: "sessions",
    audience: audienceOf(url),
    held: typeof held === "string" ? held : undefined,
    fresh: typeof fresh === "string",
  };
}
