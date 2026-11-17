// Read-only local evidence: node dashboard/server/compareAgentEffort.ts --list
import { parseArgs } from "node:util";
import { readFileSync } from "node:fs";
import { readEffortRequest } from "./agentEffortRequest.ts";
import { compareEffort } from "./agentEffortComparison.ts";
import {
  comparisonOutput,
  renderComparison,
} from "./agentEffortComparisonReport.ts";
import { catalogOutput, renderCatalog } from "./agentEffortCatalog.ts";
import {
  renderSingleReport,
  singleReportOutput,
} from "./agentEffortSingleReport.ts";
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
  if ("selections" in report) {
    const catalog = { selections: report.selections ?? [] };
    console.log(
      values.json
        ? JSON.stringify(catalogOutput(catalog))
        : renderCatalog(catalog),
    );
  } else if ("baseline" in report)
    console.log(
      values.json
        ? JSON.stringify(comparisonOutput(report))
        : renderComparison(report),
    );
  else
    console.log(
      values.json
        ? JSON.stringify(singleReportOutput(report))
        : renderSingleReport(report),
    );
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
