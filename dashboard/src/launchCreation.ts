// A native creation attempt without a trustworthy session ID. It remains
// launch evidence, never a fabricated session or a published story fact.
import { z } from "zod";
import { recordedLaunchRequestSchema } from "./launchRequest.ts";
import { shellCommand } from "./sessionCapabilities.ts";
export const creationSchema = z.object({
  request: recordedLaunchRequestSchema,
  creation: z.object({ workspace: z.string(), endpoint: z.string() }),
  launchedAt: z.iso.datetime(),
});
export type CreationRecord = z.infer<typeof creationSchema>;

// Returned native recovery is a view of saved evidence, never stored evidence.
export const creationViewSchema = creationSchema.extend({
  recovery: z.object({
    hostName: z.string(),
    inspectionArgs: z.array(z.string()).min(1).optional(),
  }),
});
export type CreationView = z.infer<typeof creationViewSchema>;

export function creationCommand(record: CreationView): string | undefined {
  const args = record.recovery.inspectionArgs;
  return args === undefined ? undefined : shellCommand(args);
}
export function creationRecovery(record: CreationView): string {
  const command = creationCommand(record);
  const inspection =
    command === undefined
      ? `Native history inspection is unavailable for ${record.recovery.hostName}. Reconcile`
      : `Inspect native history with \`${command}\` and reconcile`;
  return `${record.recovery.hostName} conversation creation is unresolved for ${record.request.title}. Workspace: ${record.creation.workspace}. ${inspection} this machine's launch evidence before starting again; no new conversation was created.`;
}
