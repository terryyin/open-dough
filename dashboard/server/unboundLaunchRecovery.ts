// Historical native evidence may settle its own interrupted attempt locally.
import {
  recordedWorkspace,
  storyOf,
  type AttemptObservation,
  type LaunchAttemptRecord,
  type LaunchRecord,
} from "../src/agentLaunch.ts";
import { sameLaunch } from "../src/launchRequest.ts";
import { sessionKey } from "../src/sessionReference.ts";
import { configuredProject } from "./projectConfiguration.ts";
import { executionCheckout } from "./executionCheckout.ts";
import { claudeSessionInWorkspace } from "./hosts/claude/verification.ts";
import { keptRecordsByProject } from "./launchRecordStore.ts";

function couldRecoverUnboundLaunch(attempt: LaunchAttemptRecord): boolean {
  return (
    attempt.request.workflow === "ad-hoc" &&
    attempt.request.host === "claude" &&
    attempt.request.followUp === undefined &&
    attempt.publication.kind === "none" &&
    attempt.reportingDeletedAt === undefined &&
    attempt.completion?.outcome !== "completed"
  );
}

export function retainedUnboundLaunches(
  attempt: LaunchAttemptRecord,
  records: readonly LaunchRecord[],
): readonly LaunchRecord[] {
  return records.filter(
    (record) =>
      record.request.reporting?.reference === attempt.id &&
      storyOf(record.request) === undefined,
  );
}

// Whether recovery may be offered reflects kept evidence only. The native
// identity and original workspace are checked anew on every Continue.
export function availableUnboundRecovery(
  attempt: LaunchAttemptRecord,
  records: readonly LaunchRecord[],
): LaunchRecord | undefined {
  if (!couldRecoverUnboundLaunch(attempt)) return undefined;
  const retained = retainedUnboundLaunches(attempt, records);
  const record = retained.length === 1 ? retained[0] : undefined;
  if (
    record === undefined ||
    record.session.host !== "claude" ||
    record.doneAt !== undefined ||
    !sameLaunch(attempt.request, record.request) ||
    Date.parse(record.launchedAt) < Date.parse(attempt.acceptedAt) ||
    (attempt.outcome?.kind === "launched" &&
      sessionKey(attempt.outcome.session) !== sessionKey(record.session))
  )
    return undefined;
  return record;
}

type AttemptRead = {
  readonly attempts: readonly AttemptObservation[];
  readonly readable: boolean;
};

export async function withUnboundRecovery(
  read: AttemptRead,
): Promise<AttemptRead> {
  if (!read.attempts.some(couldRecoverUnboundLaunch)) return read;
  const records = await keptRecordsByProject();
  const attempts = read.attempts.map((attempt): AttemptObservation =>
    availableUnboundRecovery(attempt, records.get(attempt.request.source) ?? [])
      ? { ...attempt, unboundRecovery: true }
      : attempt,
  );
  return { ...read, attempts };
}

export async function verifiesUnboundLaunch(
  attempt: LaunchAttemptRecord,
  record: LaunchRecord,
): Promise<boolean> {
  const project = configuredProject(attempt.request.source);
  const workspace = recordedWorkspace(record) ?? record.defaultStart?.workspace;
  if (project === undefined || workspace === undefined) return false;
  return claudeSessionInWorkspace(
    executionCheckout(project),
    record.session.sessionId,
    workspace,
    AbortSignal.timeout(10_000),
  );
}
