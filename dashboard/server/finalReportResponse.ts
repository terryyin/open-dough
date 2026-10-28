// Reads a session's native final report through its admitted host reader.
import type { ServerResponse } from "node:http";
import type { AgentLaunchAnswer } from "./agentLaunchResponse.ts";
import { trackedExecutionClosureReadable } from "./completionClosure.ts";
import type { AdmittedFinalReport } from "./finalReportAdmission.ts";
import { withResponseSignal } from "./responseSignal.ts";

export async function finalReportResponse(
  { record, read }: AdmittedFinalReport,
  res: ServerResponse,
): Promise<AgentLaunchAnswer> {
  return withResponseSignal(res, async (signal) => {
    const report = await read(record.session, signal);
    // Reuse tracked-execution closure-gate facts; never infer from directory.
    if (!(await trackedExecutionClosureReadable(record)))
      return { status: 200, body: report };
    return {
      status: 200,
      body: { ...report, productClosureEvidence: true as const },
    };
  });
}
