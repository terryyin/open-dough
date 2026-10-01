// Native operation availability is supplied by the local boundary, never inferred
// from a host name. The browser receives facts only, not native implementations.
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
  z.object({ attach: z.boolean(), stop: z.boolean() }),
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
  return operations[host]?.stop === true;
}
export function shellCommand(args: readonly string[]): string {
  return args.map((part) => `'${part.replaceAll("'", "'\\''")}'`).join(" ");
}
