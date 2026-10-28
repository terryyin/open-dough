// The browser's requests about one session this machine recorded, to the
// local launch boundary (`../server/launchBoundary.ts`): a POST that marks
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
import { sessionKey } from "./sessionReference.ts";
import {
  agentRecoverEndpoint,
  recoverSessionAnswerSchema,
  type RecoverSessionAnswer,
} from "./sessionRecovery.ts";
import {
  agentStopEndpoint,
  stopSessionAnswerSchema,
  type StopSessionAnswer,
} from "./sessionStop.ts";

// What names a recorded session to the boundary.
const sessionReference = (record: LaunchRecord) => ({
  source: record.request.source,
  session: record.session.sessionId,
  host: record.session.host,
});

// How long the page waits for one Done answer before leaving an explicit
// recoverable unresolved state. The POST itself is not aborted, so a late
// answer can still settle that one native operation; recovery joins the same
// in-flight request instead of posting again.
export const markDoneWaitMs = 45_000;

// What marking a recorded session done came to: the marked record, a refused
// or unreadable answer after the boundary responded, or an unresolved wait
// (bound passed or the request never completed) that must not be said as a
// failed persisted done intent.
export type MarkDoneResult =
  | { readonly kind: "marked"; readonly record: LaunchWithState }
  | { readonly kind: "refused" }
  | { readonly kind: "unresolved" };

// What the page's Mark as done answers after the request: marked, refused, or
// left unresolved. Distinct from `MarkDoneResult`, which may carry the record.
export type MarkDoneOutcome = MarkDoneResult["kind"];

const pendingMarkDone = new Map<string, Promise<MarkDoneResult>>();
const settledMarkDone = new Map<
  string,
  Extract<MarkDoneResult, { kind: "marked" }>
>();

async function postMarkDone(record: LaunchRecord): Promise<MarkDoneResult> {
  try {
    const response = await postJson(
      agentDoneEndpoint,
      sessionReference(record),
    );
    if (!response.ok) return { kind: "refused" };
    const answer = markDoneAnswerSchema.safeParse(await response.json());
    return answer.success
      ? { kind: "marked", record: answer.data.record }
      : { kind: "refused" };
  } catch {
    // An unreachable or otherwise unfinished request never completed; do not
    // claim the persisted done intent failed.
    return { kind: "unresolved" };
  }
}

async function withinMarkDoneWait(
  pending: Promise<MarkDoneResult>,
): Promise<MarkDoneResult> {
  let waiting: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      pending,
      new Promise<MarkDoneResult>((resolve) => {
        waiting = setTimeout(() => {
          resolve({ kind: "unresolved" });
        }, markDoneWaitMs);
      }),
    ]);
  } finally {
    if (waiting !== undefined) clearTimeout(waiting);
  }
}

// Marks the recorded session done, and answers its marked record, a refusal,
// or unresolved when no trustworthy answer came within the wait. One session
// keeps at most one in-flight Done POST; a late marked answer is remembered
// so recovery applies it without posting again.
export async function requestMarkDone(
  record: LaunchRecord,
): Promise<MarkDoneResult> {
  const key = sessionKey(record.session);
  const remembered = settledMarkDone.get(key);
  if (remembered !== undefined) {
    settledMarkDone.delete(key);
    return remembered;
  }
  let pending = pendingMarkDone.get(key);
  if (pending === undefined) {
    pending = postMarkDone(record).then((result) => {
      pendingMarkDone.delete(key);
      if (result.kind === "marked") settledMarkDone.set(key, result);
      return result;
    });
    pendingMarkDone.set(key, pending);
  }
  const result = await withinMarkDoneWait(pending);
  if (result.kind === "marked") settledMarkDone.delete(key);
  return result;
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

// Asks the boundary to stop the recorded session through its host,
// separate from Mark as done.
export async function requestStopSession(
  record: LaunchRecord,
): Promise<StopSessionAnswer | undefined> {
  try {
    const response = await postJson(
      agentStopEndpoint,
      sessionReference(record),
    );
    if (!response.ok) return undefined;
    const answer = stopSessionAnswerSchema.safeParse(await response.json());
    return answer.success ? answer.data : undefined;
  } catch {
    return undefined;
  }
}

// Asks the boundary to recover an unfinished Cursor session the runner does
// not hold.
export async function requestRecoverSession(
  record: LaunchRecord,
): Promise<RecoverSessionAnswer | undefined> {
  try {
    const response = await postJson(
      agentRecoverEndpoint,
      sessionReference(record),
    );
    if (!response.ok) {
      const refused = refusal.safeParse(
        await response.json().catch(() => undefined),
      );
      return refused.success
        ? { kind: "failed", explanation: refused.data.error }
        : undefined;
    }
    const answer = recoverSessionAnswerSchema.safeParse(await response.json());
    return answer.success ? answer.data : undefined;
  } catch {
    return undefined;
  }
}
