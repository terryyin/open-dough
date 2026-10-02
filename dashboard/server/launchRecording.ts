// Shared durable launch evidence, in the existing machine launch document.
import type { RecordedLaunchRequest } from "../src/launchRequest.ts";
import type {
  FirstInput,
  HostSession,
  LaunchRecord,
} from "../src/launchRecord.ts";
import {
  keepCreation,
  keepRecord,
  removeCreation,
  updateRecord,
} from "./launchRecordStore.ts";
import { launchRecord } from "./launchRecord.ts";

export type LaunchRecording = {
  session(session: HostSession, evidence: FirstInput): Promise<void>;
  creating(workspace: string, endpoint: string): Promise<void>;
  refused(): Promise<void>;
};
export function launchRecording(
  request: RecordedLaunchRequest,
  began: Date,
  facts: Pick<LaunchRecord, "start" | "preparation">,
  previous?: LaunchRecord,
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
      if (retained === undefined) await keepRecord(request.source, record);
      else if (!(await updateRecord(request.source, record)))
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
