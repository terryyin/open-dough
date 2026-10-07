// Parses Claude Code's own session listing (`./runtime.ts` runs it): `--all`
// includes sessions whose process has exited, `status` (busy, idle, or
// waiting) is present only while a session's process runs, and `waitingFor`
// says, when Claude Code reports it, what a blocked session waits for. A
// `waitingFor` that is not text is left out rather than refusing the whole
// listing, and so is an entry without a short id or state, such as an
// interactive session running in a terminal. Where a session started (`cwd`)
// and when (`startedAt`, epoch milliseconds) are kept only when listed so, for
// verifying an uncertain launch (`./verification.ts`).

import { z } from "zod";
import type { ClaudeSession, SessionState } from "../../../src/agentLaunch.ts";

const listedSession = z.looseObject({
  id: z.string().min(1),
  sessionId: z.string().min(1),
  name: z.string().optional(),
  state: z.string(),
  status: z.string().nullish(),
  waitingFor: z.string().nullish().catch(undefined),
  cwd: z.string().optional().catch(undefined),
  startedAt: z.number().optional().catch(undefined),
});

// Private Claude listing evidence also confirms launch identities and renames;
// a rename waits on `status`, kept only while the session's process runs.
// Shared callers receive only normalized observations for their saved targets.
export type ListedSession = {
  readonly session: ClaudeSession;
  readonly sessionState: Extract<SessionState, { kind: "available" }>;
  readonly status?: string;
  readonly cwd?: string;
  readonly startedAt?: number;
};

function activityOf(
  state: string,
): Extract<SessionState, { kind: "available" }>["activity"] {
  switch (state) {
    case "working":
      return "working";
    case "blocked":
      return "waiting";
    case "done":
      return "review";
    case "failed":
      return "failed";
    case "stopped":
      return "interrupted";
    default:
      return "unknown";
  }
}

export function parsedListing(
  stdout: string,
): readonly ListedSession[] | undefined {
  let listed: unknown;
  try {
    listed = JSON.parse(stdout);
  } catch {
    return undefined;
  }
  if (!Array.isArray(listed)) return undefined;
  return listed.flatMap((listedEntry) => {
    const parsed = listedSession.safeParse(listedEntry);
    if (!parsed.success) return [];
    const entry = parsed.data;
    const status = entry.status ?? undefined;
    return [
      {
        ...(status === undefined ? {} : { status }),
        ...(entry.cwd === undefined ? {} : { cwd: entry.cwd }),
        ...(entry.startedAt === undefined
          ? {}
          : { startedAt: entry.startedAt }),
        session: {
          host: "claude",
          sessionId: entry.sessionId,
          shortId: entry.id,
          name: entry.name ?? "",
        },
        sessionState: {
          kind: "available",
          availability: status === undefined ? "retained" : "loaded",
          activity: activityOf(entry.state),
          ...(activityOf(entry.state) === "unknown"
            ? {
                description: `Claude Code lists it as ${entry.state}`,
                unknownReason: "unrecognized",
              }
            : {}),
          ...(entry.waitingFor === undefined ||
          entry.waitingFor === null ||
          entry.waitingFor === ""
            ? {}
            : { waitingFor: entry.waitingFor }),
        },
      },
    ];
  });
}
