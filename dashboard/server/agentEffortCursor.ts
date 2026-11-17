import { globSync, readdirSync } from "node:fs";
import path from "node:path";
import { cursorTranscriptSubagentsDirectory } from "./hosts/cursor/unfinishedSubagents.ts";
import {
  cursorWorkflow,
  cursorWorkflowTotals,
} from "./agentEffortCursorWorkflow.ts";
import type { effortAgents } from "./agentEffortObservations.ts";
import type { CursorCatalogEntry } from "./agentEffortCatalog.ts";

export function cursorEffortReport(options: {
  home: string;
  roots?: string[] | undefined;
  family?: string | undefined;
  task?: string | undefined;
  from?: string | undefined;
  until?: string | undefined;
  list?: boolean | undefined;
  guidanceVersion?: string | undefined;
}) {
  if (options.task)
    throw new Error(
      "Cursor requires explicit --family; native task/turn ownership is unavailable",
    );
  const roots =
    options.roots ??
    globSync(path.join(options.home, ".cursor/projects/*/agent-transcripts"));
  const families = [
    ...new Set(
      roots.flatMap((root) => {
        try {
          return readdirSync(root, { withFileTypes: true })
            .filter((entry) => entry.isDirectory())
            .map((entry) => path.join(root, entry.name));
        } catch {
          return [];
        }
      }),
    ),
  ].sort();
  if (options.list)
    return {
      format: "agent-effort-v1" as const,
      selections: families.map((directory): CursorCatalogEntry => ({
        host: "cursor",
        id: path.basename(directory),
        root: path.dirname(directory),
        directory,
      })),
    };
  if (
    !options.family ||
    [".", ".."].includes(options.family) ||
    path.basename(options.family) !== options.family
  )
    throw new Error(
      "Choose an explicit Cursor --family SESSION; use --host cursor --list for identifiers",
    );
  const matches = families.filter(
    (directory) => path.basename(directory) === options.family,
  );
  if (matches.length > 1)
    throw new Error(
      "Cursor family is ambiguous; choose its --cursor-root from --host cursor --list",
    );
  const directory = matches[0];
  const gaps = new Set([
    "native-turn-boundary-unavailable",
    "native-request-count-unavailable",
    "token-counters-unavailable",
    "peak-input-unavailable",
    "idle-wake-evidence-unavailable",
    "directory-family-ownership-only",
  ]);
  if (options.from || options.until)
    gaps.add("requested-time-window-unprovable-whole-family-reported");
  const files = directory
    ? [
        path.join(directory, `${options.family}.jsonl`),
        ...globSync(
          path.join(
            cursorTranscriptSubagentsDirectory(directory),
            "**/*.jsonl",
          ),
        ).sort(),
      ]
    : [];
  if (!files.length) gaps.add("native-files-unavailable");
  const unavailable = { value: null, status: "unavailable" } as const;
  const observedSettings: ReturnType<
    typeof effortAgents
  >[number]["observedSettings"] = [];
  const observedSettingsCoverage = {
    model: null,
    effort: null,
    serviceTier: null,
    status: "unavailable",
    coverage: "retained-Cursor-transcripts-do-not-establish-request-settings",
  };
  gaps.add("observed-settings-unavailable");
  const totals = {
    requests: unavailable,
    totalInput: unavailable,
    cachedInput: unavailable,
    uncachedInput: unavailable,
    cacheWrite: unavailable,
    cacheWrite5m: unavailable,
    cacheWrite1h: unavailable,
    output: unavailable,
    reasoningOutput: unavailable,
    totalTokens: unavailable,
  };
  const agents = files.flatMap((file, index) => {
    try {
      const workflow = cursorWorkflow(file);
      workflow.gaps.forEach((gap) => gaps.add(gap));
      return [
        {
          id: file,
          role: index === 0 ? "coordinator" : "worker",
          provenance: "belonging-transcript-directory",
          sources: workflow.sources,
          workflow,
          totals,
          requestedSettings: null,
          observedSettings,
          observedSettingsCoverage,
          peakInput: unavailable,
          idleWakeRequests: unavailable,
        },
      ];
    } catch {
      gaps.add(`native-file-unavailable:${file}`);
      return [];
    }
  });
  const workflow = cursorWorkflowTotals(agents.map((agent) => agent.workflow));
  const workers = agents.filter((agent) => agent.role === "worker").length;
  if ((workflow.taskCalls ?? 0) > workers) gaps.add("missing-worker-evidence");
  return {
    format: "agent-effort-v1",
    scope: "retained-local-evidence",
    host: "cursor",
    selection: {
      kind: "native-family",
      rootSessionId: options.family,
      from: options.from ?? null,
      until: options.until ?? null,
      appliedBoundary: {
        kind: "whole-retained-directory-family",
        from: null,
        until: null,
        nativeTurnBoundary: null,
      },
      boundary:
        "whole-retained-directory-family; native task/turn/time boundary unprovable",
    },
    definition: "cursor-retained-workflow",
    accounting:
      "Workflow counts describe retained transcripts only. Consistent known tool ids count once; conflicting ids are excluded. ID-less rows are recorded occurrences with unknown uniqueness. Transcript bytes are not token or live-context estimates. Missing workers are not zero cost.",
    requestedSettings: null,
    observedSettings,
    observedSettingsCoverage,
    guidanceVersion: {
      value: options.guidanceVersion ?? null,
      provenance:
        options.guidanceVersion === undefined ? "unknown" : "supplied",
    },
    sources: agents.flatMap((agent) => agent.sources),
    totals,
    agents,
    workflow: {
      ...workflow,
      workers: agents.length ? workers : null,
      status: "partial",
      coverage:
        "retained-directory-family; worker completeness and request boundaries unknown",
    },
    peakInput: null,
    peakInputRule:
      "Cursor native transcripts cannot establish request input peaks.",
    idleWakeRequests: unavailable,
    idleWakeRule:
      "Tool results and native request boundaries cannot establish Cursor idle-wake exposure.",
    gaps: [...gaps].sort(),
  };
}
