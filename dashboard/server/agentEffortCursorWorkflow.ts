import { readFileSync } from "node:fs";
import path from "node:path";
import { isDeepStrictEqual } from "node:util";

const object = (value: unknown): Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

const metricNames = [
  "transcripts",
  "bytes",
  "rows",
  "toolCalls",
  "readCalls",
  "skillReads",
  "planReads",
  "taskCalls",
  "awaitShellCalls",
  "todoWriteCalls",
  "dynamicToolCalls",
  "missingResults",
  "identifiedToolCalls",
  "unidentifiedToolCallRows",
  "conflictingToolCallIds",
] as const;
type WorkflowMetric = (typeof metricNames)[number];

export function cursorWorkflowTotals(
  workflows: ReturnType<typeof cursorWorkflow>[],
) {
  return Object.fromEntries(
    metricNames.map((key) => [
      key,
      workflows.length
        ? workflows.reduce((sum, workflow) => sum + workflow[key], 0)
        : null,
    ]),
  ) as Record<WorkflowMetric, number | null>;
}

export function cursorWorkflow(file: string) {
  const bytes = readFileSync(file);
  type Call = { name: unknown; input: unknown; dynamic: boolean };
  const calls = new Map<string, Call>();
  const unidentified: Call[] = [];
  const conflicts = new Set<string>();
  const results = new Set<string>();
  const gaps = new Set<string>();
  const metrics = Object.fromEntries(
    metricNames.map((key) => [key, 0]),
  ) as Record<WorkflowMetric, number>;
  metrics.transcripts = 1;
  metrics.bytes = bytes.length;
  for (const line of bytes.toString("utf8").split("\n")) {
    if (!line.trim()) continue;
    let row: Record<string, unknown>;
    try {
      row = object(JSON.parse(line));
    } catch {
      gaps.add("malformed-transcript-row");
      continue;
    }
    metrics.rows++;
    const content = object(row.message).content;
    for (const value of Array.isArray(content) ? content : []) {
      const part = object(value);
      if (part.type === "tool_result" && typeof part.tool_use_id === "string")
        results.add(part.tool_use_id);
      if (part.type !== "tool_use") continue;
      const wrapper = object(part.input);
      const dynamic = part.name === "CallDynamicTool";
      const name = dynamic
        ? (wrapper.toolName ?? wrapper.name ?? wrapper.tool)
        : part.name;
      let input = dynamic ? wrapper.arguments : wrapper;
      if (typeof input === "string") {
        try {
          input = JSON.parse(input);
        } catch {
          gaps.add("unresolved-dynamic-tool-arguments");
        }
      }
      const call = { name, input, dynamic };
      if (typeof part.id !== "string" || !part.id) {
        unidentified.push(call);
        gaps.add("tool-call-identity-unavailable");
      } else {
        const previous = calls.get(part.id);
        if (previous && !isDeepStrictEqual(previous, call)) {
          conflicts.add(part.id);
          gaps.add("conflicting-tool-call-identity");
        }
        calls.set(part.id, call);
      }
    }
  }
  const identified = [...calls].filter(([id]) => !conflicts.has(id));
  for (const { name, input, dynamic } of [
    ...identified.map(([, call]) => call),
    ...unidentified,
  ]) {
    metrics.toolCalls++;
    if (dynamic) metrics.dynamicToolCalls++;
    if (typeof name !== "string") gaps.add("unresolved-dynamic-tool-name");
    if (name === "Read") {
      metrics.readCalls++;
      const args = object(input);
      const target = args.path ?? args.file_path;
      if (typeof target === "string") {
        if (path.basename(target) === "PLAN.md") metrics.planReads++;
        if (path.basename(target) === "SKILL.md") metrics.skillReads++;
      } else gaps.add("read-target-unavailable");
    }
    if (name === "Task") metrics.taskCalls++;
    if (name === "AwaitShell") metrics.awaitShellCalls++;
    if (name === "TodoWrite") metrics.todoWriteCalls++;
  }
  metrics.missingResults =
    identified.filter(([id]) => !results.has(id)).length + unidentified.length;
  metrics.identifiedToolCalls = identified.length;
  metrics.unidentifiedToolCallRows = unidentified.length;
  metrics.conflictingToolCallIds = conflicts.size;
  if (metrics.missingResults) gaps.add("tool-results-unavailable");
  return {
    ...metrics,
    toolCallRule:
      "Consistent known tool ids count once; conflicting ids are excluded. ID-less rows count as recorded occurrences with unknown uniqueness.",
    sources: [{ kind: "cursor-transcript", file }],
    gaps: [...gaps].sort(),
  };
}
