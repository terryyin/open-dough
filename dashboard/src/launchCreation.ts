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
export function creationCommand(record: CreationRecord): string {
  return shellCommand([
    "codex",
    "resume",
    "--remote",
    record.creation.endpoint,
    "--cd",
    record.creation.workspace,
    "--include-non-interactive",
  ]);
}
export function creationRecovery(record: CreationRecord): string {
  return `Codex conversation creation is unresolved for ${record.request.title}. Workspace: ${record.creation.workspace}. Inspect native history with \`${creationCommand(record)}\` and reconcile this machine's launch evidence before starting again; no new conversation was created.`;
}
