// Exercise native Playwright dispatch, not just the project configuration shape.
import { expect, test } from "../support/pageTest.ts";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { repoRoot } from "../support/repositoryRoot.ts";
import {
  proofDirectory,
  quietReporter,
  readProof,
  removeProofDirectories,
  startProofCommand,
} from "../support/proofRecordRun.ts";

test.afterAll(removeProofDirectories);

test("serial production chains start alongside ordinary work, before later ordinary files, with one global setup", async () => {
  const directory = proofDirectory();
  const events = path.join(directory, "events.txt");
  const chain = path.join(directory, "chain-started");
  const ordinary = path.join(directory, "ordinary-started");
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
  writeFileSync(
    path.join(directory, "a-ordinary.spec.ts"),
    `${preamble}
test("ordinary work overlaps the chain", async () => {
  note("ordinary:start");
  writeFileSync(${JSON.stringify(ordinary)}, "");
  await expect.poll(() => existsSync(${JSON.stringify(chain)})).toBe(true);
  note("ordinary:done");
});
`,
  );
  writeFileSync(
    path.join(directory, "b-ordinary.spec.ts"),
    `${preamble}
test("later ordinary work", () => note("ordinary:later"));
`,
  );
  writeFileSync(
    path.join(directory, "production-watcher-updates.spec.ts"),
    `${preamble}
test.describe.configure({ mode: "serial" });
let state = 0;
test.beforeAll(() => {
  note("chain:setup");
  writeFileSync(${JSON.stringify(chain)}, "");
});
test.afterAll(() => note("chain:teardown"));
test("first transition", async () => {
  await expect.poll(() => existsSync(${JSON.stringify(ordinary)})).toBe(true);
  expect(state).toBe(0);
  state = 1;
  note("chain:first");
});
test("second transition", () => {
  expect(state).toBe(1);
  note("chain:second");
});
`,
  );
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
    outputDir: path.join(directory, "results"),
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
  projects: dashboardTestProjects(new URL(${JSON.stringify(pathToFileURL(`${directory}/`).href)})),
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
  );
  expect(await run.result).toMatchObject({ status: 0, stdout: "", stderr: "" });
  const observed = readFileSync(events, "utf8").trim().split("\n");
  expect(observed.filter((event) => event === "global:setup")).toHaveLength(1);
  expect(observed.indexOf("chain:setup")).toBeLessThan(
    observed.indexOf("ordinary:later"),
  );
  expect(observed.indexOf("ordinary:start")).toBeLessThan(
    observed.indexOf("chain:first"),
  );
  expect(observed.filter((event) => event.startsWith("chain:"))).toEqual([
    "chain:setup",
    "chain:first",
    "chain:second",
    "chain:teardown",
  ]);
  const proof = readProof(record);
  expect(proof.selectedCount).toBe(4);
  expect(proof.tests.every((selected) => selected.attempts.length === 1)).toBe(
    true,
  );
  expect(proof.terminal?.strictStatus).toBe("passed");
});
