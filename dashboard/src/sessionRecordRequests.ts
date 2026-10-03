// The browser's requests about one session this machine recorded, to the
// local launch boundary (`../server/agentLaunchPlugin.ts`): a POST that marks
// it done, one that marks its report read, and one that deletes its record.
// What each answers crossed a process/HTTP boundary, so it is checked as
// external input.

import type { LaunchRecord, LaunchWithState } from "./agentLaunch.ts";
import { postJson, refusal } from "./agentLaunchClient.ts";
import {
  agentDeleteEndpoint,
  deleteRecordAnswerSchema,
  type DeleteRecordAnswer,
} from "./deleteRecord.ts";
import { agentDoneEndpoint, markDoneAnswerSchema } from "./doneMark.ts";
import { agentReadEndpoint, markReadAnswerSchema } from "./readMark.ts";

// What names a recorded session to the boundary.
const sessionReference = (record: LaunchRecord) => ({
  source: record.request.source,
  session: record.session.sessionId,
  host: record.session.host,
});

// Marks the recorded session done, and answers its marked record with its
// session's state, or undefined when no trustworthy answer came.
export async function requestMarkDone(
  record: LaunchRecord,
): Promise<LaunchWithState | undefined> {
  try {
    const response = await postJson(
      agentDoneEndpoint,
      sessionReference(record),
    );
    if (!response.ok) return undefined;
    const answer = markDoneAnswerSchema.safeParse(await response.json());
    return answer.success ? answer.data.record : undefined;
  } catch {
    return undefined;
  }
}

// Marks the recorded session's report read, and answers its record with its
// session's state, or undefined when no trustworthy answer came.
export async function requestMarkRead(
  record: LaunchRecord,
): Promise<LaunchWithState | undefined> {
  try {
    const response = await postJson(
      agentReadEndpoint,
      sessionReference(record),
    );
    if (!response.ok) return undefined;
    const answer = markReadAnswerSchema.safeParse(await response.json());
    return answer.success ? answer.data.record : undefined;
  } catch {
    return undefined;
  }
}

// What asking the boundary to delete a record came to: what it did, or that
// it could not, with the reason it gave when it gave one.
export type DeleteRecordOutcome =
  | DeleteRecordAnswer
  | { readonly kind: "failed"; readonly reason: string | undefined };

const couldNotDelete = "The session record could not be deleted: ";

// Asks the boundary to delete the recorded session's record.
export async function requestDeleteRecord(
  record: LaunchRecord,
): Promise<DeleteRecordOutcome> {
  try {
    const response = await postJson(
      agentDeleteEndpoint,
      sessionReference(record),
    );
    const body: unknown = await response.json().catch(() => undefined);
    if (!response.ok) {
      const refused = refusal.safeParse(body);
      return {
        kind: "failed",
        reason: refused.success
          ? refused.data.error.replace(couldNotDelete, "")
          : undefined,
      };
    }
    const answer = deleteRecordAnswerSchema.safeParse(body);
    return answer.success ? answer.data : { kind: "failed", reason: undefined };
  } catch {
    return { kind: "failed", reason: undefined };
  }
}
