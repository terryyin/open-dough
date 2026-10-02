// Codex history inspection derives only from the saved native creation facts.
import type { CreationRecord } from "../../../src/launchCreation.ts";

export function codexCreationEvidence(record?: CreationRecord) {
  return {
    unreadableAdvice: "Reconcile it with native Codex history.",
    ...(record === undefined
      ? {}
      : {
          inspectionArgs: [
            "codex",
            "resume",
            "--remote",
            record.creation.endpoint,
            "--cd",
            record.creation.workspace,
            "--include-non-interactive",
          ],
        }),
  };
}
