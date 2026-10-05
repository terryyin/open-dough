// A session's report for pure readings of one record: a fresh receipt and
// reference, `completed` with no message unless the case says otherwise.

import { randomUUID } from "node:crypto";
import type { CompletionReport } from "../../src/completionReport.ts";

export const completionReport = (
  fields: Partial<Pick<CompletionReport, "outcome" | "message">> = {},
): CompletionReport => ({
  receipt: randomUUID(),
  reference: randomUUID(),
  outcome: "completed",
  message: "",
  receivedAt: "2026-10-01T10:00:00.000Z",
  ...fields,
});
