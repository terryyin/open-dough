import { sessionRecordPathBeside } from "../../Distribution/src/skills/dough-execute-plan/scripts/session-record.mjs";
import {
  publishedSessionRecordSchema,
  type PublishedSessionRecord,
} from "../src/publishedSessionRecord.ts";

// The local review and pinned listing both accept a record only at its UUID's path.
export function publishedRecordFromText(
  backlogPath: string,
  path: string,
  text: string,
): PublishedSessionRecord | undefined {
  let parsed: ReturnType<typeof publishedSessionRecordSchema.safeParse>;
  try {
    parsed = publishedSessionRecordSchema.safeParse(JSON.parse(text));
  } catch {
    return undefined;
  }
  return parsed.success &&
    sessionRecordPathBeside(backlogPath, parsed.data.sessionId) === path
    ? parsed.data
    : undefined;
}
