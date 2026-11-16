// Read-only local evidence: node dashboard/server/compareAgentEffort.ts --list
import { parseArgs } from "node:util";
import { homedir } from "node:os";
import path from "node:path";
import { claudeUsageRoots, codexUsageRoots } from "./usageImport.ts";
import { agentEffortReport } from "./agentEffortReport.ts";
import { cursorEffortReport } from "./agentEffortCursor.ts";
try {
  const { values } = parseArgs({
    options: {
      home: { type: "string" },
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
  if (values.host && !["codex", "claude", "cursor"].includes(values.host))
    throw new Error("--host must be codex, claude or cursor");
  const home = path.resolve(values.home ?? homedir());
  const report =
    values.host === "cursor"
      ? cursorEffortReport({
          home,
          roots: values["cursor-root"],
          family: values.family,
          task: values.task,
          from: values.from,
          until: values.until,
          list: values.list,
          guidanceVersion: values["guidance-version"],
        })
      : await agentEffortReport(
          {
            home,
            ...(values.store ? { store: values.store } : {}),
            since: "1970-01-01T00:00:00.000Z",
            codexRoots:
              values["codex-root"] ??
              (values["codex-file"] ? [] : codexUsageRoots(home)),
            claudeRoots:
              values["claude-root"] ??
              (values["claude-file"] ? [] : claudeUsageRoots(home)),
            ...(values["codex-file"]
              ? { codexFiles: values["codex-file"] }
              : {}),
            ...(values["claude-file"]
              ? { claudeFiles: values["claude-file"] }
              : {}),
          },
          {
            task: values.task,
            family: values.family,
            host: values.host as "codex" | "claude" | undefined,
            from: values.from,
            until: values.until,
            list: values.list,
            guidanceVersion: values["guidance-version"],
          },
        );
  if (values.json) console.log(JSON.stringify(report));
  else if ("selections" in report)
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
    for (const agent of report.agents)
      console.log(`${agent.role} ${agent.id}: ${JSON.stringify(agent)}`);
    console.log(`Gaps: ${report.gaps.join(", ")}`);
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
