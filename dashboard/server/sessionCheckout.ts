import { realpathSync } from "node:fs";
import path from "node:path";
import type { LaunchRecord } from "../src/agentLaunch.ts";

// The Execution checkout a session started in: a default launch's kept
// start, or the start of a session established in the execution checkout.
export function recordedExecutionCheckoutStart(
  record: Pick<LaunchRecord, "defaultStart" | "establishedSession">,
): { readonly workspace: string } | undefined {
  if (record.defaultStart !== undefined) return record.defaultStart;
  return record.establishedSession?.role === "default-checkout"
    ? record.establishedSession
    : undefined;
}

// The checkout a folder path names, resolved. Throws when it is gone.
export const resolvedCheckout = (workspace: string) =>
  realpathSync(path.resolve(workspace));
