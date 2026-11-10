// Published workflow/action inputs and their YAML block readers for CI proof
// checks, and a run attempt that replays the actions' scripts.
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

export const root = new URL("../../", import.meta.url);
const read = (path) => readFileSync(new URL(path, root), "utf8");
export const workflow = read(".github/workflows/ci.yml");
export const fragmentsAction = read(
  ".github/actions/ci-proof-fragments/action.yml",
);
export const summaryAction = read(
  ".github/actions/ci-proof-summary/action.yml",
);
export const locations = JSON.parse(
  read(".planning/open-dough.json"),
).intent.locations.map((location) => location.path);

// Each job's lines, by its id under `jobs:`.
export function jobs(text) {
  const result = new Map();
  let current;
  for (const line of text.slice(text.indexOf("\njobs:\n")).split("\n")) {
    const id = /^ {2}([A-Za-z][\w-]*):\s*$/.exec(line);
    if (id) result.set((current = id[1]), []);
    else if (/^ {2}\S/.test(line)) current = undefined;
    else if (current) result.get(current).push(line);
  }
  return result;
}

// A job's steps, each as its lines joined.
export const steps = (lines) =>
  lines
    .join("\n")
    .split(/\n(?= {6}- )/)
    .filter((step) => step.startsWith("      - "));

// A step's `with:` input value, or its `env:` value of that name.
export const input = (step, name) =>
  new RegExp(`\\n {10}${name}: (.+)`).exec(step)?.[1];

// A step's `with:` inputs, by name.
export const stepInputs = (step) =>
  Object.fromEntries(
    [
      ...step
        .slice(step.indexOf("\n        with:\n"))
        .matchAll(/\n {10}([a-z-]+): (.+)/g),
    ].map(([, name, value]) => [name, value]),
  );

// VALUE, a producer step's input or environment value, with the expressions
// it uses evaluated for one PART of PARTS on a runner whose temporary
// directory is TEMP.
export const evaluated = (value, { temp, part, parts }) =>
  value
    .replaceAll("${{ runner.temp }}", temp)
    .replaceAll("${{ strategy.job-total }}", String(parts))
    .replace(/\$\{\{ matrix\.[a-z]+ \}\}/g, String(part));

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
    // The fragments action of JOB's PART on the runner TEMP, given INPUTS.
    fragments(job, part, temp, inputs) {
      const result = runAction(fragmentsAction, {
        ...attempt,
        RUNNER_TEMP: temp,
        ...inputsEnvironment(fragmentsAction, { ...inputs, part: `${part}` }),
      });
      const kept = join(temp, "ci-proof");
      const artifact = `ci-proof-fragments-${job}-${part}-attempt-${attempt.GITHUB_RUN_ATTEMPT}`;
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

const workflowJobs = jobs(workflow);

// The jobs that keep CI proof fragments: each one's matrix axis, its part
// count (the matrix length), the suite step that runs its tests, and the
// steps keeping its fragments.
export const producers = [
  { job: "test", axis: "share" },
  { job: "dashboard", axis: "shard" },
].map(({ job, axis }) => {
  const lines = workflowJobs.get(job);
  const matrix = new RegExp(`^ +${axis}: \\[([^\\]]*)\\]$`, "m").exec(
    lines.join("\n"),
  );
  const jobSteps = steps(lines);
  return {
    job,
    axis,
    parts: matrix[1].split(",").length,
    suite: jobSteps.find((step) => /\n {8}id: suite\n/.test(step)),
    proof: jobSteps.filter((step) =>
      step.includes("uses: ./.github/actions/ci-proof-fragments\n"),
    ),
  };
});

// The ci-proof job's step that collects the summary.
export const summaryStep = steps(workflowJobs.get("ci-proof")).find((step) =>
  step.includes("uses: ./.github/actions/ci-proof-summary\n"),
);

// The summary action's optional frontend proof upload step body, when present.
export const frontendProofUploadStep = summaryAction.includes(
  "name: Keep the frontend test proof\n",
)
  ? summaryAction.slice(
      summaryAction.indexOf("    - name: Keep the frontend test proof\n"),
    )
  : "";
