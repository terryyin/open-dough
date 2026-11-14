// Published workflow/action inputs and their YAML block readers for CI proof
// checks; ./ci-proof-action-replay.mjs replays the actions' scripts.
import { readFileSync } from "node:fs";

export const root = new URL("../../", import.meta.url);
const read = (path) => readFileSync(new URL(path, root), "utf8");
export const workflow = read(".github/workflows/ci.yml");
// The reusable workflow each browser test group's job calls.
export const browserWorkflow = read(".github/workflows/browser-test-group.yml");
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
// directory is TEMP, given the INPUTS its caller passes a reusable workflow.
export const evaluated = (value, { temp, part, parts, inputs = {} }) =>
  value
    .replaceAll("${{ runner.temp }}", temp)
    .replaceAll("${{ strategy.job-total }}", String(parts))
    .replace(/\$\{\{ matrix\.[a-z]+ \}\}/g, String(part))
    .replace(/\$\{\{ inputs\.([a-z-]+) \}\}/g, (...[, name]) => inputs[name]);

const workflowJobs = jobs(workflow);

// A caller job's `with:` inputs to a reusable workflow, by name.
const callerInputs = (lines) =>
  Object.fromEntries(
    lines
      .slice(lines.indexOf("    with:") + 1)
      .map((line) => /^ {6}([a-z-]+): (.+)$/.exec(line))
      .filter(Boolean)
      .map(([, name, value]) => [name, value.replace(/^"(.*)"$/, "$1")]),
  );

// The steps of the one job a workflow declares, by its id.
const stepsOf = (text, job) => steps(jobs(text).get(job));
const keptFragments = (jobSteps) =>
  jobSteps.filter((step) =>
    step.includes("uses: ./.github/actions/ci-proof-fragments\n"),
  );
const suiteOf = (jobSteps) =>
  jobSteps.find((step) => /\n {8}id: suite\n/.test(step));

// Each browser test group's job in ci.yml and the inputs it gives
// browser-test-group.yml.
export const browserGroups = [...workflowJobs]
  .filter(([, lines]) =>
    lines.includes("    uses: ./.github/workflows/browser-test-group.yml"),
  )
  .map(([job, lines]) => ({ job, inputs: callerInputs(lines) }));

// The jobs that keep CI proof fragments: each one's matrix axis, its part
// count (the matrix length), the suite step that runs its tests, the steps
// keeping its fragments, and the inputs a browser group's job gives the
// reusable workflow whose steps those are.
const testSteps = steps(workflowJobs.get("test"));
const browserSteps = stepsOf(browserWorkflow, "shard");
export const producers = [
  {
    job: "test",
    axis: "share",
    parts: /^ +share: \[([^\]]*)\]$/m
      .exec(workflowJobs.get("test").join("\n"))[1]
      .split(",").length,
    suite: suiteOf(testSteps),
    proof: keptFragments(testSteps),
    inputs: {},
  },
  ...browserGroups.map(({ job, inputs }) => ({
    job,
    axis: "shard",
    parts: JSON.parse(inputs.shards).length,
    suite: suiteOf(browserSteps),
    proof: keptFragments(browserSteps),
    inputs,
  })),
];

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

// JOB's PART on the runner TEMP as ci.yml declares it: its fragments step's
// inputs, and where its suite step has the runner write a report named by
// the step's environment VARIABLE. PARTS replaces the job's part count when a
// case needs more parts than CI runs.
export function declaredPart(job, part, temp, parts) {
  const declared = producers.find((producer) => producer.job === job);
  const context = {
    temp,
    part,
    parts: parts ?? declared.parts,
    inputs: declared.inputs,
  };
  const [step] = declared.proof;
  return {
    inputs: Object.fromEntries(
      Object.entries(stepInputs(step)).map(([name, value]) => [
        name,
        evaluated(value, context),
      ]),
    ),
    report: (variable) => evaluated(input(declared.suite, variable), context),
  };
}
