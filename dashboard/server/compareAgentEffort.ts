// Read-only local evidence: node dashboard/server/compareAgentEffort.ts --list
import { parseArgs } from "node:util";
import { readFileSync } from "node:fs";
import { readEffortRequest } from "./agentEffortRequest.ts";
import { compareEffort } from "./agentEffortComparison.ts";
try {
  const { values } = parseArgs({
    options: {
      home: { type: "string" },
      comparison: { type: "string" },
      store: { type: "string" },
      task: { type: "string" },
      family: { type: "string" },
      host: { type: "string" },
      from: { type: "string" },
      until: { type: "string" },
      json: { type: "boolean" },
      list: { type: "boolean" },
      "guidance-version": { type: "string" },
      "codex-file": { type: "string", multiple: true },
      "claude-file": { type: "string", multiple: true },
      "codex-root": { type: "string", multiple: true },
      "claude-root": { type: "string", multiple: true },
      "cursor-root": { type: "string", multiple: true },
    },
  });
  const report = values.comparison
    ? await compareEffort(
        JSON.parse(readFileSync(values.comparison, "utf8")),
        values,
      )
    : await readEffortRequest(values);
  if (values.json) console.log(JSON.stringify(report));
  else if ("baseline" in report) {
    console.log(
      "Exploratory agent effort comparison; no automatic improvement or causal claim",
    );
    for (const name of ["baseline", "candidate"] as const) {
      const group = report[name];
      console.log(`${name} supplied notes: ${JSON.stringify(group.notes)}`);
      for (const execution of group.executions) {
        const { agents, ...summary } = execution;
        console.log(
          `${name} execution: ${JSON.stringify({
            ...summary,
            agents: agents.map((agent) => ({
              ...agent,
              responseIds: undefined,
            })),
          })}`,
        );
      }
      console.log(
        `${name} deduplicated group: ${JSON.stringify(group.perHost)}`,
      );
    }
    console.log(`Deltas: ${JSON.stringify(report.deltas)}`);
    console.log(`Warnings: ${report.warnings.join("; ")}`);
  } else if ("selections" in report)
    console.log(JSON.stringify(report.selections, null, 2));
  else {
    console.log(`${report.host} agent effort (${report.definition})`);
    console.log(`Selection: ${JSON.stringify(report.selection)}`);
    console.log(report.accounting);
    console.log(
      `Requested settings: ${JSON.stringify(report.requestedSettings)}`,
    );
    console.log(`Guidance version: ${JSON.stringify(report.guidanceVersion)}`);
    if ("observedSettingsCoverage" in report)
      console.log(
        `Observed settings coverage: ${JSON.stringify(report.observedSettingsCoverage)}`,
      );
    console.log(report.peakInputRule);
    console.log(
      `${report.idleWakeRule} ${JSON.stringify(report.idleWakeRequests)}`,
    );
    console.log(`Combined known figures: ${JSON.stringify(report.totals)}`);
    if ("workflow" in report)
      console.log(`Workflow: ${JSON.stringify(report.workflow)}`);
    for (const original of report.agents) {
      const agent = { ...original, responseIds: undefined };
      console.log(`${agent.role} ${agent.id}: ${JSON.stringify(agent)}`);
    }
    console.log(`Gaps: ${report.gaps.join(", ")}`);
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
