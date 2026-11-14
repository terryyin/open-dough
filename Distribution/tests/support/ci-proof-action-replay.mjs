// A CI run attempt that replays the local CI proof actions' actual shell
// blocks (./ci-proof-action-fixtures.mjs reads what the workflows give them).
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  fragmentsAction,
  root,
  summaryAction,
} from "./ci-proof-action-fixtures.mjs";

// The environment ACTION's run step gives its script for INPUTS, by input
// name; an input not given is empty, as each optional one defaults.
function inputsEnvironment(action, inputs) {
  const env = action.slice(action.indexOf("\n      env:\n"));
  return Object.fromEntries(
    [...env.matchAll(/\n {8}([A-Z_]+): \$\{\{ inputs\.([a-z-]+) \}\}/g)].map(
      ([, name, input]) => [name, inputs[input] ?? ""],
    ),
  );
}

// An action's one `run: |` block, unindented; Actions runs it as `bash -eo pipefail`.
function runBlock(action) {
  const lines = action.slice(action.indexOf("      run: |\n") + 13).split("\n");
  const end = lines.findIndex((line) => !line.startsWith("        "));
  return lines
    .slice(0, end)
    .map((line) => line.slice(8))
    .join("\n");
}

// Execute the action's actual shell block with a test's explicit CI environment.
function runAction(action, env) {
  return spawnSync("bash", ["-eo", "pipefail", "-c", runBlock(action)], {
    cwd: fileURLToPath(root),
    encoding: "utf8",
    env: { ...process.env, ...env },
  });
}

// The GitHub Actions run attempt a replay names.
const attempt = {
  GITHUB_RUN_ATTEMPT: "2",
  GITHUB_RUN_ID: "7",
  GITHUB_REPOSITORY: "owner/repo",
  CI_PROOF_REVISION: "a".repeat(40),
};

// The frontend proof upload step's path under runner.temp, when the action
// declares one; its basename is the file the summarize shell block writes.
function frontendProofUploadPath() {
  const match = summaryAction.match(
    /\n +- name: Keep the frontend test proof\n[\s\S]*?\n {8}path: \$\{\{ runner\.temp \}\}\/([^\n]+)\n/,
  );
  return match?.[1];
}

// One run attempt of test T: each job part on a runner of its own, whose
// kept fragments the summary action finds where the ci-proof job downloads
// them, one artifact directory per part.
export function runAttempt(t) {
  const directory = mkdtempSync(join(tmpdir(), "ci-proof-actions-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const collector = join(directory, "ci-proof");
  const downloaded = join(collector, "ci-proof-fragments");
  mkdirSync(downloaded, { recursive: true });
  return {
    runner(job, part) {
      const temp = join(directory, `${job}-${part}`);
      mkdirSync(temp);
      return temp;
    },
    // Plant VALUE as a downloaded fragment artifact for the summary action.
    plantFragment(value, artifact = `planted-${value.entry}-${value.part}`) {
      const dir = join(downloaded, artifact);
      mkdirSync(dir, { recursive: true });
      writeFileSync(
        join(dir, `fragment-${value.part}.json`),
        `${JSON.stringify(value)}\n`,
      );
    },
    // The fragments action of a PART on the runner TEMP, given INPUTS,
    // kept as its producer's part artifact.
    fragments(part, temp, inputs) {
      const result = runAction(fragmentsAction, {
        ...attempt,
        RUNNER_TEMP: temp,
        ...inputsEnvironment(fragmentsAction, { ...inputs, part: `${part}` }),
      });
      const kept = join(temp, "ci-proof");
      const artifact = `ci-proof-fragments-${inputs.producer}-${part}-attempt-${attempt.GITHUB_RUN_ATTEMPT}`;
      if (existsSync(kept)) renameSync(kept, join(downloaded, artifact));
      return result;
    },
    // The summary action for INPUTS (`expect`, optional `frontend-entry`),
    // or a bare expect string. When frontend-entry is set, `report` is the
    // Markdown named by the action's frontend upload step.
    summary(inputs) {
      const resolved =
        typeof inputs === "string" ? { expect: inputs } : { ...inputs };
      const result = runAction(summaryAction, {
        ...attempt,
        RUNNER_TEMP: collector,
        ...inputsEnvironment(summaryAction, resolved),
      });
      const file = join(collector, "ci-proof-summary.json");
      const written =
        result.status === 0 && existsSync(file)
          ? readFileSync(file, "utf8")
          : "";
      const reportName = frontendProofUploadPath();
      const reportFile = reportName && join(collector, reportName);
      const report =
        reportFile && existsSync(reportFile)
          ? readFileSync(reportFile, "utf8")
          : undefined;
      return {
        ...result,
        written: written && JSON.parse(written),
        report,
      };
    },
  };
}
