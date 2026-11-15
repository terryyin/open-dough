// Import only retained launch facts. Do not fabricate native launch requests or
// let source recovery mutate operational/workflow state. The same retained
// records also say how each launch ended now (`retainedLaunchEnds`), which the
// Usage view reads when it decides which tasks are finished.
import { readFile } from "node:fs/promises";
import path from "node:path";
import { launchRecordSchema, type LaunchRecord } from "../src/launchRecord.ts";
import { launchSubject } from "../src/launchWorkflow.ts";
import { machineDashboardDirectory } from "./machineHome.ts";
import { readLaunchHistory, launchHistoryDirectory } from "./launchHistory.ts";
import { objectOf } from "./nativeUsageFiles.ts";
import { type UsageTask, type UsageSource } from "./usageRecords.ts";

// The usage task id of a retained launch.
function retainedTaskId(project: string, record: LaunchRecord): string {
  return JSON.stringify([
    project,
    record.session.host,
    record.session.sessionId,
    record.firstInput?.turnId ?? record.launchedAt,
  ]);
}

function reportedOutcome(record: LaunchRecord): UsageTask["outcome"] {
  return record.completion
    ? {
        kind:
          record.completion.outcome === "completed"
            ? "reported-complete"
            : "reported-incomplete",
        at: record.completion.receivedAt,
        attention: record.completion.message.length > 0,
        ...(record.returnedToBacklog === record.completion.receipt
          ? { disposition: "returned-to-backlog" as const }
          : {}),
      }
    : null;
}

function retainedTask(
  project: string,
  record: LaunchRecord,
  source: UsageSource,
): UsageTask | undefined {
  if (record.session.host === "cursor") return undefined;
  const rootTurnId = record.firstInput?.turnId;
  const requested: UsageTask["requested"] = {};
  const { model, effort, options, policy, reporting } = record.request;
  if (model !== undefined) requested.model = model;
  if (effort !== undefined) requested.effort = effort;
  if (options !== undefined) requested.options = options;
  if (policy !== undefined) requested.policy = policy;
  const subject = launchSubject(record.request);
  return {
    id: retainedTaskId(project, record),
    kind: "launch",
    project,
    host: record.session.host,
    sessionId: record.session.sessionId,
    ...(rootTurnId ? { rootTurnId } : {}),
    nativeTurns: rootTurnId ? [rootTurnId] : [],
    workflow: record.request.workflow,
    identity: subject.identity ?? null,
    title: subject.title,
    launchedAt: record.launchedAt,
    origin: "dashboard",
    ...(reporting ? { launchReference: reporting.reference } : {}),
    requested,
    outcome: reportedOutcome(record),
    fieldSources: Object.fromEntries(
      [
        "project",
        "host",
        "sessionId",
        "workflow",
        "identity",
        "title",
        "launchedAt",
        "origin",
        ...(rootTurnId ? ["rootTurnId"] : []),
        ...(reporting ? ["launchReference"] : []),
        ...Object.keys(requested).map((key) => `requested.${key}`),
        ...(record.completion ? ["outcome"] : []),
      ].map((field) => [field, [source]]),
    ),
    sources: [source],
    gaps: ["retained-native-evidence-only"],
  };
}
type RetainedRecord = {
  readonly project: string;
  readonly record: LaunchRecord;
  readonly source: UsageSource;
};

// Every launch record this machine keeps, operational ones first, then
// launch history's.
async function retainedRecords(home: string): Promise<RetainedRecord[]> {
  const retained: RetainedRecord[] = [];
  const file = path.join(
    machineDashboardDirectory(home),
    "agent-launches.json",
  );
  let operational: Record<string, unknown> = {};
  try {
    operational = objectOf(JSON.parse(await readFile(file, "utf8")));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
  for (const [project, records] of Object.entries(operational)) {
    if (!Array.isArray(records))
      throw new Error(`Malformed launch records: ${file}`);
    for (const raw of records) {
      // Unresolved creation records have no session and are not launches.
      if (!objectOf(raw)["session"]) continue;
      retained.push({
        project,
        record: launchRecordSchema.parse(raw),
        source: { kind: "operational", file },
      });
    }
  }
  for (const entry of await readLaunchHistory(home))
    retained.push({
      project: entry.project,
      record: entry.record,
      source: {
        kind: "history",
        file: path.join(
          launchHistoryDirectory(home),
          `${entry.leftAt.slice(0, 7)}.jsonl`,
        ),
      },
    });
  return retained;
}

export async function retainedUsageTasks(home: string): Promise<UsageTask[]> {
  return (await retainedRecords(home)).flatMap(
    ({ project, record, source }) =>
      retainedTask(project, record, source) ?? [],
  );
}

// How a retained launch ended as its record says now: its reported outcome
// and when the developer marked it done, if either.
export type RetainedLaunchEnd = {
  readonly outcome: UsageTask["outcome"];
  readonly doneAt: string | null;
};

// Each retained launch's end, by its usage task id. A launch kept both in
// the operational document and in history ends as either record says.
export async function retainedLaunchEnds(
  home: string,
): Promise<ReadonlyMap<string, RetainedLaunchEnd>> {
  const ends = new Map<string, RetainedLaunchEnd>();
  for (const { project, record } of await retainedRecords(home)) {
    const id = retainedTaskId(project, record);
    const prior = ends.get(id);
    ends.set(id, {
      outcome: prior?.outcome ?? reportedOutcome(record),
      doneAt: prior?.doneAt ?? record.doneAt ?? null,
    });
  }
  return ends;
}
