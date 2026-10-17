// Dough Land's caller checks over installed publication APIs, and an external
// native host response to a follow-up. Neither supplies resource disposition.
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { installedSkillPath } from "../../server/launchHosts.ts";
import { quote } from "./completionRecovery.ts";

export function checkedIntegrationCommand({
  host,
  workspace,
  branch,
  tip,
  context,
}: {
  host: "claude" | "codex";
  workspace: string;
  branch: string;
  tip: string;
  context: readonly string[];
}) {
  const installed = (skill: string, file: string) =>
    pathToFileURL(
      path.join(
        installedSkillPath(
          host,
          { path: workspace, shown: workspace },
          skill,
          "scripts",
        ),
        file,
      ),
    ).href;
  const options = {
    ownedWorkspace: workspace,
    publishedTip: tip,
    branch,
    remote: "origin",
    targetRef: "refs/heads/main",
    ...(context.length ? { landingContext: context[1] } : {}),
  };
  const script = `import {publishHistoryPreservingCandidate} from ${JSON.stringify(installed("dough-execute-plan", "history-preserving-publication.mjs"))};
import {checkQueuedClosures} from ${JSON.stringify(installed("dough-land", "queued-closure-check.mjs"))};
const options = ${JSON.stringify(options)};
const check = async () => {
 const checked = await checkQueuedClosures({checkout: options.ownedWorkspace, remote: options.remote, targetRef: options.targetRef});
 if (!checked.ok) return {status: checked.status, fields: {ownership: checked.ownership, error: checked.error}};
};
const result = await publishHistoryPreservingCandidate({...options, onFetchedTarget: check});
process.stdout.write(JSON.stringify(result));
if (result.classification === 'preserved') process.exitCode = 1;`;
  return [process.execPath, "--input-type=module", "-e", script]
    .map(quote)
    .join(" ");
}

export function executionRecordBytes(
  workspace: string,
  plan: string,
  agent: string,
) {
  return {
    backlog: readFileSync(
      path.join(workspace, ".planning/PRODUCT-BACKLOG.md"),
      "utf8",
    ),
    plan: readFileSync(path.join(workspace, ".planning", plan), "utf8"),
    profile: readFileSync(
      path.join(workspace, ".planning/agents", `${agent}.json`),
      "utf8",
    ),
  };
}

// The fake host responds to one actual terminal input by doing work in the
// conversation's saved cwd, just as its other actions emulate native commands.
export function nativeNextSlice(machine: string, input: string) {
  const script = path.join(machine, "native-next-slice.cjs");
  writeFileSync(
    script,
    `const fs = require('node:fs');
const {execFileSync} = require('node:child_process');
const branch = execFileSync('git', ['branch', '--show-current'], {encoding:'utf8'}).trim();
fs.writeFileSync('next-slice.txt', process.cwd() + '\\n' + branch + '\\n');
execFileSync('git', ['add', 'next-slice.txt']);
execFileSync('git', ['commit', '-qm', 'Continue pending slice']);
`,
  );
  writeFileSync(
    path.join(machine, "claude-state/attach-action.json"),
    JSON.stringify({ input, command: process.execPath, args: [script] }),
  );
}
