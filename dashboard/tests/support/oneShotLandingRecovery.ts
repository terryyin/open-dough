// Real installed publication and copied reporting input, with external fault seams.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import path from "node:path";
import { z } from "zod";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import { context, scripts } from "./oneShotLanding.ts";
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

export function landingGitFault(machine: string) {
  const actual = execFileSync("which", ["git"], { encoding: "utf8" }).trim();
  const bin = path.join(machine, "landing-git-bin");
  mkdirSync(bin);
  const pushes = path.join(machine, "landing-pushes");
  const losePush = path.join(machine, "landing-lose-push");
  const failCleanup = path.join(machine, "landing-fail-cleanup");
  writeFileSync(
    path.join(bin, "git"),
    `#!/bin/sh
if [ "$1" = push ]; then
 printf 'push\\n' >> ${quote(pushes)}
 if [ -f ${quote(losePush)} ]; then
  rm ${quote(losePush)}
  ${quote(actual)} "$@" || exit $?
  echo 'Accepted push response lost' >&2
  exit 74
 fi
fi
if [ "$1" = update-ref ] && [ "$2" = -d ] && [ -f ${quote(failCleanup)} ]; then
 rm ${quote(failCleanup)}
 echo 'Injected pin cleanup EIO' >&2
 exit 74
fi
exec ${quote(actual)} "$@"
`,
    { mode: 0o755 },
  );
  return {
    env: { ...process.env, PATH: `${bin}:${process.env["PATH"] ?? ""}` },
    losePush: () => {
      writeFileSync(losePush, "lose\n");
    },
    failCleanup: () => {
      writeFileSync(failCleanup, "fail\n");
    },
    pushes: () => {
      try {
        return readFileSync(pushes, "utf8").trim().split("\n").length;
      } catch {
        return 0;
      }
    },
  };
}
