// Native Playwright dispatch proves local overlap and unchanged CI concurrency.
import { expect, test } from "../../tests/support/pageTest.ts";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { repoRoot } from "../../tests/support/repositoryRoot.ts";
import {
  proofDirectory,
  quietReporter,
  readProof,
  removeProofDirectories,
  startProofCommand,
} from "../../tests/support/proofRecordRun.ts";
import { runOutputs } from "../../tests/support/testFiles.mjs";

test.afterAll(removeProofDirectories);
const chains = ["failures", "updates"] as const;

test("two local production chains leave ordinary work a worker and keep one global setup", async () => {
  const { result, observed, proof } = await dispatch(false);
  expect(result).toMatchObject({ status: 0, stdout: "", stderr: "" });
  expectCompleted(observed, proof);
  expect(
    observed.findIndex(
      (event) => event.startsWith("chain:") && event.endsWith(":setup"),
    ),
  ).toBeLessThan(observed.indexOf("ordinary:later"));
  for (const name of chains)
    expect(observed.indexOf("ordinary:start")).toBeLessThan(
      observed.indexOf(`chain:${name}:first`),
    );
  expect(peakChains(observed)).toBe(1);
});

test("CI production chains retain both configured workers", async () => {
  const { result, observed, proof } = await dispatch(true);
  expect(result).toMatchObject({ status: 0, stdout: "", stderr: "" });
  expectCompleted(observed, proof);
  // Each chain waits for the other to start: a local cap here would deadlock.
  expect(peakChains(observed)).toBe(2);
});

type Dispatch = Awaited<ReturnType<typeof dispatch>>;
function expectCompleted(observed: string[], proof: Dispatch["proof"]) {
  expect(observed.filter((event) => event === "global:setup")).toHaveLength(1);
  for (const name of chains)
    expect(
      observed.filter((event) => event.startsWith(`chain:${name}:`)),
    ).toEqual([
      `chain:${name}:setup`,
      `chain:${name}:first`,
      `chain:${name}:second`,
      `chain:${name}:teardown`,
    ]);
  expect(proof.selectedCount).toBe(6);
  expect(proof.tests.every((selected) => selected.attempts.length === 1)).toBe(
    true,
  );
  expect(proof.terminal?.strictStatus).toBe("passed");
}

function peakChains(observed: string[]) {
  let active = 0;
  let peak = 0;
  for (const event of observed) {
    if (event.startsWith("chain:") && event.endsWith(":setup")) active += 1;
    if (event.startsWith("chain:") && event.endsWith(":teardown")) active -= 1;
    peak = Math.max(peak, active);
  }
  return peak;
}

// Resource and executable-code setup stays in the native harness; the cases
// observe actual workers, transitions and reporter records, not supplied answers.
async function dispatch(ci: boolean) {
  const directory = proofDirectory();
  mkdirSync(path.join(directory, "tests", "runtime"), { recursive: true });
  mkdirSync(path.join(directory, "backend-tests"));
  const events = path.join(directory, "events.txt");
  const ordinary = path.join(directory, "ordinary-started");
  const started = chains.map((name) => path.join(directory, `${name}-started`));
  const record = path.join(directory, "proof.json");
  const config = path.join(directory, "playwright.config.mjs");
  const framework = path.join(
    repoRoot,
    "node_modules/@playwright/test/index.js",
  );
  const preamble = `
import { test, expect } from ${JSON.stringify(framework)};
import { appendFileSync, existsSync, writeFileSync } from "node:fs";
const note = (text) => appendFileSync(${JSON.stringify(events)}, text + "\\n");
`;
  // The first ordinary job gates both workers, so it must precede the later
  // job in the discovered paths of a root holding folders, as E2E Test's does.
  writeFileSync(
    path.join(directory, "backend-tests/a-ordinary.spec.ts"),
    `${preamble}
test("ordinary work overlaps a chain", async () => {
  note("ordinary:start");
  writeFileSync(${JSON.stringify(ordinary)}, "");
  await expect.poll(() => ${JSON.stringify(started)}.some(existsSync)).toBe(true);
  note("ordinary:done");
});
`,
  );
  writeFileSync(
    path.join(directory, "tests/b-ordinary.spec.ts"),
    `${preamble}
test("later ordinary work", () => note("ordinary:later"));
`,
  );
  for (const [index, name] of chains.entries()) {
    const gate = ci ? started[1 - index] : ordinary;
    writeFileSync(
      path.join(directory, `tests/runtime/production-watcher-${name}.spec.ts`),
      `${preamble}
test.describe.configure({ mode: "serial" });
let state = 0;
test.beforeAll(async () => {
  note("chain:${name}:setup");
  writeFileSync(${JSON.stringify(started[index])}, "");
  await expect.poll(() => existsSync(${JSON.stringify(gate)})).toBe(true);
});
test.afterAll(() => note("chain:${name}:teardown"));
test("first transition", () => {
  expect(state).toBe(0);
  state = 1;
  note("chain:${name}:first");
});
test("second transition", () => {
  expect(state).toBe(1);
  note("chain:${name}:second");
});
`,
    );
  }
  const setup = path.join(directory, "setup.mjs");
  writeFileSync(
    setup,
    `
import { appendFileSync } from "node:fs";
export default () => appendFileSync(${JSON.stringify(events)}, "global:setup\\n");
`,
  );
  const projectModule = pathToFileURL(
    path.join(repoRoot, "dashboard/tests/support/testFiles.mjs"),
  ).href;
  const options = {
    testDir: directory,
    outputDir: path.join(directory, runOutputs.results),
    workers: 2,
    fullyParallel: true,
    retries: 0,
    globalSetup: setup,
    reporter: [[quietReporter, { proofRecord: record }]],
  };
  writeFileSync(
    config,
    `
import { dashboardTestProjects } from ${JSON.stringify(projectModule)};
export default {
  ...${JSON.stringify(options)},
  projects: dashboardTestProjects(
    new URL(${JSON.stringify(pathToFileURL(`${directory}/`).href)}),
    undefined,
    { roots: ["."], splitVariable: "UNSET_SPLIT", durations: "longest-first" },
  ),
};
`,
  );
  const run = startProofCommand(
    process.execPath,
    [
      path.join(repoRoot, "node_modules/playwright/cli.js"),
      "test",
      "--config",
      config,
    ],
    repoRoot,
    { CI: ci ? "1" : "" },
  );
  try {
    const result = await run.result;
    return {
      result,
      observed: readFileSync(events, "utf8").trim().split("\n"),
      proof: readProof(record),
    };
  } finally {
    await run.stop();
  }
}
