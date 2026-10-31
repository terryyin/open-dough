// JSON responses from the local launch boundary, including refused requests.
import type { ServerResponse } from "node:http";
import type {
  Acceptance,
  ChangedAnswer,
  LaunchWithState,
  ReconciledAnswer,
  VerifiedAnswer,
} from "../src/agentLaunch.ts";
import type { DeleteRecordAnswer } from "../src/deleteRecord.ts";
import type { RunningCursorSessions } from "../src/cursorRunnerSessions.ts";
import type { RecoverSessionAnswer } from "../src/sessionRecovery.ts";
import type { FinalReportRead } from "../src/finalReportContract.ts";
import type {
  MarkReviewedAnswer,
  ReviewedFileDiff,
  ReviewedFileText,
  StoryReview,
  ReviewRange,
} from "../src/storyReviewContract.ts";
import type { LaunchHostOptions } from "../src/launchHostOptions.ts";

import type { submitCompletion } from "./completionReporting.ts";

import type { LandingReceipt } from "../src/launchLanding.ts";

export type AgentLaunchAnswer =
  | { readonly status: number; readonly body: { readonly drained: true } }
  | { readonly status: number; readonly body: LandingReceipt }
  | {
      readonly status: number;
      readonly body: Awaited<ReturnType<typeof submitCompletion>>;
    }
  | { readonly status: number; readonly body: LaunchHostOptions }
  | { readonly status: number; readonly body: FinalReportRead }
  | { readonly status: number; readonly body: StoryReview }
  | { readonly status: number; readonly body: ReviewRange }
  | { readonly status: number; readonly body: ReviewedFileDiff }
  | { readonly status: number; readonly body: ReviewedFileText }
  | { readonly status: number; readonly body: MarkReviewedAnswer }
  | { readonly status: number; readonly body: RunningCursorSessions }
  | { readonly status: number; readonly body: Acceptance }
  | { readonly status: number; readonly body: ChangedAnswer }
  | { readonly status: number; readonly body: ReconciledAnswer }
  | { readonly status: number; readonly body: VerifiedAnswer }
  // An answer serialized once and shared (`./machineSessionObservation.ts`).
  | { readonly status: number; readonly serialized: string }
  | { readonly status: number; readonly body: { record: LaunchWithState } }
  | { readonly status: number; readonly body: DeleteRecordAnswer }
  | { readonly status: number; readonly body: RecoverSessionAnswer }
  | { readonly status: number; readonly body: { error: string } };

export function respondToLaunch(
  res: ServerResponse,
  answer: AgentLaunchAnswer,
): void {
  if (res.writableEnded || res.destroyed) {
    return;
  }
  res.writeHead(answer.status, {
    "Cache-Control": "no-store",
    "Content-Type": "application/json",
  });
  res.end(
    "serialized" in answer ? answer.serialized : JSON.stringify(answer.body),
  );
}
