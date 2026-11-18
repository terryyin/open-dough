// Real installed publication and copied reporting input, with external fault seams.
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import path from "node:path";
import { z } from "zod";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import { context } from "./oneShotLanding.ts";
import { scripts } from "./launchLanding.ts";
import { quote, reportingChild } from "./completionRecovery.ts";

export function retainedLanding(record: LaunchRecord) {
  const { reporting } = context(record);
  const directory = path.dirname(reporting.landingContext ?? "");
  const current = z
    .object({ pending: z.string() })
    .parse(
      JSON.parse(
        readFileSync(path.join(directory, "landing-current.json"), "utf8"),
      ),
    );
  const submission = z
    .record(z.string(), z.string())
    .parse(JSON.parse(readFileSync(current.pending, "utf8")));
  return {
    pending: current.pending,
    submission,
    retry: `${reporting.command} --operation landing --retry ${quote(current.pending)}`,
  };
}

export async function publishLanding(
  record: LaunchRecord,
  cwd: string,
  env = process.env,
  expectedFiles?: string[],
) {
  const { established, reporting } = context(record);
  const module = pathToFileURL(
    path.join(
      scripts(established.workspace),
      "execution-increment-publication.mjs",
    ),
  ).href;
  const input = {
    workspace: established.workspace,
    branch: established.branch,
    previouslyPublishedBase: established.startingRevision,
    remote: established.remote,
    targetRef: `refs/heads/${established.target}`,
    landingContext: reporting.landingContext,
  };
  const validation =
    expectedFiles === undefined
      ? ""
      : `, validate: async (candidate, comparison) => {
    assert.deepEqual(execFileSync('git', ['diff', '--name-only', comparison.suffixBase, candidate], {cwd: input.workspace, encoding:'utf8'}).trim().split('\\n').sort(), ${JSON.stringify(expectedFiles)});
    return true;
  }`;
  const code = `import assert from 'node:assert/strict'; import {execFileSync} from 'node:child_process'; import {publishExecutionIncrement} from ${JSON.stringify(module)}; const input = JSON.parse(process.argv[1]); console.log(JSON.stringify(await publishExecutionIncrement({...input${validation}})));`;
  return reportingChild(
    `${quote(process.execPath)} --input-type=module -e ${quote(code)} ${quote(JSON.stringify(input))}`,
    cwd,
    env,
  );
}

export function resumeLanding(
  record: LaunchRecord,
  cwd: string,
  env = process.env,
) {
  const { established, reporting } = context(record);
  const { submission } = retainedLanding(record);
  const args = [
    process.execPath,
    path.join(scripts(established.workspace), "execution-increment-resume.mjs"),
    "resume",
    "--workspace",
    established.workspace,
    "--candidate-sha",
    submission["revision"] ?? "",
    "--suffix-base",
    submission["base"] ?? "",
    "--host",
    "codex",
    "--repo",
    "terryyin/open-dough",
    "--target-ref",
    `refs/heads/${established.target}`,
    "--landing-context",
    reporting.landingContext ?? "",
  ];
  return reportingChild(args.map(quote).join(" "), cwd, env);
}
