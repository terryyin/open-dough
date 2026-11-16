import { z } from "zod";
import { readEffortRequest, type EffortRequest } from "./agentEffortRequest.ts";
import type { EffortEvidence } from "./agentEffortReport.ts";
import {
  comparisonGroup,
  type EffortExecution,
} from "./agentEffortComparisonGroup.ts";
const member = z
  .object({
    label: z.string().min(1),
    host: z.enum(["codex", "claude", "cursor"]),
    task: z.string().optional(),
    family: z.string().optional(),
    from: z.string().optional(),
    until: z.string().optional(),
    "guidance-version": z.string().optional(),
    "codex-file": z.array(z.string()).optional(),
    "claude-file": z.array(z.string()).optional(),
    "codex-root": z.array(z.string()).optional(),
    "claude-root": z.array(z.string()).optional(),
    "cursor-root": z.array(z.string()).optional(),
  })
  .strict();
const sideSchema = z
  .object({
    notes: z
      .object({
        outcome: z.string().optional(),
        proof: z.string().optional(),
        humanIntervention: z.string().optional(),
      })
      .strict()
      .optional(),
    executions: z.array(member).min(1),
  })
  .strict();
const manifestSchema = z
  .object({ baseline: sideSchema, candidate: sideSchema })
  .strict();
export async function compareEffort(
  manifest: unknown,
  defaults: EffortRequest,
) {
  const input = manifestSchema.parse(manifest);
  const readSide = async (side: z.infer<typeof sideSchema>) => {
    const executions: EffortExecution[] = [];
    for (const { label, ...request } of side.executions) {
      let evidence: EffortEvidence | undefined;
      const report = await readEffortRequest(
        { ...defaults, ...request, list: false },
        (selected) => {
          evidence = selected;
        },
      );
      if ("selections" in report)
        throw new Error("Comparison members must select an execution");
      executions.push({ label, report, evidence });
    }
    return comparisonGroup(executions, side.notes);
  };
  const baseline = await readSide(input.baseline);
  const candidate = await readSide(input.candidate);
  const warnings = new Set<string>([
    "exploratory-retrospective-comparison; no automatic improvement or causal claim",
  ]);
  const context = (
    group: typeof baseline,
    field: "requestedSettings" | "guidanceVersion" | "selection" | "gaps",
  ) => group.executions.map((execution) => execution[field]);
  for (const field of [
    "requestedSettings",
    "guidanceVersion",
    "selection",
    "gaps",
  ] as const) {
    if (
      JSON.stringify(context(baseline, field)) !==
      JSON.stringify(context(candidate, field))
    )
      warnings.add(`${field}-differences; inspect each execution`);
  }
  const coverage = (group: typeof baseline) =>
    group.executions.map((execution) => ({
      gaps: execution.gaps,
      metrics: Object.fromEntries(
        Object.entries(execution.totals).map(([name, metric]) => [
          name,
          metric.status,
        ]),
      ),
      wakes: execution.idleWakeRequests,
    }));
  if (
    JSON.stringify(coverage(baseline)) !== JSON.stringify(coverage(candidate))
  )
    warnings.add("coverage-differences; inspect each execution");
  for (const host of candidate.perHost)
    if (
      !baseline.perHost.some(
        (before) =>
          before.host === host.host && before.definition === host.definition,
      )
    )
      warnings.add(`no-like-host-and-definition:${host.host}`);
  warnings.add(
    "outcome-proof-human-intervention-and-boundary-equivalence-require-maintainer-judgment",
  );
  if (
    [...baseline.executions, ...candidate.executions].some(
      (execution) =>
        execution.guidanceVersion.value === null ||
        execution.requestedSettings === null ||
        execution.agents.some(
          (agent) =>
            !agent.observedSettings.length ||
            agent.observedSettings.some(
              (setting) =>
                setting.model === null ||
                setting.effort === null ||
                setting.serviceTier === null,
            ),
        ),
    )
  )
    warnings.add("unknown-settings-or-guidance");
  const observed = (group: typeof baseline) =>
    group.executions.map((execution) =>
      execution.agents.map((agent) => agent.observedSettings),
    );
  if (
    JSON.stringify(observed(baseline)) !== JSON.stringify(observed(candidate))
  )
    warnings.add("observed-settings-differences; inspect each execution");
  const deltas = baseline.perHost.flatMap((before) => {
    const after = candidate.perHost.find(
      (item) =>
        item.host === before.host && item.definition === before.definition,
    );
    if (!after) {
      warnings.add(`no-like-host-and-definition:${before.host}`);
      return [];
    }
    const metrics = Object.keys(
      before.totals,
    ) as (keyof typeof before.totals)[];
    const totals = Object.fromEntries(
      metrics.flatMap((metric) => {
        const left = before.totals[metric],
          right = after.totals[metric];
        if (left.value === null || right.value === null) return [];
        return [
          [
            metric,
            {
              value: right.value - left.value,
              baseline: left,
              candidate: right,
              status:
                left.status === "complete" && right.status === "complete"
                  ? "complete"
                  : "partial-known-subtotals",
            },
          ],
        ];
      }),
    );
    const workflow =
      before.workflow && after.workflow
        ? Object.fromEntries(
            Object.entries(before.workflow).flatMap(([key, value]) => {
              const right =
                after.workflow?.[key as keyof typeof after.workflow];
              return value === null || right === null || right === undefined
                ? []
                : [[key, right - value]];
            }),
          )
        : null;
    const idleWakeRequests =
      before.idleWakeRequests.value === null ||
      after.idleWakeRequests.value === null
        ? null
        : {
            value: after.idleWakeRequests.value - before.idleWakeRequests.value,
            baseline: before.idleWakeRequests,
            candidate: after.idleWakeRequests,
          };
    return [
      {
        host: before.host,
        definition: before.definition,
        totals,
        workflow,
        idleWakeRequests,
      },
    ];
  });
  if (
    baseline.perHost.some((host) => host.gaps.length) ||
    candidate.perHost.some((host) => host.gaps.length)
  )
    warnings.add("coverage-gaps; known figures remain inspectable");
  return {
    format: "agent-effort-comparison-v1",
    baseline,
    candidate,
    deltas,
    warnings: [...warnings].sort(),
  };
}
