// Native operation availability is supplied by the local boundary, never inferred
// from a host name. The browser receives facts only, not native implementations.
import type { LaunchRecord } from "./launchRecord.ts";
import { z } from "zod";
import {
  sessionHostSchema,
  type SessionReference,
} from "./sessionReference.ts";
import { hostDescription } from "./hostDescription.ts";
export { launchHosts } from "./hostDescription.ts";
export function hostName(host: SessionReference["host"]): string {
  return hostDescription(host).name;
}
export const hostOperationsSchema = z.partialRecord(
  sessionHostSchema,
  z.object({
    attach: z.boolean(),
    stop: z.boolean(),
    doneStop: z.boolean(),
    localDone: z.boolean(),
    launchedSessions: z.boolean(),
  }),
);
export type HostOperations = z.infer<typeof hostOperationsSchema>;

export function embeddedTerminal(
  operations: HostOperations,
  host: SessionReference["host"],
): boolean {
  return operations[host]?.attach === true;
}
export function marksDone(
  operations: HostOperations,
  host: SessionReference["host"],
): boolean {
  return operations[host]?.doneStop === true;
}
// Whether the entry offers a Stop separate from Mark as done: the host
// boundary supplies a stop operation, and its Mark as done does not
// already stop the session (`doneStop`). Where Mark as done already
// stops, a separate Stop would duplicate it, so none is offered.
export function offersSeparateStop(
  operations: HostOperations,
  host: SessionReference["host"],
): boolean {
  return operations[host]?.stop === true && !marksDone(operations, host);
}
// Whether Mark as done is only a local dashboard acknowledgement for this
// host: no native stop, rename, or removal follows the mark.
export function marksLocalDone(
  operations: HostOperations,
  host: SessionReference["host"],
): boolean {
  return operations[host]?.localDone === true;
}
// A reported session is marked done locally where its host has no native stop.
export function marksRecordDone(
  operations: HostOperations,
  record: LaunchRecord,
): boolean {
  return (
    record.completion !== undefined ||
    marksDone(operations, record.session.host) ||
    marksLocalDone(operations, record.session.host)
  );
}
export function shellCommand(args: readonly string[]): string {
  return args.map((part) => `'${part.replaceAll("'", "'\\''")}'`).join(" ");
}
