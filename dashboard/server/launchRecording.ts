// Shared durable launch evidence, in the existing machine launch document.
import type { RecordedLaunchRequest } from "../src/launchRequest.ts";
import type {
  FirstInput,
  HostSession,
  LaunchRecord,
} from "../src/launchRecord.ts";
import { sessionKey } from "../src/sessionReference.ts";
import {
  keepCreation,
  keepRecord,
  removeCreation,
  replaceKeptSession,
  updateRecord,
} from "./launchRecordStore.ts";
import { launchRecord, type EstablishedRecordFacts } from "./launchRecord.ts";
import type { NativeDoneMarks } from "./doneMarks.ts";

export type LaunchRecording = {
  session(session: HostSession, evidence: FirstInput): Promise<void>;
  creating(workspace: string, endpoint: string): Promise<void>;
  refused(): Promise<void>;
};
export function launchRecording(
  request: RecordedLaunchRequest,
  began: Date,
  facts: EstablishedRecordFacts,
  previous: LaunchRecord | undefined,
  doneMarks: NativeDoneMarks,
) {
  let retained = previous;
  return {
    get retained() {
      return retained;
    },
    async session(session: HostSession, firstInput: FirstInput) {
      const record: LaunchRecord = {
        ...launchRecord(
          request,
          session,
          facts,
          retained?.launchedAt ?? began.toISOString(),
        ),
        firstInput,
      };
      if (retained === undefined) {
        await keepRecord(request.source, record, doneMarks);
        retained = record;
        return;
      }
      if (sessionKey(retained.session) !== sessionKey(session)) {
        const replaced = await replaceKeptSession(
          request.source,
          retained.session,
          record,
        );
        if (replaced === undefined)
          throw new Error("The launch record was deleted.");
        retained = replaced;
        return;
      }
      if (!(await updateRecord(request.source, record)))
        throw new Error("The launch record was deleted.");
      retained = record;
    },
    async creating(workspace: string, endpoint: string) {
      await keepCreation({
        request,
        creation: { workspace, endpoint },
        launchedAt: began.toISOString(),
      });
    },
    async refused() {
      await removeCreation(request);
    },
  } satisfies LaunchRecording & { readonly retained: LaunchRecord | undefined };
}
