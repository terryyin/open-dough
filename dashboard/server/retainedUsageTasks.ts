// Import only retained launch facts. Do not fabricate native launch requests or
// let source recovery mutate operational/workflow state.
import { readFile } from "node:fs/promises";
import path from "node:path";
import { launchRecordSchema, type LaunchRecord } from "../src/launchRecord.ts";
import { launchSubject } from "../src/launchWorkflow.ts";
import { machineDashboardDirectory } from "./machineHome.ts";
import { readLaunchHistory, launchHistoryDirectory } from "./launchHistory.ts";
import { objectOf } from "./nativeUsageFiles.ts";
import { type UsageTask, type UsageSource } from "./usageRecords.ts";

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
    id: JSON.stringify([
      project,
      record.session.host,
      record.session.sessionId,
      rootTurnId ?? record.launchedAt,
    ]),
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
    outcome: record.completion
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
      : null,
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
export async function retainedUsageTasks(home: string): Promise<UsageTask[]> {
  const tasks: UsageTask[] = [];
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
      const task = retainedTask(project, launchRecordSchema.parse(raw), {
        kind: "operational",
        file,
      });
      if (task) tasks.push(task);
    }
  }
  for (const entry of await readLaunchHistory(home)) {
    const task = retainedTask(entry.project, entry.record, {
      kind: "history",
      file: path.join(
        launchHistoryDirectory(home),
        `${entry.leftAt.slice(0, 7)}.jsonl`,
      ),
    });
    if (task) tasks.push(task);
  }
  return tasks;
}
